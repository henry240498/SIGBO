SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* =============================================================
   SIGBO-CBVC | Migracion 014 - Configuracion del sistema (login +
   menu) 100% en BD. Reemplaza seguridad.configuracion_apariencia
   (migracion 013) por seguridad.configuracion_sistema: agrega el
   logo/nombre/subtitulo del menu lateral, y deja de usar el booleano
   "mostrar_texto" (ahora es "si texto_bajo_logo no esta vacio").
   Las imagenes dejan de ser URLs externas: se suben como archivo y
   solo se guarda la ruta relativa servida por el propio backend.
   ============================================================= */

EXEC sp_rename 'seguridad.configuracion_apariencia', 'configuracion_sistema';
GO

EXEC sp_rename 'seguridad.configuracion_sistema.logo_url', 'logo_login', 'COLUMN';
GO
EXEC sp_rename 'seguridad.configuracion_sistema.fondo_url', 'fondo_login', 'COLUMN';
GO
EXEC sp_rename 'seguridad.configuracion_sistema.texto_debajo_logo', 'texto_bajo_logo', 'COLUMN';
GO

ALTER TABLE seguridad.configuracion_sistema DROP CONSTRAINT DF_configap_mostrar;
GO
ALTER TABLE seguridad.configuracion_sistema DROP COLUMN mostrar_texto;
GO

ALTER TABLE seguridad.configuracion_sistema ADD
    nombre_sistema_menu NVARCHAR(100) NULL,
    subtitulo_menu      NVARCHAR(200) NULL,
    logo_menu           NVARCHAR(500) NULL;
GO

/* Sembrar los valores que hoy estan hardcodeados en el sidebar, para
   que no se vea vacio apenas se aplique la migracion. */
UPDATE seguridad.configuracion_sistema
SET nombre_sistema_menu = 'SIGBO-CBVC',
    subtitulo_menu = 'Panel principal'
WHERE nombre_sistema_menu IS NULL;
GO
