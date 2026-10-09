/** Procesa una vez la cola de importaciones GRE y termina: `npm run gre:procesar`.
 * Comando de administración local; no recibe argumentos de rutas ni de archivos. */
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { GreImportacionService } from './gre-importacion.service';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['log', 'warn', 'error'] });
  try {
    const procesados = await app.get(GreImportacionService).procesarPendientes(10);
    console.log(JSON.stringify({ procesados }));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
