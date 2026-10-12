'use strict';
(function(global){
const modules={"motor-matpel.service":function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MotorMatpelService = void 0;
const common_1 = require("@nestjs/common");
const gre_artefacto_1 = require("./gre-artefacto");
const matpel_modelo_1 = require("./matpel-modelo");
const matpel_consulta_dto_1 = require("./dto/matpel-consulta.dto");
const matpel_perfil_1 = require("./matpel-perfil");
const matpel_recorrido_1 = require("./matpel-recorrido");
const VERSION_MOTOR = 'gre2024-matpel-2';
// Alcance del estudio fuente: otra edición requiere cotejo y una implementación registrada.
let MotorMatpelService = class MotorMatpelService {
    /** Función sin reloj, escritura, meteorología, proveedor externo ni decisiones de mando. */
    evaluar(entradaIds, parametros, catalogo, contexto = {}) {
        (0, matpel_consulta_dto_1.validarParametrosMatpel)(parametros);
        if (!Array.isArray(entradaIds) || entradaIds.length > 20 || entradaIds.some(x => typeof x !== 'string') || new Set(entradaIds.map(x => x.toLowerCase())).size !== entradaIds.length) {
            throw new common_1.BadRequestException('Selecciona identificaciones distintas de una misma edición.');
        }
        (0, matpel_consulta_dto_1.validarContextoConsultaMatpel)(entradaIds, contexto);
        const perfil = (0, matpel_perfil_1.perfilMatpel)(catalogo);
        const traza = [];
        const entradas = entradaIds.map(id => {
            const e = perfil.entradasPorId.get(id.toLowerCase());
            if (!e || !(0, gre_artefacto_1.mismoId)(e.versionId, catalogo.versionGreId))
                throw new common_1.NotFoundException('La identificación no pertenece a esta versión GRE.');
            return e;
        });
        const reglas = catalogo.reglas.map(r => ({ id: r.id, codigo: r.codigo, textoOriginal: r.textoOriginal,
            referenciaId: r.referenciaId, ejecutable: r.ejecutable, versionInterpretacion: r.versionInterpretacion }));
        const refs = (codes) => catalogo.reglas.filter(r => codes.includes(r.codigo)).map(r => r.referenciaId);
        const regla = (code) => {
            const r = perfil.reglasPorCodigo.get(code);
            if (!r?.ejecutable || r.versionInterpretacion !== 'motor-1')
                return null;
            return r;
        };
        const aviso = (codigo, motivo, codigos) => ({ codigo, motivo, referenciaIds: refs(codigos) });
        const paso = (nombre, resultado, codigos) => traza.push({ paso: nombre, resultado, reglas: codigos, referenciaIds: refs(codigos) });
        const avisos = [aviso('ORIENTACION_INICIAL', 'Conservar condiciones y texto completo; la evaluación no es una decisión de mando.', ['R01', 'R30'])];
        const provisionales = Object.entries(parametros).filter(([, d]) => d?.valor !== null && d?.certeza !== 'CONFIRMADO').map(([k]) => k);
        if (provisionales.length)
            avisos.push(aviso('CONDICIONES_PROVISIONALES', `Selección condicionada por datos estimados o no confirmados: ${provisionales.join(', ')}. Conservar su calidad y verificar antes de una decisión.`, []));
        const identificaciones = entradas.map(e => contexto.identificaciones?.find(i => (0, gre_artefacto_1.mismoId)(i.entradaId, e.id)) ??
            { entradaId: e.id, certeza: 'NO_CONFIRMADO', metodo: 'DESCONOCIDO', observacionOriginal: null, observadoEn: null, evidenciaId: null });
        if (identificaciones.some(i => i.certeza !== 'CONFIRMADO'))
            avisos.push(aviso('IDENTIFICACION_PROVISIONAL', 'La coincidencia documental no confirma la sustancia observada. Conservar la certeza y observación de identificación.', ['R02']));
        if (contexto.ambito && !['TRANSPORTE_TERRESTRE', 'DESCONOCIDO'].includes(contexto.ambito))
            avisos.push(aviso('AMBITO_GRE', 'La GRE orienta la respuesta inicial en transporte terrestre; comprobar el alcance de esta consulta para el ámbito observado.', ['R01']));
        const apartado = (estado, motivo, faltantes = [], filas = [], celdas = [], codes = []) => ({ estado, motivo, faltantes, filaIds: filas.map(f => f.id), celdas, referenciaIds: [...new Set([...refs(codes), ...filas.map(f => f.referenciaId), ...celdas.map(c => c.referenciaId)])] });
        const porDefecto = apartado('INDETERMINADO', 'Faltan condiciones para seleccionar una distancia.');
        const resultado = {
            versionContrato: 1, versionGreId: catalogo.versionGreId, edicion: catalogo.documento.edicion,
            documentoSha256: catalogo.documento.sha256, versionMotor: VERSION_MOTOR,
            sha256Contenido: perfil.sha256Contenido, sha256Interpretacion: perfil.sha256Interpretacion,
            versionInterpretacion: matpel_perfil_1.VERSION_INTERPRETACION_MATPEL,
            inputsHash: (0, matpel_perfil_1.hashMatpel)({ entradaIds: entradas.map(e => e.id.toLowerCase()).sort(), parametros,
                identificaciones: [...identificaciones].sort((a, b) => a.entradaId.toLowerCase().localeCompare(b.entradaId.toLowerCase())),
                ambito: contexto.ambito ?? 'DESCONOCIDO', sha256Contenido: perfil.sha256Contenido,
                sha256Interpretacion: perfil.sha256Interpretacion,
                versionGreId: catalogo.versionGreId.toLowerCase(), documentoSha256: catalogo.documento.sha256, versionMotor: VERSION_MOTOR }),
            entradas, parametros, guias: catalogo.guias.filter(g => entradas.some(e => (0, gre_artefacto_1.mismoId)(e.guiaId, g.id))),
            reglas, avisos, tabla1: porDefecto, tabla2: porDefecto, tabla3: porDefecto,
            aislamiento: porDefecto, proteccion: porDefecto,
        };
        const finalizar = (r) => {
            const guiasLectura = (0, matpel_perfil_1.lecturaGuiasMatpel)(catalogo, r.guias.map(g => g.id));
            const enriquecer = (a, finalidad, tablaPorDefecto) => {
                const esGuia = a.faltantes.includes('escenarioIncendioGuia') || a.faltantes.includes('distanciasGuia');
                const fila = catalogo.filas.find(f => a.filaIds.includes(f.id));
                const tabla = fila ? catalogo.tablas.find(t => (0, gre_artefacto_1.mismoId)(t.id, fila.tablaId))?.codigo : null;
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
                guiasLectura, solicitudes: (0, matpel_recorrido_1.solicitudesMatpel)(catalogo, entradaIds, parametros, r),
                traza: [...traza, ...['tabla1', 'tabla2', 'tabla3', 'aislamiento', 'proteccion'].map(k => ({ paso: `RESULTADO_${k.toUpperCase()}`, resultado: `${r[k].estado}: ${r[k].motivo}`, reglas: [], referenciaIds: r[k].referenciaIds }))],
                cobertura: { tablas: 'SELECCION_CONDICIONAL', guias: 'LECTURA_COMPLETA',
                    reglasDocumentales: perfil.condicionesDocumentales.length, dominioIntegralDemostrado: false } };
        };
        if (catalogo.documento.sha256 !== matpel_perfil_1.FUENTE_ESTUDIADA_MATPEL) {
            const no = apartado('DATOS_NO_DISPONIBLES', 'Esta edición todavía no tiene interpretación de motor cotejada con su fuente.');
            paso('EDICION', 'Fuente sin interpretación admitida.', []);
            return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no });
        }
        if (entradas.length !== 1) {
            const no = apartado('INDETERMINADO', entradas.length ? 'Varios materiales: evaluar por separado no describe una mezcla.' : 'Material desconocido; consultar guía111.', ['identificacion'], [], [], entradas.length ? ['R02'] : ['R06']);
            if (!entradas.length && regla('R06'))
                resultado.guias = catalogo.guias.filter(g => g.numero === '111');
            paso('IDENTIFICACION', no.motivo, entradas.length ? ['R02'] : ['R06']);
            return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no });
        }
        const e = entradas[0];
        if (e.polimerizable)
            avisos.push(aviso('POLIMERIZACION_CONDICIONAL', 'El sufijo P indica peligro de polimerización bajo ciertas condiciones; leer la guía completa.', ['R08']));
        if (!regla('R13')) {
            const no = apartado('DATOS_NO_DISPONIBLES', 'La edición no dispone de la regla de aplicabilidad de Tabla1.');
            return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no });
        }
        if (e.resaltadoVerde !== true) {
            const no = apartado(e.resaltadoVerde === false ? 'NO_APLICABLE' : 'INDETERMINADO', e.resaltadoVerde === false ? 'La entrada específica no está resaltada en verde: consultar guía naranja.' : 'El resaltado de la entrada no está determinado.', [], [], [], ['R13', 'R15']);
            const guia = apartado('DATOS_NO_DISPONIBLES', 'La tabla verde no aplica a esta entrada; consultar las distancias y condiciones de su guía naranja.', ['distanciasGuia'], [], [], ['R13', 'R15']);
            guia.referenciaIds.push(...resultado.guias.map(g => g.referenciaId));
            paso('RESALTADO_VERDE', no.motivo, ['R13', 'R15']);
            return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no,
                aislamiento: e.resaltadoVerde === false ? guia : no, proteccion: e.resaltadoVerde === false ? guia : no });
        }
        const tabla = (codigo) => catalogo.tablas.find(t => t.codigo === codigo);
        const condicion = (f) => {
            const cond = perfil.condicionesPorFila.get(f.id.toLowerCase());
            if (!cond)
                throw new common_1.ServiceUnavailableException('La fila GRE perdió sus condiciones.');
            return cond;
        };
        const deTabla = (codigo) => {
            const t = tabla(codigo);
            return t ? perfil.filasPorTabla.get(t.id.toLowerCase()) ?? [] : [];
        };
        let filas = deTabla('TABLA_1').filter(f => condicion(f).identificador === e.identificador);
        const exactas = filas.filter(f => (0, gre_artefacto_1.mismoId)(f.entradaId, e.id) || condicion(f).nombreNormalizado === e.nombreNormalizado);
        if (exactas.length) {
            filas = exactas;
            paso('IDENTIDAD_TABLA1', 'Filas del nombre específico.', ['R13']);
        }
        else if (filas.length) {
            if (!regla('R18')) {
                const no = apartado('INDETERMINADO', 'El nombre específico no tiene coincidencia y falta la regla de selección.', ['nombreEspecifico'], filas);
                return finalizar({ ...resultado, tabla1: no, aislamiento: no, proteccion: no });
            }
            avisos.push(aviso('NOMBRE_NO_ENCONTRADO_EN_TABLA', 'Se conservaron todas las filas del identificador; la mayor distancia protectora solo se selecciona bajo R18.', ['R18']));
            paso('IDENTIDAD_TABLA1', 'Nombre específico ausente: conservar alternativas del identificador para selección protectora bajo R18.', ['R18']);
        }
        if (filas.some(f => condicion(f).derrameEn === 'AGUA')) {
            // GRE24-FLOW-AGUA-EXTINTOR, PDF3 / impresa1. Presentación literal de
            // la rama documental; no resuelve precedencia entre escenarios o usos del agua.
            const originales = catalogo.referencias.filter(r => r.paginaPdf === 3 && (0, matpel_modelo_1.normalizarMatpel)(r.textoOriginal ?? '').includes('Y NO UTILICE AGUA COMO AGENTE EXTINTOR'));
            const a = aviso('GRE24-FLOW-AGUA-EXTINTOR', originales.length
                ? 'Hay referencia de derrame en agua. La caja final del flujo para un solo material indica: «Y no utilice agua cómo agente extintor». Verificar su alcance en el escenario observado y leer la guía completa; no equivale a prohibir todo uso del agua ni a seleccionar un agente alternativo.'
                : 'Hay referencia de derrame en agua, pero falta la fuente de la condición de agente extintor; consultar el PDF original antes de una selección.', ['R20', 'R21', 'R22']);
            a.referenciaIds.push(...originales.map(r => r.id));
            avisos.push(a);
        }
        if (!filas.length) {
            const no = apartado('DATOS_NO_DISPONIBLES', 'La entrada verde no tiene filas de Tabla1 disponibles; no usar cero como distancia.');
            return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: no, proteccion: no });
        }
        const agua = parametros.contactoAgua.valor;
        if (agua === 'TIERRA' && filas.every(f => condicion(f).derrameEn === 'AGUA')) {
            if (!regla('R20')) {
                const no = apartado('DATOS_NO_DISPONIBLES', 'Falta regla para la condición de derrame en agua.');
                return finalizar({ ...resultado, tabla1: no, tabla2: no, aislamiento: no, proteccion: no });
            }
            const no = apartado('NO_APLICABLE', 'Solo hay fila de derrame en agua y el producto no se derramó en agua; consultar guía naranja.', [], filas, [], ['R20']);
            const guia = apartado('DATOS_NO_DISPONIBLES', 'Las tablas verdes no aplican a este derrame en tierra; consultar distancias y condiciones de la guía naranja.', ['distanciasGuia'], [], [], ['R20', 'R15']);
            guia.referenciaIds.push(...resultado.guias.map(g => g.referenciaId));
            paso('MEDIO_DERRAME', no.motivo, ['R20']);
            return finalizar({ ...resultado, tabla1: no, tabla2: no, tabla3: no, aislamiento: guia, proteccion: guia });
        }
        if (agua === 'AGUA' || agua === 'TIERRA')
            filas = filas.filter(f => !condicion(f).derrameEn || condicion(f).derrameEn === agua);
        const variasCondiciones = filas.some(f => condicion(f).derrameEn);
        if ((agua === null || agua === 'AMBOS') && variasCondiciones) {
            if (!regla('R19')) {
                const no = apartado('INDETERMINADO', 'Derrame en agua/tierra sin regla de selección disponible.', ['contactoAgua'], filas);
                return finalizar({ ...resultado, tabla1: no, aislamiento: no, proteccion: no });
            }
            avisos.push(aviso('AGUA_TIERRA_MAYOR_PROTECCION', 'Agua/tierra indeterminado o ambos: conservar las alternativas y elegir la mayor protección bajo R19.', ['R19']));
            paso('MEDIO_DERRAME', 'Medio desconocido/ambos: conservar alternativas, mayor protección sólo bajo R19.', ['R19']);
        }
        const gases = deTabla('TABLA_2').filter(f => condicion(f).identificador === e.identificador);
        resultado.tabla2 = apartado(agua === 'TIERRA' ? 'NO_APLICABLE' : agua === null ? 'INDETERMINADO' : gases.length ? 'APLICABLE' : 'NO_APLICABLE', 'Gases producidos informativos: no sustituir la identidad ni consultar sus distancias como reemplazo.', agua === null ? ['contactoAgua'] : [], gases, catalogo.celdas.filter(c => gases.some(f => (0, gre_artefacto_1.mismoId)(f.id, c.filaId))), ['R21', 'R22']);
        let tamano = null;
        const cantidad = parametros.cantidad.valor;
        const r16 = regla('R16');
        if (cantidad && (cantidad.unidad === 'L' || cantidad.unidad === 'm3') && r16) {
            const p = JSON.parse(r16.parametrosJson ?? '{}');
            if (typeof p.pequenoHastaLitros === 'string' && p.limiteIncluido === true) {
                tamano = (0, matpel_modelo_1.compararDecimal)(cantidad.valorDecimal, p.pequenoHastaLitros, cantidad.unidad === 'm3' ? 1000n : 1n) <= 0 ? 'PEQUENO' : 'GRANDE';
            }
        }
        if (!tamano) {
            const no = apartado('INDETERMINADO', 'Se necesita cantidad liberada en volumen y regla de tamaño; no convertir masa a litros sin densidad respaldada.', ['cantidadVolumen'], filas, [], ['R16']);
            return finalizar({ ...resultado, tabla1: no, tabla3: no, aislamiento: no, proteccion: no });
        }
        paso('TAMANO_DERRAME', `Volumen liberado clasificado ${tamano}; no inferido de capacidad nominal.`, ['R16']);
        resultado.tabla1 = apartado('APLICABLE', 'Filas de la identidad y condiciones conservadas.', [], filas, [], ['R13', 'R16', 'R18', 'R19', 'R20']);
        const obtenerCeldas = (fs, columna) => fs.flatMap(f => perfil.celdasPorFila.get(f.id.toLowerCase()) ?? []).filter(c => c.columnaCodigo === columna);
        const seleccionar = (fs, columna, mayor, codigos) => {
            const cs = obtenerCeldas(fs, columna);
            if (!cs.length || cs.some(c => c.estadoDato !== 'DATO' || c.valorDecimal === null || !/^\d+(\.\d+)?$/.test(c.valorDecimal))) {
                return apartado('DATOS_NO_DISPONIBLES', 'La celda es una remisión, está vacía o no tiene dato numérico validado.', [], fs, cs, codigos);
            }
            if (new Set(cs.map(c => c.unidadOriginal)).size !== 1)
                return apartado('DATOS_NO_DISPONIBLES', 'Unidades incompatibles en la selección.', [], fs, cs, codigos);
            let seleccion = cs;
            if (mayor) {
                const max = cs.reduce((a, b) => (0, matpel_modelo_1.compararDecimal)(a.valorDecimal, b.valorDecimal) >= 0 ? a : b);
                seleccion = cs.filter(c => (0, matpel_modelo_1.compararDecimal)(c.valorDecimal, max.valorDecimal) === 0);
                // Un + de una alternativa menor tampoco define una cota superior comparable.
                if (cs.some(c => c.modificador))
                    seleccion = cs;
            }
            else if (cs.some(c => (0, matpel_modelo_1.compararDecimal)(c.valorDecimal, cs[0].valorDecimal) !== 0 || c.modificador !== cs[0].modificador)) {
                return apartado('INDETERMINADO', 'Hay distancias de aislamiento diferentes; no aplicar a aislamiento una regla que solo ordena protección.', [], fs, cs, codigos);
            }
            const hayCotaAbierta = seleccion.some(c => c.modificador);
            return apartado(hayCotaAbierta && seleccion.length > 1 ? 'INDETERMINADO' : 'APLICABLE', hayCotaAbierta ? 'La fuente contiene modificador: no es un límite máximo garantizado.' : 'Selección tabular sin modificar los valores originales.', [], fs, seleccion, codigos);
        };
        const a = obtenerCeldas(filas, `${tamano}_AISLAR_M`);
        const remitidas = a.some(c => c.estadoDato === 'REFERENCIA');
        if (remitidas) {
            const r23 = regla('R23');
            const r24 = regla('R24');
            let t3 = deTabla('TABLA_3').filter(f => (condicion(f).identificadores ?? []).includes(e.identificador));
            const contenedor = parametros.contenedor.valor;
            const viento = parametros.viento.valor;
            const faltantes = [];
            if (!contenedor)
                faltantes.push('contenedor');
            if (!r23 || !r24)
                faltantes.push('reglasTabla3');
            if (!t3.length)
                faltantes.push('filasTabla3');
            if (faltantes.length) {
                const no = apartado('INDETERMINADO', 'Tabla1 remite a Tabla3; no conservar una distancia de otra fila.', faltantes, t3, [], ['R23', 'R24']);
                return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no });
            }
            t3 = t3.filter(f => condicion(f).contenedor === (0, matpel_modelo_1.normalizarMatpel)(contenedor));
            if (t3.length !== 1) {
                const no = apartado('INDETERMINADO', 'El tipo de recipiente no identifica una fila de Tabla3; conservar cantidades nominales y condición de múltiples cilindros.', ['contenedorEspecifico'], t3, [], ['R23']);
                return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no });
            }
            const capacidad = parametros.cantidadContenedor?.valor;
            const numero = parametros.numeroContenedores?.valor;
            const cantidades = perfil.cantidadesTabla3;
            const tipoFila = condicion(t3[0]).contenedor;
            const variantes = perfil.tiposFilaTabla3[tipoFila] ?? [];
            const capFactor = capacidad?.unidad === 'm3' || capacidad?.unidad === 't' ? 1000n : 1n;
            const capUnidad = capacidad?.unidad === 'm3' ? 'L' : capacidad?.unidad === 't' ? 'kg' : capacidad?.unidad;
            const compatibles = capacidad && numero ? cantidades.filter(q => variantes.some(v => v.tipo === q.tipo && numero >= v.minimo && (v.maximo === null || numero <= v.maximo)) && q.unidad === capUnidad &&
                (0, matpel_modelo_1.compararDecimal)(capacidad.valorDecimal, q.desde, capFactor) >= 0 && (0, matpel_modelo_1.compararDecimal)(capacidad.valorDecimal, q.hasta, capFactor) <= 0 &&
                q.presente) : [];
            if (compatibles.length !== 1) {
                const no = apartado('INDETERMINADO', 'Falta cantidad por recipiente/número o no corresponde al tipo y rango publicados. No interpolar ni elegir capacidad cercana.', [...(!capacidad ? ['cantidadContenedor'] : []), ...(!numero ? ['numeroContenedores'] : []), ...(capacidad && numero ? ['cantidadContenedorCompatible'] : [])], t3, [], ['R23']);
                return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no });
            }
            // Control de coherencia cuando ambas cantidades son volumen. No infiere lo
            // liberado a partir de la capacidad y no convierte masa a volumen.
            if (capUnidad === 'L' && (0, matpel_modelo_1.compararDecimal)(cantidad.valorDecimal, capacidad.valorDecimal, cantidad.unidad === 'm3' ? 1000n : 1n, capFactor * BigInt(numero)) > 0) {
                const no = apartado('INDETERMINADO', 'La cantidad liberada excede el volumen informado de los recipientes.', ['cantidadesCoherentes'], t3);
                return finalizar({ ...resultado, tabla3: no, aislamiento: no, proteccion: no });
            }
            avisos.push({ codigo: 'CANTIDADES_TABLA3', motivo: 'Tipo, cantidad por recipiente y número se cotejaron con las cantidades de referencia; el volumen liberado es un dato separado.',
                referenciaIds: [...new Set(compatibles.flatMap(q => q.referenciaIds))] });
            paso('RECIPIENTE_TABLA3', 'Tipo, capacidad nominal y número cumplen una alternativa publicada; volumen liberado separado.', ['R23']);
            resultado.tabla3 = apartado('APLICABLE', 'Fila de Tabla3 para derrame grande y recipiente explícito; las cantidades de referencia se conservan en la fuente.', [], t3, [], ['R23']);
            resultado.aislamiento = seleccionar(t3, 'AISLAR_M', false, ['R23']);
            let clase = null;
            if (viento?.velocidadDecimal && (viento.unidad === 'km/h' || viento.unidad === 'mph' || viento.unidad === 'm/s')) {
                const rangos = JSON.parse(r24.parametrosJson ?? '{}')[viento.unidad === 'mph' ? 'mph' : 'kmh'];
                const compararViento = (limite) => (0, matpel_modelo_1.compararDecimal)(viento.velocidadDecimal, limite, viento.unidad === 'm/s' ? 18n : 1n, viento.unidad === 'm/s' ? 5n : 1n);
                if (viento.unidad === 'm/s')
                    avisos.push(aviso('CONVERSION_VIENTO_SIGBO', 'Conversión SIGBO exacta de m/s a km/h para cotejar los rangos publicados; conservar el dato original.', ['R24']));
                if (rangos && ['leveMenorQue', 'moderadoDesde', 'moderadoHasta', 'fuerteMayorQue'].every(k => typeof rangos[k] === 'string')) {
                    clase = compararViento(rangos.leveMenorQue) < 0 ? 'LEVE'
                        : compararViento(rangos.moderadoDesde) >= 0 && compararViento(rangos.moderadoHasta) <= 0 ? 'MODERADO'
                            : compararViento(rangos.fuerteMayorQue) > 0 ? 'FUERTE' : null;
                }
            }
            resultado.proteccion = parametros.periodo.valor && clase ? seleccionar(t3, `${parametros.periodo.valor}_${clase}_KM`, false, ['R17', 'R23', 'R24'])
                : apartado('INDETERMINADO', 'Se necesitan periodo y velocidad/clase de viento; no establecerlos por hora fija ni presumir calma.', [...(!parametros.periodo.valor ? ['periodo'] : []), ...(!clase ? ['velocidadViento'] : [])], t3);
            paso('PERIODO_VIENTO_TABLA3', `Periodo ${parametros.periodo.valor ?? 'DESCONOCIDO'}; viento ${clase ?? 'DESCONOCIDO'}.`, ['R17', 'R24']);
        }
        else {
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
};
exports.MotorMatpelService = MotorMatpelService;
exports.MotorMatpelService = MotorMatpelService = __decorate([
    (0, common_1.Injectable)()
], MotorMatpelService);

},
"matpel-modelo":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizarMatpel = void 0;
exports.compararDecimal = compararDecimal;
const normalizarMatpel = (texto) => texto.replace(/(\S)-\n/g, '$1-')
    .normalize('NFD').replace(/\p{M}/gu, '').toUpperCase().replace(/\s+/g, ' ').trim();
