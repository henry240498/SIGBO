SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* SIGBO-CBVC | Migración 031 - Denuncias rápidas, evidencias e historial */
IF SCHEMA_ID(N'denuncias') IS NULL EXEC(N'CREATE SCHEMA denuncias');
GO
IF OBJECT_ID(N'denuncias.secuencia_codigo', N'SO') IS NULL
    EXEC(N'CREATE SEQUENCE denuncias.secuencia_codigo AS BIGINT START WITH 1 INCREMENT BY 1');
GO

CREATE TABLE denuncias.categorias_denuncia (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_den_cat_id DEFAULT NEWSEQUENTIALID(),
    nombre NVARCHAR(120) NOT NULL,
    nombre_normalizado NVARCHAR(120) NOT NULL,
    orden INT NOT NULL CONSTRAINT DF_den_cat_orden DEFAULT 0,
    activo BIT NOT NULL CONSTRAINT DF_den_cat_activo DEFAULT 1,
    creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_den_cat_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_den_cat_actualizado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_denuncias_categorias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_denuncias_categorias_nombre UNIQUE (nombre_normalizado)
);
GO

CREATE TABLE denuncias.denuncias (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_den_id DEFAULT NEWSEQUENTIALID(),
    codigo NVARCHAR(30) NOT NULL,
    clave_idempotencia UNIQUEIDENTIFIER NULL,
    usuario_id UNIQUEIDENTIFIER NULL,
    nombre_denunciante NVARCHAR(160) NOT NULL,
    telefono NVARCHAR(20) NOT NULL,
    categoria_id UNIQUEIDENTIFIER NOT NULL,
    asunto_otro NVARCHAR(180) NULL,
    descripcion NVARCHAR(MAX) NULL,
    servicio_id UNIQUEIDENTIFIER NULL,
    vehiculo_id UNIQUEIDENTIFIER NULL,
    latitud DECIMAL(10,8) NULL,
    longitud DECIMAL(11,8) NULL,
    precision_ubicacion DECIMAL(10,2) NULL,
    ubicacion_capturada_en DATETIMEOFFSET(3) NULL,
    ip VARCHAR(45) NULL,
    user_agent NVARCHAR(500) NULL,
    tipo_dispositivo NVARCHAR(20) NULL,
    estado NVARCHAR(25) NOT NULL CONSTRAINT DF_den_estado DEFAULT N'NUEVA',
    asignado_a UNIQUEIDENTIFIER NULL,
    creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_den_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_den_actualizado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_denuncias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_denuncias_codigo UNIQUE (codigo),
    CONSTRAINT CK_denuncias_estado CHECK (estado IN (N'NUEVA',N'EN_REVISION',N'ASIGNADA',N'EN_INVESTIGACION',N'RESUELTA',N'CERRADA',N'DESCARTADA',N'DUPLICADA')),
    CONSTRAINT CK_denuncias_coordenadas CHECK ((latitud IS NULL AND longitud IS NULL) OR (latitud BETWEEN -90 AND 90 AND longitud BETWEEN -180 AND 180)),
    CONSTRAINT FK_denuncias_categoria FOREIGN KEY (categoria_id) REFERENCES denuncias.categorias_denuncia(id),
    CONSTRAINT FK_denuncias_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id),
    CONSTRAINT FK_denuncias_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
    CONSTRAINT FK_denuncias_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
    CONSTRAINT FK_denuncias_asignado FOREIGN KEY (asignado_a) REFERENCES seguridad.usuarios(id)
);
GO

CREATE UNIQUE INDEX UX_denuncias_idempotencia ON denuncias.denuncias(clave_idempotencia) WHERE clave_idempotencia IS NOT NULL;
CREATE INDEX IX_denuncias_listado ON denuncias.denuncias(estado, creado_en DESC);
CREATE INDEX IX_denuncias_servicio ON denuncias.denuncias(servicio_id) WHERE servicio_id IS NOT NULL;
GO

