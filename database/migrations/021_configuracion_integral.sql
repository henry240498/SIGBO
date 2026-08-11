SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

CREATE TABLE seguridad.configuracion_valores (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cfgval_id DEFAULT NEWSEQUENTIALID(),
    clave NVARCHAR(160) NOT NULL,
    alcance NVARCHAR(20) NOT NULL,
    usuario_id UNIQUEIDENTIFIER NULL,
    valor_json NVARCHAR(MAX) NOT NULL,
    version INT NOT NULL CONSTRAINT DF_cfgval_version DEFAULT 1,
    actualizado_por UNIQUEIDENTIFIER NULL,
    actualizado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cfgval_fecha DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_configuracion_valores PRIMARY KEY (id),
    CONSTRAINT CK_cfgval_alcance CHECK (alcance IN ('GLOBAL','USUARIO')),
    CONSTRAINT FK_cfgval_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id),
    CONSTRAINT FK_cfgval_actor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id)
);
GO
CREATE UNIQUE INDEX UX_cfgval_global ON seguridad.configuracion_valores(clave, alcance) WHERE usuario_id IS NULL;
CREATE UNIQUE INDEX UX_cfgval_usuario ON seguridad.configuracion_valores(clave, alcance, usuario_id) WHERE usuario_id IS NOT NULL;
GO

CREATE TABLE seguridad.configuracion_versiones (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cfgver_id DEFAULT NEWSEQUENTIALID(),
    numero INT NOT NULL,
    estado NVARCHAR(30) NOT NULL,
    valores_json NVARCHAR(MAX) NOT NULL,
    motivo NVARCHAR(500) NULL,
    base_version INT NULL,
    creado_por UNIQUEIDENTIFIER NOT NULL,
    publicado_por UNIQUEIDENTIFIER NULL,
    creado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cfgver_creado DEFAULT SYSDATETIMEOFFSET(),
    publicado_en DATETIMEOFFSET(3) NULL,
    CONSTRAINT PK_configuracion_versiones PRIMARY KEY (id),
    CONSTRAINT UQ_cfgver_numero UNIQUE (numero),
    CONSTRAINT CK_cfgver_estado CHECK (estado IN ('BORRADOR','PUBLICADO','ARCHIVADO')),
    CONSTRAINT FK_cfgver_creador FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id),
    CONSTRAINT FK_cfgver_publicador FOREIGN KEY (publicado_por) REFERENCES seguridad.usuarios(id)
);
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, N'configuracion', v.accion, N'Configuracion'
FROM (VALUES
 (N'configuracion:ver', N'ver'),
 (N'configuracion:editar_borrador', N'editar_borrador'),
 (N'configuracion:publicar', N'publicar'),
 (N'configuracion:restaurar', N'restaurar'),
 (N'configuracion:exportar', N'exportar'),
 (N'configuracion:importar', N'importar')
) v(nombre, accion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre=v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id,p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre=N'Administrador General' AND p.recurso=N'configuracion'
AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id=r.id AND a.permiso_id=p.id);
GO
