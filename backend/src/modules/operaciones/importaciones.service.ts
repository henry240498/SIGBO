import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';
import ExcelJS from 'exceljs';
import {
  Bombero,
  EstadoFilaImportacion,
  ImportacionMarcador,
  ImportacionMarcadorFila,
  MarcacionAsistencia,
  TipoMarcacion,
} from '../../shared/entities';
import { guardarBufferRestringido } from '../../shared/utils/almacenamiento';
import { AuditoriaService } from '../seguridad/auditoria.service';

const CARPETA_IMPORTACIONES = 'importaciones-marcador';

interface PunchCrudo {
  filaExcel: number;
  dia: number;
  indicePunch: number;
  horaTexto: string;
  codigoDetectado: string;
  noDispositivo: string;
  depto: string | null;
}

/** Extrae marcaciones crudas de la hoja "Logs" del export del reloj
 * biometrico (formato verificado contra un archivo real: bloques de 3 filas
 * por empleado -- encabezado de dias, fila "No :/Name :/Dept :", fila de
 * datos con una celda por dia que puede contener VARIAS horas separadas por
 * salto de linea). No se descarta ninguna marca, a diferencia del reporte
 * "Attendance Table" del propio dispositivo, que solo conserva la primera y
 * la ultima de cada dia. */
export async function extraerPunchesDeLogs(archivo: Buffer): Promise<{ punches: PunchCrudo[]; anio: number; mes: number; hojasEncontradas: number }> {
  const workbook = new ExcelJS.Workbook();
  try {
    // ExcelJS y Multer llegan con definiciones de Buffer de distintas ramas
    // de @types/node; en tiempo de ejecución ambos son Buffer de Node.
    await workbook.xlsx.load(archivo as unknown as Parameters<typeof workbook.xlsx.load>[0]);
  } catch {
    throw new BadRequestException('No se pudo leer el archivo. Verifica que sea un Excel (.xlsx) válido.');
  }

  const sheet = workbook.getWorksheet('Logs');
  if (!sheet) {
    throw new BadRequestException('El archivo no contiene una hoja "Logs" con el detalle de marcaciones.');
  }
  const filas: string[][] = [];
  for (let numeroFila = 1; numeroFila <= sheet.rowCount; numeroFila++) {
    const fila = sheet.getRow(numeroFila);
    const valores: string[] = [];
    for (let numeroColumna = 1; numeroColumna <= sheet.columnCount; numeroColumna++) {
      valores.push(fila.getCell(numeroColumna).text ?? '');
    }
    filas.push(valores);
  }

  let anio = 0;
  let mes = 0;
  for (const fila of filas.slice(0, 5)) {
    const texto = fila.join(' ');
    const m = texto.match(/(\d{4})\/(\d{2})\/\d{2}\s*~/);
    if (m) {
      anio = parseInt(m[1], 10);
      mes = parseInt(m[2], 10);
      break;
    }
  }
  if (!anio || !mes) {
    throw new BadRequestException('No se pudo determinar el periodo (ano/mes) del archivo en la hoja "Logs".');
  }

  const punches: PunchCrudo[] = [];
  for (let i = 0; i < filas.length; i++) {
    const fila = filas[i];
    if (fila[0] !== 'No :') continue;

    const idxName = fila.indexOf('Name :');
    const idxDept = fila.indexOf('Dept :');
    const noDispositivo = String(fila[2] ?? '').trim();
    const codigoDetectado = idxName >= 0 ? String(fila[idxName + 2] ?? '').trim() : '';
    const depto = idxDept >= 0 ? String(fila[idxDept + 2] ?? '').trim() || null : null;
    if (!codigoDetectado) continue;

    const filaDatos = filas[i + 1] ?? [];
    for (let dia = 1; dia <= 31; dia++) {
      const celda = String(filaDatos[dia - 1] ?? '').trim();
      if (!celda) continue;
      const marcas = celda
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      marcas.forEach((horaTexto, idx) => {
        punches.push({ filaExcel: i + 1, dia, indicePunch: idx + 1, horaTexto, codigoDetectado, noDispositivo, depto });
      });
    }
  }

  return { punches, anio, mes, hojasEncontradas: workbook.worksheets.length };
}

