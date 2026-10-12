# GRE24-AGENTS — instrucciones permanentes

Estas instrucciones aplican a cualquier agente autorizado que interprete, implemente
o modifiqueGRE/MATPEL/SCI. Leer [índice](index.md) y documentos pertinentes; seguir
fuentes hasta el [PDF](source-of-truth.md). Los mecanismos de entrada del repositorio
enlazan este documento; no suponer que cada proveedor carga automáticamente `.context`.

1. Consultar índice y reglas antes de modificar o emitir una conclusiónGRE.
2. Seguir la regla y su evidencia hasta página original/condiciones.
3. No basarse exclusivamente en resúmenes, extracción, memoria o respuestas previas.
4. Diferenciar fuente literal, interpretación, implementación, hipótesis y pendientes.
5. Conservar todas las condiciones y excepciones pertinentes, incluida incertidumbre.
6. Justificar cada conclusión operativa con id de regla y páginaPDF exacta;
   mencionar página impresa por separado cuando se conozca.
7. Comprobar conflictos con conocimiento y pruebas existentes antes de cambiar código.
8. Actualizar regla/evidencia/implementación/pruebas al descubrir una discrepancia.
9. Conservar documentación detallada válida y hallazgos; no reemplazarla por resúmenes.
10. Informar explícitamente insuficiencia de evidencia/datos; no inventar una solución.

Acceso comprobable por tipo:

| Agente/componente | Mecanismo | Estado |
|---|---|---|
| Terminal/IDE con workspace | LeerAGENTS→índice; Python/PyMuPDF y archivos locales | Lectura realizada en esta misión |
| Claude con workspace | CLAUDE→índice yAGENTS; mismo PDF y evidencias | Referencia integrada; sesiónClaude no ejecutada |
| Revisor multiagente | Hereda workspace; lectura directaPDF/contexto | Reanudado;7casos documentales resueltos y2payloads auditados; comprensión integral pendiente |
| Web sin filesystem | Requiere paquete/API autorizado de conocimiento+fuentes | PENDIENTE; no basta enlazar ruta local |
| Software/MATPEL | Motor único con registros/versiones/fuentes y controles | Consulta local implementada y probada; institucional/SCI pendientes; no ejecutar Markdown como lógica |

Una futura exportación para web debe incluir manifest dehashes, documentos
seleccionados, reglas aplicables y fuente verificable, sin secretos/datos de incidentes.
El consumidor comprobará manifest/versión y declarará lo que no puede consultar.
Hasta implementarla y probarla no afirmar acceso universal.

Al terminar un cambio actualizar [validación](validation-report.md) y [pendientes](open-issues.md),
correr pruebas pertinentes y regenerar/validar grafo si cambia estructura. No usar
aprobación de imports/tests como reemplazo de cotejo institucional ni juicio operativo.
