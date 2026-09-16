# Despliegue — SIGBO

Dependencias: Node, SQL Server; SDK móvil y firma para distribución.

Conservar reglas de AGENTS.md y trazabilidad institucional. No automatizar decisiones de autoridades ni introducir datos de ejemplo.

## Artefactos de configuración encontrados
- [.github/workflows/build.yml](<../.github/workflows/build.yml>)
- [.github/workflows/sigbo-movil-apk.yml](<../.github/workflows/sigbo-movil-apk.yml>)

Esto no acredita despliegue efectivo. Host, dominio administrado, certificado, versión desplegada y rollback probado: NO DETERMINADO. Antes de producción comprobar build, datos persistentes, variables privadas, health checks y restauración. No cambiar identidad de volúmenes o redes sin inventariar los existentes.
