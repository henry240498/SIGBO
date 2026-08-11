import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './core/database/data-source-options';
import { AuthModule } from './modules/auth/auth.module';
import { SeguridadModule } from './modules/seguridad/seguridad.module';
import { PersonalModule } from './modules/personal/personal.module';
import { OrganizacionModule } from './modules/organizacion/organizacion.module';
import { VehiculosModule } from './modules/vehiculos/vehiculos.module';
import { EquiposModule } from './modules/equipos/equipos.module';
import { ServiciosModule } from './modules/servicios/servicios.module';
import { PublicacionesModule } from './modules/publicaciones/publicaciones.module';
import { OperacionesModule } from './modules/operaciones/operaciones.module';
import { GuardiasModule } from './modules/guardias/guardias.module';
import { ConfiguracionModule } from './modules/configuracion/configuracion.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    SeguridadModule,
    PersonalModule,
    OrganizacionModule,
    VehiculosModule,
    EquiposModule,
    ServiciosModule,
    PublicacionesModule,
    OperacionesModule,
    GuardiasModule,
    ConfiguracionModule,
  ],
})
export class AppModule {}
