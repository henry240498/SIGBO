import 'reflect-metadata';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Solo se confían cabeceras de proxy cuando la infraestructura lo declara.
  // En local, req.ip proviene directamente del socket y no de X-Forwarded-For.
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);

  // El croquis de una comunicación puede viajar como PNG codificado; el límite
  // predeterminado de Express (100 KB) no alcanza para una escena real.
  app.useBodyParser('json', { limit: '8mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '8mb' });

  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });
  // crossOriginResourcePolicy en 'cross-origin': el frontend (puerto 3000) necesita
  // poder cargar <img> servidas desde este backend (puerto 3001) en <img src>.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.enableCors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('SIGBO-CBVC API')
    .setDescription('Sistema Integral de Gestion para Bomberos Voluntarios')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`SIGBO-CBVC backend escuchando en http://localhost:${port}/api/v1`);
  console.log(`Documentacion Swagger en http://localhost:${port}/api/docs`);
}

bootstrap();
