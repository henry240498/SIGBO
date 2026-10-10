import { Bombero, PersonalServicio, Servicio, ServicioParticipante, TipoServicio, Usuario } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { ServicioActivoService } from '../despacho/servicio-activo.service';
import { decidirAcceso, esSupervisor } from './centro-mando.logica';
import { CentroMandoService } from './centro-mando.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('reglas del Centro de mando', () => {
  it('solo los estados configurados tienen acceso', () => {
    expect(decidirAcceso('ACTIVO', ['ACTIVO'])).toEqual({ acceso: true, motivo: null });
    expect(decidirAcceso('LICENCIA', ['ACTIVO'])).toEqual({ acceso: false, motivo: 'Tu estado actual (Licencia) no tiene acceso al Centro de mando.' });
    expect(decidirAcceso('BAJA', ['ACTIVO', 'LICENCIA']).acceso).toBe(false);
    expect(decidirAcceso(null, ['ACTIVO']).acceso).toBe(false);
  });

  it('supervisa quien despacha o hace seguimiento', () => {
    expect(esSupervisor(['despacho:seguimiento'])).toBe(true);
    expect(esSupervisor(['servicios:despachar'])).toBe(true);
    expect(esSupervisor(['servicios:ver', 'despacho:responder'])).toBe(false);
  });
});

describe('emergencias en curso por participación', () => {
  async function preparar() {
    const base = new BaseFalsa();
    await sembrar(base, TipoServicio, { id: 't1', nombre: 'Incendio' });
    for (const id of ['s1', 's2', 's3']) {
      await sembrar(base, Servicio, { id, numeroServicio: `CS-2026-0000${id[1]}`, tipoServicioId: 't1', estado: 'EN_CURSO', gravedad: 'GRAVE', fechaHoraAviso: new Date(), direccion: 'Calle 1' });
    }
    await sembrar(base, Servicio, { id: 's4', numeroServicio: 'CS-2026-00004', tipoServicioId: 't1', estado: 'FINALIZADO', fechaHoraAviso: new Date(), direccion: 'x' });
    await sembrar(base, ServicioParticipante, { servicioId: 's1', usuarioId: 'u1', estado: 'EN_CAMINO', hasta: null });
    await sembrar(base, ServicioParticipante, { servicioId: 's3', usuarioId: 'u1', estado: 'RETIRADO', hasta: new Date() });
    await sembrar(base, PersonalServicio, { servicioId: 's2', bomberoId: 'b1', rol: 'Bombero', horasServicio: 0 });
    const pantallas = { permite: jest.fn().mockResolvedValue(false), exigir: jest.fn() };
    return new ServicioActivoService(base as never, { registrar: jest.fn() } as never, pantallas as never, {} as never);
  }

  it('sin supervisión, solo las que la persona integra (participante vigente o personal del servicio)', async () => {
    const s = await preparar();
    const r = await s.activosParaCentroMando({ id: 'u1', permisos: [] } as never, { supervisor: false, bomberoId: 'b1' });
    expect(r.servicios.map((x) => x.id).sort()).toEqual(['s1', 's2']);
    expect(r.servicios[0]).toMatchObject({ tipo: 'Incendio', gravedad: 'GRAVE', direccion: null });
  });

  it('con supervisión, todas las activas', async () => {
    const s = await preparar();
    const r = await s.activosParaCentroMando({ id: 'u9', permisos: [] } as never, { supervisor: true, bomberoId: null });
    expect(r.servicios.map((x) => x.id).sort()).toEqual(['s1', 's2', 's3']);
  });
});

