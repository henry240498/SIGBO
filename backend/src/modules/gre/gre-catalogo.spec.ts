import { randomUUID } from 'crypto';
import { GreCatalogoService } from './gre-catalogo.service';

describe('Catálogo GRE: lectura versionada sin efectos de escritura', () => {
  const versionId = randomUUID();
  const documentoId = randomUUID();
  const referenciaId = randomUUID();
  const versiones = { findOneBy: jest.fn() };
  const documentos = { findOneBy: jest.fn() };
  const referencias = { findOneBy: jest.fn() };
  const paginas = { findOneBy: jest.fn() };
  const fuentes = { validarReferencia: jest.fn() };
  const servicio = new GreCatalogoService(versiones as any, documentos as any,
    referencias as any, paginas as any, fuentes as any);
  beforeEach(() => {
    jest.resetAllMocks();
    versiones.findOneBy.mockResolvedValue({ id: versionId, documentoId, estado: 'VALIDADA' });
    documentos.findOneBy.mockResolvedValue({ id: documentoId, paginas: 392 });
    referencias.findOneBy.mockResolvedValue({ id: referenciaId, versionId, paginaPdf: 154 });
    paginas.findOneBy.mockResolvedValue({ versionId, paginaPdf: 154 });
  });
  it('restringe lectura a la versión explícita validada', async () => {
    await servicio.documentoDeVersionValidada(versionId);
    expect(versiones.findOneBy).toHaveBeenCalledWith({ id: versionId, estado: 'VALIDADA' });
    versiones.findOneBy.mockResolvedValue(null);
    await expect(servicio.documentoDeVersionValidada(versionId)).rejects.toThrow('no está validada');
  });
  it('rechaza identificadores inválidos antes de consultar', async () => {
    await expect(servicio.documentoDeVersionValidada('../archivo')).rejects.toThrow();
    expect(versiones.findOneBy).not.toHaveBeenCalled();
  });
  it('no resuelve una referencia de otra versión', async () => {
    referencias.findOneBy.mockResolvedValue(null);
    await expect(servicio.fuenteDeVersionValidada(versionId, referenciaId)).rejects.toThrow('no pertenece');
    expect(referencias.findOneBy).toHaveBeenCalledWith({ id: referenciaId, versionId });
    expect(fuentes.validarReferencia).not.toHaveBeenCalled();
  });
  it('verifica procedencia y rango de página antes de devolverla', async () => {
    await servicio.fuenteDeVersionValidada(versionId, referenciaId);
    expect(fuentes.validarReferencia).toHaveBeenCalled();
    paginas.findOneBy.mockResolvedValue({ versionId, paginaPdf: 393 });
    await expect(servicio.fuenteDeVersionValidada(versionId, referenciaId)).rejects.toThrow('página');
  });
  it('no oculta una versión sin documento conservado', async () => {
    documentos.findOneBy.mockResolvedValue(null);
    await expect(servicio.documentoDeVersionValidada(versionId)).rejects.toThrow('perdió su fuente');
  });
});