CREATE TABLE denuncias.historial_estados_denuncia (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_den_hist_id DEFAULT NEWSEQUENTIALID(),
    denuncia_id UNIQUEIDENTIFIER NOT NULL,
    estado_anterior NVARCHAR(25) NULL,
    estado_nuevo NVARCHAR(25) NOT NULL,
    usuario_id UNIQUEIDENTIFIER NULL,
    comentario NVARCHAR(MAX) NULL,
    fecha DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_den_hist_fecha DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_denuncias_historial PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_den_hist_denuncia FOREIGN KEY (denuncia_id) REFERENCES denuncias.denuncias(id) ON DELETE CASCADE,
    CONSTRAINT FK_den_hist_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
);
CREATE INDEX IX_denuncias_historial ON denuncias.historial_estados_denuncia(denuncia_id, fecha ASC);
GO

CREATE TABLE denuncias.evidencias_denuncia (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_den_evid_id DEFAULT NEWSEQUENTIALID(),
    denuncia_id UNIQUEIDENTIFIER NOT NULL,
    tipo NVARCHAR(15) NOT NULL,
    nombre_original NVARCHAR(255) NOT NULL,
    nombre_almacenado NVARCHAR(80) NOT NULL,
    mime_type NVARCHAR(100) NOT NULL,
    tamano_bytes INT NOT NULL,
    duracion_segundos INT NULL,
    hash_sha256 CHAR(64) NOT NULL,
    creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_den_evid_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_denuncias_evidencias PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_den_evid_denuncia FOREIGN KEY (denuncia_id) REFERENCES denuncias.denuncias(id) ON DELETE CASCADE,
    CONSTRAINT CK_den_evid_tipo CHECK (tipo IN (N'AUDIO', N'EVIDENCIA')),
    CONSTRAINT CK_den_evid_tamano CHECK (tamano_bytes > 0)
);
CREATE INDEX IX_denuncias_evidencias ON denuncias.evidencias_denuncia(denuncia_id, creado_en ASC);
GO

INSERT INTO denuncias.categorias_denuncia(nombre, nombre_normalizado, orden)
SELECT v.nombre, v.nombre_normalizado, v.orden
FROM (VALUES
 (N'Incidente durante un servicio',N'incidente durante un servicio',1),
 (N'Problema con un móvil',N'problema con un movil',2),
 (N'Problema con despacho',N'problema con despacho',3),
 (N'Problema con personal',N'problema con personal',4),
 (N'Reclamo urgente',N'reclamo urgente',5),
 (N'Conducta inapropiada',N'conducta inapropiada',6),
 (N'Problema administrativo',N'problema administrativo',7),
 (N'Otro',N'otro',8)
) v(nombre,nombre_normalizado,orden)
WHERE NOT EXISTS (SELECT 1 FROM denuncias.categorias_denuncia c WHERE c.nombre_normalizado=v.nombre_normalizado);
GO

INSERT INTO seguridad.permisos(nombre,recurso,accion,categoria,descripcion)
SELECT v.nombre,N'denuncias',v.accion,N'Denuncias',v.descripcion
FROM (VALUES
 (N'denuncias:ver',N'ver',N'Consulta de denuncias y evidencias autorizadas'),
 (N'denuncias:gestionar',N'gestionar',N'Cambio de estados y revisión'),
 (N'denuncias:asignar',N'asignar',N'Asignación de responsables'),
 (N'denuncias:cerrar',N'cerrar',N'Cierre, descarte y resolución'),
 (N'denuncias:ver_datos_tecnicos',N'ver_datos_tecnicos',N'Acceso a IP, agente y ubicación técnica'),
 (N'denuncias:configurar_categorias',N'configurar_categorias',N'Administración del catálogo de categorías')
) v(nombre,accion,descripcion)
WHERE NOT EXISTS(SELECT 1 FROM seguridad.permisos p WHERE p.nombre=v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol(rol_id,permiso_id)
SELECT r.id,p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre=N'Administrador General' AND p.recurso=N'denuncias'
AND NOT EXISTS(SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id=r.id AND a.permiso_id=p.id);
GO
