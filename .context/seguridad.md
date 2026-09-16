# Seguridad y variables

Conservar reglas de AGENTS.md y trazabilidad institucional. No automatizar decisiones de autoridades ni introducir datos de ejemplo.

Los archivos .env reales se conservan fuera del contexto y deben estar ignorados por Git. Los ejemplos no prueban que una variable sea obligatoria; se mantiene NO DETERMINADO hasta revisar su validación en código.

| NOMBRE_VARIABLE | PROPÓSITO | EJEMPLO_SEGURO | REQUERIDA | FUENTES |
|---|---|---|---|---|
| ACCEPT_EULA | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | .env.sqlserver.local |
| ALERTAS_DEBOUNCE_SEGUNDOS | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| AUTH_COOKIE_SAME_SITE | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| AUTH_COOKIE_SECURE | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| CORS_ORIGIN | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_ENCRYPT | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_HOST | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_INSTANCE | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_NAME | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_PASSWORD | Configuración específica; consultar el consumidor y las fuentes indicadas | REEMPLAZAR_LOCALMENTE | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_PORT | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_TRUST_SERVER_CERTIFICATE | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| DB_USER | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| JWT_EXPIRATION | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| JWT_SECRET | Firma de tokens | REEMPLAZAR_LOCALMENTE | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| MSSQL_PID | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | .env.sqlserver.local |
| MSSQL_SA_PASSWORD | Configuración específica; consultar el consumidor y las fuentes indicadas | REEMPLAZAR_LOCALMENTE | NO DETERMINADO; verificar modo de ejecución | .env.sqlserver.local |
| NEXT_PUBLIC_API_URL | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | frontend/.env.example, frontend/.env.local |
| NODE_ENV | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| PORT | Puerto de escucha | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| REFRESH_TOKEN_EXPIRATION | Configuración específica; consultar el consumidor y las fuentes indicadas | REEMPLAZAR_LOCALMENTE | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| REFRESH_TOKEN_SECRET | Configuración específica; consultar el consumidor y las fuentes indicadas | REEMPLAZAR_LOCALMENTE | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| SIGBO_API_URL | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | .movile/.env.example |
| SIGBO_DEMO_PASSWORD | Configuración específica; consultar el consumidor y las fuentes indicadas | REEMPLAZAR_LOCALMENTE | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |
| SQLCMDPASSWORD | Configuración específica; consultar el consumidor y las fuentes indicadas | REEMPLAZAR_LOCALMENTE | NO DETERMINADO; verificar modo de ejecución | .env.sqlserver.local |
| SWAGGER_ENABLED | Configuración específica; consultar el consumidor y las fuentes indicadas | NO DETERMINADO | NO DETERMINADO; verificar modo de ejecución | backend/.env, backend/.env.example |

No ejecutar proveedores, pagos, mensajería ni migraciones reales durante una validación documental.
