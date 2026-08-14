-- IMPORTANTE: este archivo contiene caracteres acentuados (a,e,i,o,u,n,
-- grado) en literales N'...'. Debe aplicarse con el codepage de entrada en
-- UTF-8 o sqlcmd los reinterpreta como Latin-1 y los corrompe al guardarlos
-- (mojibake tipo "podrǭn" en vez de "podrán"), confirmado empiricamente en
-- esta sesion (ver 030_ordenes_guardia.sql). Aplicar siempre asi:
--   sqlcmd -S <server> -d sigbo_cbvc -U sigbo_app -P '<pwd>' -C -f 65001 -i 031_identidad_institucional.sql
--
-- Identidad institucional (membrete/datos de contacto/firmas) centralizada:
-- singleton reutilizable por CUALQUIER modulo que genere documentos PDF/DOCX
-- (patron ConfiguracionSistema / AparienciaService / OrdenGuardiaConfiguracion
-- -- find({take:1}), crea la fila por defecto si no existe, update() nunca
-- inserta una segunda). Primera pasada de una sola institucion: no existe
-- institucion_id en ninguna tabla del sistema (ver database/README.md), asi
-- que esto NO implementa multi-tenant real, solo deja el diseno listo para
-- extenderse mas adelante sin romper nada.
CREATE TABLE organizacion.identidad_institucional (
    id                       UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ii_id DEFAULT NEWSEQUENTIALID(),
    nombre_institucion       NVARCHAR(200) NOT NULL,
    direccion                NVARCHAR(300) NULL,
    mostrar_direccion        BIT NOT NULL CONSTRAINT DF_ii_mdir DEFAULT 1,
    telefono                 NVARCHAR(150) NULL,
    mostrar_telefono         BIT NOT NULL CONSTRAINT DF_ii_mtel DEFAULT 1,
    email                    NVARCHAR(255) NULL,
    mostrar_email            BIT NOT NULL CONSTRAINT DF_ii_mmail DEFAULT 1,
    sitio_web                NVARCHAR(255) NULL,
    mostrar_sitio_web        BIT NOT NULL CONSTRAINT DF_ii_mweb DEFAULT 0,
    personeria_juridica      NVARCHAR(150) NULL,
    mostrar_personeria       BIT NOT NULL CONSTRAINT DF_ii_mpj DEFAULT 1,
    fecha_fundacion          DATE NULL,
    mostrar_fecha_fundacion  BIT NOT NULL CONSTRAINT DF_ii_mfund DEFAULT 1,
    logo_izquierda_url       NVARCHAR(MAX) NULL,  -- logo de afiliacion (ej. Junta Nacional)
    mostrar_logo_izquierda   BIT NOT NULL CONSTRAINT DF_ii_mlogi DEFAULT 1,
    logo_derecha_url         NVARCHAR(MAX) NULL,  -- sello propio de la institucion
    mostrar_logo_derecha     BIT NOT NULL CONSTRAINT DF_ii_mlogd DEFAULT 1,
    lineas_destacadas        NVARCHAR(MAX) NOT NULL CONSTRAINT DF_ii_lineas DEFAULT '[]',
    -- JSON: [{ "texto": "...", "tipo": "SUBTITULO|DISTINCION|OTRO", "visible": true, "orden": 1 }, ...]
    texto_pie_pagina         NVARCHAR(500) NULL,
    mostrar_numero_pagina    BIT NOT NULL CONSTRAINT DF_ii_mnp DEFAULT 1,
    mostrar_generado_sigbo   BIT NOT NULL CONSTRAINT DF_ii_mgs DEFAULT 1,
    actualizado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ii_act DEFAULT SYSDATETIMEOFFSET(),
    actualizado_por          UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_ii PRIMARY KEY CLUSTERED (id)
);
GO

-- Seed con los datos reales del membrete vigente del CBVC (leidos de la
-- plantilla institucional de referencia).
INSERT INTO organizacion.identidad_institucional
    (nombre_institucion, direccion, telefono, email, personeria_juridica, fecha_fundacion, lineas_destacadas, texto_pie_pagina)
VALUES (
    N'CUERPO DE BOMBEROS VOLUNTARIOS DE CARAPEGUA',
    N'Mcal. Estigarribia esq. Tte. Alcides González – Ex Impuesto Interno',
    N'021-8212728 / Cel.: 0976 – 132 132 Carapeguá - Paraguay',
    N'bomberoscarapegua@gmail.com',
    N'N° 5730/99',
    '1999-07-04',
    N'[
        {"texto": "Miembro Fundador de la Junta Nacional de Cuerpos de Bomberos Voluntarios del Paraguay-JNCBVP", "tipo": "SUBTITULO", "visible": true, "orden": 1},
        {"texto": "Miembro Fundador de la Asociación Paraguaya de Rescate – APR", "tipo": "SUBTITULO", "visible": true, "orden": 2},
        {"texto": "Medalla de Plata ''Valor al Heroísmo'' Ykua Bolaños 2004", "tipo": "DISTINCION", "visible": true, "orden": 3},
        {"texto": "Campeón Nacional en Trauma 2019 – Cat. En Desarrollo - APR", "tipo": "DISTINCION", "visible": true, "orden": 4}
    ]',
    N'Cuerpo de Bomberos Voluntarios de Carapeguá — Documento generado por SIGBO'
);
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria, descripcion)
SELECT v.nombre, v.recurso, v.accion, N'Organizacion', v.descripcion
FROM (VALUES
    (N'organizacion:documentos_ver',        N'organizacion', N'documentos_ver',        N'Ver la identidad institucional usada en documentos (membrete, firmas)'),
    (N'organizacion:documentos_configurar', N'organizacion', N'documentos_configurar', N'Configurar la identidad institucional usada en documentos (membrete, logos, pie de pagina)')
) AS v(nombre, recurso, accion, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre IN (N'Administrador General', N'Comandante')
  AND p.nombre IN (N'organizacion:documentos_ver', N'organizacion:documentos_configurar')
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO
