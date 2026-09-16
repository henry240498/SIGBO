<!-- BEGIN ECOSYSTEM ENTRY -->
# Entrada de agentes — SIGBO
Antes de modificar archivos, leer [.context/contexto.md](.context/contexto.md), [.context/reglas.md](.context/reglas.md) y las fuentes pertinentes. Para trabajos importantes, leer Vaults usando VAULTS_ROOT si está configurado o VAULTS_ROOT_RELATIVE en .context/proyecto.json. No cargar todo el historial o grafo; seleccionar los módulos afectados.
Conservar reglas de AGENTS.md y trazabilidad institucional. No automatizar decisiones de autoridades ni introducir datos de ejemplo.
Las reglas locales existentes siguen aplicando. No realizar commits, pushes, migraciones o cambios productivos como efecto de otra tarea.
<!-- END ECOSYSTEM ENTRY -->

# Instrucciones permanentes de SIGBO

## Fuente normativa institucional

Antes de modificar flujos de Personal, Academia, Asistencia, Guardias, Servicios,
Vehículos, Disciplina, Organización, Finanzas, Patrimonio, Documentos o Publicaciones,
consultar `docs/REGLAMENTO_GENERAL_CBVC_TRAZABILIDAD.md` y los artículos allí
referenciados del Reglamento General del CBVC.

- No automatizar decisiones reservadas a autoridades institucionales.
- Toda admisión, ascenso, sanción, baja, resolución o cambio de situación debe conservar
  autoridad, fundamento, fecha, vigencia, evidencia y auditoría.
- Parametrizar porcentajes, plazos y requisitos normativos; no fijarlos únicamente en código.
- Restringir información médica, disciplinaria y personal.
- Si el reglamento es ambiguo o puede estar reformado, registrar la duda y solicitar
  validación institucional antes de imponer una regla irreversible.

## Recuperación de contexto

Antes de cambios estructurales, consultar `.context/graph/context.mjs` con nivel L2.
Después de modificar módulos, entidades, migraciones, API o pantallas, regenerar y validar
el grafo con `build-graph.mjs` y `validar.mjs`.

## Límites de diseño y datos

- No modificar el diseño del login salvo solicitud explícita.
- Mantener la identidad visual institucional en tonos azules.
- No introducir datos, publicaciones o imágenes de ejemplo.
- Las personalizaciones de Publicaciones deben quedar aisladas de módulos operativos y
  de otras publicaciones.
