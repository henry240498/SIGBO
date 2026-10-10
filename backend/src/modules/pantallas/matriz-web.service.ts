import { ForbiddenException, Inject, Injectable, Logger, OnApplicationBootstrap, Optional, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Pantalla, PantallaPermiso } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { PERMISSION_KEY } from '../seguridad/decorators/require-permission.decorator';
import { PolicyEngineService } from '../seguridad/policy-engine.service';
import { ClaveSeccion, SECCIONES_CENTRO_MANDO } from './catalogo-secciones';
import { ACCIONES_FORZADAS, LLAMADAS_SIN_RESOLVER, PANTALLAS_WEB } from './catalogo-web.generado';
import {
  AccionForzada, AccionUi, accionDe, baseDePantalla, BaseUi, claveRuta, construirIndice, decidirApi, decidirUi,
  decidirUiDetalle, esExenta, IndiceMatriz, MetodoHttp, normalizarPatron, PantallaCatalogo, RutaBackend, sinPrefijo, VERBO_ACCION,
} from './matriz-web.logica';
import { resolverSujeto, sujetoVacio } from './sujeto';

export const CATALOGO_PANTALLAS_WEB = Symbol('CATALOGO_PANTALLAS_WEB');

export interface CatalogoWeb { pantallas: PantallaCatalogo[]; forzadas: AccionForzada[]; sinResolver: number }
export interface UsuarioMatriz { id: string; permisos: string[] }
export interface EstadoMatriz {
  activa: boolean; sincronizada: boolean; error: string | null; pantallas: number;
  secciones: number; rutasBackend: number; llamadasSinResolver: number;
}

const CATALOGO_GENERADO: CatalogoWeb = { pantallas: PANTALLAS_WEB, forzadas: ACCIONES_FORZADAS, sinResolver: LLAMADAS_SIN_RESOLVER.length };
const METODO_POR_ENUM: Partial<Record<number, MetodoHttp>> = {
  [RequestMethod.GET]: 'GET', [RequestMethod.POST]: 'POST', [RequestMethod.PUT]: 'PUT',
  [RequestMethod.PATCH]: 'PATCH', [RequestMethod.DELETE]: 'DELETE',
};
const VIGENCIA_REGLAS_MS = 60_000;
const SILENCIO_AUDITORIA_MS = 10 * 60_000;
const ACCIONES_UI: AccionUi[] = ['ver', 'crear', 'editar', 'eliminar'];

const recortar = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Matriz de permisos por pantalla aplicada a la web (spec 2026-10-09 §4).
 * Al arrancar: arma la tabla real de rutas de Nest, la cruza con el catalogo generado y
 * sincroniza seguridad.pantallas. En cada pedido (desde PermissionsGuard): si la ruta
 * pertenece a pantallas con reglas para esa persona, decide la matriz. Solo restringe.
 */
