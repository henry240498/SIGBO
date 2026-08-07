SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 011 - Seguridad Fase 1 (nucleo RBAC)
   Agrega soporte para: forzar cambio de contrasena, expiracion de
   contrasena, activar/desactivar roles, historial de contrasenas y
   el permiso para cerrar sesiones remotas.
   ============================================================= */

/* usuarios: forzar cambio de contrasena + expiracion */
ALTER TABLE seguridad.usuarios ADD
    debe_cambiar_password BIT NOT NULL CONSTRAINT DF_usuarios_debe_cambiar DEFAULT 0,
    password_expira_en     DATETIMEOFFSET(3) NULL;
GO

/* roles: activar/desactivar */
ALTER TABLE seguridad.roles ADD
    activo BIT NOT NULL CONSTRAINT DF_roles_activo DEFAULT 1;
GO

/* historial de contrasenas: evita reutilizar las ultimas N */
CREATE TABLE seguridad.historial_contrasenas (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_histpass_id DEFAULT NEWSEQUENTIALID(),
    usuario_id       UNIQUEIDENTIFIER NOT NULL,
    password_hash    NVARCHAR(255)    NOT NULL,
    creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_histpass_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_historial_contrasenas PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_histpass_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id)
);
GO

/* nuevo permiso: cerrar sesiones remotas (accion administrativa distinta de ver) */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT 'seguridad:cerrar_sesion', 'seguridad', 'cerrar_sesion', 'Seguridad'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = 'seguridad:cerrar_sesion');
GO

/* asignar el nuevo permiso al rol ADMIN (Administrador General) */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = 'Administrador General'
  AND p.nombre = 'seguridad:cerrar_sesion'
  AND NOT EXISTS (
    SELECT 1 FROM seguridad.asignacion_permisos_rol apr
    WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
