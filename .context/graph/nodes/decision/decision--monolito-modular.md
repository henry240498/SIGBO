---
id: decision--monolito-modular
tipo: DECISION
nombre: Monolito modular NestJS en vez de microservicios
nivel: L1
estado: VIGENTE
resumen: La especificacion original pedia microservicios con Kafka, Elasticsearch, MinIO y Kubernetes. Se implemento un monolito modular NestJS con los mismos modulos y la misma API REST.
archivos:
  - backend/src/app.module.ts
  - docs/README.md
edges:
  - [depends_on, dependency--nestjs]
terminos: [monolito, microservicios, kafka, nestjs, arquitectura, modulos, cqrs, modular, nest, vez, especificacion, original, pedia, elasticsearch, min, kubernetes, implemento, mismos, misma, api, rest]
---

# Monolito modular NestJS en vez de microservicios

La especificacion original pedia microservicios con Kafka, Elasticsearch, MinIO y Kubernetes. Se implemento un monolito modular NestJS con los mismos modulos y la misma API REST.

## Contexto

El documento de especificacion (`Proyecto.txt`) describia microservicios con Kafka
para event sourcing/CQRS, Elasticsearch para busqueda, MinIO para archivos y
Kubernetes para orquestacion.

## Decision

Un solo proceso NestJS con **11 modulos**: `AuthModule`, `SeguridadModule`,
`PersonalModule`, `OrganizacionModule`, `VehiculosModule`, `EquiposModule`,
`ServiciosModule`, `PublicacionesModule`, `OperacionesModule`, `GuardiasModule`,
`ConfiguracionModule`.

Los limites entre modulos se respetan por convencion: cada modulo tiene sus
controladores, servicios y DTOs, y comparte unicamente las entidades de
`backend/src/shared/entities/`.

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
- Los limites modulares **no los fuerza nada**: cualquier servicio puede importar
  cualquier entidad. La separacion depende de disciplina, no del compilador. El caso
  de Guardias lo muestra: es un modulo propio cuyas tablas viven en el esquema
  `operaciones` — ver [[rule--guardias-vive-en-operaciones]].

## Cuando reconsiderar

Si un modulo necesitara despliegue o escala independiente. Los limites modulares
actuales lo permitirian sin reescribir la logica de negocio.


## Archivos

- `backend/src/app.module.ts`
- `docs/README.md`

## Relaciones

- `depends_on` → [[dependency--nestjs|NestJS 11 + TypeORM 0.3]]

---
<sub>Nodo **curado** (editable a mano).</sub>
