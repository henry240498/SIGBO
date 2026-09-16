# Ejecución y validación

## Requisitos y límites
Node, SQL Server; SDK móvil y firma para distribución.

Conservar reglas de AGENTS.md y trazabilidad institucional. No automatizar decisiones de autoridades ni introducir datos de ejemplo.

## Comandos declarados
Ejecutar desde el directorio indicado, después de revisar sus efectos. Esta tabla acredita que existe el script, no que haya pasado recientemente.
Los comandos de prueba pueden escribir archivos o datos. Builds móviles requieren SDK/firma y Maven puede ejecutar pruebas de integración.

| Fuente | Directorio relativo a la raíz | Script o propósito | Comando |
|---|---|---|---|
| [backend/package.json](<../backend/package.json>) | backend | build | npm run build |
| [backend/package.json](<../backend/package.json>) | backend | start | npm run start |
| [backend/package.json](<../backend/package.json>) | backend | start:dev | npm run start:dev |
| [backend/package.json](<../backend/package.json>) | backend | start:debug | npm run start:debug |
| [backend/package.json](<../backend/package.json>) | backend | start:prod | npm run start:prod |
| [backend/package.json](<../backend/package.json>) | backend | test | npm test |
| [backend/package.json](<../backend/package.json>) | backend | test:ci | npm run test:ci |
| [frontend/package.json](<../frontend/package.json>) | frontend | dev | npm run dev |
| [frontend/package.json](<../frontend/package.json>) | frontend | build | npm run build |
| [frontend/package.json](<../frontend/package.json>) | frontend | start | npm run start |
| [frontend/package.json](<../frontend/package.json>) | frontend | test | npm test |

## Configuración y despliegue encontrados
- [.github/workflows/build.yml](<../.github/workflows/build.yml>)
- [.github/workflows/sigbo-movil-apk.yml](<../.github/workflows/sigbo-movil-apk.yml>)

Despliegue efectivo: NO DETERMINADO. No ejecutar Compose, migraciones o arranque contra datos compartidos por inferencia.

## Puertos
Consultar [registro global](<../../Vaults/jmartinez/Infraestructura/Puertos/registro.json>) antes de iniciar varias aplicaciones. Se conservan los puertos actuales; si un proceso ajeno ocupa uno, informar y no detenerlo.

## Cierre de un cambio
Registrar comando, entorno, revisión, fecha y resultado real en proyecto.json o en el informe de validación del cambio. Actualizar documentación afectada y revisar el diff. No confundir la existencia de CI con un resultado aprobado.

<!-- BEGIN ECOSYSTEM MOBILE-SIGNING -->
## Firma móvil
Las tareas Release requieren key.properties y un keystore estable; ya no se usa firma debug como fallback. Para pruebas locales construir explícitamente con flutter build apk --debug. No guardar claves ni contraseñas en contexto. La validez de la firma productiva y la compilación Android completa son NO DETERMINADO hasta disponer del SDK y la configuración de firma.
<!-- END ECOSYSTEM MOBILE-SIGNING -->