exports.normalizarMatpel = normalizarMatpel;
/** Comparación decimal exacta, sin truncamiento ni conversión de masa a volumen. */
function compararDecimal(a, b, factorA = 1n, factorB = 1n) {
    const partes = (v) => {
        if (v.length > 120 || !/^\d+(\.\d+)?$/.test(v))
            throw new Error('Decimal GRE inválido.');
        const [entero, fraccion = ''] = v.split('.');
        return { entero: BigInt(entero + fraccion), escala: 10n ** BigInt(fraccion.length) };
    };
    const x = partes(a);
    const y = partes(b);
    const d = x.entero * factorA * y.escala - y.entero * factorB * x.escala;
    return d < 0n ? -1 : d > 0n ? 1 : 0;
}

},
"matpel-perfil":function(require,module,exports){
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashMatpel = exports.FUENTE_ESTUDIADA_MATPEL = exports.VERSION_INTERPRETACION_MATPEL = void 0;
exports.canonicalMatpel = canonicalMatpel;
exports.perfilMatpel = perfilMatpel;
exports.lecturaGuiasMatpel = lecturaGuiasMatpel;
const crypto_1 = require("crypto");
const gre2024_definiciones_json_1 = __importDefault(require("./fuentes/gre2024-definiciones.json"));
const matpel_modelo_1 = require("./matpel-modelo");
const gre_artefacto_1 = require("./gre-artefacto");
exports.VERSION_INTERPRETACION_MATPEL = gre2024_definiciones_json_1.default.versionInterpretacion;
exports.FUENTE_ESTUDIADA_MATPEL = gre2024_definiciones_json_1.default.documentoSha256;
function canonicalMatpel(v) {
    if (Array.isArray(v))
        return `[${v.map(canonicalMatpel).join(',')}]`;
    if (v && typeof v === 'object')
        return `{${Object.keys(v).filter(k => v[k] !== undefined).sort()
            .map(k => `${JSON.stringify(k)}:${canonicalMatpel(v[k])}`).join(',')}}`;
    return JSON.stringify(v);
}
const hashMatpel = (v) => (0, crypto_1.createHash)('sha256').update(canonicalMatpel(v)).digest('hex');
exports.hashMatpel = hashMatpel;
const compactar = (s) => (0, matpel_modelo_1.normalizarMatpel)(s).replace(/\s/g, '');
const cache = new WeakMap();
/** Preparación de UNA lectura inmutable: no interpreta cantidades con regex al evaluar. */
function preparar(c) {
    const porPagina = new Map();
    for (const r of c.referencias) {
        const lista = porPagina.get(r.paginaPdf) ?? [];
        lista.push(r);
        porPagina.set(r.paginaPdf, lista);
    }
    const referencias = (pagina, literal) => {
        const rs = porPagina.get(pagina) ?? [];
        if (literal === null)
            return { presente: false, referenciaIds: [] };
        const original = compactar(literal);
        const textoPagina = rs.map(r => compactar(r.textoOriginal ?? '')).join('');
        const presente = !!original && textoPagina.includes(original);
        const ids = rs.filter(r => {
            const t = compactar(r.textoOriginal ?? '');
            return t.length > 2 && (original.includes(t) || t.includes(original));
        }).map(r => r.id);
        return { presente, referenciaIds: presente ? ids : [] };
    };
    const compatible = c.documento.sha256 === exports.FUENTE_ESTUDIADA_MATPEL;
    const cantidadesTabla3 = compatible ? gre2024_definiciones_json_1.default.cantidadesTabla3.map(q => ({ ...q,
        ...referencias(q.paginaPdf, q.literal) })).filter(q => q.presente) : [];
    const condicionesDocumentales = compatible ? gre2024_definiciones_json_1.default.reglasDocumentales.map(r => ({ ...r,
        fuentes: r.fuentes.map(f => ({ ...f, ...referencias(f.paginaPdf, f.extractoLiteral) })),
        validacion: 'DOCUMENTAL_NO_ACEPTACION_OPERACIONAL' })) : [];
    const entradasPorId = new Map(c.entradas.map(e => [e.id.toLowerCase(), e]));
    const reglasPorCodigo = new Map(c.reglas.map(r => [r.codigo, r]));
    const filasPorTabla = new Map();
    const condicionesPorFila = new Map();
    for (const f of c.filas) {
        const clave = f.tablaId.toLowerCase();
        const fs = filasPorTabla.get(clave) ?? [];
        fs.push(f);
        filasPorTabla.set(clave, fs);
        // Estructura cerrada validada por la importación; un JSON dañado detiene preparación.
        const condicion = JSON.parse(f.condicionesJson ?? '{}');
        if (!condicion || typeof condicion !== 'object' || Array.isArray(condicion))
            throw new Error('Condición GRE inválida.');
        condicionesPorFila.set(f.id.toLowerCase(), condicion);
    }
    const celdasPorFila = new Map();
    for (const celda of c.celdas) {
        const clave = celda.filaId.toLowerCase();
        const cs = celdasPorFila.get(clave) ?? [];
        cs.push(celda);
        celdasPorFila.set(clave, cs);
    }
    return { compatible, cantidadesTabla3, tiposFilaTabla3: gre2024_definiciones_json_1.default.tiposFilaTabla3,
        condicionesDocumentales, entradasPorId, reglasPorCodigo, filasPorTabla,
        condicionesPorFila, celdasPorFila, sha256Interpretacion: (0, exports.hashMatpel)(gre2024_definiciones_json_1.default),
        sha256Contenido: c.sha256Contenido ?? (0, exports.hashMatpel)({ entradas: c.entradas, guias: c.guias,
            bloques: c.bloques, tablas: c.tablas, filas: c.filas, celdas: c.celdas, reglas: c.reglas,
            camposFuente: c.camposFuente, referencias: c.referencias, paginas: c.paginas, secciones: c.secciones }) };
}
function perfilMatpel(c) {
    const previo = cache.get(c);
    if (previo)
        return previo;
    const perfil = preparar(c);
    cache.set(c, perfil);
    return perfil;
}
/** Texto contextual íntegro; no extrae un número ni adopta sus acciones. */
function lecturaGuiasMatpel(c, guiaIds) {
    return c.guias.filter(g => guiaIds.some(id => (0, gre_artefacto_1.mismoId)(id, g.id))).map(g => {
        const bloques = c.bloques.filter(b => (0, gre_artefacto_1.mismoId)(b.guiaId, g.id));
        const evacuacion = bloques.filter(b => (0, matpel_modelo_1.normalizarMatpel)(b.encabezadoOriginal ?? '') === 'EVACUACION');
        const perfil = perfilMatpel(c);
        const condiciones = perfil.condicionesDocumentales.filter(r => r.id.startsWith(`GRE24-G${g.numero}-`));
        return { guiaId: g.id, numero: g.numero, referenciaId: g.referenciaId,
            tratamiento: 'LECTURA_DOCUMENTAL', bloquesTotales: bloques.length,
            estadoImplementacion: 'LECTURA_COMPLETA_SIN_SELECCION_AUTOMATICA',
            distancias: evacuacion.map(b => ({ bloqueId: b.id, textoOriginal: b.textoOriginal,
                referenciaId: b.referenciaId, finalidad: 'AISLAMIENTO_Y_EVACUACION_CONDICIONADOS' })),
            condiciones, advertencia: 'Leer todas las condiciones de la guía. Este texto no selecciona una distancia ni una acción por sí solo.' };
    });
}

},
"matpel-recorrido":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.solicitudesMatpel = solicitudesMatpel;
const matpel_perfil_1 = require("./matpel-perfil");
function solicitudesMatpel(c, entradaIds, p, r) {
    const perfil = (0, matpel_perfil_1.perfilMatpel)(c);
    const e = entradaIds.length === 1 ? perfil.entradasPorId.get(entradaIds[0].toLowerCase()) : null;
    if (!e || !perfil.compatible)
        return [];
    const campos = new Map();
    const agregar = (campo, etiqueta, motivo, regla) => {
        const ref = perfil.reglasPorCodigo.get(regla)?.referenciaId;
        campos.set(campo, { campo, etiqueta, motivo, referenciaIds: ref ? [ref] : [] });
    };
    if (p.incendio.valor === null)
        agregar('incendio', 'Incendio presente', 'Determina la consulta de distancias de incendio en la guía.', 'R14');
    const faltantes = [...new Set([r.aislamiento, r.proteccion, r.tabla1, r.tabla3].flatMap(x => x.faltantes))];
    const nombres = {
        cantidadVolumen: ['cantidad', 'Cantidad liberada en volumen', 'R16'],
        periodo: ['periodo', 'Periodo observado', 'R17'],
        contenedor: ['contenedor', 'Tipo de recipiente publicado', 'R23'],
        contenedorEspecifico: ['contenedor', 'Tipo de recipiente publicado', 'R23'],
        cantidadContenedor: ['cantidadContenedor', 'Cantidad de referencia por recipiente', 'R23'],
        numeroContenedores: ['numeroContenedores', 'Número de recipientes', 'R23'],
        velocidadViento: ['viento', 'Velocidad del viento', 'R24'],
        contactoAgua: ['contactoAgua', 'Medio del derrame', 'R19'],
        cantidadContenedorCompatible: ['cantidadContenedor', 'Revisar cantidad de referencia por recipiente', 'R23'],
        cantidadesCoherentes: ['cantidad', 'Revisar cantidad liberada y recipientes', 'R23'],
    };
    for (const k of faltantes) {
        const n = nombres[k];
        if (n)
            agregar(n[0], n[1], 'Necesario para resolver la condición indicada; puede conservarse desconocido.', n[2]);
    }
    // El medio puede resolver alternativas bajo R19 sin invalidar su selección autorizada.
    if (e.resaltadoVerde && p.contactoAgua.valor === null) {
        const hayAgua = c.filas.some(f => perfil.condicionesPorFila.get(f.id.toLowerCase())?.identificador === e.identificador &&
            perfil.condicionesPorFila.get(f.id.toLowerCase())?.derrameEn === 'AGUA');
        if (hayAgua)
            agregar('contactoAgua', 'Medio del derrame', 'Conservar alternativas agua/tierra mientras se desconozca.', 'R19');
    }
    return [...campos.values()];
}

},
"matpel-geometria":function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.geometriaMatpel = geometriaMatpel;
const RADIO_TIERRA_M = 6371008.8; // Modelo esférico complementario de SIGBO, no dato GRE.
const rad = (v) => v * Math.PI / 180;
const deg = (v) => v * 180 / Math.PI;
/** Proyección geodésica esférica de un desplazamiento local este/norte. */
function desplazar(origen, este, norte) {
    const distancia = Math.hypot(este, norte) / RADIO_TIERRA_M;
    const rumbo = Math.atan2(este, norte);
    const lat = rad(origen[1]);
    const lon = rad(origen[0]);
    const lat2 = Math.asin(Math.sin(lat) * Math.cos(distancia) + Math.cos(lat) * Math.sin(distancia) * Math.cos(rumbo));
    const lon2 = lon + Math.atan2(Math.sin(rumbo) * Math.sin(distancia) * Math.cos(lat), Math.cos(distancia) - Math.sin(lat) * Math.sin(lat2));
    return [((deg(lon2) + 540) % 360) - 180, deg(lat2)];
}
/** GRE PDF297 / impresa295: círculo de aislamiento y cuadrado a favor del viento.
 * Representación complementaria; no calcula concentraciones ni órdenes SCI. */
