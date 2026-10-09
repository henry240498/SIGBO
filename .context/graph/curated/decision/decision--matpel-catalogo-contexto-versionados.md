---
id: decision--matpel-catalogo-contexto-versionados
tipo: DECISION
nombre: GRE versionada y MATPEL sobre el mismo Servicio y cronología
nivel: L1
resumen: GRE y MATPEL separados sobre el mismo Servicio. Fuente privada y extracción candidata de índices, guías, tablas y reglas; API administrativa de importación, revisión, validación y activación con permisos. SQL probado solo en bases temporales. Cotejo institucional y contexto operacional pendientes; decisiones conservan snapshots y autoridad del núcleo.
estado: CATALOGO_CANDIDATO_ADMINISTRACION_PROBADA
dominio: servicios
fuente: docs/matpel/FASE_2_ARQUITECTURA.md
archivos:
  - docs/matpel/FASE_2_ARQUITECTURA.md
  - docs/matpel/FASE_2_CONTRATOS.md
  - docs/matpel/FASE_2_EXPERIENCIA.md
  - docs/matpel/FASE_2_MATRIZ_GRE.md
  - docs/matpel/FASE_3A_BASE_DOCUMENTAL.md
  - docs/matpel/FASE_3A_VALIDACION.md
  - docs/matpel/FASE_3B_INDICES_GUIAS.md
  - docs/matpel/FASE_3C_TABLAS_CONDICIONES.md
  - docs/matpel/FASE_3D_ADMINISTRACION.md
  - backend/src/modules/gre/gre.module.ts
  - backend/src/modules/gre/gre-catalogo.service.ts
  - backend/src/modules/gre/gre-fuentes.service.ts
  - scripts/matpel/importar_gre.py
  - scripts/matpel/extraer_gre.py
  - database/migrations/094_gre_base_documental.sql
  - database/migrations/095_matpel_permisos.sql
  - backend/src/modules/incidente-nucleo/cronologia.service.ts
  - backend/src/modules/despacho/servicio-activo.service.ts
edges:
  - [constrains, domain--servicios]
  - [constrains, component--modulo-incidente-nucleo]
  - [constrains, service--incidente-nucleo-cronologia]
  - [constrains, component--modulo-gre]
  - [constrains, entity--gre-version]
  - [constrains, entity--gre-campo-fuente]
terminos: [matpel, gre, sci, fuente, edicion, certeza, decision, cronologia, importacion, desconocido, autoridad, offline]
---

## Decisión y alcance

Extender NestJS/SQL Server, web y Flutter actuales. GreModule prepara catálogo/fuentes
en fase 3A; fases 3C–3D añaden extracción candidata completa y API administrativa en
AppModule con importación, revisión, validación y activación controladas.
MatpelModule sigue propuesto para consumir catálogo y núcleo existente. No crear otro SCI ni otra
cronología o Servicio para MATPEL.

Fuente privada identificada por hash; candidato documental no equivale a catálogo
validado. Las referencias de campo usan FKs de la misma versión. Correcciones generan
otra candidata con revisión explícita y origen, sin alterar versión validada. Migración
094 preparada y registrada en manifiestos; pruebas contra bases SQL temporales propias,
sin aplicación institucional. 095 registra permisos y asignaciones iniciales, pendiente
de aplicación institucional. No inferir catálogo activo por una prueba desechable.

Entrada GRE usa id propio, no ONU como identidad única. Datos de catálogo, reglas y
fuentes pertenecen a una versión. Activación nueva no reescribe decisiones históricas.
Una decisión conserva evaluación/inputs/edición/fuentes, responsable y fechas.

Fase 3B: una entrada candidata es un par amarillo/azul conciliado por identificador y
nombre (un ID con diez nombres son diez entradas). Verde por rectángulos de cada fila,
nunca por el recuadro global; apartados de guía por estructura fija y negrita, no por
tamaño de letra. Texto o señal que no se atribuye a una fila o bloque es hallazgo
crítico; el artefacto queda `aptoActivacion = false` hasta revisión/validación humana.

Fase 3C: tablas reales por geometría y rótulos, originales/unidades/condiciones y
remisiones conservados. Fase 3D: importar deja REQUIERE_REVISION; validar exige todas
las referencias cotejadas, reporte completo sin hallazgos y ninguna celda NO_VALIDADO.
Revisiones y propuestas son auditadas e idempotentes; activar/recuperar exige motivo,
revisión esperada y versión validada. Worker apagado por defecto.

## Autorización y experiencia

Consulta independiente y panel dentro del mismo incidente. Peligros/seguridad y estado
de certeza visibles; condiciones solo cuando hacen falta; fuente junto al dato.
Permisos compuestos se verifican con AND y alcance; el guard existente usa OR.
Mando se acredita por el núcleo, sin deducir autoridad por administrar GRE.

## Dependencias

Núcleo sin consumidores operativos acreditados en el diagnóstico; revisar contratos
antes de integración. Reglamento original no localizado en repositorio/adjuntos:
consultar artículos antes de modificar flujos operativos y validar vigencia institucional.
Dos fallos previos Despacho siguen registrados. Validación de catálogo, pruebas de
interfaz y recorridos operativos permanecen en fases posteriores.

## Fuentes de diseño

La matriz de fase 2 conserva 42 secciones y 392 páginas. Contratos y DTOs describen
endpoints futuros, no rutas ya activas. El grafo debe conservar esa distinción.
