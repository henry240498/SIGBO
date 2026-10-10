import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Bombero, DisponibilidadPersonal, Usuario } from '../../shared/entities';
import { AlertasService } from '../alertas/alertas.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { VencimientosService } from '../control-personal/vencimientos.service';
import { DenunciasService } from '../denuncias/denuncias.service';
import { DespachoService } from '../despacho/despacho.service';
import { ServicioActivoService } from '../despacho/servicio-activo.service';
import { DisponibilidadService } from '../flota/disponibilidad.service';
import { FlotaService } from '../flota/flota.service';
import { ClaveSeccion, SECCIONES_CENTRO_MANDO } from '../pantallas/catalogo-secciones';
import { MatrizWebService } from '../pantallas/matriz-web.service';
import { ReservasService } from '../reservas/reservas.service';
import { PerfilService } from '../seguridad/perfil.service';
import { SistemaService } from '../sistema/sistema.service';
import { decidirAcceso, esSupervisor, nivelPorCantidad } from './centro-mando.logica';

export interface ItemPendiente {
  clave: string;
  titulo: string;
  cantidad: number | null;
  detalle: string | null;
  enlace: string;
  nivel: 'normal' | 'atencion' | 'critico';
  error: string | null;
}

type SeccionRespuesta = { estado: 'ok'; datos: unknown } | { estado: 'error'; error: string };

