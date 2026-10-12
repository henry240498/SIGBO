import { readFileSync } from 'fs';
import { resolve } from 'path';
import { randomUUID } from 'crypto';
import { GreDocumento, GreImportacion, GreVersion } from '../../shared/entities';
import { GreImportacionService, identidadParser } from './gre-importacion.service';

const a = JSON.parse(readFileSync(resolve(__dirname, '../../../../.context/gre2024/test-cases/motor-fuente.json'), 'utf8')).artefactoRecortado;

describe('Progreso de importación durante la transacción de carga; regresión de timeout observado', () => {
  it.each(['commit', 'rollback'])('consulta inmediata conserva estado confirmado y libera snapshot tras %s', async (final) => {
    const t = { id: randomUUID(), versionId: randomUUID(), token: randomUUID(), intento: 1 };
    const version = { id: t.versionId, documentoId: randomUUID(), estado: 'IMPORTANDO', reporteJson: null,
      versionParser: identidadParser(a.versionParser, a.herramienta.version), versionNormalizador: a.versionNormalizador };
    let estado = 'EN_PROCESO';
    const leer = jest.fn(({ id }) => id === t.id ? Promise.resolve({ id: t.id, versionId: t.versionId,
      estado, etapa: estado === 'EN_PROCESO' ? 'CARGANDO' : estado, paginasProcesadas: 0, intento: 1 }) : Promise.resolve(null));
    let iniciar!: () => void, terminar!: (v: any) => void, fallar!: (e: Error) => void;
    const iniciada = new Promise<void>(r => { iniciar = r; });
    const carga = new Promise<any>((r, e) => { terminar = r; fallar = e; });
    const ds = {
      query: jest.fn().mockResolvedValue([{ id: t.id }]),
      transaction: jest.fn(() => { iniciar(); return carga; }),
      getRepository: (entidad: unknown) => entidad === GreImportacion ? { findOneBy: leer } : entidad === GreVersion
        ? { findOneByOrFail: jest.fn().mockResolvedValue(version) }
        : entidad === GreDocumento ? { findOneByOrFail: jest.fn().mockResolvedValue({ ...a.documento, tamanoBytes: a.documento.bytes }) } : {},
    };
    const servicio = new GreImportacionService(ds as any, { catalogo: async () => ({ documentoSha256: a.documento.sha256 }) } as any, {} as any, '.');
    jest.spyOn(servicio as any, 'candidato').mockResolvedValue({ archivo: 'GRE2024-Spa-Web-a.pdf' });
    jest.spyOn(servicio, 'leerArtefacto').mockResolvedValue(a);
    const registrarFallo = jest.spyOn(servicio as any, 'fallar').mockImplementation(async () => { estado = 'ERROR'; });
    const procesamiento = servicio.procesar(t);
    await iniciada;
    const lecturasAntes = leer.mock.calls.length;
    const respuesta = await servicio.estado(t.id.toUpperCase());
    expect(respuesta.estado).toBe('EN_PROCESO');
    expect(respuesta.etapa).toBe('CARGANDO');
    expect(respuesta.paginasProcesadas).toBe(0);
    expect(respuesta.version.estado).toBe('IMPORTANDO');
    expect(respuesta).toMatchObject({ consultaDuranteCarga: true });
    expect(respuesta).not.toHaveProperty('leaseToken');
    expect(leer.mock.calls.length).toBe(lecturasAntes); // No espera el lock de la transacción abierta.
    await expect(servicio.estado(randomUUID())).rejects.toMatchObject({ status: 404 });
    if (final === 'commit') { estado = 'COMPLETADA'; terminar({ paginas: a.paginas.length }); }
    else fallar(new Error('Carga revertida'));
    await procesamiento;
    const posterior = await servicio.estado(t.id);
    expect(posterior.estado).toBe(final === 'commit' ? 'COMPLETADA' : 'ERROR');
    expect(posterior).not.toHaveProperty('consultaDuranteCarga');
    expect(registrarFallo).toHaveBeenCalledTimes(final === 'commit' ? 0 : 1);
  });
  it('timeout de otro proceso se comunica como indisponibilidad temporal, sin inventar progreso o vacío', async () => {
    const ds = { getRepository: () => ({ findOneBy: jest.fn().mockRejectedValue({ driverError: { code: 'ETIMEOUT' } }) }) };
    const servicio = new GreImportacionService(ds as any, {} as any, {} as any, '.');
    await expect(servicio.estado(randomUUID())).rejects.toMatchObject({ status: 503, response: { codigo: 'GRE_CONSULTA_OCUPADA' } });
  });
});
