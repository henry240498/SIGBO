/* =============================================================
   SIGBO-CBVC | Migracion 071 - Servicios: seguimiento geografico
   =============================================================
   Extension "Seguimiento Geografico y Operativo del Servicio":
   ruta planificada (dibujada por el RO desde la WEB), eventos
   geograficos del recorrido y pruebas de comunicacion/radio, con la
   base de datos preparada para que una futura APP alimente GPS en
   tiempo real sin rediseno.

   No se toca servicios.servicios, servicios.comunicaciones_servicio ni
   servicios.tipos_servicio -- el modulo existente sigue igual. Se
   reutiliza y se AMPLIA servicios.historial_servicios (existia desde
   007_servicios.sql, sin entidad TypeORM y sin ninguna fila real, asi
   que ampliar su CHECK no rompe nada).
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- organizacion.cuarteles: coordenadas (para el marcador "Cuartel" y
   el calculo de distancia de las pruebas de comunicacion) --- */
IF COL_LENGTH('organizacion.cuarteles', 'latitud') IS NULL
    ALTER TABLE organizacion.cuarteles ADD latitud DECIMAL(10,8) NULL;
GO
IF COL_LENGTH('organizacion.cuarteles', 'longitud') IS NULL
    ALTER TABLE organizacion.cuarteles ADD longitud DECIMAL(11,8) NULL;
GO

/* --- servicios.historial_servicios: se amplia, no se duplica ---
   Nueva columna movil_id: los eventos del recorrido (salida, llegada,
   punto de control, GPS...) ocurren siempre en relacion a un movil
   despachado, dato que la tabla original (pensada en 007) no preveia.
   Nueva columna observacion: texto libre corto por evento -- separado
   de `datos` (JSON) porque es el caso comun y no necesita esquema
   variable. */
IF COL_LENGTH('servicios.historial_servicios', 'movil_id') IS NULL
    ALTER TABLE servicios.historial_servicios ADD movil_id UNIQUEIDENTIFIER NULL;
GO
IF COL_LENGTH('servicios.historial_servicios', 'observacion') IS NULL
    ALTER TABLE servicios.historial_servicios ADD observacion NVARCHAR(MAX) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_hser_servicio')
    ALTER TABLE servicios.historial_servicios ADD CONSTRAINT FK_hser_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE CASCADE;
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_hser_movil')
    ALTER TABLE servicios.historial_servicios ADD CONSTRAINT FK_hser_movil FOREIGN KEY (movil_id) REFERENCES vehiculos.vehiculos(id) ON DELETE SET NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_hser_creadopor')
    ALTER TABLE servicios.historial_servicios ADD CONSTRAINT FK_hser_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id);
GO

/* Vocabulario de eventos del pedido (seccion 13), en reemplazo del
   original (SALIDA/LLEGADA/GPS/COMBUSTIBLE/INCIDENTE/FIN): la tabla
   nunca tuvo filas reales, asi que no hay datos que migrar. GPS se
   mantiene -- es el tipo que compone la "ruta realizada" (cada fila
   GPS ordenada por fecha/hora, sin necesidad de una tabla aparte). */
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_hser_tipo')
    ALTER TABLE servicios.historial_servicios DROP CONSTRAINT CK_hser_tipo;
GO
ALTER TABLE servicios.historial_servicios ADD CONSTRAINT CK_hser_tipo CHECK (tipo_evento IN (
    N'SALIDA_CUARTEL', N'LLEGADA_SERVICIO', N'SALIDA_SERVICIO',
    N'LLEGADA_CENTRO_SALUD', N'SALIDA_CENTRO_SALUD', N'REGRESO_CUARTEL', N'FIN_SERVICIO',
    N'PUNTO_CONTROL', N'GPS', N'INCIDENTE', N'OBSERVACION', N'OTRO'
));
GO

/* --- servicios.rutas_planificadas ---
   La ruta que el RO dibuja sobre el mapa antes o durante el servicio:
   una sola por servicio (se reemplaza al redefinirla, con auditoria
   de antes/despues -- no un historial de versiones). Los puntos van
   como JSON (mismo criterio que comunicaciones_servicio.datos,
   decision--comunicacion-como-json): es una lista ordenada que se lee
   siempre completa, nunca se consulta punto por punto con SQL. */
IF OBJECT_ID(N'servicios.rutas_planificadas', N'U') IS NULL
BEGIN
    CREATE TABLE servicios.rutas_planificadas (
        id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_rutapl_id DEFAULT NEWSEQUENTIALID(),
        servicio_id     UNIQUEIDENTIFIER NOT NULL,
        puntos          NVARCHAR(MAX)    NOT NULL,
        creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_rutapl_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por      UNIQUEIDENTIFIER NULL,
        actualizado_en  DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_rutapl_act DEFAULT SYSDATETIMEOFFSET(),
        actualizado_por UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_rutas_planificadas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT UQ_rutapl_servicio UNIQUE (servicio_id),
        CONSTRAINT CK_rutapl_puntos CHECK (ISJSON(puntos) = 1),
        CONSTRAINT FK_rutapl_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE CASCADE,
        CONSTRAINT FK_rutapl_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_rutapl_actualizadopor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

/* --- servicios.pruebas_comunicacion ---
   Tabla dedicada (no un evento mas de historial_servicios) porque el
   pedido pide estadisticas futuras por nivel y distancia (seccion 25:
   promedio, maximo con 5/5, punto de degradacion) -- eso exige
   columnas propias y consultables, no un dato mas adentro de un JSON. */
IF OBJECT_ID(N'servicios.pruebas_comunicacion', N'U') IS NULL
BEGIN
    CREATE TABLE servicios.pruebas_comunicacion (
        id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_prueba_id DEFAULT NEWSEQUENTIALID(),
        servicio_id      UNIQUEIDENTIFIER NOT NULL,
        movil_id         UNIQUEIDENTIFIER NULL,
        latitud          DECIMAL(10,8) NOT NULL,
        longitud         DECIMAL(11,8) NOT NULL,
        distancia_metros DECIMAL(10,2) NULL,
        nivel            TINYINT       NOT NULL,
        observacion      NVARCHAR(MAX) NULL,
        creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_prueba_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por       UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_pruebas_comunicacion PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_prueba_nivel CHECK (nivel BETWEEN 1 AND 5),
        CONSTRAINT FK_prueba_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id) ON DELETE CASCADE,
        CONSTRAINT FK_prueba_movil FOREIGN KEY (movil_id) REFERENCES vehiculos.vehiculos(id) ON DELETE SET NULL,
        CONSTRAINT FK_prueba_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_prueba_servicio' AND object_id = OBJECT_ID('servicios.pruebas_comunicacion'))
    CREATE INDEX IX_prueba_servicio ON servicios.pruebas_comunicacion(servicio_id);
GO

/* No se agregan permisos nuevos: servicios:ver_gps (ver la seccion
   completa) y servicios:despachar (definir/editar/eliminar ruta,
   eventos y pruebas) ya existian sembrados y asignados a roles desde
   antes -- estaban huerfanos, sin ningun @RequirePermission que los
   usara. Esta migracion no toca seguridad.permisos. */
