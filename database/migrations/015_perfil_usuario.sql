SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 015 - "Mi Perfil" + politica de edicion
   de datos personales.

   Redes sociales (campo unico) van directo en seguridad.usuarios.
   Telefonos y correos (listas dinamicas) van en tablas propias.
   El interruptor Libre/Fijo es una columna mas en la fila unica de
   seguridad.configuracion_sistema (mismo patron que apariencia).
   ============================================================= */

ALTER TABLE seguridad.usuarios ADD
    whatsapp       NVARCHAR(30)  NULL,
    facebook_url   NVARCHAR(500) NULL,
    instagram_url  NVARCHAR(500) NULL,
    x_url          NVARCHAR(500) NULL;
GO

ALTER TABLE seguridad.configuracion_sistema ADD
    perfil_edicion_libre BIT NOT NULL CONSTRAINT DF_configsis_perfillibre DEFAULT 1;
GO

CREATE TABLE seguridad.usuario_telefonos (
    id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_usertel_id DEFAULT NEWSEQUENTIALID(),
    usuario_id  UNIQUEIDENTIFIER NOT NULL,
    numero      NVARCHAR(30)     NOT NULL,
    etiqueta    NVARCHAR(50)     NULL,
    creado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_usertel_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_usuario_telefonos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_usertel_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE CASCADE
);
GO

CREATE TABLE seguridad.usuario_correos (
    id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_usercorreo_id DEFAULT NEWSEQUENTIALID(),
    usuario_id  UNIQUEIDENTIFIER NOT NULL,
    correo      NVARCHAR(255)    NOT NULL,
    etiqueta    NVARCHAR(50)     NULL,
    creado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_usercorreo_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_usuario_correos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_usercorreo_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id) ON DELETE CASCADE
);
GO

CREATE INDEX IX_usuario_telefonos_usuario ON seguridad.usuario_telefonos(usuario_id);
CREATE INDEX IX_usuario_correos_usuario   ON seguridad.usuario_correos(usuario_id);
GO

/* Permiso nuevo: solo quien lo tenga puede cambiar el interruptor
   Libre/Fijo. Por defecto, solo el rol Administrador General. */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT 'seguridad:configurar_politica_perfil', 'seguridad', 'configurar_politica_perfil', 'Seguridad'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = 'seguridad:configurar_politica_perfil');
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = 'Administrador General'
  AND p.nombre = 'seguridad:configurar_politica_perfil'
  AND NOT EXISTS (
    SELECT 1 FROM seguridad.asignacion_permisos_rol apr
    WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
