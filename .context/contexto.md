# SIGBO — contexto

Fecha de revisión estructural: 2026-09-14. Identificador: sigbo.

## Producto y alcance
Sistema institucional con grafo documental amplio.

Tecnología y persistencia: NestJS 11, Next.js 16, React 19, TypeORM; SQL Server; Flutter/Android

Dependencias y servidor: Node, SQL Server; SDK móvil y firma para distribución.

## Lectura obligatoria
1. [Contexto general de Vaults](<../../Vaults/jmartinez/Ecosistema/contexto.md>) y [reglas generales](<../../Vaults/jmartinez/Ecosistema/reglas.md>).
2. [Reglas particulares](reglas.md) y [ejecución y validación](ejecucion.md).
3. Documentación y decisiones del componente que vaya a cambiar.

## Límites
Conservar reglas de AGENTS.md y trazabilidad institucional. No automatizar decisiones de autoridades ni introducir datos de ejemplo.

## Fuentes técnicas
- [.movile/pubspec.yaml](<../.movile/pubspec.yaml>)
- [.movile/android/build.gradle](<../.movile/android/build.gradle>)
- [.movile/android/app/build.gradle](<../.movile/android/app/build.gradle>)
- [.movile/android_app_src/build.gradle](<../.movile/android_app_src/build.gradle>)
- [backend/package.json](<../backend/package.json>)
- [frontend/package.json](<../frontend/package.json>)

## Documentación conservada
- [AGENTS.md](<../AGENTS.md>)
- [CLAUDE.md](<../CLAUDE.md>)
- [loquefaltadefinirBien.md](<../loquefaltadefinirBien.md>)
- [README_START.md](<../README_START.md>)
- [.movile/README.md](<../.movile/README.md>)
- [.movile/docs/CONEXION.md](<../.movile/docs/CONEXION.md>)
- [Conversacion_Desarrollo/Servicios_Seguimiento_Geografico.md](<../Conversacion_Desarrollo/Servicios_Seguimiento_Geografico.md>)
- [Conversacion_Desarrollo/Snoopy_Auditoria_PreProduccion.md](<../Conversacion_Desarrollo/Snoopy_Auditoria_PreProduccion.md>)
- [Conversacion_Desarrollo/Snoopy_Cierre_Estabilizacion.md](<../Conversacion_Desarrollo/Snoopy_Cierre_Estabilizacion.md>)
- [Conversacion_Desarrollo/Snoopy_Estado_Actual.md](<../Conversacion_Desarrollo/Snoopy_Estado_Actual.md>)

## Estado verificable
La metadata está en [proyecto.json](proyecto.json). STATUS y último despliegue permanecen NO DETERMINADO hasta contar con evidencia. Una revisión documental no valida el funcionamiento de la aplicación.
[Seguimiento de correcciones y dependencias externas](<../../Vaults/jmartinez/Ecosistema/seguimiento.md>).

No copiar versiones, estado de Git o resultados históricos como si fueran hechos permanentes. Al cambiar una fuente técnica, revisar el contexto y actualizar su hash solo después de comprobar coherencia.

<!-- BEGIN ECOSYSTEM DETAILS -->
## Documentos por tarea

- [arquitectura.md](<arquitectura.md>)
- [testing.md](<testing.md>)
- [base-datos.md](<base-datos.md>)
- [despliegue.md](<despliegue.md>)
- [seguridad.md](<seguridad.md>)
<!-- END ECOSYSTEM DETAILS -->
