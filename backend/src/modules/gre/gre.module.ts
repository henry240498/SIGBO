import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import {
  GreDocumento, GreVersion, GrePagina, GreSeccion, GreReferencia, GreGuia,
  GreEntrada, GreAlias, GreBloque, GreTabla, GreFila, GreCelda, GreRegla,
  GreCampoFuente, GreRevision, GreImportacion, GreActivacion, GreActivacionHistorial,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { GreActivacionService } from './gre-activacion.service';
import { GreAdminController } from './gre-admin.controller';
import { GreCatalogoService } from './gre-catalogo.service';
import { GreComparacionService } from './gre-comparacion.service';
import { GRE_RAIZ_PRIVADA, GreFuentesService } from './gre-fuentes.service';
import { GreImportacionService } from './gre-importacion.service';
import { GreProcesoService } from './gre-proceso.service';
import { GreRevisionService } from './gre-revision.service';
import { GreTrabajadorService } from './gre-trabajador.service';
import { MatpelConsultaController } from './matpel-consulta.controller';
import { MatpelConsultaService } from './matpel-consulta.service';
import { MotorMatpelService } from './motor-matpel.service';

/** Catálogo GRE: fuente privada, importación controlada, revisión, validación y
 * activación (fases 3A–3D). El trabajador de importación arranca solo con
 * GRE_TRABAJADOR=activo; levantar la API no extrae ni carga documentos. */
@Module({
  imports: [
    SeguridadModule,
    TypeOrmModule.forFeature([
      GreDocumento, GreVersion, GrePagina, GreSeccion, GreReferencia, GreGuia,
      GreEntrada, GreAlias, GreBloque, GreTabla, GreFila, GreCelda, GreRegla,
      GreCampoFuente, GreRevision, GreImportacion, GreActivacion, GreActivacionHistorial,
    ]),
  ],
  controllers: [GreAdminController, MatpelConsultaController],
  providers: [GreCatalogoService, GreFuentesService, GreProcesoService, GreImportacionService, GreRevisionService,
    GreComparacionService, GreActivacionService, GreTrabajadorService, MatpelConsultaService, MotorMatpelService,
    { provide: GRE_RAIZ_PRIVADA, useFactory: () => join(process.cwd(), 'private_uploads', 'gre') },
  ],
  exports: [GreCatalogoService, GreFuentesService, GreTrabajadorService, MatpelConsultaService, MotorMatpelService],
})
export class GreModule {}
