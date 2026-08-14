---
id: decision--monolito-modular
tipo: DECISION
nombre: Monolito modular NestJS en vez de microservicios
nivel: L1
resumen: La especificacion original pedia microservicios con Kafka, Elasticsearch, MinIO y Kubernetes. Se implemento un monolito modular NestJS con los mismos modulos y la misma API REST.
estado: VIGENTE
fuente: docs/README.md
archivos: [backend/src/app.module.ts, docs/README.md]
terminos: [monolito, microservicios, kafka, nestjs, arquitectura, modulos, cqrs]
edges:
  - [depends_on, dependency--nestjs]
---

## Contexto

El documento de especificacion (`Proyecto.txt`) describia microservicios con Kafka
para event sourcing/CQRS, Elasticsearch para busqueda, MinIO para archivos y
Kubernetes para orquestacion.

## Decision

<<<<<<< Updated upstream
Un solo proceso NestJS con **11 modulos**: `AuthModule`, `SeguridadModule`,
`PersonalModule`, `OrganizacionModule`, `VehiculosModule`, `EquiposModule`,
`ServiciosModule`, `PublicacionesModule`, `OperacionesModule`, `GuardiasModule`,
`ConfiguracionModule`.

Los limites entre modulos se respetan por convencion: cada modulo tiene sus
controladores, servicios y DTOs, y comparte unicamente las entidades de
`backend/src/shared/entities/`.
=======
Un solo proceso NestJS con **10 modulos**: `AuthModule`, `SeguridadModule`,
`PersonalModule`, `OrganizacionModule`, `VehiculosModule`, `EquiposModule`,
`ServiciosModule`, `PublicacionesModule`, `OperacionesModule`,
`ConfiguracionModule`. Los limites entre modulos se respetan por convencion: cada
modulo tiene sus controladores, servicios y DTOs, y comparte unicamente las
entidades de `backend/src/shared/entities/`.
>>>>>>> Stashed changes

## Motivo

Entregar un sistema que **efectivamente corra** en la maquina disponible. Un
cluster de microservicios no era operable por una institucion de bomberos
voluntarios sin equipo de plataforma.

## Costo aceptado

- No hay event sourcing ni CQRS: la trazabilidad se resuelve con
  `seguridad.logs_auditoria` y tablas de historial (`historial_institucional`,
  `historial_codigo`, `fojas_servicio`).
- Sin busqueda full-text: las consultas van directo a SQL Server.
- Escalado solo vertical.
<<<<<<< Updated upstream
- Los limites modulares **no los fuerza nada**: cualquier servicio puede importar
  cualquier entidad. La separacion depende de disciplina, no del compilador. El caso
  de Guardias lo muestra: es un modulo propio cuyas tablas viven en el esquema
  `operaciones` — ver [[rule--guardias-vive-en-operaciones]].
=======
>>>>>>> Stashed changes

## Cuando reconsiderar

Si un modulo necesitara despliegue o escala independiente. Los limites modulares
actuales lo permitirian sin reescribir la logica de negocio.