/** Normaliza un codigo bomberil a "PREFIJO:NUMERO" (numero como entero real,
 * sin ceros a la izquierda) para poder comparar el texto libre que escribe
 * cada dispositivo/operador (ej. "BC 10", "BC04", "BC-10") contra el codigo
 * real guardado en Personal (ej. "BC-10"). */
function normalizarCodigo(codigo: string): string | null {
  const m = codigo
    .trim()
    .toUpperCase()
    .match(/^([A-Z]+)[\s-]*0*(\d+)$/);
  if (!m) return null;
  return `${m[1]}:${parseInt(m[2], 10)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** Construye el timestamp con offset explicito -04:00 (Paraguay) para no
 * depender de la zona horaria del proceso que ejecuta el import. */
function construirTimestamp(anio: number, mes: number, dia: number, horaTexto: string): Date | null {
  const m = horaTexto.match(/^(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const hora = parseInt(m[1], 10);
  const minuto = parseInt(m[2], 10);
  if (hora > 23 || minuto > 59) return null;
  return new Date(`${anio}-${pad(mes)}-${pad(dia)}T${pad(hora)}:${pad(minuto)}:00.000-04:00`);
}

@Injectable()
export class ImportacionesService {
  constructor(
    @InjectRepository(ImportacionMarcador) private readonly importacionRepo: Repository<ImportacionMarcador>,
    @InjectRepository(ImportacionMarcadorFila) private readonly filaRepo: Repository<ImportacionMarcadorFila>,
    @InjectRepository(MarcacionAsistencia) private readonly marcacionRepo: Repository<MarcacionAsistencia>,
    @InjectRepository(Bombero) private readonly bomberoRepo: Repository<Bombero>,
    private readonly auditoriaService: AuditoriaService,
  ) {}

  async analizar(file: Express.Multer.File, actorId: string, ip?: string) {
    if (!file) throw new BadRequestException('No se recibio ningun archivo');

    const hash = createHash('sha256').update(file.buffer).digest('hex');

    const existente = await this.importacionRepo.findOne({ where: { archivoHash: hash } });
    if (existente) {
      if (existente.estado === 'CONFIRMADO') {
        throw new ConflictException(
          `Este archivo ya fue importado el ${existente.fechaImportacion.toLocaleString()} (${existente.registrosImportados ?? 0} registros). Subirlo de nuevo no generaria duplicados, pero no hay nada nuevo para procesar.`,
        );
      }
      // Analisis previo sin confirmar (o cancelado): se limpia y se vuelve a analizar desde cero.
      await this.filaRepo.delete({ importacionId: existente.id });
      await this.importacionRepo.delete(existente.id);
    }

    const { punches, anio, mes, hojasEncontradas } = await extraerPunchesDeLogs(file.buffer);

    const bomberos = await this.bomberoRepo.find();
    const mapaNormalizado = new Map<string, Bombero>();
    const codigosAmbiguos = new Set<string>();
    for (const b of bomberos) {
      const n = normalizarCodigo(b.numeroBombero);
      if (!n) continue;
      if (mapaNormalizado.has(n)) {
        codigosAmbiguos.add(n);
      } else {
        mapaNormalizado.set(n, b);
      }
    }

    const vistosEnLote = new Set<string>();
    const candidatos: Array<{ bomberoId: string; timestamp: Date }> = [];
    const filasParaGuardar: Array<Partial<ImportacionMarcadorFila> & { bomberoId: string | null; timestamp: Date | null }> = [];

    for (const p of punches) {
      const normalizado = normalizarCodigo(p.codigoDetectado);
      const bombero = normalizado && !codigosAmbiguos.has(normalizado) ? mapaNormalizado.get(normalizado) : undefined;
      const timestamp = construirTimestamp(anio, mes, p.dia, p.horaTexto);
      const tipoMarcacion: TipoMarcacion = p.indicePunch % 2 === 1 ? 'ENTRADA' : 'SALIDA';

      let estadoFila: EstadoFilaImportacion;
      let motivo: string | null = null;

      if (!timestamp) {
        estadoFila = 'INCONSISTENTE';
        motivo = `No se pudo interpretar la hora "${p.horaTexto}" (dispositivo No ${p.noDispositivo}, dia ${p.dia}).`;
      } else if (!bombero) {
        estadoFila = 'NO_IDENTIFICADO';
        motivo = `El codigo "${p.codigoDetectado}" (dispositivo No ${p.noDispositivo}) no coincide con ningun bombero activo en Personal.`;
      } else {
        const clave = `${bombero.id}|${timestamp.toISOString()}`;
        if (vistosEnLote.has(clave)) {
          estadoFila = 'DUPLICADO';
          motivo = 'Esta misma marcacion (bombero + fecha/hora exacta) aparece mas de una vez en este archivo.';
        } else {
          vistosEnLote.add(clave);
          candidatos.push({ bomberoId: bombero.id, timestamp });
          estadoFila = 'RECONOCIDO'; // se puede degradar a YA_IMPORTADO mas abajo
        }
      }

      filasParaGuardar.push({
        hojaExcel: 'Logs',
        filaExcel: p.filaExcel,
        datoOriginal: JSON.stringify(p),
        codigoDetectado: p.codigoDetectado,
        bomberoIdResuelto: bombero?.id ?? null,
        tipoMarcacionDetectado: timestamp ? tipoMarcacion : null,
        timestampDetectado: timestamp,
        estadoFila,
        motivo,
        bomberoId: bombero?.id ?? null,
        timestamp,
      });
    }

    // Detectar YA_IMPORTADO contra marcaciones reales ya existentes (una sola consulta por lote).
    const yaExistentes = new Set<string>();
    if (candidatos.length > 0) {
      const bomberoIds = [...new Set(candidatos.map((c) => c.bomberoId))];
      const existentesDb = await this.marcacionRepo
        .createQueryBuilder('m')
        .where('m.bomberoId IN (:...ids)', { ids: bomberoIds })
        .getMany();
      for (const m of existentesDb) {
        yaExistentes.add(`${m.bomberoId}|${new Date(m.timestampMarcacion).toISOString()}`);
      }
    }

    let reconocidos = 0;
    let noIdentificados = 0;
    let duplicados = 0;
    let inconsistentes = 0;

    for (const f of filasParaGuardar) {
      if (f.estadoFila === 'RECONOCIDO' && f.bomberoId && f.timestamp) {
        const clave = `${f.bomberoId}|${f.timestamp.toISOString()}`;
        if (yaExistentes.has(clave)) {
          f.estadoFila = 'YA_IMPORTADO';
          f.motivo = 'Ya existe una marcacion identica registrada para este bombero en esta fecha/hora.';
        }
      }
      switch (f.estadoFila) {
        case 'RECONOCIDO':
          reconocidos++;
          break;
        case 'NO_IDENTIFICADO':
          noIdentificados++;
          break;
        case 'DUPLICADO':
        case 'YA_IMPORTADO':
          duplicados++;
          break;
        case 'INCONSISTENTE':
          inconsistentes++;
          break;
      }
    }

    const archivoUrl = await guardarBufferRestringido(file.buffer, '.xlsx', CARPETA_IMPORTACIONES);

    const importacion = await this.importacionRepo.save(
      this.importacionRepo.create({
        archivoNombre: file.originalname,
        archivoHash: hash,
        archivoUrl,
        usuarioId: actorId,
        fechaImportacion: new Date(),
        hojasEncontradas,
        registrosEncontrados: punches.length,
        registrosReconocidos: reconocidos,
        registrosNoIdentificados: noIdentificados,
        registrosDuplicados: duplicados,
        registrosConInconsistencias: inconsistentes,
        registrosImportados: null,
        estado: 'ANALIZADO',
      }),
    );

    for (const f of filasParaGuardar) {
      await this.filaRepo.save(
        this.filaRepo.create({
          importacionId: importacion.id,
          hojaExcel: f.hojaExcel,
          filaExcel: f.filaExcel,
          datoOriginal: f.datoOriginal,
          codigoDetectado: f.codigoDetectado,
          bomberoIdResuelto: f.bomberoIdResuelto,
          tipoMarcacionDetectado: f.tipoMarcacionDetectado,
          timestampDetectado: f.timestampDetectado,
          estadoFila: f.estadoFila as EstadoFilaImportacion,
          motivo: f.motivo,
        }),
      );
    }

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'ANALIZAR_IMPORTACION_MARCADOR',
      recurso: 'operaciones.importaciones_marcador',
      recursoId: importacion.id,
      datosDespues: importacion,
      ip: ip ?? null,
    });

    return importacion;
  }

  async findOne(id: string) {
    const importacion = await this.importacionRepo.findOne({ where: { id } });
    if (!importacion) throw new NotFoundException(`Importacion ${id} no encontrada`);
    return importacion;
  }

  historial() {
    return this.importacionRepo.find({ order: { fechaImportacion: 'DESC' } });
  }

  async listarFilas(importacionId: string, estadoFila?: EstadoFilaImportacion) {
    await this.findOne(importacionId);
    const query = this.filaRepo.createQueryBuilder('f').where('f.importacionId = :importacionId', { importacionId });
    if (estadoFila) query.andWhere('f.estadoFila = :estadoFila', { estadoFila });
    const filas = await query.orderBy('f.filaExcel', 'ASC').getMany();
    if (filas.length === 0) return [];

    const bomberoIds = [...new Set(filas.filter((f) => f.bomberoIdResuelto).map((f) => f.bomberoIdResuelto as string))];
    const bomberos = bomberoIds.length
      ? await this.bomberoRepo.createQueryBuilder('b').where('b.id IN (:...ids)', { ids: bomberoIds }).getMany()
      : [];
    const mapa = new Map(bomberos.map((b) => [b.id, b]));

    return filas.map((f) => {
      const bombero = f.bomberoIdResuelto ? mapa.get(f.bomberoIdResuelto) : undefined;
      return {
        ...f,
        nombreBombero: bombero ? `${bombero.nombre} ${bombero.apellido}` : null,
        codigoBombero: bombero?.numeroBombero ?? null,
      };
    });
  }

  async confirmar(importacionId: string, actorId: string, ip?: string) {
    const importacion = await this.findOne(importacionId);
    if (importacion.estado !== 'ANALIZADO') {
      throw new BadRequestException(`Esta importacion ya esta en estado ${importacion.estado} y no se puede confirmar de nuevo.`);
    }

    const filasReconocidas = await this.filaRepo.find({ where: { importacionId, estadoFila: 'RECONOCIDO' } });

    let importados = 0;
    for (const f of filasReconocidas) {
      if (!f.bomberoIdResuelto || !f.timestampDetectado || !f.tipoMarcacionDetectado) continue;
      const marcacion = await this.marcacionRepo.save(
        this.marcacionRepo.create({
          eventoId: null,
          bomberoId: f.bomberoIdResuelto,
          tipoMarcacion: f.tipoMarcacionDetectado as TipoMarcacion,
          metodo: 'HUELLA',
          timestampMarcacion: f.timestampDetectado,
          fuente: 'IMPORTACION_EXCEL',
          registradoPor: actorId,
          importacionId: importacion.id,
          datoOriginal: f.datoOriginal,
          codigoOriginalExcel: f.codigoDetectado,
          filaExcel: f.filaExcel,
        }),
      );
      await this.filaRepo.update(f.id, { marcacionIdGenerada: marcacion.id });
      importados++;
    }

    await this.importacionRepo.update(importacionId, { estado: 'CONFIRMADO', registrosImportados: importados });
    const actualizado = await this.findOne(importacionId);

    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CONFIRMAR_IMPORTACION_MARCADOR',
      recurso: 'operaciones.importaciones_marcador',
      recursoId: importacionId,
      datosAntes: importacion,
      datosDespues: actualizado,
      ip: ip ?? null,
    });

    return actualizado;
  }

  async cancelar(importacionId: string, actorId: string, ip?: string) {
    const importacion = await this.findOne(importacionId);
    if (importacion.estado === 'CONFIRMADO') {
      throw new BadRequestException('Esta importacion ya fue confirmada y no se puede cancelar.');
    }
    await this.importacionRepo.update(importacionId, { estado: 'CANCELADO' });
    const actualizado = await this.findOne(importacionId);
    await this.auditoriaService.registrar({
      usuarioId: actorId,
      accion: 'CANCELAR_IMPORTACION_MARCADOR',
      recurso: 'operaciones.importaciones_marcador',
      recursoId: importacionId,
      datosAntes: importacion,
      datosDespues: actualizado,
      ip: ip ?? null,
    });
    return actualizado;
  }
}
