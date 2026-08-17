/* =============================================================
   SIGBO-CBVC | Migracion 064 - Finanzas: Beneficios de Socios Protectores
   =============================================================
   Etapa 3. Catalogo parametrizable de beneficios (seccion 11 del
   pedido) mas su registro de aplicacion auditado (seccion 12-13).
   Un beneficio aplica a TODO socio con estado activo -- no hay
   asignacion 1 a 1 socio<->beneficio, el pedido no la exige y
   agregarla seria sobredesarrollo.

   Integracion con Academia (seccion 12): se agrega un costo nullable
   a la actividad academica (hoy no existe ningun campo de precio en
   el modulo) y columnas de calculo en la inscripcion -- el descuento
   se guarda ahi, el precio base de la actividad NUNCA se modifica.

   Integracion con Servicios (seccion 13): NO se toca
   servicios.servicios ni se le agrega costo -- ese modulo modela
   intervenciones/emergencias, no servicios facturables; no existe
   hoy un precio que descontar. La logica de calculo queda generica
   y reutilizable (BeneficiosSociosService.calcularDescuento) para
   cuando corresponda, sin asumir un precio que no existe.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- finanzas.beneficios_socios --- */

IF OBJECT_ID(N'finanzas.beneficios_socios', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.beneficios_socios (
        id                      UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_bensoc_id DEFAULT NEWSEQUENTIALID(),
        nombre                  NVARCHAR(150) NOT NULL,
        tipo_id                 UNIQUEIDENTIFIER NOT NULL,
        porcentaje_descuento    DECIMAL(5,2)  NULL,
        monto_fijo_descuento    DECIMAL(15,2) NULL,
        ambito                  NVARCHAR(20)  NOT NULL,
        actividad_academica_id  UNIQUEIDENTIFIER NULL,
        tipo_servicio_id        UNIQUEIDENTIFIER NULL,
        fecha_inicio            DATE          NOT NULL,
        fecha_fin               DATE          NULL,
        estado                  NVARCHAR(20)  NOT NULL CONSTRAINT DF_bensoc_estado DEFAULT N'ACTIVO',
        condiciones             NVARCHAR(MAX) NULL,
        observaciones           NVARCHAR(MAX) NULL,
        institucion_id          UNIQUEIDENTIFIER NULL,
        creado_en               DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bensoc_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_bensoc_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por              UNIQUEIDENTIFIER NULL,
        actualizado_por         UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_beneficios_socios PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_bensoc_ambito CHECK (ambito IN (N'ACADEMIA', N'SERVICIOS', N'GENERAL')),
        CONSTRAINT CK_bensoc_estado CHECK (estado IN (N'ACTIVO', N'INACTIVO')),
        CONSTRAINT CK_bensoc_porcentaje CHECK (porcentaje_descuento IS NULL OR (porcentaje_descuento > 0 AND porcentaje_descuento <= 100)),
        CONSTRAINT CK_bensoc_algundescuento CHECK (porcentaje_descuento IS NOT NULL OR monto_fijo_descuento IS NOT NULL),
        CONSTRAINT FK_bensoc_tipo FOREIGN KEY (tipo_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_bensoc_actividad FOREIGN KEY (actividad_academica_id) REFERENCES academia.actividades(id),
        CONSTRAINT FK_bensoc_tiposervicio FOREIGN KEY (tipo_servicio_id) REFERENCES servicios.tipos_servicio(id),
        CONSTRAINT FK_bensoc_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_bensoc_estado' AND object_id = OBJECT_ID('finanzas.beneficios_socios'))
    CREATE INDEX IX_bensoc_estado ON finanzas.beneficios_socios(estado);
GO

/* --- finanzas.aplicaciones_beneficio (auditoria de cada aplicacion) --- */

IF OBJECT_ID(N'finanzas.aplicaciones_beneficio', N'U') IS NULL
BEGIN
    CREATE TABLE finanzas.aplicaciones_beneficio (
        id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_apben_id DEFAULT NEWSEQUENTIALID(),
        beneficio_id         UNIQUEIDENTIFIER NOT NULL,
        socio_protector_id   UNIQUEIDENTIFIER NOT NULL,
        ambito               NVARCHAR(20)  NOT NULL,
        referencia_id        UNIQUEIDENTIFIER NULL, -- ej. inscripciones.id
        monto_base           DECIMAL(15,2) NOT NULL,
        descuento_aplicado   DECIMAL(15,2) NOT NULL,
        monto_final          DECIMAL(15,2) NOT NULL,
        aplicado_en          DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_apben_fecha DEFAULT SYSDATETIMEOFFSET(),
        aplicado_por         UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_aplicaciones_beneficio PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_apben_beneficio FOREIGN KEY (beneficio_id) REFERENCES finanzas.beneficios_socios(id),
        CONSTRAINT FK_apben_socio FOREIGN KEY (socio_protector_id) REFERENCES finanzas.socios_protectores(id),
        CONSTRAINT FK_apben_aplicadopor FOREIGN KEY (aplicado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_apben_socio' AND object_id = OBJECT_ID('finanzas.aplicaciones_beneficio'))
    CREATE INDEX IX_apben_socio ON finanzas.aplicaciones_beneficio(socio_protector_id);
GO

/* --- academia.actividades: costo opcional (no todas las actividades
   cobran -- por eso nullable, sin default 0 que implique gratuidad). --- */

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('academia.actividades') AND name = 'costo')
    ALTER TABLE academia.actividades ADD costo DECIMAL(15,2) NULL;
GO

/* --- academia.inscripciones: snapshot del calculo de beneficio aplicado
   al momento de inscribirse -- el costo base de la actividad nunca se
   modifica (seccion 12: "No modificar el precio base del curso"). --- */

IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('academia.inscripciones') AND name = 'costo_base')
    ALTER TABLE academia.inscripciones ADD costo_base DECIMAL(15,2) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('academia.inscripciones') AND name = 'beneficio_aplicado_id')
    ALTER TABLE academia.inscripciones ADD beneficio_aplicado_id UNIQUEIDENTIFIER NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('academia.inscripciones') AND name = 'descuento_importe')
    ALTER TABLE academia.inscripciones ADD descuento_importe DECIMAL(15,2) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('academia.inscripciones') AND name = 'costo_final')
    ALTER TABLE academia.inscripciones ADD costo_final DECIMAL(15,2) NULL;
GO

IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_insc_beneficio')
    ALTER TABLE academia.inscripciones
        ADD CONSTRAINT FK_insc_beneficio FOREIGN KEY (beneficio_aplicado_id) REFERENCES finanzas.beneficios_socios(id);
GO
