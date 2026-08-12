-- IMPORTANTE: este archivo contiene caracteres acentuados (a,e,i,o,u,n,
-- grado) en literales N'...'. Debe aplicarse con el codepage de entrada en
-- UTF-8 o sqlcmd los reinterpreta como Latin-1 y los corrompe al guardarlos
-- (mojibake tipo "podrǭn" en vez de "podrán"), confirmado empiricamente en
-- esta sesion. Aplicar siempre asi:
--   sqlcmd -S <server> -d sigbo_cbvc -U sigbo_app -P '<pwd>' -C -f 65001 -i 030_ordenes_guardia.sql
-- (los demas .sql de este directorio evitan el problema escribiendo el
-- texto sin acentos; este es el primero que necesita texto en espanol
-- correcto porque se imprime tal cual en el documento oficial).
--
-- Ordenes de Guardia: documento oficial mensual generado desde la
-- planificacion ya existente (Guardia/AsignacionGuardia/GrupoGuardia/
-- EsquemaHorarioGuardia). Es una capa de lectura/agregacion + estado de
-- publicacion -- no modifica el motor de planificacion.

-- Configuracion institucional (singleton, patron ConfiguracionSistema /
-- AparienciaService): textos de plantilla, firmantes, logos.
CREATE TABLE operaciones.orden_guardia_configuracion (
    id                          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ogc_id DEFAULT NEWSEQUENTIALID(),
    titulo_documento            NVARCHAR(300) NOT NULL CONSTRAINT DF_ogc_titulo DEFAULT N'ORDEN DE SERVICIO N° {{numero}}/{{anio}}',
    texto_header_institucional  NVARCHAR(MAX) NULL,
    logo_izquierda_url          NVARCHAR(MAX) NULL,
    logo_derecha_url            NVARCHAR(MAX) NULL,
    texto_intro_plantilla       NVARCHAR(MAX) NULL,
    regla_texto_oficial         NVARCHAR(MAX) NULL,
    regla_texto_chofer          NVARCHAR(MAX) NULL,
    exigir_rango_igual_o_superior_oficial BIT NOT NULL CONSTRAINT DF_ogc_exigir DEFAULT 1,
    texto_pie                   NVARCHAR(MAX) NULL,
    firmante1_cargo_id          UNIQUEIDENTIFIER NULL,
    firmante1_etiqueta          NVARCHAR(150) NULL,
    firmante2_cargo_id          UNIQUEIDENTIFIER NULL,
    firmante2_etiqueta          NVARCHAR(150) NULL,
    actualizado_en              DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ogc_act DEFAULT SYSDATETIMEOFFSET(),
    actualizado_por             UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_ogc PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_ogc_firmante1 FOREIGN KEY (firmante1_cargo_id) REFERENCES organizacion.cargos(id),
    CONSTRAINT FK_ogc_firmante2 FOREIGN KEY (firmante2_cargo_id) REFERENCES organizacion.cargos(id)
);
GO

INSERT INTO operaciones.orden_guardia_configuracion
    (texto_intro_plantilla, regla_texto_oficial, regla_texto_chofer, texto_pie)
VALUES (
    N'La Encargaduría de Personal y la Comandancia en uso de sus atribuciones; en concordancia con el Art. 213° del Reglamento General del CBVC, comunica a todo el Personal Bombero/a Combatiente e incorporado las guardias periódicas correspondientes al mes de {{mes}} DEL AÑO {{anio}}.',
    N'Los Voluntarios a Cargo de las guardias podrán ser reemplazados por otros Voluntarios a Cargo o por otro del mismo rango o mayor Rango.',
    N'Los conductores podrán ser reemplazados únicamente por conductores.',
    N'Las guardias de los días hábiles son a partir de las 20:00hs y la salida a las 06:00hs, y los fines de semana y feriados de 20:00hs a 13:00hs. del día siguiente.'
);
GO

