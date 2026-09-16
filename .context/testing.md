# Testing — SIGBO

[Comandos declarados](ejecucion.md). La presencia de pruebas no acredita una ejecución reciente.

Separar unitarias de integración/E2E. Estas últimas requieren una DB de prueba expresamente identificada, migraciones controladas y datos de fixture; no reutilizar una DB compartida por defecto.

## Suites localizadas
- [backend/src/core/database/data-source-options.spec.ts](<../backend/src/core/database/data-source-options.spec.ts>)
- [backend/src/modules/auth/auth-config.spec.ts](<../backend/src/modules/auth/auth-config.spec.ts>)
- [backend/src/modules/auth/auth-cookies.spec.ts](<../backend/src/modules/auth/auth-cookies.spec.ts>)
- [backend/src/modules/auth/auth-token-size.spec.ts](<../backend/src/modules/auth/auth-token-size.spec.ts>)

Registrar comando, fecha, revisión y resultado real; consultar proyecto.json y el informe del cambio.
