import 'dotenv/config';
import 'reflect-metadata';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { obtenerOrigenesCors, validarConfiguracionCookies } from './modules/auth/auth-cookies';
import { validarConfiguracionAuth } from './modules/auth/auth.service';
import { esRutaUploadRestringida } from './shared/utils/almacenamiento';

async function bootstrap() {
  validarConfiguracionCookies();
  validarConfiguracionAuth();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // Solo se confían cabeceras de proxy cuando la infraestructura lo declara.
  // En local, req.ip proviene directamente del socket y no de X-Forwarded-For.
  app.set('trust proxy', process.env.TRUST_PROXY === 'true' ? 1 : false);
  // Express 5 usa un parser simple por defecto. Conservamos la semántica que
  // tenía SIGBO en Express 4 para filtros y colecciones serializados en query.
  app.set('query parser', 'extended');

  // El croquis de una comunicación puede viajar como PNG codificado; el límite
  // predeterminado de Express (100 KB) no alcanza para una escena real.
  app.useBodyParser('json', { limit: '8mb' });
  app.useBodyParser('urlencoded', { extended: true, limit: '8mb' });

  // Los documentos operativos y personales se descargan exclusivamente por
  // controladores autenticados; solo imágenes públicas siguen bajo /uploads.
  app.use('/uploads', (req, res, next) => {
    if (esRutaUploadRestringida(req.path)) return res.status(404).end();
    next();
  });
  // Los nombres de archivos públicos son aleatorios y cambian al reemplazar
  // una imagen; por ello se pueden cachear sin servir una versión anterior.
  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
    maxAge: 31_536_000_000,
    immutable: true,
    setHeaders: (res) => {
      // Static sale antes de Helmet; conserva la política necesaria para que
      // el frontend institucional pueda cargar logos desde otro origen.
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });
  // crossOriginResourcePolicy en 'cross-origin': el frontend (puerto 3000) necesita
  // poder cargar <img> servidas desde este backend (puerto 3001) en <img src>.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  const origenesCors = obtenerOrigenesCors();
  app.enableCors({
    origin: origenesCors.length === 1 ? origenesCors[0] : origenesCors,
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

  // La documentación describe contratos y superficies internas: se expone
  // únicamente tras una habilitación explícita del entorno.
  const swaggerHabilitado = process.env.SWAGGER_ENABLED === 'true';
  if (swaggerHabilitado) {
    const config = new DocumentBuilder()
      .setTitle('SIGBO-CBVC API')
      .setDescription('Sistema Integral de Gestion para Bomberos Voluntarios')
      .setVersion('0.1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`SIGBO-CBVC backend escuchando en http://localhost:${port}/api/v1`);
  if (swaggerHabilitado) console.log(`Documentacion Swagger en http://localhost:${port}/api/docs`);
}

bootstrap();
