/* =============================================================
   SIGBO-CBVC | Migracion 082 - Control del personal
   =============================================================
   Fase 3 de la hoja de ruta:
   3.1 aptitudes con vencimiento (carnet de salud, vacunas, licencias...)
   3.3 limites de horas de servicio y descanso (los define el cuartel;
       sin una fila activa no se evalua ningun limite)
   3.5 fichaje por QR en la puerta del cuartel

   Ya existian y NO se duplican: requisitos por puesto
   (operaciones.requisitos_rol_guardia, modulo guardias), asignacion y
   devolucion de EPP (equipos.prestamos_equipos). El control de vencimientos
   las incluye en su consulta. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- 1) Aptitudes --- */
IF OBJECT_ID('personal.aptitudes', 'U') IS NULL
BEGIN
    CREATE TABLE personal.aptitudes (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_apt_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_aptitudes PRIMARY KEY,
        bombero_id UNIQUEIDENTIFIER NOT NULL,
        categoria NVARCHAR(10) NOT NULL CONSTRAINT DF_apt_categoria DEFAULT 'OTRA'
            CONSTRAINT CK_apt_categoria CHECK (categoria IN ('MEDICA', 'LICENCIA', 'OTRA')),
        tipo NVARCHAR(80) NOT NULL,
        emitido_en DATE NULL,
        vence_en DATE NOT NULL,
        observacion NVARCHAR(500) NULL,
        activo BIT NOT NULL CONSTRAINT DF_apt_activo DEFAULT 1,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_apt_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_apt_actualizado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_apt_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_apt_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_apt_vence' AND object_id = OBJECT_ID('personal.aptitudes'))
    CREATE INDEX IX_apt_vence ON personal.aptitudes (activo, vence_en);
GO

/* --- 2) Limites de horas de servicio (una fila activa a la vez) --- */
IF OBJECT_ID('operaciones.limites_horas_servicio', 'U') IS NULL
BEGIN
    CREATE TABLE operaciones.limites_horas_servicio (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_lhs_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_limites_horas PRIMARY KEY,
        horas_maximas_periodo INT NOT NULL CONSTRAINT CK_lhs_horas CHECK (horas_maximas_periodo BETWEEN 1 AND 744),
        periodo_dias INT NOT NULL CONSTRAINT CK_lhs_periodo CHECK (periodo_dias BETWEEN 1 AND 366),
        descanso_minimo_horas INT NOT NULL CONSTRAINT CK_lhs_descanso CHECK (descanso_minimo_horas BETWEEN 0 AND 168),
        activo BIT NOT NULL CONSTRAINT DF_lhs_activo DEFAULT 1,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_lhs_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_lhs_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_lhs_activo' AND object_id = OBJECT_ID('operaciones.limites_horas_servicio'))
    CREATE UNIQUE INDEX UX_lhs_activo ON operaciones.limites_horas_servicio (activo) WHERE activo = 1;
GO

/* --- 3) Puntos de fichaje (el QR contiene un token; aqui solo su hash) --- */
IF OBJECT_ID('operaciones.puntos_fichaje', 'U') IS NULL
BEGIN
    CREATE TABLE operaciones.puntos_fichaje (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_pfi_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_puntos_fichaje PRIMARY KEY,
        nombre NVARCHAR(100) NOT NULL,
        token_hash CHAR(64) NOT NULL,
        activo BIT NOT NULL CONSTRAINT DF_pfi_activo DEFAULT 1,
        creado_por UNIQUEIDENTIFIER NULL,
        creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_pfi_creado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT UQ_pfi_token UNIQUE (token_hash),
        CONSTRAINT FK_pfi_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF OBJECT_ID('operaciones.fichajes', 'U') IS NULL
BEGIN
    CREATE TABLE operaciones.fichajes (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_fich_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_fichajes PRIMARY KEY,
        punto_id UNIQUEIDENTIFIER NOT NULL,
        usuario_id UNIQUEIDENTIFIER NOT NULL,
        bombero_id UNIQUEIDENTIFIER NULL,
        tipo NVARCHAR(10) NOT NULL CONSTRAINT CK_fich_tipo CHECK (tipo IN ('ENTRADA', 'SALIDA')),
        registrado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_fich_registrado DEFAULT SYSDATETIMEOFFSET(),
        CONSTRAINT FK_fich_punto FOREIGN KEY (punto_id) REFERENCES operaciones.puntos_fichaje(id),
        CONSTRAINT FK_fich_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_fich_usuario_registrado' AND object_id = OBJECT_ID('operaciones.fichajes'))
    CREATE INDEX IX_fich_usuario_registrado ON operaciones.fichajes (usuario_id, registrado_en DESC);
GO

/* --- 4) Permisos nuevos ---
   Aptitudes medicas reutilizan personal:ver_medico / editar_medico; el resto
   personal:ver / editar. Horas de servicio: guardias:ver / editar.
   Fichaje: asistencia:marcar (escanear), asistencia:ver y asistencia:editar. */
GO