-- El documento en si: cabecera + snapshot inmutable una vez publicado.
CREATE TABLE operaciones.ordenes_guardia (
    id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_og_id DEFAULT NEWSEQUENTIALID(),
    anio             INT NOT NULL,
    mes              INT NOT NULL,
    numero           INT NOT NULL,
    periodo_desde    DATE NOT NULL,
    periodo_hasta    DATE NOT NULL,
    fecha_emision    DATE NOT NULL,
    estado           NVARCHAR(20) NOT NULL CONSTRAINT DF_og_estado DEFAULT 'BORRADOR',
    contenido_json   NVARCHAR(MAX) NOT NULL,
    generado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_og_generado DEFAULT SYSDATETIMEOFFSET(),
    generado_por     UNIQUEIDENTIFIER NULL,
    revisada_en      DATETIMEOFFSET(3) NULL,
    revisada_por     UNIQUEIDENTIFIER NULL,
    aprobada_en      DATETIMEOFFSET(3) NULL,
    aprobada_por     UNIQUEIDENTIFIER NULL,
    publicada_en     DATETIMEOFFSET(3) NULL,
    publicada_por    UNIQUEIDENTIFIER NULL,
    anulada_en       DATETIMEOFFSET(3) NULL,
    anulada_por      UNIQUEIDENTIFIER NULL,
    anulada_motivo   NVARCHAR(MAX) NULL,
    archivo_pdf_url  NVARCHAR(MAX) NULL,
    archivo_docx_url NVARCHAR(MAX) NULL,
    observaciones    NVARCHAR(MAX) NULL,
    CONSTRAINT PK_og PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_og_anio_numero UNIQUE (anio, numero),
    CONSTRAINT CK_og_estado CHECK (estado IN ('BORRADOR','REVISADA','APROBADA','PUBLICADA','ANULADA'))
);
GO

-- Historial de modificaciones a una Orden ya PUBLICADA: nunca se toca el
-- contenido_json original, solo se agrega un registro de lo que cambio y
-- por que.
CREATE TABLE operaciones.ordenes_guardia_modificaciones (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_ogm_id DEFAULT NEWSEQUENTIALID(),
    orden_id        UNIQUEIDENTIFIER NOT NULL,
    campo           NVARCHAR(100) NOT NULL,
    descripcion     NVARCHAR(MAX) NOT NULL,
    valor_anterior  NVARCHAR(MAX) NULL,
    valor_nuevo     NVARCHAR(MAX) NULL,
    motivo          NVARCHAR(MAX) NOT NULL,
    registrado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_ogm_reg DEFAULT SYSDATETIMEOFFSET(),
    registrado_por  UNIQUEIDENTIFIER NOT NULL,
    CONSTRAINT PK_ogm PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_ogm_orden FOREIGN KEY (orden_id) REFERENCES operaciones.ordenes_guardia(id)
);
CREATE INDEX IX_ogm_orden ON operaciones.ordenes_guardia_modificaciones(orden_id);
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria, descripcion)
SELECT v.nombre, v.recurso, v.accion, N'Guardias', v.descripcion
FROM (VALUES
    (N'guardias:ordenes_ver',        N'guardias', N'ordenes_ver',        N'Ver ordenes de guardia y su configuracion'),
    (N'guardias:ordenes_crear',      N'guardias', N'ordenes_crear',      N'Crear una nueva orden de guardia (borrador)'),
    (N'guardias:ordenes_editar',     N'guardias', N'ordenes_editar',     N'Editar/regenerar una orden de guardia no publicada'),
    (N'guardias:ordenes_aprobar',    N'guardias', N'ordenes_aprobar',    N'Aprobar una orden de guardia revisada'),
    (N'guardias:ordenes_publicar',   N'guardias', N'ordenes_publicar',   N'Publicar una orden de guardia aprobada'),
    (N'guardias:ordenes_anular',     N'guardias', N'ordenes_anular',     N'Anular una orden de guardia'),
    (N'guardias:ordenes_configurar', N'guardias', N'ordenes_configurar', N'Configurar textos institucionales y firmantes de la orden de guardia')
) AS v(nombre, recurso, accion, descripcion)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre IN (N'Administrador General', N'Comandante')
  AND p.nombre LIKE N'guardias:ordenes_%'
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Jefe de Guardia'
  AND p.nombre IN (N'guardias:ordenes_ver', N'guardias:ordenes_crear', N'guardias:ordenes_editar')
  AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id);
GO