function geometriaMatpel(e, p, c) {
    const motivos = [];
    const regla = c.reglas.find(r => r.codigo === 'R25');
    const resultado = { versionGeometria: 'sigbo-gre-figura-1', modelo: 'ESFERA_6371008_8_M',
        finalidad: 'ORIENTACION_INICIAL_NO_MODELO_DISPERSION', versionGreId: e.versionGreId, inputsHash: e.inputsHash,
        referenciaIds: regla ? [regla.referenciaId] : [], calidadUbicacion: p.ubicacion.certeza, calidadViento: p.viento.certeza,
        precisionM: p.ubicacion.valor?.precisionM ?? null, aislamiento: null,
        proteccion: null, motivos };
    if (!regla) {
        motivos.push('La edición no tiene la referencia de la figura GRE.');
        return resultado;
    }
    const ubicacion = p.ubicacion.valor;
    if (!ubicacion) {
        motivos.push('Ubicación del derrame desconocida.');
        return resultado;
    }
    // Límites de representación SIGBO; nunca se presentan como límite de peligro GRE.
    if (Math.abs(ubicacion.latitud) > 85) {
        motivos.push('La representación disponible no cubre zonas polares.');
        return resultado;
    }
    if (p.incendio.valor !== false) {
        motivos.push('Incendio presente o desconocido: consultar guía y condiciones antes de representar zonas de derrame.');
        return resultado;
    }
    if (p.contactoAgua.valor !== 'TIERRA' && e.tabla2.filaIds.length) {
        motivos.push('Material reactivo en agua: la fuente puede desplazarse; verificar origen efectivo antes de representar zonas.');
        return resultado;
    }
    const centro = [ubicacion.longitud, ubicacion.latitud];
    const distancia = (a) => {
        if (a.estado !== 'APLICABLE' || !a.celdas.length || a.celdas.some(x => x.modificador || x.estadoDato !== 'DATO' || x.valorDecimal === null))
            return null;
        const valores = a.celdas.map(x => x.unidadOriginal === 'm' ? Number(x.valorDecimal) : x.unidadOriginal === 'km' ? Number(x.valorDecimal) * 1000 : NaN);
        if (valores.some(x => !Number.isFinite(x) || x <= 0 || x > 20000) || valores.some(x => x !== valores[0]))
            return null;
        return valores[0];
    };
    const aislamiento = distancia(e.aislamiento);
    const proteccion = distancia(e.proteccion);
    if (aislamiento !== null)
        resultado.aislamiento = { centro, radioM: aislamiento, referenciaIds: e.aislamiento.referenciaIds };
    else
        motivos.push('Aislamiento sin distancia única, positiva y aplicable para la representación.');
    if (proteccion === null) {
        motivos.push('Protección sin distancia única y acotada; un modificador + no define borde máximo.');
        return resultado;
    }
    const viento = p.viento.valor;
    if (!viento || viento.direccionDesdeGrados === null || viento.velocidadDecimal === null || Number(viento.velocidadDecimal) <= 0) {
        motivos.push('Falta dirección desde la que sopla el viento y velocidad positiva observada.');
        return resultado;
    }
    const rumbo = rad((viento.direccionDesdeGrados + 180) % 360);
    const punto = (adelante, lateral) => desplazar(centro, adelante * Math.sin(rumbo) + lateral * Math.cos(rumbo), adelante * Math.cos(rumbo) - lateral * Math.sin(rumbo));
    const vertices = [punto(0, -proteccion / 2), punto(0, proteccion / 2), punto(proteccion, proteccion / 2), punto(proteccion, -proteccion / 2)];
    if (vertices.some(v => Math.abs(v[0] - centro[0]) > 180)) {
        motivos.push('El cuadrado cruza el antimeridiano; la representación disponible requiere partición geográfica.');
        return resultado;
    }
    resultado.proteccion = { type: 'Polygon', coordinates: [[...vertices, vertices[0]]], distanciaM: proteccion, anchoM: proteccion,
        vientoDesdeGrados: viento.direccionDesdeGrados, referenciaIds: e.proteccion.referenciaIds };
    return resultado;
}

},
"dto/matpel-consulta.dto":function(require,module,exports){
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EvaluarMatpelV2Dto = exports.IdentificacionConsultaDto = exports.EvaluarMatpelDto = exports.ParametrosMatpelDto = exports.DatoMatpelDto = exports.TablaMatpelDto = exports.VersionMatpelDto = exports.BuscarMatpelDto = void 0;
exports.validarContextoConsultaMatpel = validarContextoConsultaMatpel;
exports.validarParametrosMatpel = validarParametrosMatpel;
const common_1 = require("@nestjs/common");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class BuscarMatpelDto {
    constructor() {
        this.limite = 20;
    }
}
exports.BuscarMatpelDto = BuscarMatpelDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(120)
], BuscarMatpelDto.prototype, "q", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)()
], BuscarMatpelDto.prototype, "versionGreId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['IDENTIFICADOR', 'NOMBRE', 'GUIA'])
], BuscarMatpelDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50)
], BuscarMatpelDto.prototype, "limite", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000)
], BuscarMatpelDto.prototype, "cursor", void 0);
class VersionMatpelDto {
}
exports.VersionMatpelDto = VersionMatpelDto;
__decorate([
    (0, class_validator_1.IsUUID)()
], VersionMatpelDto.prototype, "versionGreId", void 0);
class TablaMatpelDto extends VersionMatpelDto {
    constructor() {
        super(...arguments);
        this.pagina = 1;
        this.limite = 20;
    }
}
exports.TablaMatpelDto = TablaMatpelDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(4)
], TablaMatpelDto.prototype, "identificador", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100000)
], TablaMatpelDto.prototype, "pagina", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50)
], TablaMatpelDto.prototype, "limite", void 0);
class DatoMatpelDto {
}
exports.DatoMatpelDto = DatoMatpelDto;
__decorate([
    (0, class_validator_1.Allow)()
], DatoMatpelDto.prototype, "valor", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'])
], DatoMatpelDto.prototype, "certeza", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['OPERADOR', 'SIGBO', 'METEOROLOGIA', 'OCR'])
], DatoMatpelDto.prototype, "origen", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)()
], DatoMatpelDto.prototype, "observadoEn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)()
], DatoMatpelDto.prototype, "evidenciaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)()
], DatoMatpelDto.prototype, "fuenteDatoId", void 0);
class ParametrosMatpelDto {
}
exports.ParametrosMatpelDto = ParametrosMatpelDto;
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "eventos", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "incendio", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "cantidad", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "contactoAgua", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "periodo", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "contenedor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "cantidadContenedor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "numeroContenedores", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "viento", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => DatoMatpelDto)
], ParametrosMatpelDto.prototype, "ubicacion", void 0);
class EvaluarMatpelDto extends VersionMatpelDto {
}
exports.EvaluarMatpelDto = EvaluarMatpelDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ArrayUnique)(),
    (0, class_validator_1.IsUUID)(undefined, { each: true })
], EvaluarMatpelDto.prototype, "entradaIds", void 0);
__decorate([
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ParametrosMatpelDto)
], EvaluarMatpelDto.prototype, "parametros", void 0);
class IdentificacionConsultaDto {
}
exports.IdentificacionConsultaDto = IdentificacionConsultaDto;
__decorate([
    (0, class_validator_1.IsUUID)()
], IdentificacionConsultaDto.prototype, "entradaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000)
], IdentificacionConsultaDto.prototype, "observacionOriginal", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'])
], IdentificacionConsultaDto.prototype, "certeza", void 0);
__decorate([
    (0, class_validator_1.IsIn)(['MANUAL', 'PLACA', 'OCR', 'DESCONOCIDO'])
], IdentificacionConsultaDto.prototype, "metodo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsISO8601)()
], IdentificacionConsultaDto.prototype, "observadoEn", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)()
], IdentificacionConsultaDto.prototype, "evidenciaId", void 0);
class EvaluarMatpelV2Dto extends EvaluarMatpelDto {
}
exports.EvaluarMatpelV2Dto = EvaluarMatpelV2Dto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMaxSize)(20),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => IdentificacionConsultaDto)
], EvaluarMatpelV2Dto.prototype, "identificaciones", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['TRANSPORTE_TERRESTRE', 'INSTALACION_FIJA', 'AEREO_MARITIMO', 'DESCONOCIDO'])
], EvaluarMatpelV2Dto.prototype, "ambito", void 0);
function validarContextoConsultaMatpel(ids, ctx) {
    const fallo = () => { throw new common_1.BadRequestException('Identificación o ámbito MATPEL inválidos.'); };
    if (!ctx || typeof ctx !== 'object' || Array.isArray(ctx) || Object.keys(ctx).some(k => !['ambito', 'identificaciones'].includes(k)))
        fallo();
    if (ctx.ambito !== undefined && !['TRANSPORTE_TERRESTRE', 'INSTALACION_FIJA', 'AEREO_MARITIMO', 'DESCONOCIDO'].includes(ctx.ambito))
        fallo();
    if (ctx.identificaciones === undefined)
        return;
    if (!Array.isArray(ctx.identificaciones) || ctx.identificaciones.length !== ids.length)
        fallo();
    const vistos = new Set();
    for (const i of ctx.identificaciones) {
        if (!i || typeof i !== 'object' || Array.isArray(i) || Object.keys(i).some(k => !['entradaId', 'observacionOriginal', 'certeza', 'metodo', 'observadoEn', 'evidenciaId'].includes(k)) ||
            typeof i.entradaId !== 'string' || !ids.some(id => id.toLowerCase() === i.entradaId.toLowerCase()) || vistos.has(i.entradaId.toLowerCase()) ||
            !['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'].includes(i.certeza) ||
            !['MANUAL', 'PLACA', 'OCR', 'DESCONOCIDO'].includes(i.metodo) ||
            (i.observacionOriginal !== null && (typeof i.observacionOriginal !== 'string' || i.observacionOriginal.length > 2000)) ||
            (i.observadoEn !== null && (typeof i.observadoEn !== 'string' || !/(Z|[+-]\d\d:\d\d)$/.test(i.observadoEn) || !Number.isFinite(Date.parse(i.observadoEn)))) ||
            (i.evidenciaId !== null && (typeof i.evidenciaId !== 'string' || !/^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(i.evidenciaId))))
            fallo();
        vistos.add(i.entradaId.toLowerCase());
    }
}
/** Validación de unión discriminada: null nunca significa falso/cero; tampoco se
 * admiten claves extra dentro de valor, que el whitelist de Nest no alcanza. */