describe('CentroMandoService', () => {
  function nuevo(base: BaseFalsa, o: { secciones?: string[]; alertasFalla?: boolean } = {}) {
    const visibles = new Set(o.secciones ?? ['emergencias', 'alertas', 'mi_actividad', 'pendientes']);
    const deps = {
      matriz: { evaluadorSecciones: jest.fn().mockResolvedValue((c: string) => visibles.has(c)) },
      configuracion: { valorGlobal: jest.fn().mockResolvedValue(['ACTIVO']) },
      servicioActivo: { activosParaCentroMando: jest.fn().mockResolvedValue({ supervisor: false, servicios: [] }) },
      despacho: { listar: jest.fn().mockResolvedValue([{}, {}]) },
      alertas: { listar: o.alertasFalla ? jest.fn().mockRejectedValue(new Error('se cayó')) : jest.fn().mockResolvedValue([]) },
      disponibilidad: { consultar: jest.fn() },
      flota: { vencimientos: jest.fn().mockResolvedValue([]) },
      perfil: { obtenerInicioPropio: jest.fn().mockResolvedValue({ tienePerfilBombero: false, proximasGuardias: [], ultimosServicios: [] }) },
      denuncias: { resumen: jest.fn().mockResolvedValue({ NUEVA: 2, EN_REVISION: 1 }) },
      reservas: { listar: jest.fn().mockResolvedValue([]) },
      vencimientos: { vencimientos: jest.fn().mockResolvedValue([]) },
      sistema: { resumen: jest.fn() },
    };
    const s = new CentroMandoService(base as never, deps.matriz as never, deps.configuracion as never, deps.servicioActivo as never,
      deps.despacho as never, deps.alertas as never, deps.disponibilidad as never, deps.flota as never, deps.perfil as never,
      deps.denuncias as never, deps.reservas as never, deps.vencimientos as never, deps.sistema as never);
    return { s, deps };
  }

  it('el personal no activo no ve nada (ni se consulta nada)', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', bomberoId: 'b1' });
    await sembrar(base, Bombero, { id: 'b1', estado: 'LICENCIA' });
    const { s, deps } = nuevo(base);
    await expect(s.panel({ id: 'u1', permisos: ['servicios:ver'] } as never)).resolves.toMatchObject({ acceso: 'SIN_ACCESO', secciones: {} });
    expect(deps.matriz.evaluadorSecciones).not.toHaveBeenCalled();
    expect(deps.servicioActivo.activosParaCentroMando).not.toHaveBeenCalled();
  });

  it('una cuenta sin ficha de bombero se rige por sus roles', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'admin', bomberoId: null });
    const { s } = nuevo(base);
    await expect(s.acceso({ id: 'admin', permisos: [] } as never)).resolves.toMatchObject({ acceso: true });
  });

  it('una sección que falla no tumba a las demás, y los pendientes respetan cada permiso', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', bomberoId: 'b1' });
    await sembrar(base, Bombero, { id: 'b1', estado: 'ACTIVO' });
    const { s, deps } = nuevo(base, { alertasFalla: true });
    const r = await s.panel({ id: 'u1', permisos: ['servicios:ver', 'denuncias:ver'] } as never);
    expect(r.acceso).toBe('PERMITIDO');
    expect(r.secciones.alertas).toEqual({ estado: 'error', error: 'se cayó' });
    expect(r.secciones.emergencias).toMatchObject({ estado: 'ok' });
    expect(deps.servicioActivo.activosParaCentroMando).toHaveBeenCalledWith(expect.anything(), { supervisor: false, bomberoId: 'b1' });
    const pendientes = (r.secciones.pendientes as { datos: Array<{ clave: string; cantidad: number }> }).datos;
    expect(pendientes).toEqual([expect.objectContaining({ clave: 'denuncias', cantidad: 3 })]);
    expect(deps.despacho.listar).not.toHaveBeenCalled();
  });

  it('sin ningún pendiente permitido, la sección no aparece', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', bomberoId: null });
    const { s } = nuevo(base, { secciones: ['pendientes', 'mi_actividad'] });
    const r = await s.panel({ id: 'u1', permisos: [] } as never);
    expect(r.secciones.pendientes).toBeUndefined();
    expect(r.secciones.mi_actividad).toMatchObject({ estado: 'ok' });
  });
});