@Injectable()
export class MatrizWebService implements OnApplicationBootstrap {
  private readonly log = new Logger('MatrizWeb');
  private readonly catalogo: CatalogoWeb;
  private indice: IndiceMatriz = { pantallasPorRuta: new Map(), rutasPorPantalla: new Map(), sinResolver: [] };
  private rutas: RutaBackend[] = [];
  private activa = false;
  private sincronizada = false;
  private errorSincronizacion: string | null = null;
  private reglasCache: { cargadas: number; reglas: PantallaPermiso[] } | null = null;
  private readonly ultimasDenegaciones = new Map<string, number>();

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Optional() @Inject(CATALOGO_PANTALLAS_WEB) catalogo?: CatalogoWeb,
  ) {
    this.catalogo = catalogo ?? CATALOGO_GENERADO;
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      this.rutas = this.leerRutas();
      this.indice = construirIndice(this.catalogo.pantallas, this.rutas);
      this.activa = true;
      if (this.indice.sinResolver.length) {
        this.log.warn(`${this.indice.sinResolver.length} llamadas del catálogo no coinciden con ninguna ruta del backend (ver Sistema › Estado).`);
      }
    } catch (e) {
      this.activa = false;
      this.log.error(`No se pudo armar el índice de pantallas: ${mensaje(e)}. La matriz web queda inactiva.`);
    }
    await this.sincronizar();
  }

  private leerRutas(): RutaBackend[] {
    const salida: RutaBackend[] = [];
    for (const wrapper of this.discovery.getControllers()) {
      const { instance, metatype } = wrapper as { instance?: object; metatype?: Function };
      if (!instance || !metatype) continue;
      const bases = ([] as string[]).concat(Reflect.getMetadata(PATH_METADATA, metatype) ?? '');
      const permisosClase: string[] = Reflect.getMetadata(PERMISSION_KEY, metatype) ?? [];
      const prototipo = Object.getPrototypeOf(instance);
      for (const nombre of this.scanner.getAllMethodNames(prototipo)) {
        const manejador = prototipo[nombre];
        const metodo = METODO_POR_ENUM[Reflect.getMetadata(METHOD_METADATA, manejador) as number];
        const caminos = Reflect.getMetadata(PATH_METADATA, manejador);
        if (!metodo || caminos === undefined) continue;
        const permisos: string[] = Reflect.getMetadata(PERMISSION_KEY, manejador) ?? permisosClase;
        for (const base of bases) {
          for (const camino of ([] as string[]).concat(caminos)) {
            salida.push({ metodo, patron: normalizarPatron(`${base}/${camino}`), permisos });
          }
        }
      }
    }
    return salida;
  }

  async sincronizar(): Promise<void> {
    try {
      const repo = this.dataSource.getRepository(Pantalla);
      const existentes = await repo.find({});
      const porCodigo = new Map(existentes.map((p) => [p.codigo, p]));
      const deseadas = [
        ...this.catalogo.pantallas.map((p) => ({ codigo: p.codigo, nombre: recortar(p.nombre, 80), descripcion: recortar(`${p.modulo} · ${p.ruta}`, 200) })),
        ...SECCIONES_CENTRO_MANDO.map((s) => ({ codigo: s.codigo, nombre: recortar(`Centro de mando › ${s.nombre}`, 80), descripcion: recortar(s.descripcion, 200) })),
      ];
      const codigos = new Set(deseadas.map((d) => d.codigo));
      for (const d of deseadas) {
        const e = porCodigo.get(d.codigo);
        if (e && e.nombre === d.nombre && e.descripcion === d.descripcion && e.activa) continue;
        await repo.save(Object.assign(e ?? new Pantalla(), { ...d, confidencialAplica: e?.confidencialAplica ?? false, activa: true }));
      }
      for (const e of existentes) {
        if (/^0x[BC]/.test(e.codigo) && !codigos.has(e.codigo) && e.activa) await repo.save(Object.assign(e, { activa: false }));
      }
      this.sincronizada = true;
      this.errorSincronizacion = null;
    } catch (e) {
      this.sincronizada = false;
      this.errorSincronizacion = mensaje(e);
      this.log.error(`No se pudo sincronizar seguridad.pantallas: ${this.errorSincronizacion}. Se reintenta al abrir Seguridad › Pantallas.`);
    }
  }

  estaSincronizada(): boolean {
    return this.sincronizada;
  }

  invalidar(): void {
    this.reglasCache = null;
  }

  private async reglas(): Promise<PantallaPermiso[]> {
    if (this.reglasCache && Date.now() - this.reglasCache.cargadas < VIGENCIA_REGLAS_MS) return this.reglasCache.reglas;
    const reglas = await this.dataSource.getRepository(PantallaPermiso).find({});
    this.reglasCache = { cargadas: Date.now(), reglas };
    return reglas;
  }

  async exigirEnRuta(user: UsuarioMatriz, metodo: string, rutaExpress: string | undefined): Promise<void> {
    if (!this.activa || !rutaExpress) return;
    const patron = sinPrefijo(rutaExpress);
    if (esExenta(patron)) return;
    const m = metodo.toUpperCase() === 'HEAD' ? 'GET' : metodo.toUpperCase();
    const codigos = this.indice.pantallasPorRuta.get(claveRuta(m, patron)) ?? [];
    if (!codigos.length) return;
    const accion = accionDe(m, patron, this.catalogo.forzadas);
    if (!accion) return;
    const reglas = (await this.reglas()).filter((r) => codigos.includes(r.pantallaCodigo));
    if (!reglas.length) return;
    const decision = decidirApi(codigos, accion, reglas, await resolverSujeto(this.dataSource, user.id));
    if (decision.permitido) return;
    const codigo = decision.codigoDenegado as string;
    const nombre = this.catalogo.pantallas.find((p) => p.codigo === codigo)?.nombre ?? codigo;
    await this.auditarDenegacion(user.id, codigo, accion, `${m} ${patron}`);
    throw new ForbiddenException(`No tenés permiso para ${VERBO_ACCION[accion]} en «${nombre}».`);
  }

  private async auditarDenegacion(usuarioId: string, codigo: string, accion: string, ruta: string) {
    const clave = `${usuarioId}|${codigo}|${accion}`;
    const ahora = Date.now();
    if (ahora - (this.ultimasDenegaciones.get(clave) ?? 0) < SILENCIO_AUDITORIA_MS) return;
    this.ultimasDenegaciones.set(clave, ahora);
    try {
      await this.moduleRef.get(AuditoriaService, { strict: false }).registrar({
        usuarioId, accion: 'DENEGADO_POR_PANTALLA', recurso: 'seguridad.pantalla_permisos', recursoId: null,
        datosDespues: { pantalla: codigo, accion, ruta },
      });
    } catch (e) {
      this.log.warn(`No se pudo auditar una denegación por pantalla: ${mensaje(e)}`);
    }
  }

  private base(p: PantallaCatalogo, accion: AccionUi): BaseUi {
    return baseDePantalla(p, this.indice.rutasPorPantalla.get(p.codigo) ?? [], accion, this.catalogo.forzadas);
  }

  async misPermisosWeb(user: UsuarioMatriz) {
    const reglas = await this.reglas();
    const sujeto = reglas.some((r) => /^0x[BC]/.test(r.pantallaCodigo)) ? await resolverSujeto(this.dataSource, user.id) : sujetoVacio(user.id);
    const pantallas = this.catalogo.pantallas.map((p) => {
      const propias = reglas.filter((r) => r.pantallaCodigo === p.codigo);
      const [ver, crear, editar, eliminar] = ACCIONES_UI.map((a) => decidirUi(this.base(p, a), a, user.permisos, propias, sujeto));
      return { codigo: p.codigo, ruta: p.ruta, ver, crear, editar, eliminar };
    });
    return { generadoEn: new Date(), activa: this.activa, pantallas };
  }

  async evaluadorSecciones(user: UsuarioMatriz): Promise<(clave: ClaveSeccion) => boolean> {
    const reglas = await this.reglas();
    const sujeto = reglas.some((r) => r.pantallaCodigo.startsWith('0xC')) ? await resolverSujeto(this.dataSource, user.id) : sujetoVacio(user.id);
    return (clave) => {
      const s = SECCIONES_CENTRO_MANDO.find((x) => x.clave === clave);
      if (!s) return false;
      const base: BaseUi = s.base === 'SIEMPRE'
        ? { siempre: true, nunca: false, algunoDe: [], prefijo: null }
        : { siempre: false, nunca: false, algunoDe: s.base, prefijo: null };
      return decidirUi(base, 'ver', user.permisos, reglas.filter((r) => r.pantallaCodigo === s.codigo), sujeto);
    };
  }

  /** Qué vería y podría hacer una persona en cada pantalla, y por qué (rol o regla). */
  async vistaPrevia(usuarioId: string) {
    const permisos = await this.moduleRef.get(PolicyEngineService, { strict: false }).getPermisosEfectivos(usuarioId);
    const reglas = await this.reglas();
    const sujeto = await resolverSujeto(this.dataSource, usuarioId);
    return this.catalogo.pantallas.map((p) => {
      const propias = reglas.filter((r) => r.pantallaCodigo === p.codigo);
      const [ver, crear, editar, eliminar] = ACCIONES_UI.map((a) => decidirUiDetalle(this.base(p, a), a, permisos, propias, sujeto));
      return { codigo: p.codigo, ruta: p.ruta, nombre: p.nombre, modulo: p.modulo, ver, crear, editar, eliminar };
    });
  }

  catalogoParaAdministrar() {
    return {
      activa: this.activa,
      sincronizada: this.sincronizada,
      pantallas: [
        ...this.catalogo.pantallas.map((p) => ({
          codigo: p.codigo, nombre: p.nombre, ruta: p.ruta, modulo: p.modulo, tipo: 'WEB' as const,
          rutasApi: (this.indice.rutasPorPantalla.get(p.codigo) ?? []).map((r) => ({ metodo: r.metodo, patron: r.patron, permisos: r.permisos, exenta: esExenta(r.patron) })),
        })),
        ...SECCIONES_CENTRO_MANDO.map((s) => ({
          codigo: s.codigo, nombre: `Centro de mando › ${s.nombre}`, ruta: '/dashboard/centro-mando', modulo: 'centro-mando', tipo: 'SECCION' as const,
          rutasApi: [] as Array<{ metodo: MetodoHttp; patron: string; permisos: string[]; exenta: boolean }>,
        })),
      ],
    };
  }

  estado(): EstadoMatriz {
    return {
      activa: this.activa, sincronizada: this.sincronizada, error: this.errorSincronizacion,
      pantallas: this.catalogo.pantallas.length, secciones: SECCIONES_CENTRO_MANDO.length,
      rutasBackend: this.rutas.length, llamadasSinResolver: this.indice.sinResolver.length + this.catalogo.sinResolver,
    };
  }
}
