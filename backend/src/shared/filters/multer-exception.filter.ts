import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { MulterError } from 'multer';

/** Sin esto, un archivo que supera `limits.fileSize` revienta como un
 * Error 500 generico ("Internal server error") en vez de un 400 claro:
 * Multer levanta un MulterError, que no es un HttpException, asi que el
 * manejador de excepciones por defecto de Nest no sabe traducirlo. Se
 * aplica con @UseFilters(MulterExceptionFilter) en cualquier endpoint con
 * FileInterceptor que declare un limite de tamano. */
@Catch(MulterError)
export class MulterExceptionFilter implements ExceptionFilter {
  catch(exception: MulterError, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<Response>();
    const mensaje = exception.code === 'LIMIT_FILE_SIZE' ? 'El archivo es demasiado pesado.' : 'No se pudo procesar el archivo subido.';
    response.status(400).json({ statusCode: 400, message: mensaje, error: 'Bad Request' });
  }
}
