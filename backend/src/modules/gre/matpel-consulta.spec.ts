import { Reflector } from '@nestjs/core';
import { MatpelConsultaController } from './matpel-consulta.controller';
import { MatpelConsultaService } from './matpel-consulta.service';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { GreActivacion, GreEntrada, GreGuia, GreVersion } from '../../shared/entities';

describe('Consulta MATPEL: autorización, edición explícita y paginación vinculada', () => {
  const versionGreId = '00000000-0000-4000-8000-000000000001';
  const documento = { sha256: 'b'.repeat(64), edicion: '2024', idioma: 'es' };
  const catalogo = { documentoDeVersionValidada: jest.fn(), fuenteDeVersionValidada: jest.fn() };
  const fuentes = { leerDocumento: jest.fn() };
  let ds: any; let service: MatpelConsultaService; let qb: any; let repos: Map<any, any>;
  beforeEach(() => {
    jest.resetAllMocks(); repos = new Map();
    qb = {}; for (const n of ['where', 'andWhere', 'innerJoin', 'orderBy', 'addOrderBy', 'take']) qb[n] = jest.fn().mockReturnValue(qb);
    qb.getMany = jest.fn().mockResolvedValue([]);
    ds = { query: jest.fn().mockResolvedValue([{ versiones: 1, activaciones: 1 }]), getRepository: jest.fn((tipo) => {
      if (!repos.has(tipo)) repos.set(tipo, { find: jest.fn().mockResolvedValue([]), findOneBy: jest.fn().mockResolvedValue(null), createQueryBuilder: jest.fn().mockReturnValue(qb) });
      return repos.get(tipo);
    }) };
    service = new MatpelConsultaService(ds, catalogo as any, fuentes as any);
    catalogo.documentoDeVersionValidada.mockResolvedValue(documento);
  });
  it('no publica candidato ni inicia importación cuando no hay edición activa/tablas', async () => {
    expect((await service.estado()).estado).toBe('SIN_EDICION_ACTIVA');
    ds.query.mockResolvedValue([{ versiones: null, activaciones: null }]);
    expect((await service.estado()).estado).toBe('CATALOGO_NO_INSTALADO');
    expect(catalogo.documentoDeVersionValidada).not.toHaveBeenCalled();
    expect(fuentes.leerDocumento).not.toHaveBeenCalled();
  });
  it('consulta activa validada y conserva id para el resto de peticiones', async () => {
    ds.getRepository(GreActivacion).findOneBy.mockResolvedValue({ versionId: versionGreId });
    expect(await service.estado()).toMatchObject({ estado: 'DISPONIBLE', versionGreId, documentoSha256: documento.sha256 });
    expect(catalogo.documentoDeVersionValidada).toHaveBeenCalledWith(versionGreId);
  });
  it('identificador con varias entradas devuelve todas para selección explícita', async () => {
    const filas = [2, 3].map(n => ({ id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, nombreNormalizado: `N${n}`, identificador: '3171', versionId: versionGreId }));
    qb.getMany.mockResolvedValue(filas);
    const r = await service.buscar({ q: '3171', limite: 20, versionGreId });
    expect(r.items).toHaveLength(2); expect(r.items.every(i => i.requiereSeleccionExplicita)).toBe(true);
    expect(qb.andWhere).toHaveBeenCalledWith('e.identificador = :q', { q: '3171' });
  });
  it('cursor de otra consulta/edición o corrupto es rechazado', async () => {
    qb.getMany.mockResolvedValue([2, 3].map(n => ({ id: `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`, nombreNormalizado: `N${n}` })));
    const inicial = await service.buscar({ q: '3171', limite: 1, versionGreId });
    expect(inicial.cursor).toBeTruthy();
    await expect(service.buscar({ q: '1005', limite: 1, versionGreId, cursor: inicial.cursor! })).rejects.toThrow('cursor');
    await expect(service.buscar({ q: '3171', limite: 1, versionGreId: versionGreId.replace(/1$/, '9'), cursor: inicial.cursor! })).rejects.toThrow('cursor');
    await expect(service.buscar({ q: '3171', limite: 1, versionGreId, cursor: 'invalid' })).rejects.toThrow('cursor');
  });
  it('búsqueda por nombre escapa comodines como literal y no interpola SQL', async () => {
    await service.buscar({ q: 'a%_[', limite: 20, versionGreId });
    expect(qb.andWhere).toHaveBeenCalledWith("e.nombreNormalizado LIKE :patron ESCAPE '\\'", { patron: '%A\\%\\_\\[%' });
    expect(qb.where).toHaveBeenCalledWith('e.versionId = :versionGreId', { versionGreId });
  });
  it('guía111/guías vacías también se consultan sin forzar una entrada', async () => {
    ds.getRepository(GreGuia).find.mockResolvedValue([{ numero: '121', estadoContenido: 'INTENCIONALMENTE_VACIA' }]);
    const r = await service.buscar({ q: '121', limite: 20, versionGreId });
    expect(r.guias[0].estadoContenido).toBe('INTENCIONALMENTE_VACIA'); expect(r.items).toEqual([]);
  });
  it('caché vuelve a comprobar validación; una revocación impide reutilizarla', async () => {
    ds.getRepository(GreVersion).findOneBy.mockResolvedValue({ estado: 'VALIDADA', sha256Contenido: 'c'.repeat(64) });
    const lectura = await service.leer(versionGreId); await service.leer(versionGreId);
    expect(Object.isFrozen(lectura)).toBe(true); expect(Object.isFrozen(lectura.entradas)).toBe(true);
    expect(ds.getRepository(GreEntrada).find).toHaveBeenCalledTimes(1);
    catalogo.documentoDeVersionValidada.mockRejectedValue(new Error('validación revocada'));
    await expect(service.leer(versionGreId)).rejects.toThrow('revocada');
  });
  it('rechaza filas de otra edición y material ajeno', async () => {
    ds.getRepository(GreVersion).findOneBy.mockResolvedValue({ estado: 'VALIDADA' });
    ds.getRepository(GreEntrada).find.mockResolvedValue([{ id: 'x', versionId: 'otra' }]);
    await expect(service.leer(versionGreId)).rejects.toThrow('mezcla versiones');
    ds.getRepository(GreEntrada).find.mockResolvedValue([]);
    await expect(service.material(versionGreId, 'ajena')).rejects.toThrow('no pertenece');
  });
  it('un error del servidor se conserva como error, sin convertirlo en0 resultados', async () => {
    qb.getMany.mockRejectedValue(new Error('base inaccesible'));
    await expect(service.buscar({ q: '1005', limite: 20, versionGreId })).rejects.toThrow('base inaccesible');
  });
  it('todas las rutas exigen matpel:consultar, sin inferirlo de administración', () => {
    const guard = new PermissionsGuard(new Reflector());
    const context = (permisos: string[]) => ({ getHandler: () => MatpelConsultaController.prototype.evaluar,
      getClass: () => MatpelConsultaController, switchToHttp: () => ({ getRequest: () => ({ user: { permisos } }) }) });
    for (const handler of [MatpelConsultaController.prototype.evaluar, MatpelConsultaController.prototype.evaluarV2,
      MatpelConsultaController.prototype.manifest, MatpelConsultaController.prototype.parte]) {
      const ctx = (p: string[]) => ({...context(p), getHandler: () => handler});
      expect(() => guard.canActivate(ctx(['matpel:administrar_gre']) as any)).toThrow('Permiso insuficiente');
      expect(guard.canActivate(ctx(['matpel:consultar']) as any)).toBe(true);
    }
  });
});
