import { BadRequestException } from '@nestjs/common';
import { DenunciasService } from './denuncias.service';

const repo = () => ({ findOne: jest.fn(), find: jest.fn(), exist: jest.fn(), create: jest.fn((x) => x), save: jest.fn(), createQueryBuilder: jest.fn() });
function servicio() {
  const repos = Array.from({ length: 9 }, repo);
  return new DenunciasService({ transaction: jest.fn() } as any, repos[0] as any, repos[1] as any, repos[2] as any, repos[3] as any, repos[4] as any, repos[5] as any, repos[6] as any, repos[7] as any, repos[8] as any, { registrar: jest.fn() } as any);
}

describe('Denuncias rápidas', () => {
  const validar = (dto: any, audio?: any) => (servicio() as any).validarSolicitud(dto, audio);

  it('normaliza teléfonos paraguayos nacionales e internacionales', () => {
    const s = servicio() as any;
    expect(s.normalizarTelefono('0981123456')).toBe('+595981123456');
    expect(s.normalizarTelefono('+595981123456')).toBe('+595981123456');
    expect(s.normalizarTelefono('595981123456')).toBe('+595981123456');
  });

  it('exige explicación escrita o audio, sin exigir ambas', () => {
    expect(() => validar({ telefono: '0981123456' })).toThrow(BadRequestException);
    expect(() => validar({ telefono: '0981123456', descripcion: 'Descripción breve' })).not.toThrow();
    expect(() => validar({ telefono: '0981123456', duracionAudioSegundos: 12 }, { buffer: Buffer.from('x') })).not.toThrow();
  });

  it('rechaza un audio cuya duración no fue validada', () => {
    expect(() => validar({ telefono: '0981123456' }, { buffer: Buffer.from('x') })).toThrow('duración');
  });

  it('permite continuar sin GPS y exige el par completo cuando se comparte', () => {
    expect(() => validar({ telefono: '0981123456', descripcion: 'Mensaje' })).not.toThrow();
    expect(() => validar({ telefono: '0981123456', descripcion: 'Mensaje', latitud: -25.3 })).toThrow('ubicación');
    expect(() => validar({ telefono: '0981123456', descripcion: 'Mensaje', latitud: -25.3, longitud: -57.5, precisionUbicacion: 12 })).not.toThrow();
  });

  it('detecta archivos por su contenido y no solamente por extensión', () => {
    const s = servicio() as any;
    expect(s.detectarMime(Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x00]))).toBe('audio/webm');
    expect(s.detectarMime(Buffer.from('%PDF-1.7'))).toBe('application/pdf');
    expect(s.detectarMime(Buffer.from('archivo inseguro'))).toBeNull();
  });

  it('reutiliza una denuncia ya creada al recibir la misma clave de idempotencia', async () => {
    const s = servicio() as any;
    s.denunciaRepo.findOne.mockResolvedValue({ id: 'id', codigo: 'DEN-2026-000001', estado: 'NUEVA', creadoEn: new Date() });
    const resultado = await s.crearPublica({ claveIdempotencia: '11111111-1111-4111-8111-111111111111' }, {}, { usuarioId: null, ip: null, userAgent: null });
    expect(resultado.codigo).toBe('DEN-2026-000001');
  });
});
