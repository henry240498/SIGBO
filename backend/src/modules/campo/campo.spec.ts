import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Ausencia, Bombero, Hidrante, Servicio, Usuario } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { AdjuntosService, MAX_ADJUNTOS_POR_ENTIDAD } from './adjuntos.service';
import { AusenciasService, MAX_DIAS_AUSENCIA, seSolapan } from './ausencias.service';
import { VictimasService, totalesPorCategoria } from './victimas.service';

jest.mock('../../shared/utils/almacenamiento', () => ({
  ...jest.requireActual('../../shared/utils/almacenamiento'),
  guardarBufferRestringido: jest.fn(async () => 'privado:adjuntos-campo:0123456789abcdef0123456789abcdef.png'),
  leerBufferRestringido: jest.fn(async () => Buffer.from('bytes-de-la-imagen')),
  borrarImagenSiExiste: jest.fn(async () => undefined),
}));
import * as almacenamiento from '../../shared/utils/almacenamiento';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

const PNG = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(40)]);
const archivo = (buffer: Buffer) => ({ buffer }) as Express.Multer.File;
const ctx = { usuarioId: 'u1' };

describe('AdjuntosService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let servicio: AdjuntosService;
  const dto = { entidad: 'HIDRANTE' as const, entidadId: 'H1', tipo: 'FOTO' as const };

  beforeEach(async () => {
    jest.clearAllMocks();
    base = new BaseFalsa();
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new AdjuntosService(base as unknown as DataSource, audit as never);
    await sembrar(base, Hidrante, { id: 'H1' });
  });

  it('guarda una imagen valida: archivo privado, registro y auditoria', async () => {
    const a = await servicio.subir(archivo(PNG), { ...dto, descripcion: 'Frente' }, ctx);
    expect(a).toMatchObject({ entidad: 'HIDRANTE', tipo: 'FOTO', descripcion: 'Frente', tamanoBytes: PNG.length, subidoPor: 'u1' });
    expect(almacenamiento.guardarBufferRestringido).toHaveBeenCalledWith(PNG, '.png', 'adjuntos-campo');
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'SUBIR' }));
    // la referencia interna del archivo nunca sale en la respuesta
    expect(JSON.stringify(a)).not.toContain('privado:');
  });

  it('rechaza: sin archivo, algo que no es imagen, demasiado grande y un registro inexistente', async () => {
    await expect(servicio.subir(undefined, dto, ctx)).rejects.toThrow(BadRequestException);
    await expect(servicio.subir(archivo(Buffer.from('%PDF-1.4 no es imagen')), dto, ctx)).rejects.toThrow(/no es una imagen/);
    await expect(servicio.subir(archivo(Buffer.concat([PNG, Buffer.alloc(8 * 1024 * 1024)])), dto, ctx)).rejects.toThrow(/8 MB/);
    await expect(servicio.subir(archivo(PNG), { ...dto, entidadId: 'NO' }, ctx)).rejects.toThrow(NotFoundException);
    expect(base.tabla('Adjunto')).toHaveLength(0);
    expect(almacenamiento.guardarBufferRestringido).not.toHaveBeenCalled();
  });

  it('no confia en el tipo que declara el cliente: un ejecutable con extension .png se rechaza', async () => {
    await expect(servicio.subir(archivo(Buffer.from('MZ\x90\x00 programa')), dto, ctx)).rejects.toThrow(BadRequestException);
  });

  it('el mismo envio reintentado (misma clave) no duplica nada', async () => {
    const a = await servicio.subir(archivo(PNG), { ...dto, claveIdempotencia: 'clave-123456' }, ctx);
    const b = await servicio.subir(archivo(PNG), { ...dto, claveIdempotencia: 'clave-123456' }, ctx);
    expect(b.id).toBe(a.id);
    expect(base.tabla('Adjunto')).toHaveLength(1);
    expect(almacenamiento.guardarBufferRestringido).toHaveBeenCalledTimes(1);
  });

  it('usa la hora en que se tomo la foto (acotada)', async () => {
    const hace = new Date(Date.now() - 20 * 60_000).toISOString();
    expect(new Date((await servicio.subir(archivo(PNG), { ...dto, tomadoEn: hace }, ctx)).tomadoEn).toISOString()).toBe(hace);
  });

  it(`admite hasta ${MAX_ADJUNTOS_POR_ENTIDAD} por registro`, async () => {
    for (let i = 0; i < MAX_ADJUNTOS_POR_ENTIDAD; i++) await servicio.subir(archivo(PNG), dto, ctx);
    await expect(servicio.subir(archivo(PNG), dto, ctx)).rejects.toThrow(ConflictException);
  });

  it('si el registro falla despues de guardar el archivo, no queda un archivo huerfano', async () => {
    const original = base.getRepository;
    base.getRepository = ((c: { name: string }) => {
      const r = original(c as never);
      return c.name === 'Adjunto' ? { ...r, save: async () => { throw new Error('base caida'); } } : r;
    }) as never;
    await expect(servicio.subir(archivo(PNG), dto, ctx)).rejects.toThrow('base caida');
    expect(almacenamiento.borrarImagenSiExiste).toHaveBeenCalledWith('privado:adjuntos-campo:0123456789abcdef0123456789abcdef.png', 'adjuntos-campo');
  });

  it('lista metadatos y entrega el archivo con su tipo; un id inexistente da 404', async () => {
    const a = await servicio.subir(archivo(PNG), dto, ctx);
    expect(await servicio.listar('HIDRANTE', 'H1')).toHaveLength(1);
    expect(await servicio.listar('HIDRANTE', 'OTRO')).toHaveLength(0);
    const f = await servicio.archivo(a.id);
    expect(f.mime).toBe('image/png');
    expect(f.buffer.toString()).toBe('bytes-de-la-imagen');
    await expect(servicio.archivo('no-existe')).rejects.toThrow(NotFoundException);
  });
});

