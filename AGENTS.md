<<<<<<< Updated upstream
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
=======
# Reglas permanentes de desarrollo de SIGBO

Estas reglas se aplican a todo cambio futuro del repositorio.

## Recuperación de contexto

- Antes de explorar un módulo completo, consultar `node .context/graph/context.mjs <términos> --level L2`.
- Usar `--archivo` o `--tabla` para evaluar impacto antes de modificar código o esquema.
- El grafo es un índice; ante discrepancias prevalecen el código, las migraciones aplicadas y la documentación oficial.
- Regenerar con `build-graph.mjs` cuando cambien entidades, tablas, controladores, pantallas, módulos o decisiones estructurales; después ejecutar `validar.mjs`.

## No negociables

- Preservar datos y cambios existentes. Toda modificación de esquema debe ser específica, idempotente, verificable y reversible cuando corresponda.
- No modificar el login, identidad institucional, permisos ni módulos fuera del alcance solicitado.
- No crear datos, imágenes, integraciones o capacidades simuladas. Los estados sin datos deben ser explícitos.
- No exponer secretos, contraseñas, tokens ni información sensible en frontend, logs, URLs o respuestas públicas.
- Validar autorización y datos en backend; la validación del frontend es solo una ayuda de uso.
- Mantener separación entre UI, dominio, persistencia y servicios externos.

## Web y accesibilidad

- Usar HTML semántico, un solo `h1`, jerarquía de títulos, `label` asociado y listas/tablas correctas.
- Toda imagen informativa requiere `alt`; lo decorativo debe quedar oculto para tecnologías asistivas.
- Todo control debe funcionar con teclado, tener foco visible y área táctil suficiente.
- Modales y paneles deben mover/atrapar/restaurar foco, cerrar con Escape y anunciarse correctamente.
- No transmitir información únicamente mediante color. Mantener contraste WCAG AA y respetar reducción de movimiento, zoom y alto contraste.
- Estados dinámicos usan `role="status"`, `role="alert"` o regiones vivas según corresponda.
- No usar placeholders como sustituto de etiquetas ni `alert()` para feedback de aplicación.

## React y frontend

- Tipar respuestas y estados; evitar `any`, mutaciones, keys inestables, efectos sin limpieza y peticiones sin comprobar `response.ok`.
- Representar siempre carga, error, vacío y éxito. Evitar doble envío y conservar datos tras errores recuperables.
- Centralizar acceso a API, codificar parámetros con `URLSearchParams` y cancelar peticiones cuando sea relevante.
- Preferir clases reutilizables a estilos en línea nuevos. Usar Grid/Flexbox, unidades relativas y diseño responsive.
- No usar `dangerouslySetInnerHTML` con contenido no saneado.

## Seguridad, rendimiento y calidad

- Archivos: validar tipo real, tamaño, nombre, autorización y almacenamiento; nunca confiar solo en `accept`.
- Enlaces externos con nueva pestaña requieren `rel="noopener noreferrer"`.
- Mantener CSP/Helmet, CORS restringido, rate limiting donde corresponda y auditoría de acciones sensibles.
- Paginar consultas grandes, evitar N+1 y cálculos completos repetidos; medir antes de optimizar.
- Cada entrega debe pasar compilación de backend/frontend, `git diff --check`, migraciones aplicables y pruebas proporcionales al riesgo.
- Documentar decisiones, limitaciones e infraestructura pendiente en `docs/MEJORAS_CONTINUAS.md`.
>>>>>>> Stashed changes
