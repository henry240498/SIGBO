import { BadRequestException } from '@nestjs/common';
import { detectarImagen, esRutaUploadRestringida, guardarBuffer, guardarBufferRestringido, guardarImagen, leerBufferPrivado, leerBufferPublicadoRestringido, mimeImagenPorReferencia, rutaAbsolutaAlmacenamiento } from './almacenamiento';

describe('detectarImagen', () => {
  it.each([
    ['PNG', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), '.png'],
    ['JPEG', Buffer.from([0xff, 0xd8, 0xff, 0xe0]), '.jpg'],
    ['GIF87a', Buffer.from('GIF87a\u0001\u0000'), '.gif'],
    ['GIF89a', Buffer.from('GIF89a\u0001\u0000'), '.gif'],
    ['WEBP', Buffer.from([0x52, 0x49, 0x46, 0x46, 0x24, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]), '.webp'],
  ])('reconoce %s por su cabecera y normaliza la extensión', (_nombre, contenido, extension) => {
    expect(detectarImagen(contenido)).toEqual({ extension });
  });

  it('rechaza contenido que solo simula ser una imagen', () => {
    expect(detectarImagen(Buffer.from('<script>alert(1)</script>'))).toBeNull();
  });

  it('no utiliza ni la extensión ni el MIME declarados por el cliente', async () => {
    const archivo = { buffer: Buffer.from('<script>alert(1)</script>'), mimetype: 'image/png', originalname: 'foto.png' } as Express.Multer.File;
    await expect(guardarImagen(archivo)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('no permite segmentos de carpeta ni extensiones que salgan del almacenamiento', async () => {
    await expect(guardarBuffer(Buffer.from('x'), '.pdf', '../fuera')).rejects.toThrow('Carpeta de almacenamiento inválida');
    await expect(guardarBuffer(Buffer.from('x'), '../fuera', 'documentos')).rejects.toThrow('Extensión de almacenamiento inválida');
    await expect(leerBufferPrivado('0123456789abcdef0123456789abcdef.pdf', '../fuera')).rejects.toThrow('Carpeta de almacenamiento inválida');
  });

  it('identifica las carpetas de documentos que no pueden servirse estáticamente', () => {
    expect(esRutaUploadRestringida('/fojas-servicio/0123456789abcdef.pdf')).toBe(true);
    expect(esRutaUploadRestringida('/ordenes-guardia/0123456789abcdef.docx')).toBe(true);
    expect(esRutaUploadRestringida('/firmas-bomberos/0123456789abcdef.png')).toBe(true);
    expect(esRutaUploadRestringida('/perfiles/0123456789abcdef.png')).toBe(true);
    expect(esRutaUploadRestringida('/Perfiles/0123456789abcdef.png')).toBe(true);
    expect(esRutaUploadRestringida('/apariencia/0123456789abcdef.png')).toBe(false);
  });

  it('rechaza rutas publicadas que no pertenecen a la carpeta autorizada', async () => {
    await expect(leerBufferPublicadoRestringido('/uploads/apariencia/0123456789abcdef.pdf', 'fojas-servicio'))
      .rejects.toThrow('Ruta de documento inválida');
  });

  it('no permite usar el almacenamiento privado de documentos para una carpeta pública', async () => {
    await expect(guardarBufferRestringido(Buffer.from('x'), '.pdf', 'apariencia'))
      .rejects.toThrow('La carpeta no está configurada como restringida');
  });

  it('resuelve referencias privadas de firma sin permitir traversal', () => {
    expect(rutaAbsolutaAlmacenamiento('privado:firmas-bomberos:0123456789abcdef0123456789abcdef.png')).toContain('private_uploads');
    expect(rutaAbsolutaAlmacenamiento('privado:firmas-bomberos:../secreto.png')).toBeNull();
    expect(mimeImagenPorReferencia('privado:firmas-bomberos:0123456789abcdef0123456789abcdef.webp')).toBe('image/webp');
  });
});