describe('VictimasService', () => {
  let base: BaseFalsa;
  let servicio: VictimasService;
  beforeEach(async () => {
    base = new BaseFalsa();
    servicio = new VictimasService(base as unknown as DataSource, { registrar: jest.fn().mockResolvedValue(undefined) } as never);
    await sembrar(base, Servicio, { id: 'S1', estado: 'EN_CURSO' });
    await sembrar(base, Servicio, { id: 'S2', estado: 'CANCELADO' });
  });

  it('totales por categoria, con todas presentes', () => {
    expect(totalesPorCategoria([])).toEqual({ RESCATADA: 0, HERIDA: 0, FALLECIDA: 0, EVACUADA: 0 });
    expect(totalesPorCategoria([{ categoria: 'HERIDA', cantidad: 2 }, { categoria: 'HERIDA', cantidad: 3 }, { categoria: 'RESCATADA', cantidad: 1 }])).toMatchObject({ HERIDA: 5, RESCATADA: 1 });
  });

  it('registra y suma por servicio; rechaza servicios inexistentes o cancelados', async () => {
    await servicio.registrar({ servicioId: 'S1', categoria: 'RESCATADA', cantidad: 2 }, ctx);
    await servicio.registrar({ servicioId: 'S1', categoria: 'HERIDA', cantidad: 1, observacion: 'Quemaduras leves' }, ctx);
    const r = await servicio.deServicio('S1');
    expect(r.totales).toEqual({ RESCATADA: 2, HERIDA: 1, FALLECIDA: 0, EVACUADA: 0 });
    expect(r.registros).toHaveLength(2);
    await expect(servicio.registrar({ servicioId: 'NO', categoria: 'HERIDA', cantidad: 1 }, ctx)).rejects.toThrow(NotFoundException);
    await expect(servicio.registrar({ servicioId: 'S2', categoria: 'HERIDA', cantidad: 1 }, ctx)).rejects.toThrow(ConflictException);
  });
});