function validarParametrosMatpel(p) {
    const fallar = (campo) => { throw new common_1.BadRequestException(`Dato MATPEL inválido: ${campo}.`); };
    const keys = ['eventos', 'incendio', 'cantidad', 'contactoAgua', 'periodo', 'contenedor', 'viento', 'ubicacion'];
    const opcionales = ['cantidadContenedor', 'numeroContenedores'];
    if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).some(k => !keys.includes(k) && !opcionales.includes(k)))
        fallar('parametros');
    const objeto = (valor, campos) => valor && typeof valor === 'object' && !Array.isArray(valor)
        && Object.keys(valor).every(k => campos.includes(k)) && campos.every(k => Object.prototype.hasOwnProperty.call(valor, k));
    const decimal = (valor) => typeof valor === 'string' && valor.length <= 80 && /^\d+(\.\d+)?$/.test(valor);
    const uuid = (valor) => valor === null || typeof valor === 'string' && /^[\da-f]{8}(-[\da-f]{4}){3}-[\da-f]{12}$/i.test(valor);
    for (const key of [...keys, ...opcionales.filter(k => Object.prototype.hasOwnProperty.call(p, k))]) {
        const d = p[key];
        if (!objeto(d, ['valor', 'certeza', 'origen', 'observadoEn', 'evidenciaId', 'fuenteDatoId']) ||
            !['DESCONOCIDO', 'NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'].includes(d.certeza) ||
            !['OPERADOR', 'SIGBO', 'METEOROLOGIA', 'OCR'].includes(d.origen) ||
            !uuid(d.evidenciaId) || !uuid(d.fuenteDatoId) ||
            (d.observadoEn !== null && (typeof d.observadoEn !== 'string' || !/(Z|[+-]\d\d:\d\d)$/.test(d.observadoEn) || !Number.isFinite(Date.parse(d.observadoEn)))) ||
            (d.certeza === 'DESCONOCIDO') !== (d.valor === null))
            fallar(key);
        const v = d.valor;
        if (v === null)
            continue;
        if (key === 'eventos' && (!Array.isArray(v) || !v.length || v.length > 5 || new Set(v).size !== v.length || v.some(x => !['DERRAME', 'FUGA', 'INCENDIO', 'EXPLOSION', 'OTRO'].includes(x))))
            fallar(key);
        if (key === 'incendio' && typeof v !== 'boolean')
            fallar(key);
        if ((key === 'cantidad' || key === 'cantidadContenedor') && (!objeto(v, ['valorDecimal', 'unidad']) || !decimal(v.valorDecimal) || !['L', 'm3', 'kg', 't'].includes(v.unidad)))
            fallar(key);
        if (key === 'numeroContenedores' && (!Number.isSafeInteger(v) || v < 1 || v > 100000))
            fallar(key);
        if (key === 'contactoAgua' && !['TIERRA', 'AGUA', 'AMBOS'].includes(v))
            fallar(key);
        if (key === 'periodo' && !['DIA', 'NOCHE'].includes(v))
            fallar(key);
        if (key === 'contenedor' && (typeof v !== 'string' || !v.trim() || v.length > 200))
            fallar(key);
        if (key === 'viento' && (!objeto(v, ['velocidadDecimal', 'unidad', 'direccionDesdeGrados', 'proveedorId']) ||
            (v.velocidadDecimal !== null && !decimal(v.velocidadDecimal)) ||
            ![null, 'km/h', 'mph', 'm/s'].includes(v.unidad) ||
            (v.velocidadDecimal === null) !== (v.unidad === null) ||
            (v.direccionDesdeGrados !== null && (!Number.isFinite(v.direccionDesdeGrados) || v.direccionDesdeGrados < 0 || v.direccionDesdeGrados >= 360)) ||
            (v.proveedorId !== null && (typeof v.proveedorId !== 'string' || v.proveedorId.length > 100))))
            fallar(key);
        if (key === 'ubicacion' && (!objeto(v, ['latitud', 'longitud', 'precisionM']) ||
            !Number.isFinite(v.latitud) || Math.abs(v.latitud) > 90 || !Number.isFinite(v.longitud) || Math.abs(v.longitud) > 180 ||
            (v.precisionM !== null && (!Number.isFinite(v.precisionM) || v.precisionM < 0))))
            fallar(key);
    }
    const datos = p;
    if (datos.eventos.valor?.includes('INCENDIO') && datos.incendio.valor === false)
        fallar('eventos/incendio contradictorios');
}

}};
const definiciones={"schemaVersion":1,"versionInterpretacion":"gre2024-condiciones-2","documentoSha256":"bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af","validacionOperacional":"PENDIENTE","cantidadesTabla3":[{"tipo":"CARROTANQUE DE FERROCARRIL","desde":"80000","hasta":"80000","unidad":"kg","literal":"•\t Carrotanque de ferrocarril: 80 000 kg (176 370 libras)","paginaPdf":340,"paginaImpresa":"338"},{"tipo":"AUTOTANQUE O REMOLQUE","desde":"20000","hasta":"25000","unidad":"kg","literal":"•\t Autotanque o remolque: 20 000 – 25 000 kg (44 092 – 55 116 libras)","paginaPdf":340,"paginaImpresa":"338"},{"tipo":"TANQUE DE AGRICULTURA","desde":"3785","hasta":"3785","unidad":"L","literal":"•\t Tanque de agricultura: 3785 L (1000 galones)","paginaPdf":340,"paginaImpresa":"338"},{"tipo":"CILINDRO PEQUENO","desde":"72","hasta":"72","unidad":"L","literal":"•\t Cilindro pequeño: 72 L (19 galones)","paginaPdf":340,"paginaImpresa":"338"},{"tipo":"CILINDRO TON","desde":"757","hasta":"1135","unidad":"L","literal":"•\t Cilindro ton: 757 - 1135 L (200 - 300 galones)","paginaPdf":340,"paginaImpresa":"338"}],"tiposFilaTabla3":{"CARROTANQUE DE FERROCARRIL":[{"tipo":"CARROTANQUE DE FERROCARRIL","minimo":1,"maximo":1}],"AUTOTANQUE O REMOLQUE":[{"tipo":"AUTOTANQUE O REMOLQUE","minimo":1,"maximo":1}],"TANQUE DE AGRICULTURA":[{"tipo":"TANQUE DE AGRICULTURA","minimo":1,"maximo":1}],"MULTIPLES CILINDROS PEQUENOS":[{"tipo":"CILINDRO PEQUENO","minimo":2,"maximo":null}],"MULTIPLES CILINDROS TONES":[{"tipo":"CILINDRO TON","minimo":2,"maximo":null}],"MULTIPLES CILINDROS PEQUENOS O UN CILINDRO TON":[{"tipo":"CILINDRO PEQUENO","minimo":2,"maximo":null},{"tipo":"CILINDRO TON","minimo":1,"maximo":1}]},"reglasDocumentales":[{"id":"GRE24-FLOW-AGUA-EXTINTOR","descripcion":"El flujo inicial indica no utilizar agua como agente extintor cuando el material incluye la referencia de derrame en agua.","condicionesActivacion":["La fila aplicable de Tabla1 para el material identificado incluye la referencia cuando es derramado en agua; puede no figurar en el nombre del índice.","La aplicación se examina dentro del flujo para un solo material."],"entradasNecesarias":["Identificación específica y referencia de agua del material.","Escenario de incendio y guía naranja pertinente para conservar sus demás condiciones."],"excepcionesYAlteraciones":["No sustituye lectura de la guía específica ni sus instrucciones de enfriamiento/reducción de vapores.","No extrapolar automáticamente el flujo a varios materiales.","La caja final del flujo se conecta con las ramas de material resaltado en verde; no generalizar cualquier mención de agua en una guía."],"reglasRelacionadas":["R02","R20","R21","GRE24-ISSUE-WATER-EXTINGUISHER"],"limites":["La presentación conserva la condición y no recomienda un agente; falta cotejo de precedencia por escenario/material con cada guía."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":3,"paginaImpresa":"1","extractoLiteral":"Y no utilice agua cómo agente extintor."}]},{"id":"GRE24-GEOMETRIA-PROTECCION","descripcion":"Representación de la zona de acción protectora en el diagrama de Tabla1.","condicionesActivacion":["Se ha seleccionado una distancia de acción protectora aplicable D.","Se dispone de origen y dirección del viento para orientar una representación."],"entradasNecesarias":["Distancia D con unidad/finalidad/fuente y condiciones.","Ubicación del derrame y dirección del viento inequívoca."],"excepcionesYAlteraciones":["Fuente puede moverse o extenderse aguas abajo en materiales reactivos en corrientes.","No es modelo físico de dispersión ni límite máximo garantizado.","Sin viento/ubicación suficientes no producir geometría orientada."],"reglasRelacionadas":["R25","R26","R27","GRE24-ISSUE-SCI"],"limites":["Convención de viento meteorológico y cálculo geodésico SIGBO aún no implementados/probados."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":297,"paginaImpresa":"295","extractoLiteral":null}]},{"id":"GRE24-T3-CONTENEDORES-CANTIDADES","descripcion":"Tabla3 asocia diferentes tipos de contenedores con distintas cantidades y conserva unidades de masa y volumen.","condicionesActivacion":["Material pertenece a los grupos seleccionados en Tabla3.","Escenario de derrame grande bajo las condiciones originales."],"entradasNecesarias":["Material preciso.","Tipo de contenedor.","Tamaño del derrame, periodo y categoría de viento."],"excepcionesYAlteraciones":["No extrapolar tipos no listados.","No convertir kg a litros sin información respaldada.","Las cantidades descritas no autorizan asumir que todo el contenido se derramó."],"reglasRelacionadas":["R16","R23","R24","GRE24-ISSUE-T3-QUANTITIES"],"limites":["Clasificación/interpretación exhaustiva del alcance de cada cantidad y sus casos límite pendientes.","Lote 2026-10-10: fuentes propias de las cinco cantidades y distinción de las filas múltiples; todavía no hay selección operativa ni criterio numérico de capacidad diferente."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":340,"paginaImpresa":"338","extractoLiteral":null}]},{"id":"GRE24-G124-AGENTES-AGUA-CONDICIONES","descripcion":"Guía124 limita los agentes en incendio pequeño, conservando la advertencia de reacción con agua.","condicionesActivacion":["Guía124 seleccionada con identificación respaldada.","Incendio pequeño confirmado; el responsable evalúa si debe combatirse."],"entradasNecesarias":["Material preciso y condiciones de su fila.","Tamaño de incendio y necesidad de intervención evaluada por responsable.","Reactividad con agua y alcance de las ramas del flujo inicial."],"excepcionesYAlteraciones":["No transformar esta restricción en recomendación universal de agua.","No completar un apartado de incendio grande que no está en estas páginas.","Interacción con PDF3 pendiente: GRE24-ISSUE-G124-WATER-PRECEDENCE."],"reglasRelacionadas":["GRE24-G124-B08-C01","GRE24-G124-B08-C03"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","No transformar esta restricción en recomendación universal de agua.","No completar un apartado de incendio grande que no está en estas páginas.","Interacción con PDF3 pendiente: GRE24-ISSUE-G124-WATER-PRECEDENCE."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":185,"paginaImpresa":"183","extractoLiteral":"PRECAUCIÓN: Estos materiales no arden, pero mantienen la combustión. Algunos van a reaccionar \nviolentamente con el agua."},{"paginaPdf":185,"paginaImpresa":"183","extractoLiteral":"•\t Solamente agua, no use polvos químicos secos, CO2 o Halon®."}]},{"id":"GRE24-G125-AMONIACO-CONFINADO","descripcion":"Advertencia específica de inflamabilidad del amoniaco anhidro UN1005 en condiciones descritas.","condicionesActivacion":["Guía125 y UN1005, amoniaco anhidro.","Alta concentración y espacio confinado.","Introducción de fuente de ignición."],"entradasNecesarias":["Identidad confirmada.","Concentración evaluada con evidencia y confinamiento.","Presencia o entrada de ignición."],"excepcionesYAlteraciones":["El literal no fija un umbral de concentración.","No inferir concentración por nombre o cantidad de contenedor."],"reglasRelacionadas":["GRE24-G125-B03-C07"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","El literal no fija un umbral de concentración.","No inferir concentración por nombre o cantidad de contenedor."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":186,"paginaImpresa":"184","extractoLiteral":"•\t Para UN1005: el amoniaco anhidro, en altas concentraciones en espacios confinados, presenta riesgo de \ninflamabilidad si una fuente de ignicion se introduce."}]},{"id":"GRE24-G126-AEROSOL-PROPELENTE","descripcion":"UN1950 puede contener propelente inflamable pese al título de gases comprimidos/licuados.","condicionesActivacion":["Guía126 seleccionada.","Material identificado como aerosol UN1950."],"entradasNecesarias":["Identidad y composición disponible del aerosol."],"excepcionesYAlteraciones":["Puede contener no equivale a todos contienen.","Composición desconocida no elimina advertencia."],"reglasRelacionadas":["GRE24-G126-B02-C04"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","Puede contener no equivale a todos contienen.","Composición desconocida no elimina advertencia."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":188,"paginaImpresa":"186","extractoLiteral":"PRECAUCIÓN: Los aerosoles (UN1950) pueden contener un propelente inflamable."}]},{"id":"GRE24-G127-ESPUMA-ALCOHOL-IDENTIDADES","descripcion":"Advertencia específica de espuma resistente al alcohol para incendios con identificadores listados.","condicionesActivacion":["Guía127 seleccionada.","Incendio que involucra UN1170, UN1987 o UN3475."],"entradasNecesarias":["Identificador y certeza de material involucrado.","Incendio y composición del agente disponible."],"excepcionesYAlteraciones":["No limitar la advertencia general a un tamaño de incendio que no indica su literal.","No inferir compatibilidad de otro agente por aparecer en la lista del subapartado."],"reglasRelacionadas":["GRE24-G127-B08-C02"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","No limitar la advertencia general a un tamaño de incendio que no indica su literal.","No inferir compatibilidad de otro agente por aparecer en la lista del subapartado."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":191,"paginaImpresa":"189","extractoLiteral":"PRECAUCIÓN: Para incendios que involucren UN1170, UN1987 o UN3475, debe utilizarse espuma \nresistente al alcohol."}]},{"id":"GRE24-G128-REMISION-HIBRIDOS","descripcion":"Vehículo híbrido en guía128 requiere consulta adicional de guía147 o138 según batería.","condicionesActivacion":["Guía128 seleccionada.","Vehículo híbrido involucrado."],"entradasNecesarias":["Tipo de vehículo.","Identidad de batería: ion litio/ion sodio frente a sodio."],"excepcionesYAlteraciones":["La remisión no borra los peligros y contexto de guía128.","Este lote no demuestra lectura completa de138/147."],"reglasRelacionadas":["GRE24-G128-B02-C11"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","La remisión no borra los peligros y contexto de guía128.","Este lote no demuestra lectura completa de138/147."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":192,"paginaImpresa":"190","extractoLiteral":"•\t Para vehículos híbridos, la GUÍA 147 (Baterías de ión litio o ión sodio) o la GUÍA 138 (Baterías de sodio) \ntambién deben ser consultadas."}]},{"id":"GRE24-G128-AGUA-CRUDO-TANQUE-DANADO","descripcion":"Prohibición localizada de agua directa en carro tanque dañado con petróleo crudo.","condicionesActivacion":["Guía128 seleccionada y petróleo crudo identificado.","Carro tanque dañado.","Aplicación directa de agua al recipiente descrito."],"entradasNecesarias":["Identidad del producto.","Tipo de recipiente y evidencia de daño.","Finalidad y lugar de aplicación del agua."],"excepcionesYAlteraciones":["No extender a todo líquido o recipiente sin fuente.","Agua directa, enfriamiento y abatimiento de vapor no se unifican."],"reglasRelacionadas":["GRE24-G128-B08-C09"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","No extender a todo líquido o recipiente sin fuente.","Agua directa, enfriamiento y abatimiento de vapor no se unifican."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":193,"paginaImpresa":"191","extractoLiteral":"•\t Para el petróleo crudo, no rocíe agua directamente en un carro tanque dañado. Esto puede conducir a \nuna peligrosa rebosamiento por ebullición."}]},{"id":"GRE24-G129-POLVO-SECO-NITROS","descripcion":"Excepción de extintores de productos químicos secos para fuegos con nitrometano o nitroetano.","condicionesActivacion":["Guía129 seleccionada.","Fuego involucrando UN1261 nitrometano o UN2842 nitroetano.","El texto está en el subapartado incendio pequeño; conservar esa ubicación."],"entradasNecesarias":["Identidad confirmada.","Escenario y tamaño de incendio.","Tipo de producto extintor."],"excepcionesYAlteraciones":["Literal dice fuegos: precedencia para otros tamaños pendiente.","No transferir a todos los materiales de129 ni a130."],"reglasRelacionadas":["GRE24-G129-B08-C03"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","Literal dice fuegos: precedencia para otros tamaños pendiente.","No transferir a todos los materiales de129 ni a130."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":195,"paginaImpresa":"193","extractoLiteral":"•\t No usar extintores de productos químicos secos, para controlar fuegos que involucren nitrometano \n(UN1261) o nitroetano (UN2842)."}]},{"id":"GRE24-G128-G130-ESPUMA-CONDICIONAL","descripcion":"Alternativa de espuma resistente al alcohol cuando la regular es ineficaz o no está disponible.","condicionesActivacion":["Guía128 o130 seleccionada, en escenario de fuego del subapartado.","Espuma regular ineficaz O no disponible."],"entradasNecesarias":["Guía/material y tamaño de incendio.","Disponibilidad de espuma regular.","Eficacia evaluada con evidencia; no inferida por software."],"excepcionesYAlteraciones":["Ineficaz y no disponible son condiciones distintas.","Desconocido no equivale a falso; preservar información incompleta.","El bloque grande conserva la misma condición en sus propias fuentes."],"reglasRelacionadas":["GRE24-G128-B08-C03","GRE24-G130-B08-C02"],"limites":["Propuesta documental: sin evaluador determinista ni prueba de motor/SCI.","Revisión independiente de interpretación pendiente.","Ineficaz y no disponible son condiciones distintas.","Desconocido no equivale a falso; preservar información incompleta.","El bloque grande conserva la misma condición en sus propias fuentes."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":193,"paginaImpresa":"191","extractoLiteral":"•\t Polvos químicos secos, CO2, rocío de agua o espuma regular. Si la espuma regular no es efectiva, o no \nestá disponible, use espuma resistente al alcohol."},{"paginaPdf":197,"paginaImpresa":"195","extractoLiteral":"•\t Polvos químicos secos, CO2, rocío de agua o espuma regular. Si la espuma regular no es efectiva, o no \nestá disponible, use espuma resistente al alcohol."}]},{"id":"GRE24-G131-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía131: Líquidos Inflamables - Tóxicos.","condicionesActivacion":["Guía131 seleccionada y material identificado como metanol UN1230, durante detección o evaluación de fuego."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Salud precede incendio. Metanol UN1230 puede arder con llama invisible: ausencia de llama visible no descarta fuego; la advertencia se repite en peligros y respuesta. Cloroacetato de metilo UN2295 conserva el efecto lacrimógeno.","Aislamiento inmediato50m; resaltados remitenTabla1 y otros aumentan según necesidad sin cifra; incendio de tanque/vagón/autotanque800m, con consideración de evacuación separada. Agentes pequeños/grandes no eliminan la advertencia de rocío posiblemente ineficaz. Fuga distingue absorción pequeña, dique grande y vapor que no garantiza prevenir ignición en confinados.","Protección química recomendada solo cuando no exista riesgo de incendio. Auxilios generales más específicos y ERAP canadiense se mantienen separados."],"reglasRelacionadas":[],"limites":["No inferir ausencia de incendio por inspección visual; los métodos citados no certifican equipo disponible.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":198,"paginaImpresa":"196","extractoLiteral":"PRECAUCIÓN: Metanol (UN1230) arderá con llama invisible. Use un método alternativo de detección \n(cámara térmica, palo de escoba, etc.) "},{"paginaPdf":199,"paginaImpresa":"197","extractoLiteral":"PRECAUCIÓN: Metanol (UN1230) arderá con llama invisible. Use un método alternativo de detección \n(cámara térmica, palo de escoba, etc.)"}]},{"id":"GRE24-G132-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía132: Líquidos Inflamables - Corrosivos.","condicionesActivacion":["Guía132, derrame o fuga de hidrazina y selección de absorbente."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Incendio precede salud. Materiales corrosivos pueden reaccionar violentamente con agua; el enfriamiento exterior no autoriza introducirla en contenedores. Distancias50m, Tabla1 para resaltados/otros aumento sin cifra,800m para recipiente en fuego.","Para hidrazina el absorbente es arena SECA o inerte; no presentar la lista general de absorbentes sin esa condición. PolimerizaciónP y calor/incendio no se convierten en certeza de reacción. Fuga grande conserva límite del rocío en confinados.","Auxilios de corrosivos conservan al menos30min y posible lavado adicional como literal documental, sin protocolo médico nuevo. ERAP es nota canadiense."],"reglasRelacionadas":[],"limites":["Identidad desconocida no permite aplicar automáticamente un absorbente general; condición seca/inerte explícita.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":201,"paginaImpresa":"199","extractoLiteral":"•\t Para la hidrazina, absorba con arena SECA o absorbente inerte (vermiculita, almohadillas absorbentes)."}]},{"id":"GRE24-G133-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía133: Sólidos Inflamables.","condicionesActivacion":["Guía133, incendio que involucra pigmento o pasta metálica, en particular pasta de aluminio."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Sólidos inflamables: fricción, polvo/virutas y sustancia fundida sobre punto de inflamación; posible reignición. Aislamiento25m; derrame grande considerar100m a favor del viento; recipiente en fuego800m.","Pigmentos/pastas metálicas tienen apartado propio: pasta de aluminio se trata como metal combustible, con agentes secos/claseD y remisión170. No copiar sin contexto la lista de agua/espuma del fuego ordinario. Derrame seco pequeño usa contenedor limpio/seco y cubierta holgada; grande humedecimiento/dique no debe anular el apartado metálico.","Retirada/signos del tanque y límites de incendio masivo persisten. Remover material fundido solidificado en piel requiere asistencia médica; ERAP canadiense separado."],"reglasRelacionadas":["GRE24-GUIA-170"],"limites":["Resolver remisión170 y conservar tipo de material; agentes del incendio ordinario no resuelven esta rama.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":203,"paginaImpresa":"201","extractoLiteral":"•\t Los incendios de Pasta de Aluminio deben tratarse como incendios de metales combustibles. Use arena \nSECA, polvo de grafito, extintores secos a base de cloruro de sodio o extintores de clase D. También, \nvea la GUÍA 170."}]},{"id":"GRE24-G134-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía134: Sólidos Inflamables - Tóxicos y/o \nCorrosivos.","condicionesActivacion":["Guía134, derrame o fuga y contacto con contenedor dañado o sustancia derramada."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Sólidos inflamables tóxicos/corrosivos, incendio primero; contacto con metales puede producir hidrógeno.25m inmediato,100m considerado para derrame grande y800m en incendio de recipiente.","Fuego pequeño/grande conserva espuma resistente al alcohol y límites de chorros/no agua dentro del contenedor. En fuga no tocar material o envase dañado salvo protección adecuada; herramientas sin chispas y envase forrado de plástico, sin trasladar humedecimiento de133.","La condición de riesgo de incendio limita ropa química recomendada. Auxilios de corrosivos30min/más lavado posible y remisión general son documentación; ERAP no es requisito local."],"reglasRelacionadas":[],"limites":["La excepción exige ropa protectora adecuada; no atribuir suficiencia al equipo estructural ni autorizar intervención.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":205,"paginaImpresa":"203","extractoLiteral":"•\t No tocar los contenedores dañados o el material derramado, a menos que esté usando la ropa protectora \nadecuada."}]},{"id":"GRE24-G135-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía135: Sustancias - Espontáneamente Combustibles.","condicionesActivacion":["Guía135 y xantatos UN3342 o ditionitos UN1384/1923/1929; distinguir fuego pequeño/grande de derrame pequeño."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Combustión espontánea, humedad, reacción con agua, descomposición y reignición; pentaborano UN1380 altamente tóxico. Líquido50m/sólido25m; resaltadosTabla1/otros aumento;800m para recipiente en incendio.","Prohibición general de agua/CO2/espuma SOBRE MATERIAL tiene excepciones explícitas para UN3342,1384,1923,1929 en fuegos pequeños y grandes: agua abundante, no sofocamiento. Listas secas excluyen esos mismos ONU. UN3342 inundado sigue liberando disulfuro de carbono inflamable. Mantener separados enfriamiento exterior, entrada/contacto de agua y material del incendio.","En derrame pequeño de esas identidades aparece disolver con5partes de agua y recolectar; no inventar unidad/base de la proporción ni extenderla al incendio. Fuente contiene advertencia específica frente a cubierta seca/plástica general: conservar ambas, sin precedencia global automática. Auxilios generales y ERAP."],"reglasRelacionadas":[],"limites":["Excepción por identidad y escenario;5partes no tiene base operacional determinada aquí. No silenciar riesgo residual de UN3342 ni imponer precedencia universal.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":207,"paginaImpresa":"205","extractoLiteral":"•\t NO USAR AGUA, CO2 O ESPUMA SOBRE EL MATERIAL."},{"paginaPdf":207,"paginaImpresa":"205","extractoLiteral":"PRECAUCIÓN: Para incendios PEQUEÑOS y GRANDES de Xantatos, UN3342 y Ditionito (Hidrosulfito) \nUN1384, UN1923 y UN1929, USE ABUNDANTE CANTIDAD DE AGUA para detener la reacción. El \nsofocamiento no es útil para estos materiales, éstos no necesitan aire para arder."},{"paginaPdf":207,"paginaImpresa":"205","extractoLiteral":"PRECAUCIÓN: Para derrames de Xantatos, UN3342 y Ditionito (Hidrosulfito) UN1384, UN1923 y UN1929, \ndisolver con 5 partes de agua y recolectar para su disposición final. "},{"paginaPdf":207,"paginaImpresa":"205","extractoLiteral":"PRECAUCIÓN: UN3342 cuando se inunde con agua seguirá desprendiendo vapores inflamables de disulfuro \nde carbono."},{"paginaPdf":207,"paginaImpresa":"205","extractoLiteral":"PRECAUCIÓN: UN3342 cuando se inunde con agua seguirá desprendiendo vapores inflamables de disulfuro \nde carbono."}]},{"id":"GRE24-G136-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía136: Sustancias - Espontáneamente Combustibles - \nTóxicas y/o Corrosivas (reactivas con el aire).","condicionesActivacion":["Guía136 y fósforo UN1381 con posible contacto directo con la sustancia."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Reactiva con aire, incendio primero; puede venir fundida y reignitar. Líquido50m/sólido25m, Tabla1 si resaltado,800m en fuego de recipiente. FósforoUN1381 con posible contacto directo requiere ropa especial aluminizada; no extenderla sin condición.","A diferencia de135, fuego pequeño usa agua/arena o tierra húmeda; grande rocío/niebla y prohíbe dispersar con chorros de alta presión. Fuga pequeña conserva material bajo agua en recipiente metálico; grande cubrir húmedo y dique.","Piel expuesta se mantiene húmeda hasta atención, material fundido requiere médico y ropa/calzado contaminados en metal lleno de agua por peligro al secar. Literales clínicos se conservan, no se convierten en automatismo. ERAP separado."],"reglasRelacionadas":[],"limites":["No transferir prohibición de agua de135; distinguir equipo condicionado, fuga y atención médica.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":208,"paginaImpresa":"206","extractoLiteral":"•\t Para Fósforo UN1381: Cuando hay un posible contacto directo con la sustancia, debe utilizar ropa \nde protección especial aluminizada. "},{"paginaPdf":209,"paginaImpresa":"207","extractoLiteral":"•\t Cubrir con agua, arena o tierra.  Levantar con una pala limpia, colocar el material en un contenedor de \nmetal y conservar el material bajo el agua."},{"paginaPdf":209,"paginaImpresa":"207","extractoLiteral":"•\t Quite y aisle la ropa y el calzado contaminados, y póngalos en un contenedor de metal lleno de agua. \nExiste peligro de incendio si se deja secar."}]},{"id":"GRE24-G137-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía137: Sustancias - Reactivas con el Agua - Corrosivas.","condicionesActivacion":["Guía137; estado de involucramiento del material en incendio, tamaño del fuego y suficiencia de suministro de agua conocidos."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Corrosivos reactivos con agua, salud primero. Anhidrido acéticoUN1715 es excepción inflamable; calor/gases/hidrógeno, contaminación con agua y material fundido conservados. Líquido50m/sólido25m, Tabla1 si resaltado y800m en recipiente incendiado.","Si MATERIAL NO involucrado en incendio, no usar agua sobre él. Pequeño: seco/CO2; grande: agua abundante/niebla y retirada si suministro insuficiente. No introducir agua en contenedor y no aplicarla directamente a fuga/derrame; rocío sobre vapor no equivale a esos usos.","Absorción seca, cubierta plástica, herramientas y prevención de vías; no copiar134. Auxilios de corrosivos30min y remoción fundida médica más generales; ERAP separado."],"reglasRelacionadas":[],"limites":["Uso de agua depende de escenario y destino; desconocido no equivale a material incendiado ni suministro suficiente.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":211,"paginaImpresa":"209","extractoLiteral":"•\t Cuando el material no está involucrado en un incendio, no use agua sobre el mismo."},{"paginaPdf":211,"paginaImpresa":"209","extractoLiteral":"•\t Inunde el área del incendio con grandes cantidades de agua, mientras derriba los vapores con niebla de \nagua. Si el suministro de agua es insuficiente, los respondedores deben retirarse."}]},{"id":"GRE24-G138-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía138: Sustancias - Reactivas con el Agua\n\n(emiten gases inflamables).","condicionesActivacion":["Guía138, derrame de polvo y propuesta de limpieza o disposición."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Emite gases inflamables con agua/humedad, reignición y posibles líquidos portadores inflamables. Líquido50m/sólido25m, derrame grande considerar300m a favor del viento, recipiente en fuego800m.","No agua/espuma para fuego. Metales/polvos tienen agentes secos/claseD, alternativas específicas de litio y remisión170. Enfriamiento exterior no autoriza agua dentro; rocío para vapor requiere evitar contacto de flujos con derrame.","Derrame pequeño seco/plástico y no agua salvo indicación; polvo permanece seco y limpieza/disposición solo con supervisión de especialista. Auxilio conserva quitar material antes de enjuagar20min, más generales; no trasladar agentes de138 a baterías de ion litio147. ERAP separado."],"reglasRelacionadas":["GRE24-GUIA-170"],"limites":["Se requiere supervisión de especialista y mantener seco; no automatizar manejo ni sustituir identidad del material.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":213,"paginaImpresa":"211","extractoLiteral":"•\t NO LO LIMPIE O DESECHE, EXCEPTO BAJO LA SUPERVISION DE UN ESPECIALISTA."},{"paginaPdf":213,"paginaImpresa":"211","extractoLiteral":"•\t Use polvo químico seco, arena SECA, Cloruro de Sodio en polvo, polvo de grafito o extintores de clase D; \nAdemás, para Litio puede usar polvo Lith-X® o polvo de cobre. También vea la GUÍA 170."}]},{"id":"GRE24-G139-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía139: Sustancias - Reactivas con el Agua\n\n(emiten gases inflamables y tóxicos).","condicionesActivacion":["Guía139 e identidad clorosilano; distinguir incendio grande, nota general y reducción de vapores del derrame."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Emite gases inflamables Y tóxicos al contacto con agua; incendio primero y toxicidad no sustituible por138. Líquido50m/sólido25m, resaltadosTabla1/otros aumento sin cifra,800m en recipiente incendiado.","Clorosilanos exceptúan espuma de la prohibición general: para la rama de incendio grande, espuma resistente al alcohol, no agua/polvos secos/cal/carbonato por hidrógeno explosivo. La nota general remite a esa rama; no extender automáticamente su ubicación a todo tamaño sin conservar fuente. Fuga de clorosilanos también espuma para vapores; flujos de agua no contactan material.","Polvo seco/plástico y limpieza solo especialista. Auxilio conserva remoción previa y20min más generales; ERAP canadiense."],"reglasRelacionadas":[],"limites":["Excepción de espuma no elimina prohibición de agua ni agentes que producen hidrógeno; preservar localización y alcance.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":215,"paginaImpresa":"213","extractoLiteral":"•\t NO UTILICE AGUA O ESPUMA (LA ESPUMA PUEDE UTILIZARSE PARA CLOROSILANOS, \n\nVER DEBAJO)"},{"paginaPdf":215,"paginaImpresa":"213","extractoLiteral":"•\t PARA CLOROSILANOS NO USE AGUA, use espuma resistente al alcohol; NO USE polvos químicos \nsecos, cal, o carbonato de sodio, ya que pueden producir grandes cantidades de hidrógeno gaseoso, el \ncual puede explotar. "},{"paginaPdf":215,"paginaImpresa":"213","extractoLiteral":"•\t PARA CLOROSILANOS, use espuma resistente al alcohol para reducir los vapores."}]},{"id":"GRE24-G140-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía140: Oxidantes.","condicionesActivacion":["Guía140, productos de nitrato de amonio y escenario de fuego o contaminación/caliente-fundido-contenido indicado en cada cláusula."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Oxidantes: nitrato de amonio en fuego/contaminado o caliente-fundido-contenido remite112 como explosivo. Líquido50m/sólido25m; derrame grande considerar100m. Recipiente genérico incendiado800m, pero nitrato de amonio dentro de tanque/vagón/remolque incendiado1600m con INICIAR evacuación incluyendo respondedores.","Pequeño agua, no seco/espuma; CO2/Halon control limitado. Grande agua a distancia, no mover carga/vehículo expuestos a calor. Nitrato de amonio en apartado de tanques: no combatir carga, retirarse/evacuar/aislar al menos1600m,112 y no ingreso24h O hasta asesoramiento experto; no convertirlo en permiso automático al cumplir un reloj.","Fuga seca pequeña vs líquida pequeña vs grande se conserva; no agua dentro de envases. Ropa contaminada peligrosa al secarse, auxilios generales y ERAP separado."],"reglasRelacionadas":["GRE24-GUIA-112"],"limites":["1600m y evacuación de respondedores no se reducen al caso genérico800m; conservar24h o experto sin automatizar reingreso.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":216,"paginaImpresa":"214","extractoLiteral":"PRECAUCIÓN: Los productos de nitrato de amonio pueden explotar si están involucrados en un incendio o \ncontaminados con hidrocarburos (combustibles), materia orgánica, u otros contaminantes, o cuando están \ncalientes, fundidos y contenidos. Tratar como un explosivo (GUÍA 112)."},{"paginaPdf":216,"paginaImpresa":"214","extractoLiteral":"•\t Si hay productos de nitrato de amonio dentro de un tanque, vagón de ferrocarril o remolque que está \ninvolucrado en un incendio, AISLE a 1600 metros (1 milla) a la redonda; también, inicie la evacuación \nincluyendo a los respondedores de emergencia a 1600 metros (1 milla) a la redonda."},{"paginaPdf":217,"paginaImpresa":"215","extractoLiteral":"•\t Para productos de nitrato de amonio: No combata el fuego de una carga. Retírese, evacúe y aísle el \nárea por lo menos 1600 metros (1 milla). Tratar como un explosivo (GUÍA 112). No ingrese al área durante \n24 horas, o hasta que un experto haya brindado el asesoramiento. "}]},{"id":"GRE24-G141-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía141: Oxidantes - Tóxicos.","condicionesActivacion":["Guía141 y selección de agentes para incendio pequeño."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Oxidantes tóxicos, incendio primero; toxicidad por ingestión/polvo y riesgo por calor/contaminación. Líquido50m/sólido25m, derrame grande considerar100m a favor del viento, recipiente incendiado800m; no copiar la excepción de nitrato de amonio de140 sin selección pertinente.","Fuego pequeño agua, no polvo seco ni espuma, CO2/Halon control limitado; grande agua a distancia y no mover carga/vehículo expuestos a calor. Fuga seca pequeña cubierta holgada y grande dique; no importar la absorción líquida de142.","Ropa contaminada puede arder al secarse; auxilios generales y ERAP canadiense, no protocolo ni requisito local nuevo."],"reglasRelacionadas":[],"limites":["Control limitado de CO2/Halon no equivale a preferencia ni autorización para cualquier escenario.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":219,"paginaImpresa":"217","extractoLiteral":"•\t Usar agua. No usar polvos químicos secos o espuma. El uso de CO2 y Halon® pueden proveer un \ncontrol limitado."}]},{"id":"GRE24-G142-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía142: Oxidantes - Tóxicos (líquidos).","condicionesActivacion":["Guía142, derrame o fuga; diferenciar reducción de vapores y entrada de agua al contenedor."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Oxidantes tóxicos líquidos: humos tóxicos/inflamables en confinados.50m inmediato; resaltadosTabla1/otros aumento sin cifra;800m si tanque/vagón/autotanque incendiado.","Agentes pequeños/grandes y carga expuesta conservan las restricciones de oxidante. En fuga rocío reduce/desvía vapores, pero no introducir agua en envases. Pequeño líquido se absorbe con material no combustible; grande dique.","Ventilación de espacios exige capacitación/equipo. Protección química recomendada solo sin riesgo de incendio; ropa contaminada peligrosa al secarse. Auxilios generales/ERAP separados."],"reglasRelacionadas":[],"limites":["Rocío para vapor no autoriza inundar el contenedor; preservar escenario y destino de aplicación.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":221,"paginaImpresa":"219","extractoLiteral":"•\t Usar rocío de agua para reducir los vapores; o desviar la nube de vapor a la deriva."},{"paginaPdf":221,"paginaImpresa":"219","extractoLiteral":"•\t No introducir agua en los contenedores."}]},{"id":"GRE24-G143-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía143: Oxidantes (inestables).","condicionesActivacion":["Guía143, derrame grande y propuesta de limpieza o disposición."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Oxidantes inestables: fricción, calor o contaminación, toxicidad y polvo en confinados. Líquido50m/sólido25m, Tabla1 para resaltados y800m si recipiente en fuego.","Incendio pequeño agua/no seco o espuma, grande agua a distancia y no agua dentro por reacción violenta; no mover carga calentada. Fuga pequeña indica inundar área; grande exige especialista para limpieza/disposición. No trasladar inundación pequeña al grande ni a envase.","Dique para escurrimientos del fuego; alejamiento de tanques en llamas, incendio masivo condicionado a monitores. Ropa contaminada al secarse, auxilios generales/ERAP."],"reglasRelacionadas":[],"limites":["Exigir especialista; permiso documental de agua al área pequeña no habilita envase ni derrame grande.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":223,"paginaImpresa":"221","extractoLiteral":"•\t NO LO LIMPIE O DESECHE, EXCEPTO BAJO LA SUPERVISION DE UN ESPECIALISTA."},{"paginaPdf":223,"paginaImpresa":"221","extractoLiteral":"•\t No introducir agua en los contenedores.  Puede ocurrir una reacción violenta."}]},{"id":"GRE24-G144-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía144: Oxidantes (reactivos con el agua).","condicionesActivacion":["Guía144 y fuego o aplicación de agua al derrame/contenedor."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Oxidantes reactivos con agua producen sustancias tóxicas/corrosivas y posibles gases inflamables/hidrógeno. Líquido50m/sólido25m, resaltadosTabla1/otros aumento y800m en recipiente incendiado.","No agua/espuma para fuego, agentes secos en pequeño/grande, alternativa de retirada. Enfriamiento exterior se conserva sin convertirlo en contacto con sustancia; fuga rocío solo evitando flujos al material y prohibición explícita de agua sobre sustancia o dentro.","Pequeño seco/plástico y grande limpieza/disposición solo especialista. No copiar el agua del oxidante ordinario141–143. Ropa contaminada al secarse, auxilios generales/ERAP."],"reglasRelacionadas":[],"limites":["Distinguir enfriamiento exterior, vapor y contacto directo; desconocimiento del destino no autoriza aplicar agua.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":225,"paginaImpresa":"223","extractoLiteral":"•\t NO USAR AGUA O ESPUMA."},{"paginaPdf":225,"paginaImpresa":"223","extractoLiteral":"•\t NO DERRAMAR AGUA sobre la sustancia esparcida o dentro de los contenedores."},{"paginaPdf":225,"paginaImpresa":"223","extractoLiteral":"•\t Usar rocío de agua para reducir los vapores; o desviar la nube de vapor a la deriva. Evite que flujos de \nagua entren en contacto con el material derramado."}]},{"id":"GRE24-G145-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía145: Peróxidos Orgánicos\n\n(susceptibles a la contaminación y al calor).","condicionesActivacion":["Guía145, incendio pequeño y disponibilidad de agua determinada."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Peróxidos sensibles al calor/contaminación, incendio primero. Líquido50m/sólido25m; derrame grande considerar250m A LA REDONDA, no100/300m a favor del viento;800m para recipiente incendiado.","Pequeño prefiere rocío/niebla; seco/CO2/espuma regular solo si no hay agua disponible. Grande agua a distancia, sin chorros directos, sin mover carga/vehículo calentados. Fuga mantener húmedo; absorbente inerte húmedo/no combustible, cubierta holgada/plástica; grande humedecer/dique y especialista.","Ropa contaminada puede arder al secar y auxilios generales. No aparece nota ERAP en estas páginas; no copiarla por semejanza con146."],"reglasRelacionadas":[],"limites":["Los agentes alternativos dependen de falta de agua; disponibilidad desconocida no equivale a ausencia.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":227,"paginaImpresa":"225","extractoLiteral":"•\t Es preferible usar agua en forma de niebla o rocío; si no hay agua disponible utilice polvo químico seco, \nCO2 o espuma regular."}]},{"id":"GRE24-G146-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía146: Peróxidos Orgánicos\n\n(susceptibles a la contaminación, calor y fricción).","condicionesActivacion":["Guía146, derrame grande y propuesta de limpieza o disposición."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Peróxidos sensibles además a choque/fricción; no eliminar esa diferencia respecto145. Líquido50m/sólido25m,250m considerado a la redonda en derrame grande y800m en fuego de recipiente.","Pequeño agua preferida y alternativas solo sin agua; grande agua a distancia sin chorros/carga calentada. Mantener humedad, absorbente inerte húmedo/no combustible y cubierta holgada, grande especialista para limpieza/disposición.","Ropa contaminada al secar y auxilios generales; a diferencia de145 sí figura nota ERAP canadiense."],"reglasRelacionadas":[],"limites":["Humectación y contención no sustituyen supervisión de especialista; no automatizar ejecución.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":229,"paginaImpresa":"227","extractoLiteral":"•\t NO LO LIMPIE O DESECHE, EXCEPTO BAJO LA SUPERVISION DE UN ESPECIALISTA."}]},{"id":"GRE24-G147-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía147: Baterías de Ión Litio y Ión Sodio.","condicionesActivacion":["Guía147, incendio de batería ion litio/sodio; distinguir conexión a vehículo, pequeño o batería pequeña, grande o grandes/múltiples, y riesgosHV/MV."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Baterías de IÓN litio/sodio, no litio/sodio metálico. Electrolito inflamable puede liberarse/arder por temperatura>150°C O daño/abuso;150°C no es umbral universal de seguridad. HF en batería incendiada remite125.25m inmediato, aumento de derrame según necesidad sin cifra; carro/remolque incendiado500m y evacuación de respondedores iniciada.","Reignición hasta semanas, monitoreo térmico si disponible y agua salada no recomendada. Vehículo: consultar fabricante antes de desconectar,12V solo seguro; nunca cortarHV/MV ni tocar dañados/sumergidos; no perforar/cortar/desmontar para acceder. Agua abundante de bateríaHV si disponible y aplicación directa si posible, pequeña cantidad puede liberar gases.","Si batería fuera de vehículo, remisión al apartado pequeño. Pequeño/batería pequeña solo agua abundante, no seco/CO2/Halon; grande/grandes/múltiples dejar consumir/proteger entorno/agua a cercanas. Derrame absorción no combustible y metal para batería fugada/absorbente. Auxilios generales, sinERAP local."],"reglasRelacionadas":[],"limites":["Las ramas de tamaño/vehículo no se fusionan; no inferir seguridad de temperatura ni finalizar vigilancia al desaparecer la llama. Resolver fabricante125.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":231,"paginaImpresa":"229","extractoLiteral":"•\t Nunca corte el cable de alta tensión (HV) o media tensión (MV)."},{"paginaPdf":231,"paginaImpresa":"229","extractoLiteral":"•\t NO perfore, corte, haga palanca ni desmonte ninguna estructura del vehículo para acceder a la batería. \nEl contacto con un componente de alto voltaje puede causar una descarga eléctrica. "},{"paginaPdf":231,"paginaImpresa":"229","extractoLiteral":"•\t Sólo rocíe agua (en grandes cantidades); no utilice productos químicos secos, CO2 o Halon®."},{"paginaPdf":231,"paginaImpresa":"229","extractoLiteral":"•\t Permita que el fuego de la batería se consuma y proteja el entorno. "},{"paginaPdf":231,"paginaImpresa":"229","extractoLiteral":"PRECAUCIÓN: El uso de agua salada para la lucha contra los incendios no es recomendado, ya que puede \naumentar la producción de hidrógeno y fluoruro de hidrógeno gaseoso."},{"paginaPdf":231,"paginaImpresa":"229","extractoLiteral":"•\t El incendio de una batería de ión litio o ión sodio puede volver a encenderse en cualquier momento después \nde que se haya extinguido el fuego, hasta semanas después."}]},{"id":"GRE24-G148-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía148: Peróxidos Orgánicos\n\n(susceptibles a la calor y al contaminación /\n\ntemperatura controlada).","condicionesActivacion":["Guía148, control térmico de la sustancia y fuga; conocer temperatura de control del producto y posibilidad/disponibilidad de refrigerante."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Peróxidos a temperatura controlada: pérdida de control puede iniciar descomposición violenta. Líquido50m/sólido25m,250m considerado circular para derrame grande y800m para recipiente incendiado.","Mantener a temperatura igual o inferior a la de control específica; no hay valor en estas páginas. Pequeño agua preferida/alternativas sin agua; grande conserva restricciones de chorros/carga expuesta. Tanques advertencia de posible explosión.","En fuga no permitir calentamiento, refrigerante y guantes térmicos; si imposible o no disponible, evacuar inmediatamente. Pequeño absorbente húmedo y grande especialista; ropa peligrosa al secar, generales yERAP. Conservar errores editoriales del título/literal original sin corregir fuente."],"reglasRelacionadas":[],"limites":["No inventar temperatura de control ni declarar refrigeración suficiente con datos ausentes; evacuar es indicación documental para decisión competente.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":233,"paginaImpresa":"231","extractoLiteral":"•\t La sustancia deben mantenerse siempre a una temperatura igual o más baja que la “temperatura \nde control”."},{"paginaPdf":233,"paginaImpresa":"231","extractoLiteral":"•\t NO permita que la sustancia se caliente. Use un agente refrigerante como hielo seco o hielo (utilice \nguantes de protección térmica). Si esto no es posible o no pueden obtenerse, evacue el área de \ninmediato."}]},{"id":"GRE24-G149-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía149: Sustancias (auto reactivas).","condicionesActivacion":["Guía149, fuego que involucra tanque/vagón/autotanque y evaluación del contenedor."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Autorreactivos: descomposición/polimerización/ignición por calor, reacción, fricción/impacto;P condicionado y mezclas de vapor/polvo. Líquido50m/sólido25m,250m considerado circular en derrame grande y800m si recipiente en fuego.","Pequeño seco/CO2/rocío/espuma regular sin copiar preferencia de peróxidos; grande agua a distancia. Tanques posible explosión, máxima distancia, enfriamiento y signos de retirada. Fuga pequeña absorbente inerte húmedo/no combustible, herramientas sin chispas y tapas holgadas/plástico.","No añadir temperatura de control de150 a149 por similitud. Auxilios generales yERAP, sin auxilios específicos nuevos."],"reglasRelacionadas":[],"limites":["No asumir estabilidad después de extinguir; conservar advertencia de explosión y signos sin automatizar intervención.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":235,"paginaImpresa":"233","extractoLiteral":"•\t TENGA CUIDADO DE LA POSIBLE EXPLOSIÓN DEL CONTENEDOR."},{"paginaPdf":235,"paginaImpresa":"233","extractoLiteral":"•\t Retírese inmediatamente si sale un sonido creciente de los mecanismos de seguridad de las ventilas, o \nsi el tanque se empieza a decolorar."}]},{"id":"GRE24-G150-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía150: Sustancias\n\n(auto reactivas / temperatura controlada).","condicionesActivacion":["Guía150, fuga y posibilidad/disponibilidad de refrigerante, con temperatura de control específica del producto."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Autorreactivos a temperatura controlada: descomposición autoacelerada por pérdida del control específico; no fusionar149. Líquido50m/sólido25m,250m considerado circular y800m en fuego de recipiente.","Sustancia a temperatura igual o menor que control, sin valor en la guía; pequeño agentes listados, grande agua a distancia, tanques explosión/retirada. Fuga no calentamiento, refrigerante y guantes; imposible/no disponible implica evacuación inmediata.","Absorbente inerte húmedo/no combustible y cubierta holgada/plástica; limpieza/disposición del apartado pequeño solo con especialista. No copiar localización grande de148. Auxilios generales/ERAP, conservar gramática original en literal."],"reglasRelacionadas":[],"limites":["Temperatura desconocida no es conforme; localización de supervisión es derrame pequeño y no se cambia por plantilla.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":237,"paginaImpresa":"235","extractoLiteral":"•\t La sustancia deben mantenerse siempre a una temperatura igual o más baja que la “temperatura \nde control”."},{"paginaPdf":237,"paginaImpresa":"235","extractoLiteral":"•\t NO permita que la sustancia se caliente. Use un agente refrigerante como hielo seco o hielo (utilice \nguantes de protección térmica). Si esto no es posible o no pueden obtenerse, evacue el área de \ninmediato."},{"paginaPdf":237,"paginaImpresa":"235","extractoLiteral":"•\t NO LO LIMPIE O DESECHE, EXCEPTO BAJO LA SUPERVISION DE UN ESPECIALISTA."}]},{"id":"GRE24-G151-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía151: Sustancias - Tóxicas (no combustibles).","condicionesActivacion":["Guía151, fuga de material sólido y prevención de dispersión/inhalación de polvo."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Tóxicos no combustibles, salud primero; no combustión espontánea no elimina descomposición tóxica ni explosión de envases por calor. Líquido50m/sólido25m, resaltadosTabla1/otros aumento según necesidad y800m en fuego de recipiente.","Pequeño seco/CO2/rocío; grande rocío/niebla/espuma regular sin chorros directos. Enfriamiento exterior separado de prohibición de agua dentro, que reaparece en fuga. Fuga cubierta plástica y absorbente seco/no combustible; para sólidos evitar nube e inhalación de polvo.","Contacto solo con protección adecuada, ropa química recomendada solo sin fuego. Auxilios generales yERAP, sin copiar auxilios fundidos de152."],"reglasRelacionadas":[],"limites":["Estado sólido requerido para la cláusula de polvo; no inferir ausencia de toxicidad por no combustibilidad.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":239,"paginaImpresa":"237","extractoLiteral":"•\t Para sólidos, prevenga la nube de polvo y evite la inhalación de polvo."},{"paginaPdf":239,"paginaImpresa":"237","extractoLiteral":"•\t NO INTRODUCIR AGUA EN LOS CONTENEDORES."}]},{"id":"GRE24-G152-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía152: Sustancias - Tóxicas (combustibles).","condicionesActivacion":["Guía152, material fundido solidificado sobre la piel y propuesta de remoción."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Tóxicos combustibles, salud primero; material fundido yP con calor/fuego conservados. Líquido50m/sólido25m,Tabla1 si resaltado y800m en incendio de recipiente.","Pequeño seco/CO2/rocío; grande rocío/niebla/regular, dique/sin chorros. Fuga además elimina ignición; cubierta plástica/absorbente seco, sin agua dentro. No afirmar que no se enciende fácilmente equivale a incombustible.","Material fundido solidificado en piel requiere asistencia médica, más remisión a auxilios generales;ERAP separado."],"reglasRelacionadas":[],"limites":["Reservar remoción a asistencia médica; no convertir cláusula en tratamiento autónomo.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":241,"paginaImpresa":"239","extractoLiteral":"•\t La remoción de material fundido solidificado en la piel requiere asistencia médica."}]},{"id":"GRE24-G153-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía153: Sustancias - Tóxicas y/o Corrosivas\n\n(combustibles).","condicionesActivacion":["Guía153 y selección de agentes para incendio grande."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Tóxicos/corrosivos combustibles, salud primero; bromoacetato de metiloUN2643 lacrimógeno, fundido yP conservados. Líquido50m/sólido25m,Tabla1 si resaltado y800m para recipiente en fuego.","Incendio grande incluye seco/CO2/rocío/espuma resistente al alcohol; no copiar lista de152 con espuma regular. Tanques no agua dentro/enfriamiento/signos de retirada; fuga absorbente seco/no combustible y contacto condicionado a equipo adecuado.","Corrosivos al menos30min/más lavado posible y remoción de fundido médica, siempre con generales;ERAP exterior."],"reglasRelacionadas":[],"limites":["Conservar tamaño y agente exacto; equivalencia con guías parecidas no está demostrada.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":243,"paginaImpresa":"241","extractoLiteral":"•\t Usar polvo químico seco, CO2, rocío de agua o espuma resistente al alcohol."}]},{"id":"GRE24-G154-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía154: Sustancias - Tóxicas y/o Corrosivas\n(no combustibles).","condicionesActivacion":["Guía154 y vehículo o equipo eléctrico con tipo de batería identificado."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Tóxicos/corrosivos no combustibles, salud primero; algunos oxidantes e hidrógeno con metal. Vehículos/equipo eléctrico consultan ADICIONALMENTE147 si ion litio/sodio o138 si sodio: no sustituir por cualquier batería. Líquido50m/sólido25m,Tabla1 si resaltado y800m en fuego de recipiente.","Pequeño seco/CO2/rocío; grande seco/CO2/rocío/espuma resistente al alcohol. Fuga elimina ignición pese título no combustible; absorbente seco/no combustible, no agua dentro y límites de capacitación/contacto.","Auxilios de corrosivos30min más generales; no añadir remoción de fundido porque153 la contiene.ERAP canadiense separado."],"reglasRelacionadas":["GRE24-GUIA-138","GRE24-GUIA-147"],"limites":["147/138 son remisiones adicionales condicionadas por química; batería desconocida no se selecciona por similitud.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":244,"paginaImpresa":"242","extractoLiteral":"•\t Para vehículos o equipo eléctrico, la GUÍA 147 (Baterías de ión litio o ión sodio) o la GUÍA 138 (Baterías \nde sodio) también deben ser consultadas."}]},{"id":"GRE24-G155-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía155: Sustancias - Tóxicas y/o Corrosivas\n\n(inflamables / susceptibles al agua).","condicionesActivacion":["Guía155 y cloruro de acetilo UN1717 durante selección de agente extintor; conservar además rama de clorosilanos si identidad pertinente."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Inflamables susceptibles al agua, incendio primero; reacción, gases, retroceso, hidrógeno/P y lacrimógenos preservados. Líquido50m/sólido25m,Tabla1 si resaltado y800m recipiente incendiado.","Nota de la mayoría de espumas reactiva no desaparece al listar espuma resistente al alcohol. Cloruro de acetiloUN1717 únicamenteCO2 o seco, advertencia previa a tamaños. Clorosilanos en grande no agua/espuma resistente al alcohol y en fuga espuma para vapor. No trasladar automáticamente advertencia seca/cal de139 si155 no la dice.","Fuga no agua sobre material/envase; rocío para vapor evitando contacto, puesta a tierra, cubierta seca/plástica y herramientas sin chispas. Corrosivos30min/generales yERAP."],"reglasRelacionadas":[],"limites":["Restricción únicamenteCO2/seco es específica; no sustituirla por lista genérica ni generalizar a todo155.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":247,"paginaImpresa":"245","extractoLiteral":"PRECAUCIÓN: Para el Cloruro de Acetilo (UN1717), use únicamente CO2 o polvo químico seco."},{"paginaPdf":247,"paginaImpresa":"245","extractoLiteral":"•\t PARA CLOROSILANOS, NO USE AGUA, use espuma resistente al alcohol."},{"paginaPdf":247,"paginaImpresa":"245","extractoLiteral":"•\t Nota:  La mayoría de las espumas reaccionan con el material y despiden gases corrosivos/tóxicos."}]},{"id":"GRE24-G156-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía156: Sustancias - Tóxicas y/o Corrosivas\n\n(combustibles / susceptibles al agua).","condicionesActivacion":["Guía156 y bromuro de acetilo UN1716 durante selección de agente extintor."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Combustibles susceptibles al agua, incendio primero; reacción, fundido, calor/gases/P no se colapsan con155. Líquido50m/sólido25m,Tabla1 si resaltado y800m recipiente incendiado.","Bromuro de acetiloUN1716 únicamenteCO2 o seco, distinto de cloruroUN1717. Nota de espumas reactiva y clorosilanos con no agua/espuma resistente al alcohol permanecen. Fuga vapor separado de agua sobre sustancia/contenedor y flujo sin contacto.","Cubierta seca/plástica, herramientas sin chispas/envase forrado; auxilios corrosivos30min y remoción de material fundido médica, más generales yERAP."],"reglasRelacionadas":[],"limites":["No confundir UN1716/1717 ni omitir únicamente; agentes genéricos no anulan advertencia específica.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":249,"paginaImpresa":"247","extractoLiteral":"PRECAUCIÓN: Para el Bromuro de acetilo (UN1716), use únicamente CO2 o polvo químico seco."},{"paginaPdf":249,"paginaImpresa":"247","extractoLiteral":"•\t PARA CLOROSILANOS, NO USE AGUA, use espuma resistente al alcohol."}]},{"id":"GRE24-G157-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía157: Sustancias - Tóxicas y/o Corrosivas\n\n(no combustibles / susceptibles al agua).","condicionesActivacion":["Guía157; identidad y concentración conocidas para remisión140, o cianuro identificado al evaluarCO2 en incendio pequeño."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["No combustibles susceptibles al agua, salud primero. Remisión140: UN1802/2032/3084/3093;UN1796 y1826 MÁS DEL50%;UN2031 MÁS DEL65%. No convertir a>= ni inferir composición desconocida. Líquido50m/sólido25m,Tabla1 si resaltado y800m en fuego de recipiente.","PequeñoCO2 EXCEPTO cianuros/seco/arena seca/espuma resistente al alcohol; nota de algunas espumas reactiva. Grande rocío/niebla/espuma conservando prohibición de agua dentro y flujos sin contacto. Fuga cubierta seca/plástica y herramientas sin chispas.","Corrosivos30min y caso cutáneoHFUN1790 con ramas según disponibilidad de gel:5min ygel si disponible, enjuague hasta tratamiento si no. No copiar identidadUN1052 de125 ni convertir literal en protocolo médico. Generales/ERAP."],"reglasRelacionadas":["GRE24-GUIA-140"],"limites":["Umbrales estrictos>50/>65 y composición desconocida pendientes; excepción deCO2 persiste independientemente de no combustibilidad.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":250,"paginaImpresa":"248","extractoLiteral":"•\t UN1802, UN2032, UN3084, UN3093, UN1796 (más del 50%), UN1826 (más del 50%) y UN2031 (más \ndel 65%) pueden actuar como oxidantes. También consulte la GUÍA 140."},{"paginaPdf":251,"paginaImpresa":"249","extractoLiteral":"•\t CO2 (excepto para cianuros), polvo químico seco, arena seca, espuma resistente al alcohol."}]},{"id":"GRE24-G158-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía158: Sustancias Infecciosas.","condicionesActivacion":["Guía158, descontaminación y limpieza/disposición; conocer compatibilidad o proceso validado y disponer de supervisión especialista."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Infecciosas, salud primero: categoríaA2814/2900/3549 se distingue deB3373 y desechos3291; condensación/hielo seco en embalaje dañado puede estar contaminado.25m inmediato; esta guía no da una distancia800m de tanque ni derrame grande250m, no agregarlas por plantilla.","Protección requiere criterio por cantidad/vía;N95 con prueba de ajuste o alternativas apropiadas, guantes contra corte si punzantes y térmicos sobre resistentes a líquidos si hielo seco. Descontaminación con químico COMPATIBLE o tecnología/proceso VALIDADO antes de limpieza/eliminación;10% de blanqueador=0,5% hipoclorito es ejemplo literal, no fórmula universal para cualquier producto.","Incendio grande agente del fuego circundante/sin chorros que dispersen. Derrame absorbente/desinfectante húmedo y limpieza/disposición solo especialista. Víctima puede contaminar, traslado solo seguro, efectos retardados y consulta médica; generales/ERAP."],"reglasRelacionadas":[],"limites":["Ejemplos de equipo/desinfectante no certifican adecuación; no automatizar mezcla, limpieza ni tratamiento.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":252,"paginaImpresa":"250","extractoLiteral":"•\t Descontamine la ropa de protección y equipo de protección personal después de su uso y antes de \nla limpieza o eliminación, con un desinfectante químico compatible (por ejemplo, solución al 10% \nde un blanqueador, lo que equivale al 0,5% de hipoclorito de sodio) o a través de una tecnología de \ndescontaminación validada (por ejemplo, autoclave) o proceso."},{"paginaPdf":253,"paginaImpresa":"251","extractoLiteral":"•\t NO LO LIMPIE O DESECHE, EXCEPTO BAJO LA SUPERVISION DE UN ESPECIALISTA."},{"paginaPdf":253,"paginaImpresa":"251","extractoLiteral":"PRECAUCIÓN: La víctima puede ser una fuente de contaminación."}]},{"id":"GRE24-G159-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía159: Sustancias (irritantes).","condicionesActivacion":["Guía159, propuesta de ingreso a espacio cerrado que requiere ventilación."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Irritantes, salud primero; efectos breves de minutos no eliminan daño severo en confinados ni gases del fuego. Líquido50m/sólido25m, derrame grande considerar100m a favor del viento, recipiente en fuego800m.","Ventilar solo con capacitación/equipo; pequeño seco/CO2/rocío/regular y grande rocío/niebla/regular. Tanques máxima distancia, no agua dentro, enfriamiento y signos de retirada; incendio masivo monitores o retirada.","Fuga pequeña absorbente no combustible y grande dique/proteger vías; no copiar cubierta/plástico de151. Auxilios generales yERAP, sin específicos."],"reglasRelacionadas":[],"limites":["Ventilación no acredita atmósfera segura ni habilita ingreso de personal sin capacitación/equipo.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":254,"paginaImpresa":"252","extractoLiteral":"•\t Ventile los espacios cerrados antes de ingresar, pero solo si está adecuadamente capacitado y equipado."}]},{"id":"GRE24-G160-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía160: Solventes Halogenados.","condicionesActivacion":["Guía160 y evaluación de agentes para incendio grande."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Solventes halogenados, salud primero; asfixia/mareos en confinados y mezclas aire/vapor explosivas.50m inmediato, derrame grande considerar100m a favor del viento, recipiente en fuego800m.","Protección química recomendada solo sin fuego y ventilación solo capacitación/equipo. Pequeño seco/CO2/rocío; grande seco/CO2/rocío/espuma resistente al alcohol, no copiar regular de159. Tanques enfriamiento/signos de retirada; fuga elimina ignición y pequeña absorción no combustible/grande dique.","Auxilios generales más agua/jabón en piel. No aparece notaERAP aquí ni prohibición de agua dentro en estas páginas; conservar alcance sin inferir que otros contextos la permiten."],"reglasRelacionadas":[],"limites":["Agentes dependen de guía/tamaño; no añadir ni eliminar restricciones por similitud con159.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":257,"paginaImpresa":"255","extractoLiteral":"•\t Usar polvo químico seco, CO2, rocío de agua o espuma resistente al alcohol."}]},{"id":"GRE24-G161-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía161: Materiales Radiactivos\n\n(radiación de bajo nivel).","condicionesActivacion":["Guía161 y propuesta de descontaminación o limpieza de personas sin lesiones/equipo sospechosos de contaminación."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Radiación baja, salud primero; ausencia de etiquetasI/II/III o detección por instrumento común no descarta material.25m inmediato, derrame grande considerar100m a favor del viento; gran cantidad en incendio mayor considerar300m circular, no800m de tanque.","Rescate/vidas/auxilios/otros peligros preceden medir radiación; notificar autoridad radiológica, que decide consecuencias y cierre. Personas sin lesión/equipo sospechosos de contaminación aislados, sin iniciar descontaminación/limpieza hasta instrucciones. RopaERA/estructural indicada para este alcance, no copiar suficiencia a163–166.","No mover embalajes dañados; agentes según fuego, líquido absorbente no combustible/polvo cubierto. Urgencias médicas y traslado prioritarios, generales; noERAP aquí."],"reglasRelacionadas":[],"limites":["Requiere instrucciones de autoridad radiológica; no automatizar cierre, retrasar urgencias ni interpretar falta de detección como ausencia.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":258,"paginaImpresa":"256","extractoLiteral":"•\t Retener o aislar a las personas sin lesiones o el equipo, sospechosos de estar contaminados. No inicie \nlabores de descontaminación y limpieza hasta recibir instrucciones de las Autoridades de Radiación."}]},{"id":"GRE24-G162-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía162: Materiales Radiactivos\n\n(radiación de nivel bajo a moderado).","condicionesActivacion":["Guía162, etiquetaRADIACTIVO y etiqueta de peligro secundario, o material identificado como uranio/torio en gránulos/recortes o nitrato."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Nivel bajo/moderado: daño/liberación cambian exposición, según tipo/cantidad/superficie. Peligro secundario etiquetado requiere ambas guías. Uranio/torio granulado/recortes expuestos al aire remiten136 y nitratos141. Instrumentos comunes pueden no detectar.25m,100m considerado a favor del viento para grande y300m considerado circular si gran cantidad/incendio mayor.","Vidas antes de medir y autoridad para descontaminación/cierre. No mover dañados; absorbente líquido/dique grande y cubierta de polvo, escurrimientos controlados. No deducir peligro químico desde solo etiquetaRADIACTIVO.","Auxilios generales, prioridad médica/no demora y quitar material/enjuagar20min documentados;ERAP sí figura, distinto de161."],"reglasRelacionadas":["GRE24-GUIA-136","GRE24-GUIA-141"],"limites":["Conservar ambas guías y condiciones físicas/químicas; la prioridad general del segundo peligro no descarta riesgo radiológico.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":260,"paginaImpresa":"258","extractoLiteral":"•\t Cuando un embalaje muestre una etiqueta de RADIACTIVO y otra etiqueta de peligro secundario, siga las guías \nde estos dos peligros. Generalmente el segundo peligro es mayor que el peligro de radiación."},{"paginaPdf":260,"paginaImpresa":"258","extractoLiteral":"•\t El Uranio y el Torio en gránulos o recortes pueden encenderse espontáneamente si se exponen al aire. \n\n(Consulte la GUÍA 136)"},{"paginaPdf":260,"paginaImpresa":"258","extractoLiteral":"•\t Los nitratos son oxidantes y pueden encender a otros combustibles. (También consulte la GUÍA 141)"}]},{"id":"GRE24-G163-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía163: Materiales Radiactivos\n\n(radiación de nivel bajo a alto).","condicionesActivacion":["Guía163 y evaluación de protección contra radiación interna frente a externa, con tipo/estado de embalaje conocidos."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Nivel bajo/alto: tiposA/B/C y acuerdos especiales, daño/liberación y severidad. EtiquetaI\u003c0,005mSv/h=0,5mrem/h fuera de embalaje simple/no dañado/aislado; TI máximo a1m solo mismas condiciones.800°C/30min es criterio de diseño/evaluaciónTipoB, no garantía del accidente ni permiso de espera.","25m,100m considerado para derrame grande a favor del viento,300m considerado circular si gran cantidad/incendio mayor. Vidas antes de medir, autoridad para limpieza/cierre;ERA/estructural protege exposición INTERNA pero NO EXTERNA. Instrumento común puede no detectar.","No mover/tocar dañados, aspecto exterior húmedo/leve daño no prueba falla ni integridad; absorbente no combustible, control escurrimiento. Urgencia/no demora y auxilios generales, sinERAP en páginas."],"reglasRelacionadas":[],"limites":["No declarar protección externa porERA/ropa;TI/etiqueta/diseño no equivalen a medición actual de embalaje dañado.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":262,"paginaImpresa":"260","extractoLiteral":"•\t El equipo de respiración autónoma (ERA) de presión positiva y la ropa de protección para incendios estructurales \nproporcionarán protección adecuada en contra de la exposición de radiación interna, pero no para la exposición \nde radiación externa."},{"paginaPdf":262,"paginaImpresa":"260","extractoLiteral":"•\t Los embalajes radiactivos con etiquetas Amarillo II y Amarillo III tienen niveles más altos de radiación. El índice \nde transporte (TI) en la etiqueta, identifica el nivel máximo de radiación en mrem/h a un metro de un embalaje \nsimple, aislado y no dañado."}]},{"id":"GRE24-G164-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía164: Materiales Radiactivos\n\n(forma especial / bajo a alto nivel de \nradiación externa).","condicionesActivacion":["Guía164 y fuente radiactiva identificada fuera del embalaje."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Forma especial, radiación externa baja/alta; contaminación interna no esperada NO imposible. TiposA/B/C, etiquetaI/TI bajo condiciones del embalaje y800°C/30min de diseño, sin garantía en campo.25m,100m considerado a favor del viento si grande,300m circular considerado para gran cantidad/incendio mayor.","Vidas antes de medir, autoridad decide cierre/limpieza final;ERA/estructural no protege exposición externa. Si fuente fuera del embalajeNO tocar, alejarse y esperar instrucciones. Habitual detectabilidad de cápsula no elimina límites del instrumento.","No mover dañados; humedad exterior rara vez indica falla, no certifica seguro. Agentes del fuego, urgencias/no demora/generales; sinERAP aquí."],"reglasRelacionadas":[],"limites":["Esperar autoridad radiológica y no manipular; falta de contaminación probable no elimina radiación externa.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":265,"paginaImpresa":"263","extractoLiteral":"•\t Si se identifica que la fuente está fuera del embalaje NO LO TOQUE. Mantenerse alejado y espere las instrucciones \nde la Autoridad de Radiación."},{"paginaPdf":264,"paginaImpresa":"262","extractoLiteral":"•\t El equipo de respiración autónoma (ERA) de presión positiva y la ropa de protección para incendios estructurales \nproporcionarán protección adecuada en contra de la exposición de radiación interna, pero no para la exposición \nde radiación externa."}]},{"id":"GRE24-G165-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía165: Materiales Radiactivos\n(fisionable / radiación de nivel bajo a alto).","condicionesActivacion":["Guía165, material fisionable y lectura del índiceTI oIC en etiqueta/documento."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Fisionables, nivel bajo/alto: tiposAF/IF frenteB(U)F/B(M)F/CF y acuerdosAF/BF/CF. TI PODRÍA NO indicar radiación a1m, puede reflejar controles por fisión;IC/etiquetaFISIONABLE distinto deTI. No copiar equivalencia de163/164.800°C/30min diseño y detector común limitado.","25m,100m considerado a favor del viento si grande,300m circular para gran cantidad/incendio mayor. Autoridad para descontaminación/cierre, vidas prioritarias yERA/estructural sin protección externa.","No mover/tocar dañados; líquidos raros/probablemente bajo nivel no significan contaminación nula. Agentes ordinarios, urgencia/no demora/generales;ERAP sí figura."],"reglasRelacionadas":[],"limites":["No convertirTI de fisionable en tasa de radiación por plantilla; conservarIC y controles de transporte sin decisión automática.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":266,"paginaImpresa":"264","extractoLiteral":"•\t El índice de transporte (TI) mostrado en las etiquetas o el documento de embarque podría no indicar el nivel \nde radiación a un metro de un embalaje simple, aislado y no dañado; mientras que, puede relacionarse con los \ncontroles necesarios para el transporte debido a las propiedades fisionables de los materiales. Alternativamente, \nla naturaleza fisionable de los contenidos está indicada por Índice de Seguridad con respecto a Criticidad (IC) en \nuna señal especial de FISIONABLE o en los documentos de embarque."}]},{"id":"GRE24-G166-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía166: Materiales Radiactivos - Corrosivos\n(hexafluoruro de uranio / reactivos con el agua).","condicionesActivacion":["Guía166, incendio grande y propuesta de agua; estado de daño del contenedor y destino de aplicación conocidos."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Hexafluoruro de uranio/reactivo con agua; peligro químico muy superior al radiológico, formaHF/ácido/residuo. Diferenciar envases protegidos y cilindroUN2978 sin revestimiento lleno vs vacíoEXCEPTOresiduos.800°C/30min diseño no certifica integridad.","25m inmediato, derrame remiteTabla1 sin limitarlo a resaltado y gran cantidad en incendio mayor considerar300m circular. No agua/espuma SOBREmaterial; en grande solo agua si envases sin daño, sin agua sobre sustancia/dentro. Rocío para vapor debe evitar flujos al derrame; dique de escurrimiento y autosellado posible no certifican fuga detenida.","Autoridad para limpieza/cierre, vidas/urgencias primero; ropa química solo sin fuego. Contacto cutáneoHFgas/ácido con ramas gel5min o enjuaguehasta médico, sin protocolo nuevo. Generales/ERAP."],"reglasRelacionadas":[],"limites":["Contenedor no dañado es requisito; no autoriza contacto con material/entrada al envase. Daño desconocido no es sin daño.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":269,"paginaImpresa":"267","extractoLiteral":"•\t Solo utilice agua si los contenedores no tienen daños."},{"paginaPdf":269,"paginaImpresa":"267","extractoLiteral":"•\t NO USAR AGUA O ESPUMA SOBRE EL MATERIAL."},{"paginaPdf":269,"paginaImpresa":"267","extractoLiteral":"•\t Usar rocío de agua para reducir los vapores; o desviar la nube de vapor a la deriva. Evite que flujos de agua \nentren en contacto con el material derramado."}]},{"id":"GRE24-G168-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía168: Monoxido de Carbono (líquido refrigerado).","condicionesActivacion":["Guía168, fuego de fuga de gas y posibilidad de detener la fuga."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Monóxido de carbono líquido refrigerado, salud primero; inodoro y llama posiblemente invisible, toxicidad y criogenia.100m inmediato,Tabla1 para derrame y800m en fuego de recipiente; no copiar grandes derrames500m de gases ordinarios.","No extinguir fuego de fuga de gas salvo que pueda detenerse; capacidad desconocida no habilita. Pequeño seco/CO2/rocío, grande rocío/niebla/regular, agua no directa a fuente/dispositivo por congelación; vapor rocío sin flujo sobre derrame. Fase gas si posible, aislamiento hasta dispersión.","ERA, protección térmica de criogénico y límites química/estructural. Solo médico intenta descongelar partes heladas, más generales. SinERAP aquí; conservar gramática original de llama."],"reglasRelacionadas":[],"limites":["No ausencia de llama/olor como seguridad ni extinción autorizada por capacidad desconocida; atención congelada reservada.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":273,"paginaImpresa":"271","extractoLiteral":"•\t NO EXTINGA UN INCENDIO DE FUGA DE GAS A MENOS QUE LA FUGA PUEDA SER DETENIDA."},{"paginaPdf":273,"paginaImpresa":"271","extractoLiteral":"•\t En caso de contacto con gas licuado, sólo el personal médico debe intentar descongelar las partes heladas."}]},{"id":"GRE24-G169-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía169: Aluminio (fundido).","condicionesActivacion":["Guía169 y propuesta de agua en fuego; situación que pone vida en peligro y forma de aplicación verificadas, o propuesta de detener/limpiar fuga fundida."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Aluminio fundido sobre705°C: agua, oxidantes, herramientas frías/húmedas/sucias y concreto pueden causar explosión/astillamiento.50m inmediato; no hay aquí800m ni evacuación grande genéricos. Protección térmica estructural limitada.","Agua prohibida salvo situación de vida en peligro y SOLOrocío fino; no halogenados/espuma. Incendio circundante agente apropiado sin contacto con fundido. NO intentar detener fuga ni con pala/objeto; contención con arena seca, solidificación natural si posible.","Material sólido puede seguir caliente y apariencia no distingue; contacto solo frío conocido, limpiezaexperto después de solidificar. Remoción en piel médica/generales; sinERAP."],"reglasRelacionadas":[],"limites":["Excepción no elimina requisitos ni se evalúa automáticamente; solidificado no significa frío; no copiar detener si seguro de otra guía.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":275,"paginaImpresa":"273","extractoLiteral":"•\t No usar agua, excepto en situaciones que ponen la vida en peligro y en ese caso, solamente \nutilizar un rocío fino."},{"paginaPdf":275,"paginaImpresa":"273","extractoLiteral":"•\t No tratar de detener la fuga, debido al peligro de explosión."},{"paginaPdf":275,"paginaImpresa":"273","extractoLiteral":"•\t Limpiar solamente bajo la supervisión de un experto, después de que el material se haya solidificado."}]},{"id":"GRE24-G170-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía170: Metales\n\n(polvos, cenizas, virutas, rebabas o recortes, etc.).","condicionesActivacion":["Guía170 seleccionada para fuego de metales/polvos y evaluación de agua, espuma oCO2."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Metales polvo/virutas/etc., incendio primero; líquidos portadores/reacción con agua/reignición y óxidos peligrosos. Líquido50m/sólido25m, derrame grande considerar50m a favor del viento(160pies), recipiente en fuego800m; no copiar100/300m.","NOagua/espuma/CO2; hidrógeno por mojado agrava confinados. Agentes arenaSECA/grafito/cloruro de sodio seco/claseD, preferencia confinar/sofocar. En tanques extinción imposible=>proteger alrededores/dejar consumir, sin lista general de enfriamiento con agua de138.","Fuga eliminar ignición/no tocar, detener solo sin riesgo y proteger vías. Auxilios generales/ERAP. Esta guía resuelve remisiones metálicas133/138, con identidad y escenario conservados."],"reglasRelacionadas":[],"limites":["Agentes secos/claseD no se sustituyen por listas ordinarias; no confundir metal con bateríaiónlitio147.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":277,"paginaImpresa":"275","extractoLiteral":"•\t NO USAR AGUA, ESPUMA O CO2."},{"paginaPdf":277,"paginaImpresa":"275","extractoLiteral":"•\t Al mojar los fuegos metálicos con agua se genera hidrógeno gaseoso, provocando un peligro extremo \nde explosión, particularmente si el fuego se encuentra en un sitio confinado (ej. Edificio, compartimiento \nde carga, etc.)."}]},{"id":"GRE24-G171-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía171: Sustancias\n\n(peligro de bajo a moderado).","condicionesActivacion":["Guía171, asbesto en derrame y propuesta de limpieza/disposición, o dispositivosUN3268/3559 en fuego."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Peligro bajo/moderado no inocuidad: UN3508 cargado/cortocircuito,UN2211 vapores y asbesto pulmonar. Líquido50m/sólido25m,Tabla1 si resaltado/otros aumento y800m recipiente incendiado.","UN3268/3559 en fuego pueden activarse tardíamente/proyectiles: distancia segura sin cifra específica. Pequeño seco/CO2/rocío/regular, grande no dispersar con chorros. Asbesto evitar inhalación/cubierta plástica y limpieza/disposición SOLOespecialista; no lista genérica de pala/absorción sin esta rama.","Fugas pequeña seca, pequeña y grande separadas; límites de retirada por tanque, auxilios generales. SinERAP aquí."],"reglasRelacionadas":[],"limites":["Supervisión especialista y riesgo tardío se conservan; distancia segura de dispositivos no tiene número inventado.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":279,"paginaImpresa":"277","extractoLiteral":"•\t Para el asbesto, evite la inhalación de polvo. Cubra el derrame con una lámina de plástico o lona para \nminimizar la dispersión. No limpie ni deseche, excepto bajo la supervisión de un especialista."},{"paginaPdf":279,"paginaImpresa":"277","extractoLiteral":"PRECAUCIÓN: Los incendios con Dispositivos de seguridad (UN3268) y Dispositivos de dispersión de \nagentes extintores (UN3559) pueden tener una activación retardada y un riesgo de proyectiles peligrosos. \nExtinga el fuego a una distancia segura. "}]},{"id":"GRE24-G172-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía172: Galio y Mercurio.","condicionesActivacion":["Guía172, fuga y selección de equipo/herramientas, con mercurio identificado si se propone kit específico."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Galio/mercurio no combustibles con humos/contaminación; salud primero.50m inmediato, derrame grande considerar100m a favor del viento y contenedorGRANDEen fuego considerar500m circular; no es aislamiento obligatorio800m.","Agente del fuego circundante y NOagua directa a metal calentado. Fuga no equipos/herramientas de acero/aluminio, cubrir no combustible/plástico; mercurio kit específico y tratamiento posterior de área con sulfuro de calcio/tiosulfato citado como posibilidad, no proceso certificado.","Detener solo seguro/equipo adecuado para contacto; auxilios generales, sinERAP ni protección química recomendada añadida."],"reglasRelacionadas":[],"limites":["No trasladar herramientas genéricas ni convertir posibilidad de tratamiento posterior en ejecución automática.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":281,"paginaImpresa":"279","extractoLiteral":"•\t No usar equipo o herramientas de acero o aluminio."},{"paginaPdf":281,"paginaImpresa":"279","extractoLiteral":"•\t Para mercurio, use un equipo para derrame de mercurio."},{"paginaPdf":281,"paginaImpresa":"279","extractoLiteral":"•\t No ponga agua directamente al metal calentado."}]},{"id":"GRE24-G173-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía173: Gases Adsorbidos - Tóxico*.","condicionesActivacion":["Guía173, incendio pequeño y material identificado como UN3515/3518/3520, además de condición de fuga detenible si es fuego de fuga."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Gases ADSORBIDOS tóxicos; asterisco conserva que algunos también inflamables/corrosivos/oxidantes.100m inmediato,Tabla1 para derrame; VARIOSembalajes pequeños dentro de ferrocarril/remolque en fuego1600m aislamiento+consideración evacuación todasdirecciones, no800m de tanque genérico.","No extinguir fuga de gas salvo detenible. PequeñoUN3515/3518/3520 SOLOagua/no secoCO2Halon, excepción sobre lista general. Grande no agua dentro/cilindros dañados solo especialista; agua no fuente/dispositivos. Fuga puesta tierra PARAinflamables y combustibles apartados PARAoxidantes; no decidir propiedad desde título solamente.","Rocío vapor sin contacto/agua directa, aislamiento hasta dispersión; auxilios quemaduras/generales yERAP. Dos viñetas en línea de salud se conservan juntas, sin perder irritación."],"reglasRelacionadas":[],"limites":["Excepciónagua no autoriza introducirla/directa a fuga; gases desconocidos no excluyen propiedades secundarias ni habilitan manipulación.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":283,"paginaImpresa":"281","extractoLiteral":"•\t Para UN3515, UN3518, UN3520, use únicamente agua, no use polvo químico seco, CO2 o Halon®."},{"paginaPdf":283,"paginaImpresa":"281","extractoLiteral":"•\t NO EXTINGA UN INCENDIO DE FUGA DE GAS A MENOS QUE LA FUGA PUEDA SER DETENIDA."},{"paginaPdf":283,"paginaImpresa":"281","extractoLiteral":"•\t Los cilindros dañados deberán ser manipulados solamente por especialistas."}]},{"id":"GRE24-G174-CONDICION-ESPECIFICA","descripcion":"Condición particular documentada de guía174: Gases Adsorbidos - Inflamables u Oxidantes.","condicionesActivacion":["Guía174, evaluación de derrame grande frente a incendio de varios embalajes pequeños en ferrocarril/remolque, con propiedades del gas y fuga detenible conocidas."],"entradasNecesarias":["Identificación del material y guía, con fuente y grado de certeza.","Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.","Datos de la condición particular respaldados; incógnitas conservadas explícitamente."],"excepcionesYAlteraciones":["Adsorbidos inflamables u oxidantes, incendio primero; características no idénticas de todos gases.100m inmediato, derrame grande considerar800m a favor del viento; varios embalajes pequeños en ferrocarril/remolque1600m todasdirecciones y evacuación considerada.","No extinguir fuga de gas salvo detenible; agente del fuego circundante, pequeño seco/CO2 y grande rocío/niebla; cilindros dañados solo especialista. No copiar excepciónUN3515 de173 a174. Fuente/dispositivos sin agua directa, masivo monitores o retirada.","Fuga distingue eliminación de ignición PARAinflamables y separación de combustibles PARAoxidantes; puesta a tierra de todo equipo aparece sin el condicionante de173. Evitar expansión por alcantarillas/ventilación/confinados, ventilar con límites de ingreso y aislamiento hasta dispersión. Quemaduras/generales yERAP."],"reglasRelacionadas":[],"limites":["800m a favor del viento y1600m todasdirecciones son escenarios/finalidades distintos; no unificar ni sustituir autoridad por evacuación automática.","Revisión independiente de interpretación pendiente.","Sin evaluador determinista ni prueba operativa de motor/SCI."],"tratamiento":"LECTURA_DOCUMENTAL","fuentes":[{"paginaPdf":284,"paginaImpresa":"282","extractoLiteral":"•\t Considere la evacuación inicial a favor del viento de por lo menos 800 metros (1/2 milla)."},{"paginaPdf":284,"paginaImpresa":"282","extractoLiteral":"•\t Si varios embalajes pequeños (dentro de un ferrocarril o remolque) están involucrados en un incendio, \nAISLE 1600 metros (1 milla) en todas las direcciones; también, considere la evacuación inicial de 1600 \nmetros (1 milla) en todas las direcciones."},{"paginaPdf":285,"paginaImpresa":"283","extractoLiteral":"•\t NO EXTINGA UN INCENDIO DE FUGA DE GAS A MENOS QUE LA FUGA PUEDA SER DETENIDA."}]}]};
// Adaptadores de plataforma. SHA-256 lo proporciona Android o el arnés de pruebas.
// No evalúa texto descargado ni permite resolver módulos fuera de esta lista.
const cache = {};
class ErrorHttp extends Error { constructor(message) { super(message); this.name = 'ErrorMatpel'; } }
const decorator = () => () => {};
const nest = { BadRequestException: ErrorHttp, NotFoundException: ErrorHttp,
  ServiceUnavailableException: ErrorHttp, Injectable: decorator };
const shims = {
  '@nestjs/common': nest,
  'class-transformer': { Type: decorator },
  'class-validator': new Proxy({}, { get: () => decorator }),
  crypto: { createHash(algorithm) {
    if (algorithm !== 'sha256') throw Error('Algoritmo no admitido.');
    let value = '';
    return { update(s) { if (typeof s !== 'string') throw Error('Huella no textual.'); value += s; return this; },
      digest(format) { if (format !== 'hex') throw Error('Formato no admitido.'); return global.SigboCrypto.sha256(value); } };
  } },
  'gre-artefacto': { mismoId: (a, b) => !!a && !!b && a.toLowerCase() === b.toLowerCase() },
  'fuentes/gre2024-definiciones.json': definiciones,
};
function load(id, from = '') {
  if (id.startsWith('.')) {
    const parts = (from.split('/').slice(0, -1).join('/') + '/' + id).split('/');
    const clean = []; for (const p of parts) { if (p === '..') clean.pop(); else if (p && p !== '.') clean.push(p); }
    id = clean.join('/');
  }
  if (Object.prototype.hasOwnProperty.call(shims, id)) return shims[id];
  if (cache[id]) return cache[id].exports;
  if (!Object.prototype.hasOwnProperty.call(modules, id)) throw Error('Dependencia de motor no admitida: ' + id);
  const m = { exports: {} }; cache[id] = m; modules[id](dep => load(dep, id), m, m.exports); return m.exports;
}
const { MotorMatpelService } = load('motor-matpel.service');
const { geometriaMatpel } = load('matpel-geometria');
const { perfilMatpel, lecturaGuiasMatpel } = load('matpel-perfil');
const motor = new MotorMatpelService();
let catalogo, manifest;
function inicializar(p) {
  catalogo = undefined; manifest = undefined;
  if (typeof BigInt !== 'function') throw Error('Actualizar Android System WebView para consultar sin conexión.');
  const m = p.manifest, c = p.contenido;
  if (!m || !c || m.documentoSha256 !== definiciones.documentoSha256 ||
      m.versionInterpretacion !== definiciones.versionInterpretacion) throw Error('Edición incompatible con el motor local.');
  for (const parte of ['entradas','guias','bloques','tablas','filas','celdas','reglas','camposFuente','referencias','paginas','secciones']) {
    if (!Array.isArray(c[parte])) throw Error('Edición local incompleta.');
  }
  // Campos de versión omitidos por el exportador documental se restituyen desde
  // el manifiesto ya comprobado, nunca desde el cuerpo de consulta.
  const candidato = { ...c, versionGreId: m.versionGreId, sha256Contenido: m.sha256Contenido,
    documento: { sha256: m.documentoSha256, edicion: m.edicion, idioma: m.idioma } };
  for (const parte of ['entradas','guias','bloques','tablas','filas','celdas','reglas','referencias','paginas','secciones'])
    candidato[parte] = c[parte].map(r => ({ ...r, versionId: m.versionGreId }));
  const perfil = perfilMatpel(candidato);
  if (!perfil.compatible || p.interpretacion?.sha256Definiciones !== perfil.sha256Interpretacion)
    throw Error('La interpretación descargada no coincide con el motor local.');
  catalogo = candidato; manifest = m;
  return { estado: 'DISPONIBLE', versionGreId: m.versionGreId, edicion: m.edicion,
    documentoSha256: m.documentoSha256, modo: 'LOCAL_SIN_CONEXION', validacionOperacional: 'PENDIENTE' };
}
function evaluar(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body) ||
      Object.keys(body).some(k => !['versionGreId','entradaIds','parametros','identificaciones','ambito'].includes(k)))
    throw Error('Contrato local de consulta inválido.');
  if (!catalogo || body.versionGreId !== manifest.versionGreId) throw Error('Versión local incorrecta.');
  const e = motor.evaluar(body.entradaIds, body.parametros, catalogo,
    { identificaciones: body.identificaciones, ambito: body.ambito });
  return { ...e, versionContrato: 2, modoConsulta: 'LOCAL_SIN_CONEXION',
    geometria: geometriaMatpel(e, body.parametros, catalogo) };
}
function ficha(id) {
  const entrada = catalogo.entradas.find(e => e.id === id); if (!entrada) throw Error('Material no disponible.');
  const d = { valor: null, certeza: 'DESCONOCIDO', origen: 'OPERADOR', observadoEn: null, evidenciaId: null, fuenteDatoId: null };
  const parametros = Object.fromEntries(['eventos','incendio','cantidad','contactoAgua','periodo','contenedor','viento','ubicacion'].map(k => [k,d]));
  const e = motor.evaluar([id], parametros, catalogo);
  return { entrada, guia: catalogo.guias.find(g => g.id === entrada.guiaId), solicitudes: e.solicitudes,
    guiasLectura: e.guiasLectura, contenedoresTabla3: catalogo.filas.filter(f => {
      const t = catalogo.tablas.find(t => t.id === f.tablaId), p = JSON.parse(f.condicionesJson || '{}');
      return t?.codigo === 'TABLA_3' && (p.identificadores || []).includes(entrada.identificador);
    }).map(f => ({ id: f.id, nombre: f.etiquetaOriginal, referenciaId: f.referenciaId })) };
}
function dispatch(json) {
  try {
    const p = JSON.parse(json);
    const data = p.accion === 'inicializar' ? inicializar(p.datos) :
      p.accion === 'evaluar' ? evaluar(p.datos) : p.accion === 'ficha' ? ficha(p.datos) :
      (() => { throw Error('Acción local inválida.'); })();
    return JSON.stringify({ ok: true, data });
  } catch (e) { return JSON.stringify({ ok: false, mensaje: e.message || 'No se pudo consultar el motor local.' }); }
}
global.SigboMotor = { inicializar, evaluar, ficha, dispatch,
  lecturaGuia: id => lecturaGuiasMatpel(catalogo, [id])[0] };

})(globalThis);
