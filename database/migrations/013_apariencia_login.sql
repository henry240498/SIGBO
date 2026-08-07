SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 013 - Apariencia configurable del login
   Tabla de una sola fila: logo, fondo y texto opcional debajo del
   logo en la pantalla de inicio de sesion. Solo el rol ADMIN puede
   modificarla (GET es publico: la pantalla de login lo necesita
   antes de autenticarse).
   ============================================================= */

CREATE TABLE seguridad.configuracion_apariencia (
    id                 UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_configap_id DEFAULT NEWSEQUENTIALID(),
    logo_url           NVARCHAR(MAX) NULL,
    fondo_url          NVARCHAR(MAX) NULL,
    mostrar_texto      BIT NOT NULL CONSTRAINT DF_configap_mostrar DEFAULT 0,
    texto_debajo_logo  NVARCHAR(200) NULL,
    actualizado_en     DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_configap_act DEFAULT SYSDATETIMEOFFSET(),
    actualizado_por    UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_configuracion_apariencia PRIMARY KEY CLUSTERED (id)
);
GO

ALTER TABLE seguridad.configuracion_apariencia
    ADD CONSTRAINT FK_configap_actpor FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id);
GO

/* Fila unica por defecto. logo_url apunta a un archivo que se debe
   colocar en frontend/public/logo-cbvc.png (o cambiarse desde la UI). */
INSERT INTO seguridad.configuracion_apariencia (logo_url, mostrar_texto)
SELECT '/logo-cbvc.png', 0
WHERE NOT EXISTS (SELECT 1 FROM seguridad.configuracion_apariencia);
GO

/* Permiso nuevo: solo ADMIN puede cambiar la apariencia del login */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT 'seguridad:configurar_apariencia', 'seguridad', 'configurar_apariencia', 'Seguridad'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos WHERE nombre = 'seguridad:configurar_apariencia');
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = 'Administrador General'
  AND p.nombre = 'seguridad:configurar_apariencia'
  AND NOT EXISTS (
    SELECT 1 FROM seguridad.asignacion_permisos_rol apr
    WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
  );
GO
