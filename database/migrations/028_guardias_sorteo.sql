-- Fase C del motor de planificacion de Guardias: sorteo de personal para
-- fechas especiales (8 diciembre, Nochebuena, Navidad, vispera Ano Nuevo,
-- Ano Nuevo -- seccion 20 del pedido). Registra fecha, motivo, personas
-- elegibles, seleccionadas y no seleccionadas, resultado, fecha/hora y
-- usuario ejecutor: todo auditado, nunca solo el resultado final.
CREATE TABLE operaciones.sorteos_guardia (
    id                     UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_sorteo_id DEFAULT NEWSEQUENTIALID(),
    fecha                  DATE NOT NULL,
    motivo                 NVARCHAR(300) NOT NULL,
    cantidad_a_seleccionar INT NOT NULL,
    esquema_horario_id     UNIQUEIDENTIFIER NULL,
    guardia_id             UNIQUEIDENTIFIER NULL,
    ejecutado_por          UNIQUEIDENTIFIER NULL,
    ejecutado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_sorteo_ejecutado DEFAULT SYSDATETIMEOFFSET(),
    observacion            NVARCHAR(MAX) NULL,
    CONSTRAINT PK_sorteos_guardia PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_sorteo_esquema FOREIGN KEY (esquema_horario_id) REFERENCES operaciones.esquemas_horario_guardia(id),
    CONSTRAINT FK_sorteo_guardia FOREIGN KEY (guardia_id) REFERENCES operaciones.guardias(id),
    CONSTRAINT CK_sorteo_cantidad CHECK (cantidad_a_seleccionar > 0)
);
GO

-- Guarda TODOS los elegibles (seleccionado=1 y seleccionado=0), no solo los
-- ganadores: es la unica forma de que una auditoria futura pueda confirmar
-- que el sorteo respeto candidato = realiza_guardias_especiales=1.
CREATE TABLE operaciones.sorteo_participantes (
    id            UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_sorteopart_id DEFAULT NEWSEQUENTIALID(),
    sorteo_id     UNIQUEIDENTIFIER NOT NULL,
    bombero_id    UNIQUEIDENTIFIER NOT NULL,
    seleccionado  BIT NOT NULL CONSTRAINT DF_sorteopart_sel DEFAULT 0,
    orden         INT NOT NULL CONSTRAINT DF_sorteopart_orden DEFAULT 0,
    CONSTRAINT PK_sorteo_participantes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_sorteopart_sorteo FOREIGN KEY (sorteo_id) REFERENCES operaciones.sorteos_guardia(id),
    CONSTRAINT FK_sorteopart_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id)
);
CREATE INDEX IX_sorteo_participantes_sorteo ON operaciones.sorteo_participantes(sorteo_id);
GO

INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria, descripcion)
SELECT N'guardias:sorteos', N'guardias', N'sorteos', N'Guardias', N'Ejecutar y consultar sorteos de personal para fechas especiales'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = N'guardias:sorteos');
GO

INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id
FROM seguridad.roles r
CROSS JOIN seguridad.permisos p
WHERE r.nombre = 'Administrador General' AND p.nombre = 'guardias:sorteos'
AND NOT EXISTS (
    SELECT 1 FROM seguridad.asignacion_permisos_rol apr WHERE apr.rol_id = r.id AND apr.permiso_id = p.id
);
GO