describe('AusenciasService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let servicio: AusenciasService;
  const hoy = '2026-03-10';
  const yo = { usuarioId: 'u1', puedeDecidir: false };
  const jefe = { usuarioId: 'adm', puedeDecidir: true };
  const otro = { usuarioId: 'u2', puedeDecidir: false };

  beforeEach(async () => {
    base = new BaseFalsa();
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new AusenciasService(base as unknown as DataSource, audit as never);
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gomez' });
    await sembrar(base, Bombero, { id: 'B2', nombre: 'Luis', apellido: 'Paz' });
    await sembrar(base, Usuario, { id: 'u1', bomberoId: 'B1' });
    await sembrar(base, Usuario, { id: 'u2', bomberoId: 'B2' });
    await sembrar(base, Usuario, { id: 'adm', bomberoId: null });
  });

  it('se solapan: extremos incluidos', () => {
    expect(seSolapan({ desde: '2026-03-10', hasta: '2026-03-12' }, { desde: '2026-03-12', hasta: '2026-03-15' })).toBe(true);
    expect(seSolapan({ desde: '2026-03-10', hasta: '2026-03-12' }, { desde: '2026-03-13', hasta: '2026-03-15' })).toBe(false);
  });

  it('pide para si mismo (por su vinculo con el bombero) y audita', async () => {
    const a = await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-14', motivo: 'Tramite personal' }, yo, hoy);
    expect(a).toMatchObject({ bomberoId: 'B1', estado: 'SOLICITADA', solicitadaPor: 'u1', desde: '2026-03-12', hasta: '2026-03-14' });
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'SOLICITAR' }));
  });

  it('exige vinculo con un bombero; para otro solo si se puede decidir', async () => {
    await expect(servicio.solicitar({ desde: hoy, hasta: hoy, motivo: 'Motivo' }, jefe, hoy)).rejects.toThrow(/no esta vinculado/);
    await expect(servicio.solicitar({ desde: hoy, hasta: hoy, motivo: 'Motivo', bomberoId: 'B2' }, yo, hoy)).rejects.toThrow(ForbiddenException);
    await expect(servicio.solicitar({ desde: hoy, hasta: hoy, motivo: 'Motivo', bomberoId: 'B2' }, jefe, hoy)).resolves.toMatchObject({ bomberoId: 'B2' });
    await expect(servicio.solicitar({ desde: hoy, hasta: hoy, motivo: 'Motivo', bomberoId: 'NO' }, jefe, hoy)).rejects.toThrow(NotFoundException);
  });

  it('valida fechas: orden, pasado y duracion maxima', async () => {
    await expect(servicio.solicitar({ desde: '2026-03-14', hasta: '2026-03-12', motivo: 'Motivo' }, yo, hoy)).rejects.toThrow(BadRequestException);
    await expect(servicio.solicitar({ desde: '2026-03-01', hasta: '2026-03-05', motivo: 'Motivo' }, yo, hoy)).rejects.toThrow(/pasado/);
    await expect(servicio.solicitar({ desde: '2026-03-10', hasta: '2026-12-31', motivo: 'Motivo' }, yo, hoy)).rejects.toThrow(new RegExp(String(MAX_DIAS_AUSENCIA)));
  });

  it('no permite dos ausencias superpuestas del mismo bombero, pero una cancelada libera el periodo', async () => {
    const a = await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-14', motivo: 'Motivo' }, yo, hoy);
    await expect(servicio.solicitar({ desde: '2026-03-14', hasta: '2026-03-16', motivo: 'Motivo' }, yo, hoy)).rejects.toThrow(ConflictException);
    await servicio.cancelar(a.id, {}, yo);
    await expect(servicio.solicitar({ desde: '2026-03-14', hasta: '2026-03-16', motivo: 'Motivo' }, yo, hoy)).resolves.toBeDefined();
  });

  it('solo quien decide aprueba o rechaza; rechazar exige motivo; no se decide dos veces', async () => {
    const a = await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-14', motivo: 'Motivo' }, yo, hoy);
    await expect(servicio.decidir(a.id, { decision: 'APROBAR' }, yo)).rejects.toThrow(ForbiddenException);
    await expect(servicio.decidir(a.id, { decision: 'RECHAZAR' }, jefe)).rejects.toThrow(BadRequestException);
    expect(await servicio.decidir(a.id, { decision: 'APROBAR' }, jefe)).toMatchObject({ estado: 'APROBADA', decididaPor: 'adm' });
    await expect(servicio.decidir(a.id, { decision: 'APROBAR' }, jefe)).rejects.toThrow(ConflictException);
    await expect(servicio.decidir('NO', { decision: 'APROBAR' }, jefe)).rejects.toThrow(NotFoundException);
  });

  it('la cancela quien la pidio o quien decide, nunca un tercero', async () => {
    const a = await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-14', motivo: 'Motivo' }, yo, hoy);
    await expect(servicio.cancelar(a.id, {}, otro)).rejects.toThrow(ForbiddenException);
    await expect(servicio.cancelar(a.id, {}, jefe)).resolves.toMatchObject({ estado: 'CANCELADA' });
    await expect(servicio.cancelar(a.id, {}, yo)).rejects.toThrow(ConflictException);
  });

  it('cada uno ve solo lo suyo; quien decide ve todo, con el nombre', async () => {
    await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-13', motivo: 'Motivo' }, yo, hoy);
    await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-13', motivo: 'Motivo' }, otro, hoy);
    expect((await servicio.listar(yo)).map((x) => x.bombero)).toEqual(['Gomez, Ana']);
    expect(await servicio.listar(jefe)).toHaveLength(2);
  });

  it('ausentesEl devuelve solo a quienes tienen una ausencia APROBADA que cubre la fecha', async () => {
    const a = await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-14', motivo: 'Motivo' }, yo, hoy);
    const b = await servicio.solicitar({ desde: '2026-03-12', hasta: '2026-03-14', motivo: 'Motivo' }, otro, hoy);
    await servicio.decidir(a.id, { decision: 'APROBAR' }, jefe); // solo la de B1 se aprueba
    await servicio.decidir(b.id, { decision: 'RECHAZAR', motivo: 'Falta personal' }, jefe);
    expect([...(await servicio.ausentesEl('2026-03-13'))]).toEqual(['B1']);
    expect((await servicio.ausentesEl('2026-03-15')).size).toBe(0);
    expect((await servicio.ausentesEl('2026-03-11')).size).toBe(0);
  });
});

void [Ausencia];
