import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  Bombero,
  Cargo,
  Designacion,
  Documento,
  DocumentoRelacion,
  Expediente,
  FirmaDocumento,
  IdentidadInstitucional,
  NumeracionDocumento,
  Parametro,
  PlantillaDocumento,
  Rango,
  VersionArchivoDocumento,
} from '../../shared/entities';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { ExpedientesService } from './expedientes.service';
import { ExpedientesController } from './expedientes.controller';
import { PlantillasService } from './plantillas.service';
import { PlantillasController } from './plantillas.controller';
import { FirmasDocumentoService } from './firmas-documento.service';
import { FirmasDocumentoController } from './firmas-documento.controller';
import { DashboardDocumentosService } from './dashboard-documentos.service';
import { DashboardDocumentosController } from './dashboard-documentos.controller';
import { ConsultasDocumentosService } from './consultas-documentos.service';
import { ConsultasDocumentosController } from './consultas-documentos.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Documento,
      DocumentoRelacion,
      VersionArchivoDocumento,
      Expediente,
      PlantillaDocumento,
      FirmaDocumento,
      NumeracionDocumento,
      // Entidades de otros modulos que Documentos consulta/referencia
      // directamente (mismo patron de bajo acoplamiento ya usado en
      // Deposito/Academia/Finanzas): nunca se duplican sus estructuras.
      Parametro,
      Bombero,
      Cargo,
      Designacion,
      Rango,
      IdentidadInstitucional,
    ]),
    SeguridadModule,
  ],
  controllers: [
    // Orden deliberado: los controllers con rutas literales de un solo
    // segmento bajo /documentos (dashboard, expedientes, plantillas) deben
    // registrarse ANTES que DocumentosController -- Express/Nest resuelve
    // rutas en orden de registro, no por especificidad, y GET /documentos/:id
    // (registrado en DocumentosController) capturaria esas rutas literales
    // si se registrara primero (bug real detectado en smoke test).
    DashboardDocumentosController,
    ExpedientesController,
    PlantillasController,
    ConsultasDocumentosController,
    FirmasDocumentoController,
    DocumentosController,
  ],
  providers: [
    DocumentosService,
    ExpedientesService,
    PlantillasService,
    FirmasDocumentoService,
    DashboardDocumentosService,
    ConsultasDocumentosService,
  ],
  exports: [DocumentosService],
})
export class DocumentosModule {}
