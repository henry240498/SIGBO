import { BadRequestException, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import type { GreCelda, GreFila } from '../../shared/entities';
import { mismoId } from './gre-artefacto';
import { CatalogoMatpel, compararDecimal, ContextoConsultaMatpel, EstadoApartadoMatpel, normalizarMatpel, ParametrosMatpel } from './matpel-modelo';
import { validarContextoConsultaMatpel, validarParametrosMatpel } from './dto/matpel-consulta.dto';
import { FUENTE_ESTUDIADA_MATPEL, hashMatpel, lecturaGuiasMatpel, perfilMatpel, VERSION_INTERPRETACION_MATPEL } from './matpel-perfil';
import { solicitudesMatpel } from './matpel-recorrido';

const VERSION_MOTOR = 'gre2024-matpel-2';
// Alcance del estudio fuente: otra edición requiere cotejo y una implementación registrada.

@Injectable()
export class MotorMatpelService {
  /** Función sin reloj, escritura, meteorología, proveedor externo ni decisiones de mando. */
  evaluar(entradaIds: string[], parametros: ParametrosMatpel, catalogo: CatalogoMatpel, contexto: ContextoConsultaMatpel = {}) {
    validarParametrosMatpel(parametros);
    if (!Array.isArray(entradaIds) || entradaIds.length > 20 || entradaIds.some(x => typeof x !== 'string') || new Set(entradaIds.map(x => x.toLowerCase())).size !== entradaIds.length) {
      throw new BadRequestException('Selecciona identificaciones distintas de una misma edición.');
    }
    validarContextoConsultaMatpel(entradaIds, contexto);
    const perfil = perfilMatpel(catalogo);
    const traza: Array<{ paso: string; resultado: string; reglas: string[]; referenciaIds: string[] }> = [];
    const entradas = entradaIds.map(id => {
      const e = perfil.entradasPorId.get(id.toLowerCase());
      if (!e || !mismoId(e.versionId, catalogo.versionGreId)) throw new NotFoundException('La identificación no pertenece a esta versión GRE.');
      return e;
    });
    const reglas = catalogo.reglas.map(r => ({ id: r.id, codigo: r.codigo, textoOriginal: r.textoOriginal,
      referenciaId: r.referenciaId, ejecutable: r.ejecutable, versionInterpretacion: r.versionInterpretacion }));
    const refs = (codes: string[]) => catalogo.reglas.filter(r => codes.includes(r.codigo)).map(r => r.referenciaId);
    const regla = (code: string) => {
      const r = perfil.reglasPorCodigo.get(code);
      if (!r?.ejecutable || r.versionInterpretacion !== 'motor-1') return null;
      return r;
    };
    const aviso = (codigo: string, motivo: string, codigos: string[]) => ({ codigo, motivo, referenciaIds: refs(codigos) });
    const paso = (nombre: string, resultado: string, codigos: string[]) => traza.push({ paso: nombre, resultado, reglas: codigos, referenciaIds: refs(codigos) });
    const avisos = [aviso('ORIENTACION_INICIAL', 'Conservar condiciones y texto completo; la evaluación no es una decisión de mando.', ['R01', 'R30'])];
    const provisionales = Object.entries(parametros).filter(([, d]) => d?.valor !== null && d?.certeza !== 'CONFIRMADO').map(([k]) => k);
    if (provisionales.length) avisos.push(aviso('CONDICIONES_PROVISIONALES', `Selección condicionada por datos estimados o no confirmados: ${provisionales.join(', ')}. Conservar su calidad y verificar antes de una decisión.`, []));
    const identificaciones = entradas.map(e => contexto.identificaciones?.find(i => mismoId(i.entradaId, e.id)) ??
      { entradaId: e.id, certeza: 'NO_CONFIRMADO' as const, metodo: 'DESCONOCIDO' as const, observacionOriginal: null, observadoEn: null, evidenciaId: null });
    if (identificaciones.some(i => i.certeza !== 'CONFIRMADO')) avisos.push(aviso('IDENTIFICACION_PROVISIONAL',
      'La coincidencia documental no confirma la sustancia observada. Conservar la certeza y observación de identificación.', ['R02']));
    if (contexto.ambito && !['TRANSPORTE_TERRESTRE', 'DESCONOCIDO'].includes(contexto.ambito)) avisos.push(aviso('AMBITO_GRE',
      'La GRE orienta la respuesta inicial en transporte terrestre; comprobar el alcance de esta consulta para el ámbito observado.', ['R01']));
    const apartado = (estado: EstadoApartadoMatpel, motivo: string, faltantes: string[] = [], filas: GreFila[] = [], celdas: GreCelda[] = [], codes: string[] = []) =>
      ({ estado, motivo, faltantes, filaIds: filas.map(f => f.id), celdas, referenciaIds: [...new Set([...refs(codes), ...filas.map(f => f.referenciaId), ...celdas.map(c => c.referenciaId)])] });
    const porDefecto = apartado('INDETERMINADO', 'Faltan condiciones para seleccionar una distancia.');
    const resultado = {
      versionContrato: 1, versionGreId: catalogo.versionGreId, edicion: catalogo.documento.edicion,
      documentoSha256: catalogo.documento.sha256, versionMotor: VERSION_MOTOR,
      sha256Contenido: perfil.sha256Contenido, sha256Interpretacion: perfil.sha256Interpretacion,
      versionInterpretacion: VERSION_INTERPRETACION_MATPEL,
      inputsHash: hashMatpel({ entradaIds: entradas.map(e => e.id.toLowerCase()).sort(), parametros,
        identificaciones: [...identificaciones].sort((a, b) => a.entradaId.toLowerCase().localeCompare(b.entradaId.toLowerCase())),
        ambito: contexto.ambito ?? 'DESCONOCIDO', sha256Contenido: perfil.sha256Contenido,
        sha256Interpretacion: perfil.sha256Interpretacion,
        versionGreId: catalogo.versionGreId.toLowerCase(), documentoSha256: catalogo.documento.sha256, versionMotor: VERSION_MOTOR }),
      entradas, parametros, guias: catalogo.guias.filter(g => entradas.some(e => mismoId(e.guiaId, g.id))),
      reglas, avisos, tabla1: porDefecto, tabla2: porDefecto, tabla3: porDefecto,
      aislamiento: porDefecto, proteccion: porDefecto,
    };
    const finalizar = (r: typeof resultado) => {
      const guiasLectura = lecturaGuiasMatpel(catalogo, r.guias.map(g => g.id));
      const enriquecer = (a: typeof porDefecto, finalidad: string, tablaPorDefecto: string) => {
        const esGuia = a.faltantes.includes('escenarioIncendioGuia') || a.faltantes.includes('distanciasGuia');
        const fila = catalogo.filas.find(f => a.filaIds.includes(f.id));
        const tabla = fila ? catalogo.tablas.find(t => mismoId(t.id, fila.tablaId))?.codigo : null;
        return { ...a, finalidad, fuenteResultado: esGuia ? 'GUIA_NARANJA' : tabla ?? tablaPorDefecto,
          estadoImplementacion: esGuia ? 'LECTURA_COMPLETA_SIN_SELECCION_AUTOMATICA' : 'SELECCION_TABULAR_PARCIAL',
          validacionOperacional: 'PENDIENTE' };
      };
      return { ...r, identificaciones, ambito: contexto.ambito ?? 'DESCONOCIDO',
        aislamiento: enriquecer(r.aislamiento, 'AISLAMIENTO', 'NO_DETERMINADA'),
        proteccion: enriquecer(r.proteccion, 'PROTECCION', 'NO_DETERMINADA'),
        tabla1: enriquecer(r.tabla1, 'SELECCION_TABLA', 'TABLA_1'),
        tabla2: enriquecer(r.tabla2, 'GASES_INFORMATIVOS', 'TABLA_2'),
        tabla3: enriquecer(r.tabla3, 'SELECCION_TABLA', 'TABLA_3'),
        guiasLectura, solicitudes: solicitudesMatpel(catalogo, entradaIds, parametros, r),
        traza: [...traza, ...(['tabla1', 'tabla2', 'tabla3', 'aislamiento', 'proteccion'] as const).map(k =>
          ({ paso: `RESULTADO_${k.toUpperCase()}`, resultado: `${r[k].estado}: ${r[k].motivo}`, reglas: [], referenciaIds: r[k].referenciaIds }))],
        cobertura: { tablas: 'SELECCION_CONDICIONAL', guias: 'LECTURA_COMPLETA',
          reglasDocumentales: perfil.condicionesDocumentales.length, dominioIntegralDemostrado: false } };
    };
    if (catalogo.documento.sha256 !== FUENTE_ESTUDIADA_MATPEL) {
      const no = apartado('DATOS_NO_DISPONIBLES', 'Esta edición todavía no tiene interpretación de motor cotejada con su fuente.');
      paso('EDICION', 'Fuente sin interpretación admitida.', []);
      return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no });
    }
    if (entradas.length !== 1) {
      const no = apartado('INDETERMINADO', entradas.length ? 'Varios materiales: evaluar por separado no describe una mezcla.' : 'Material desconocido; consultar guía111.', ['identificacion'], [], [], entradas.length ? ['R02'] : ['R06']);
      if (!entradas.length && regla('R06')) resultado.guias = catalogo.guias.filter(g => g.numero === '111');
      paso('IDENTIFICACION', no.motivo, entradas.length ? ['R02'] : ['R06']);
      return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no });
    }
    const e = entradas[0];
    if (e.polimerizable) avisos.push(aviso('POLIMERIZACION_CONDICIONAL', 'El sufijo P indica peligro de polimerización bajo ciertas condiciones; leer la guía completa.', ['R08']));
    if (!regla('R13')) {
      const no = apartado('DATOS_NO_DISPONIBLES', 'La edición no dispone de la regla de aplicabilidad de Tabla1.');
      return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no });
    }
    if (e.resaltadoVerde !== true) {
      const no = apartado(e.resaltadoVerde === false ? 'NO_APLICABLE' : 'INDETERMINADO',
        e.resaltadoVerde === false ? 'La entrada específica no está resaltada en verde: consultar guía naranja.' : 'El resaltado de la entrada no está determinado.', [], [], [], ['R13', 'R15']);
      const guia = apartado('DATOS_NO_DISPONIBLES', 'La tabla verde no aplica a esta entrada; consultar las distancias y condiciones de su guía naranja.', ['distanciasGuia'], [], [], ['R13', 'R15']);
      guia.referenciaIds.push(...resultado.guias.map(g => g.referenciaId));
      paso('RESALTADO_VERDE', no.motivo, ['R13', 'R15']);
      return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no,
        aislamiento: e.resaltadoVerde === false ? guia : no, proteccion: e.resaltadoVerde === false ? guia : no });
    }
    const tabla = (codigo: string) => catalogo.tablas.find(t => t.codigo === codigo);
    const condicion = (f: GreFila): Record<string, any> => {
      const cond = perfil.condicionesPorFila.get(f.id.toLowerCase());
      if (!cond) throw new ServiceUnavailableException('La fila GRE perdió sus condiciones.');
      return cond;
    };
    const deTabla = (codigo: string) => {
      const t = tabla(codigo);
      return t ? perfil.filasPorTabla.get(t.id.toLowerCase()) ?? [] : [];
    };
    let filas = deTabla('TABLA_1').filter(f => condicion(f).identificador === e.identificador);
    const exactas = filas.filter(f => mismoId(f.entradaId, e.id) || condicion(f).nombreNormalizado === e.nombreNormalizado);
    if (exactas.length) { filas = exactas; paso('IDENTIDAD_TABLA1', 'Filas del nombre específico.', ['R13']); }
    else if (filas.length) {
      if (!regla('R18')) {
        const no = apartado('INDETERMINADO', 'El nombre específico no tiene coincidencia y falta la regla de selección.', ['nombreEspecifico'], filas);
        return finalizar({ ...resultado, tabla1: no, aislamiento: no, proteccion: no  });
      }
      avisos.push(aviso('NOMBRE_NO_ENCONTRADO_EN_TABLA', 'Se conservaron todas las filas del identificador; la mayor distancia protectora solo se selecciona bajo R18.', ['R18']));
      paso('IDENTIDAD_TABLA1', 'Nombre específico ausente: conservar alternativas del identificador para selección protectora bajo R18.', ['R18']);
    }
    if (filas.some(f => condicion(f).derrameEn === 'AGUA')) {
      // GRE24-FLOW-AGUA-EXTINTOR, PDF3 / impresa1. Presentación literal de
      // la rama documental; no resuelve precedencia entre escenarios o usos del agua.
      const originales = catalogo.referencias.filter(r => r.paginaPdf === 3 && normalizarMatpel(r.textoOriginal ?? '').includes('Y NO UTILICE AGUA COMO AGENTE EXTINTOR'));
      const a = aviso('GRE24-FLOW-AGUA-EXTINTOR', originales.length
        ? 'Hay referencia de derrame en agua. La caja final del flujo para un solo material indica: «Y no utilice agua cómo agente extintor». Verificar su alcance en el escenario observado y leer la guía completa; no equivale a prohibir todo uso del agua ni a seleccionar un agente alternativo.'
        : 'Hay referencia de derrame en agua, pero falta la fuente de la condición de agente extintor; consultar el PDF original antes de una selección.', ['R20', 'R21', 'R22']);
      a.referenciaIds.push(...originales.map(r => r.id));
      avisos.push(a);
    }
    if (!filas.length) {
      const no = apartado('DATOS_NO_DISPONIBLES', 'La entrada verde no tiene filas de Tabla1 disponibles; no usar cero como distancia.');
      return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no  });
    }
    const agua = parametros.contactoAgua.valor;
    if (agua === 'TIERRA' && filas.every(f => condicion(f).derrameEn === 'AGUA')) {
      if (!regla('R20')) {
        const no = apartado('DATOS_NO_DISPONIBLES', 'Falta regla para la condición de derrame en agua.');
        return finalizar({ ...resultado, tabla1: no, tabla2: no, aislamiento: no, proteccion: no  });
      }
      const no = apartado('NO_APLICABLE', 'Solo hay fila de derrame en agua y el producto no se derramó en agua; consultar guía naranja.', [], filas, [], ['R20']);
      const guia = apartado('DATOS_NO_DISPONIBLES', 'Las tablas verdes no aplican a este derrame en tierra; consultar distancias y condiciones de la guía naranja.', ['distanciasGuia'], [], [], ['R20', 'R15']);
      guia.referenciaIds.push(...resultado.guias.map(g => g.referenciaId));
      paso('MEDIO_DERRAME', no.motivo, ['R20']);
      return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: guia, proteccion: guia });
    }
    if (agua === 'AGUA' || agua === 'TIERRA') filas = filas.filter(f => !condicion(f).derrameEn || condicion(f).derrameEn === agua);
    const variasCondiciones = filas.some(f => condicion(f).derrameEn);
    if ((agua === null || agua === 'AMBOS') && variasCondiciones) {
      if (!regla('R19')) {
        const no = apartado('INDETERMINADO', 'Derrame en agua/tierra sin regla de selección disponible.', ['contactoAgua'], filas);
        return finalizar({ ...resultado, tabla1: no, aislamiento: no, proteccion: no  });
      }
      avisos.push(aviso('AGUA_TIERRA_MAYOR_PROTECCION', 'Agua/tierra indeterminado o ambos: conservar las alternativas y elegir la mayor protección bajo R19.', ['R19']));
      paso('MEDIO_DERRAME', 'Medio desconocido/ambos: conservar alternativas, mayor protección sólo bajo R19.', ['R19']);
    }
    const gases = deTabla('TABLA_2').filter(f => condicion(f).identificador === e.identificador);
    resultado.tabla2 = apartado(agua === 'TIERRA' ? 'NO_APLICABLE' : agua === null ? 'INDETERMINADO' : gases.length ? 'APLICABLE' : 'NO_APLICABLE',
      'Gases producidos informativos: no sustituir la identidad ni consultar sus distancias como reemplazo.', agua === null ? ['contactoAgua'] : [], gases,
      catalogo.celdas.filter(c => gases.some(f => mismoId(f.id, c.filaId))), ['R21', 'R22']);
    let tamano: 'PEQUENO' | 'GRANDE' | null = null;
    const cantidad = parametros.cantidad.valor;
    const r16 = regla('R16');
    if (cantidad && (cantidad.unidad === 'L' || cantidad.unidad === 'm3') && r16) {
      const p = JSON.parse(r16.parametrosJson ?? '{}');
      if (typeof p.pequenoHastaLitros === 'string' && p.limiteIncluido === true) {
        tamano = compararDecimal(cantidad.valorDecimal, p.pequenoHastaLitros, cantidad.unidad === 'm3' ? 1000n : 1n) <= 0 ? 'PEQUENO' : 'GRANDE';
      }
    }
    if (!tamano) {
      const no = apartado('INDETERMINADO', 'Se necesita cantidad liberada en volumen y regla de tamaño; no convertir masa a litros sin densidad respaldada.', ['cantidadVolumen'], filas, [], ['R16']);
      return finalizar({ ...resultado, tabla1: no, tabla3: no, aislamiento: no, proteccion: no  });
    }
    paso('TAMANO_DERRAME', `Volumen liberado clasificado ${tamano}; no inferido de capacidad nominal.`, ['R16']);
    resultado.tabla1 = apartado('APLICABLE', 'Filas de la identidad y condiciones conservadas.', [], filas, [], ['R13', 'R16', 'R18', 'R19', 'R20']);
    const obtenerCeldas = (fs: GreFila[], columna: string) => fs.flatMap(f => perfil.celdasPorFila.get(f.id.toLowerCase()) ?? []).filter(c => c.columnaCodigo === columna);
    const seleccionar = (fs: GreFila[], columna: string, mayor: boolean, codigos: string[]) => {
      const cs = obtenerCeldas(fs, columna);
      if (!cs.length || cs.some(c => c.estadoDato !== 'DATO' || c.valorDecimal === null || !/^\d+(\.\d+)?$/.test(c.valorDecimal))) {
        return apartado('DATOS_NO_DISPONIBLES', 'La celda es una remisión, está vacía o no tiene dato numérico validado.', [], fs, cs, codigos);
      }
      if (new Set(cs.map(c => c.unidadOriginal)).size !== 1) return apartado('DATOS_NO_DISPONIBLES', 'Unidades incompatibles en la selección.', [], fs, cs, codigos);
      let seleccion = cs;
      if (mayor) {
        const max = cs.reduce((a, b) => compararDecimal(a.valorDecimal!, b.valorDecimal!) >= 0 ? a : b);
        seleccion = cs.filter(c => compararDecimal(c.valorDecimal!, max.valorDecimal!) === 0);
        // Un + de una alternativa menor tampoco define una cota superior comparable.
        if (cs.some(c => c.modificador)) seleccion = cs;
      } else if (cs.some(c => compararDecimal(c.valorDecimal!, cs[0].valorDecimal!) !== 0 || c.modificador !== cs[0].modificador)) {
        return apartado('INDETERMINADO', 'Hay distancias de aislamiento diferentes; no aplicar a aislamiento una regla que solo ordena protección.', [], fs, cs, codigos);
      }
      const hayCotaAbierta = seleccion.some(c => c.modificador);
      return apartado(hayCotaAbierta && seleccion.length > 1 ? 'INDETERMINADO' : 'APLICABLE',
        hayCotaAbierta ? 'La fuente contiene modificador: no es un límite máximo garantizado.' : 'Selección tabular sin modificar los valores originales.', [], fs, seleccion, codigos);
    };
    const a = obtenerCeldas(filas, `${tamano}_AISLAR_M`);
    const remitidas = a.some(c => c.estadoDato === 'REFERENCIA');
    if (remitidas) {
      const r23 = regla('R23'); const r24 = regla('R24');
      let t3 = deTabla('TABLA_3').filter(f => (condicion(f).identificadores ?? []).includes(e.identificador));
      const contenedor = parametros.contenedor.valor;
      const viento = parametros.viento.valor;
      const faltantes = [] as string[];
      if (!contenedor) faltantes.push('contenedor');
      if (!r23 || !r24) faltantes.push('reglasTabla3');
      if (!t3.length) faltantes.push('filasTabla3');
      if (faltantes.length) {
        const no = apartado('INDETERMINADO', 'Tabla1 remite a Tabla3; no conservar una distancia de otra fila.', faltantes, t3, [], ['R23', 'R24']);
        return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no  });
      }
      t3 = t3.filter(f => condicion(f).contenedor === normalizarMatpel(contenedor!));
      if (t3.length !== 1) {
        const no = apartado('INDETERMINADO', 'El tipo de recipiente no identifica una fila de Tabla3; conservar cantidades nominales y condición de múltiples cilindros.', ['contenedorEspecifico'], t3, [], ['R23']);
        return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no  });
      }
      const capacidad = parametros.cantidadContenedor?.valor;
      const numero = parametros.numeroContenedores?.valor;
      const cantidades = perfil.cantidadesTabla3;
      const tipoFila = condicion(t3[0]).contenedor as string;
      const variantes: Array<{ tipo: string; minimo: number; maximo: number | null }> = perfil.tiposFilaTabla3[tipoFila] ?? [];
      const capFactor = capacidad?.unidad === 'm3' || capacidad?.unidad === 't' ? 1000n : 1n;
      const capUnidad = capacidad?.unidad === 'm3' ? 'L' : capacidad?.unidad === 't' ? 'kg' : capacidad?.unidad;
      const compatibles = capacidad && numero ? cantidades.filter(q => variantes.some(v => v.tipo === q.tipo && numero >= v.minimo && (v.maximo === null || numero <= v.maximo)) && q.unidad === capUnidad &&
        compararDecimal(capacidad.valorDecimal, q.desde, capFactor) >= 0 && compararDecimal(capacidad.valorDecimal, q.hasta, capFactor) <= 0 &&
        q.presente) : [];
      if (compatibles.length !== 1) {
        const no = apartado('INDETERMINADO', 'Falta cantidad por recipiente/número o no corresponde al tipo y rango publicados. No interpolar ni elegir capacidad cercana.',
          [...(!capacidad ? ['cantidadContenedor'] : []), ...(!numero ? ['numeroContenedores'] : []), ...(capacidad && numero ? ['cantidadContenedorCompatible'] : [])], t3, [], ['R23']);
        return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no  });
      }
      // Control de coherencia cuando ambas cantidades son volumen. No infiere lo
      // liberado a partir de la capacidad y no convierte masa a volumen.
      if (capUnidad === 'L' && compararDecimal(cantidad!.valorDecimal, capacidad!.valorDecimal,
          cantidad!.unidad === 'm3' ? 1000n : 1n, capFactor * BigInt(numero!)) > 0) {
        const no = apartado('INDETERMINADO', 'La cantidad liberada excede el volumen informado de los recipientes.', ['cantidadesCoherentes'], t3);
        return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no  });
      }
      avisos.push({ codigo: 'CANTIDADES_TABLA3', motivo: 'Tipo, cantidad por recipiente y número se cotejaron con las cantidades de referencia; el volumen liberado es un dato separado.',
        referenciaIds: [...new Set(compatibles.flatMap(q => q.referenciaIds))] });
      paso('RECIPIENTE_TABLA3', 'Tipo, capacidad nominal y número cumplen una alternativa publicada; volumen liberado separado.', ['R23']);
      resultado.tabla3 = apartado('APLICABLE', 'Fila de Tabla3 para derrame grande y recipiente explícito; las cantidades de referencia se conservan en la fuente.', [], t3, [], ['R23']);
      resultado.aislamiento = seleccionar(t3, 'AISLAR_M', false, ['R23']);
      let clase: 'LEVE' | 'MODERADO' | 'FUERTE' | null = null;
      if (viento?.velocidadDecimal && (viento.unidad === 'km/h' || viento.unidad === 'mph' || viento.unidad === 'm/s')) {
        const rangos = JSON.parse(r24!.parametrosJson ?? '{}')[viento.unidad === 'mph' ? 'mph' : 'kmh'];
        const compararViento = (limite: string) => compararDecimal(viento.velocidadDecimal!, limite, viento.unidad === 'm/s' ? 18n : 1n, viento.unidad === 'm/s' ? 5n : 1n);
        if (viento.unidad === 'm/s') avisos.push(aviso('CONVERSION_VIENTO_SIGBO', 'Conversión SIGBO exacta de m/s a km/h para cotejar los rangos publicados; conservar el dato original.', ['R24']));
        if (rangos && ['leveMenorQue', 'moderadoDesde', 'moderadoHasta', 'fuerteMayorQue'].every(k => typeof rangos[k] === 'string')) {
          clase = compararViento(rangos.leveMenorQue) < 0 ? 'LEVE'
            : compararViento(rangos.moderadoDesde) >= 0 && compararViento(rangos.moderadoHasta) <= 0 ? 'MODERADO'
              : compararViento(rangos.fuerteMayorQue) > 0 ? 'FUERTE' : null;
        }
      }
      resultado.proteccion = parametros.periodo.valor && clase ? seleccionar(t3, `${parametros.periodo.valor}_${clase}_KM`, false, ['R17', 'R23', 'R24'])
        : apartado('INDETERMINADO', 'Se necesitan periodo y velocidad/clase de viento; no establecerlos por hora fija ni presumir calma.',
          [...(!parametros.periodo.valor ? ['periodo'] : []), ...(!clase ? ['velocidadViento'] : [])], t3);
      paso('PERIODO_VIENTO_TABLA3', `Periodo ${parametros.periodo.valor ?? 'DESCONOCIDO'}; viento ${clase ?? 'DESCONOCIDO'}.`, ['R17', 'R24']);
    } else {
      resultado.tabla3 = apartado('NO_APLICABLE', 'Las celdas seleccionadas de Tabla1 no remiten a Tabla3.');
      resultado.aislamiento = seleccionar(filas, `${tamano}_AISLAR_M`, false, ['R16']);
      resultado.proteccion = parametros.periodo.valor && regla('R17') ? seleccionar(filas, `${tamano}_${parametros.periodo.valor}_KM`, true, ['R16', 'R17', 'R18', 'R19'])
        : apartado('INDETERMINADO', 'El periodo día/noche depende de salida/puesta del sol; no usar un horario fijo.', ['periodo'], filas, [], ['R17']);
    }
    if (parametros.incendio.valor !== false) {
      const motivo = parametros.incendio.valor === true
        ? 'Con incendio, la distancia de incendio de la guía determina aislamiento; las tablas orientan protección por material residual.'
        : 'Incendio desconocido: no interpretar como ausencia de incendio.';
      resultado.aislamiento = apartado('INDETERMINADO', motivo, parametros.incendio.valor === null ? ['incendio'] : ['escenarioIncendioGuia'], filas, [], ['R14']);
      avisos.push(aviso('INCENDIO_Y_RESIDUAL', motivo, ['R14']));
      paso('INCENDIO', motivo, ['R14']);
    }
    avisos.push(aviso('AJUSTES_NO_AUTOMATICOS', 'Liberación instantánea, varios recipientes, temperatura y condiciones atmosféricas requieren conservar las advertencias; no se aplicó un multiplicador.', ['R28', 'R29', 'R30']));
    return finalizar(resultado);
  }
}