const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Centro de mando (spec 2026-10-09 §5): solo las secciones que la persona puede ver, cada una por su lado. */
@Injectable()
export class CentroMandoService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly matriz: MatrizWebService,
    private readonly configuracion: ConfiguracionService,
    private readonly servicioActivo: ServicioActivoService,
    private readonly despacho: DespachoService,
    private readonly alertas: AlertasService,
    private readonly disponibilidad: DisponibilidadService,
    private readonly flota: FlotaService,
    private readonly perfil: PerfilService,
    private readonly denuncias: DenunciasService,
    private readonly reservas: ReservasService,
    private readonly vencimientos: VencimientosService,
    private readonly sistema: SistemaService,
  ) {}

  async acceso(user: Pick<AuthenticatedUser, 'id'>): Promise<{ acceso: boolean; motivo: string | null; bomberoId: string | null }> {
    const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { id: user.id } });
    if (!usuario?.bomberoId) return { acceso: true, motivo: null, bomberoId: null };
    const bombero = await this.dataSource.getRepository(Bombero).findOne({ where: { id: usuario.bomberoId } });
    const permitidos = await this.configuracion.valorGlobal<string[]>('operations.commandCenterStates');
    return { ...decidirAcceso(bombero?.estado ?? null, permitidos), bomberoId: usuario.bomberoId };
  }

  async panel(user: AuthenticatedUser) {
    const acceso = await this.acceso(user);
    if (!acceso.acceso) return { generadoEn: new Date(), acceso: 'SIN_ACCESO' as const, motivo: acceso.motivo, secciones: {} as Partial<Record<ClaveSeccion, SeccionRespuesta>> };

    const puede = await this.matriz.evaluadorSecciones(user);
    const claves = SECCIONES_CENTRO_MANDO.map((s) => s.clave).filter((c) => puede(c));
    let disponibilidad: ReturnType<DisponibilidadService['consultar']> | null = null;
    const enVivo = () => (disponibilidad ??= this.disponibilidad.consultar());

    const cargadores: Record<ClaveSeccion, () => Promise<unknown>> = {
      accesos: async () => null,
      emergencias: () => this.servicioActivo.activosParaCentroMando(user, { supervisor: esSupervisor(user.permisos), bomberoId: acceso.bomberoId }),
      alertas: async () => (await this.alertas.listar({ estado: 'PENDIENTE', limite: 20 })).map((a) => ({
        id: a.id, tipo: a.tipo, solicitanteNombre: a.solicitanteNombre, detalle: a.detalle, creadoEn: a.creadoEn,
      })),
      moviles: async () => (await enVivo()).moviles,
      personal: () => this.disponibilidadPersonal(),
      guardia: async () => (await enVivo()).personalDeGuardia,
      convocatorias: async () => (await enVivo()).convocatorias,
      mi_actividad: () => this.perfil.obtenerInicioPropio(user.id),
      pendientes: () => this.pendientes(user),
      sistema: () => this.sistema.resumen(),
    };

    const resultados = await Promise.allSettled(claves.map((c) => cargadores[c]()));
    const secciones: Partial<Record<ClaveSeccion, SeccionRespuesta>> = {};
    claves.forEach((clave, i) => {
      const r = resultados[i];
      secciones[clave] = r.status === 'fulfilled' ? { estado: 'ok', datos: r.value } : { estado: 'error', error: mensaje(r.reason) };
    });
    const pendientes = secciones.pendientes;
    if (pendientes?.estado === 'ok' && Array.isArray(pendientes.datos) && pendientes.datos.length === 0) delete secciones.pendientes;
    return { generadoEn: new Date(), acceso: 'PERMITIDO' as const, motivo: null, secciones };
  }

  /** Bomberos por disponibilidad, con el estado mas reciente de cada persona. */
  private async disponibilidadPersonal() {
    const filas = await this.dataSource.getRepository(DisponibilidadPersonal).find({});
    const ultima = new Map<string, DisponibilidadPersonal>();
    for (const f of filas) {
      const previa = ultima.get(f.usuarioId);
      if (!previa || new Date(f.desde).getTime() > new Date(previa.desde).getTime()) ultima.set(f.usuarioId, f);
    }
    const estados = [...ultima.values()].map((f) => f.estado);
    const cuenta = (e: string) => estados.filter((x) => x === e).length;
    return { alLlamado: cuenta('AL_LLAMADO'), enBase: cuenta('EN_BASE'), enCamino: cuenta('EN_CAMINO'), enServicio: cuenta('EN_SERVICIO'), noDisponible: cuenta('NO_DISPONIBLE'), total: estados.length };
  }

  /** Bandeja de lo que espera a la funcion de la persona: cada item exige su propio permiso. */
  private async pendientes(user: AuthenticatedUser): Promise<ItemPendiente[]> {
    const tiene = (p: string) => user.permisos.includes(p);
    const definiciones: Array<{ clave: string; titulo: string; enlace: string; cargar: () => Promise<Pick<ItemPendiente, 'cantidad' | 'detalle' | 'nivel'>> }> = [];
    if (tiene('despacho:seguimiento')) definiciones.push({
      clave: 'despacho', titulo: 'Solicitudes de despacho abiertas', enlace: '/dashboard/servicios/despacho',
      cargar: async () => { const n = (await this.despacho.listar(true)).length; return { cantidad: n, detalle: null, nivel: nivelPorCantidad(n) }; },
    });
    if (tiene('denuncias:ver')) definiciones.push({
      clave: 'denuncias', titulo: 'Denuncias sin resolver', enlace: '/dashboard/denuncias',
      cargar: async () => {
        const r = await this.denuncias.resumen() as Record<string, number>;
        const nuevas = r['NUEVA'] ?? 0;
        const enRevision = r['EN_REVISION'] ?? 0;
        return { cantidad: nuevas + enRevision, detalle: `${nuevas} nueva(s), ${enRevision} en revisión`, nivel: nivelPorCantidad(nuevas + enRevision) };
      },
    });
    if (tiene('reservas:decidir')) definiciones.push({
      clave: 'reservas', titulo: 'Reservas por decidir', enlace: '/dashboard/reservas',
      cargar: async () => { const n = (await this.reservas.listar({ estado: 'SOLICITADA' }) as unknown[]).length; return { cantidad: n, detalle: null, nivel: nivelPorCantidad(n) }; },
    });
    if (tiene('vehiculos:ver')) definiciones.push({
      clave: 'flota', titulo: 'Vencimientos de móviles (30 días)', enlace: '/dashboard/vehiculos/flota',
      cargar: async () => {
        const l = await this.flota.vencimientos(30);
        const vencidos = l.filter((v) => v.vencido).length;
        return { cantidad: l.length, detalle: `${vencidos} vencido(s)`, nivel: nivelPorCantidad(l.length, vencidos) };
      },
    });
    if (tiene('personal:ver')) definiciones.push({
      clave: 'personal', titulo: 'Vencimientos del personal (30 días)', enlace: '/dashboard/personal/control',
      cargar: async () => {
        const l = await this.vencimientos.vencimientos(30, { incluirMedicas: false });
        const vencidos = l.filter((v) => v.vencido).length;
        return { cantidad: l.length, detalle: `${vencidos} vencido(s)`, nivel: nivelPorCantidad(l.length, vencidos) };
      },
    });
    const resultados = await Promise.allSettled(definiciones.map((d) => d.cargar()));
    return definiciones.map((d, i) => {
      const r = resultados[i];
      return r.status === 'fulfilled'
        ? { clave: d.clave, titulo: d.titulo, enlace: d.enlace, error: null, ...r.value }
        : { clave: d.clave, titulo: d.titulo, enlace: d.enlace, cantidad: null, detalle: null, nivel: 'normal' as const, error: mensaje(r.reason) };
    });
  }
}
