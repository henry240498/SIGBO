# Documentos: numeración institucional, previsualización y eliminación

Continuidad de la implementación pedida en "SIGBO — AJUSTES Y CORRECCIONES DEL MÓDULO
DOCUMENTOS" (18 secciones). Cubre qué se construyó, qué se verificó en vivo y qué queda
pendiente si una sesión futura retoma este trabajo.

## Qué existía antes de este cambio

- `documentos.numeraciones` (migración 052) ya tenía un correlativo por
  `tipo_documento_id + anio (+institucion_id)`, pero solo con `ultimo_numero`: sin mes,
  sin vigencia, sin auditoría propia, y `siguienteNumero()` **consumía el número apenas
  se llamaba** (no había forma de "espiar" sin gastar).
- El backend de Documentos ya tenía `DELETE /:id` (eliminación lógica → archiva +
  audita `ELIMINACION_LOGICA`, nunca borra el archivo) y la función
  `eliminarDocumento()` en `lib/documentos.ts` — **ninguno de los dos estaba conectado a
  un botón**. Era una brecha de frontend, no de backend.
- `GET /:id/archivo` solo servía con `Content-Disposition: attachment` (`res.download`);
  no existía ruta de vista previa.
- Los logos institucionales **ya se renderizaban correctamente** en los PDF generados
  desde plantilla (`plantillas.service.ts` → `resolverEncabezadoInstitucional()` →
  `generarDocumentoPlantillaPdf()`). Se verificó generando un documento real y leyendo
  el PDF resultante: ambos logos aparecen. La causa más probable del reporte original es
  que el usuario miraba un documento generado **antes** de configurar los logos (son
  subidos el mismo día del reporte) — un PDF ya generado es una foto fija, no se
  actualiza retroactivamente si después se cambia el membrete.
- El formato de número era `"47/2026"` (número/año); el pedido pide `"2026/47"`
  (año/número).
- No había restricción de unicidad en base para `numero_documental`: dos documentos del
  mismo tipo podían terminar con el mismo número sin que nada lo impidiera.

## Qué se construyó

**Migración `069_documentos_numeracion_avanzada.sql`**
- Agrega a `documentos.numeraciones`: `mes_actual`, `anio_desde/mes_desde/numero_desde`,
  `anio_hasta/mes_hasta/numero_hasta`, `fecha_vigencia_desde/hasta`,
  `creado_en/creado_por/actualizado_en/actualizado_por` (con FK a `seguridad.usuarios`).
  `anio`/`ultimo_numero` siguen siendo la posición vigente ("año actual"/"número
  actual"); no se renombraron para no romper el código que ya los leía.
- Índice único filtrado `UQ_doci_tipo_numero` en
  `documentos.documentos_institucionales(tipo_documento_id, numero_documental)` con
  `WHERE numero_documental IS NOT NULL` (SQL Server solo permite un NULL por índice
  único no filtrado, y la mayoría de documentos físicos/sin numerar tienen
  `numero_documental = NULL`).

**Backend (`documentos.service.ts` / `documentos.controller.ts`)**
- `siguienteNumero()` ahora devuelve `"${anio}/${numero}"` (consume, igual que antes).
- `previsualizarSiguienteNumero()` (nuevo): misma cuenta, **sin incrementar** — no crea
  fila si no existe. `GET /documentos/numeraciones/:tipoDocumentoId/siguiente?anio=`,
  permiso `documentos:crear`.
- `listarNumeraciones()` / `guardarNumeracion()` (upsert por tipo+año, nunca borra
  historial, audita `CREAR_NUMERACION`/`EDITAR_NUMERACION` con antes/después vía
  `AuditoriaService` — sin tabla de auditoría propia). `GET`/`PUT
  /documentos/numeraciones`, permiso `organizacion:documentos_configurar` (el mismo que
  ya protegía esa pantalla; no se creó un permiso nuevo).
- `crear()` atrapa la violación del índice único (SQL Server 2601/2627) y la traduce a
  `409 Conflict` con mensaje legible en vez de un 500 crudo.
- `GET /:id/vista-previa` (nuevo): mismo chequeo de permisos/confidencialidad que
  `descargar()`, `Content-Disposition: inline`, solo PDF/PNG/JPG (`MIME_PREVISUALIZABLE`
  en el controller); otros formatos responden `415` para que el frontend ofrezca
  descargar. Permiso `documentos:ver` (más permisivo que `documentos:descargar` a
  propósito — previsualizar es "ver", no "llevarse el archivo").

**Frontend**
- `frontend/src/app/dashboard/organizacion/documentos/page.tsx`: nueva sección
  "Numeración de documentos" (tabla + alta/edición) debajo de la configuración de
  identidad institucional existente, gateada por `organizacion:documentos_configurar`.
- `frontend/src/app/dashboard/documentos/listado/page.tsx`: el checkbox "Numerar
  automáticamente" se reemplazó por un campo de número editable, prellenado con la
  sugerencia (`previsualizarSiguienteNumero`). Aceptarlo tal cual → `autoNumerar: true`
  (consume). Editarlo o borrarlo → número manual o documento sin numerar (nunca toca el
  contador). Columna nueva con botón "👁 Ver" que abre el visor sin navegar.
- `frontend/src/components/VisorDocumento.tsx` (nuevo): modal que trae el archivo como
  blob autenticado y lo muestra embebido (`<iframe>` para PDF, `<img>` para imágenes);
  formatos no soportados muestran un aviso y el botón Descargar sigue disponible en el
  mismo modal. Se usa desde el listado y desde la ficha.
- `frontend/src/app/dashboard/documentos/[id]/page.tsx`: botones "👁 Previsualizar" (sin
  permiso extra más allá de `documentos:ver`, que la página ya exige) y "🗑 Eliminar"
  (permiso `documentos:eliminar`, ya existía en base de datos y en `lib/documentos.ts`
  pero no estaba conectado a ningún botón).

## Verificado en vivo (los 7 casos del pedido)

Contra el backend real (`node -e "fetch(...)"`, nunca `curl -d` con texto acentuado —
ver nota de metodología abajo), usuario `admin`:

1. Config Resolución 2026 número actual = 46 → sugerencia = `2026/47`. Confirmado, y
   confirmado que **espiar la sugerencia 3 veces seguidas no la mueve** (sigue en 47
   hasta que un documento la consume de verdad).
2. Aceptar 47 (crear documento con `autoNumerar: true`) → próxima sugerencia = `2026/48`.
   Confirmado.
3. `GET /:id/vista-previa` responde `200`, `Content-Type: application/pdf`,
   `Content-Disposition: inline`. Confirmado.
4. Documento generado desde plantilla, descargado y leído: aparecen logo izquierdo,
   logo derecho, membrete completo y `N.° 2026/48` con el formato correcto. Confirmado
   visualmente (no solo por código).
5. Crear un documento con `numeroDocumental: "2026/47"` manual (ya usado) → `409
   Conflict` con mensaje explicando el número duplicado. Confirmado.
6. `DELETE /:id` → `200 { eliminado: true }`, y `GET /:id/auditoria` incluye
   `ELIMINACION_LOGICA`. Confirmado.
7. Usuario `bombero` (solo `documentos:ver` + `documentos:descargar`): puede listar y
   previsualizar (`200`); **no** puede crear, eliminar, ni ver/editar la numeración
   (`403` en los cuatro casos). Confirmado.

**Limpieza post-prueba**: las pruebas 1-2 y 4-6 consumieron números reales del
numerador Resolución/2026 (que ya tenía `ultimoNumero=1` de uso previo). Se restauró a
`1` vía `guardarNumeracion()` (auditado como `EDITAR_NUMERACION`) y se borraron
físicamente los documentos/plantilla creados solo para la prueba (`DELETE` directo en
SQL, no vía la API — estos eran registros de prueba míos, no institucionales reales, así
que no aplica la regla de "nunca borrar documentos históricos"). El sistema queda en el
mismo estado numérico en que estaba antes de esta sesión de pruebas.

## Pendiente / fuera de alcance de esta sesión

- **Word/Excel no tienen vista previa embebida.** No hay motor de conversión a PDF
  disponible en este entorno (se verificó: no hay LibreOffice/`soffice` instalado). El
  visor detecta la extensión y ofrece descargar en vez de simular un iframe que el
  navegador no va a poder mostrar. Si en algún momento se instala LibreOffice en el
  servidor, `documentos.controller.ts` (`MIME_PREVISUALIZABLE`) y `VisorDocumento.tsx`
  (`EXTENSIONES_PREVISUALIZABLES`) son los dos puntos a extender con una conversión
  `soffice --headless --convert-to pdf` a un archivo temporal (nunca al original).
- **`/uploads/*` se sirve sin autenticación** (`app.useStaticAssets`, `main.ts`) — esto
  es anterior a este cambio y afecta a *todo* el proyecto (logos, firmas, fotos,
  documentos), no algo que esta tarea haya introducido. La vista previa nueva **no**
  depende de esa ruta pública (usa el endpoint autenticado `/documentos/:id/vista-previa`
  con el mismo chequeo de confidencialidad que `descargar()`), pero un documento
  `Restringido`/`Confidencial` sigue siendo técnicamente alcanzable si alguien adivina
  la URL hasheada de `/uploads/documentos/...`. No se tocó porque es un patrón
  arquitectónico usado en todo el sistema y cambiarlo excede el pedido ("sin alterar
  funcionalidades que ya funcionan correctamente en otros módulos").
- **Resolución de vigencia por fecha** (sección 12 del pedido): las columnas
  `fecha_vigencia_desde/hasta` existen y se pueden cargar desde la nueva pantalla, pero
  `siguienteNumero()`/`previsualizarSiguienteNumero()` siguen resolviendo por
  `tipo+año` explícito (el que ya se pasa desde el frontend), no auto-seleccionan entre
  configuraciones solapadas por fecha. Para el caso de uso descrito (Resolución 2026 vs
  Resolución 2027, cada una con su propio año) esto ya alcanza; si en el futuro se
  necesita que el sistema decida solo "qué numeración aplica hoy" entre configuraciones
  del mismo año con vigencias distintas, ahí sí hace falta esa lógica adicional.
- El listado de Documentos no tiene todavía columnas de "Editar"/"Descargar" como
  botones de grilla (sección 15 pedía los cuatro iconos en la grilla); quedó "👁 Ver" en
  la grilla y el resto de acciones (editar datos, descargar, anular, archivar, eliminar)
  en la ficha del documento, que ya las tenía casi todas antes de este cambio.

## Adenda: cierre del visor y alineación del título (post-entrega)

Tras la entrega inicial, feedback en vivo sobre el módulo ya desplegado detectó dos
problemas más, corregidos en la misma sesión:

- **Modal de previsualización sin forma de cerrar**: el botón "Cerrar" vivía solo
  dentro del header de la tarjeta, junto al `<iframe>` del PDF. En un layout flex
  anidado, un iframe hijo puede crecer más allá de la caja que le corresponde si al
  contenedor `flex:1` le falta `min-height: 0` — eso probablemente empujaba el header
  fuera del área visible. Se corrigió agregando `minHeight: 0` al contenedor, y sobre
  todo agregando **tres formas independientes de cerrar** que no dependen de dónde
  termine posicionado el header: un botón ✕ flotante fijo en la esquina superior
  derecha de la pantalla (fuera de la tarjeta, z-index alto), tecla **Escape**, y click
  en el fondo oscuro. `frontend/src/components/VisorDocumento.tsx`.
- **Título/número/fecha no quedaba centrado**: `encabezadoInstitucional()` en
  `reporte-documento-plantilla-pdf.ts` posiciona el nombre institucional y las líneas
  destacadas con un `x` explícito (`xCentro = MARGEN + 58`, para esquivar los logos).
  pdfkit deja `doc.x` en ese valor después de un `.text()` con posición explícita, y el
  bloque título/número/fecha de abajo lo heredaba (no pasaba su propio `x`), quedando
  centrado respecto de una caja angosta corrida a la derecha en vez de la página
  completa. Se corrigió reseteando `doc.x = MARGEN` y pasando `x`/`width` explícitos a
  esas tres líneas.
- **Nueva configuración**: alineación del título (Izquierda/Centro/Derecha),
  `organizacion.identidad_institucional.alineacion_titulo` (migración `070`, default
  `CENTRO`), editable en Organización Institucional → Configuración de Documentos →
  "Título del documento". Es una configuración global (no por plantilla/documento) —
  mismo criterio que logos y pie de página: un solo lugar para toda la identidad
  documental, no un ajuste por módulo. Verificado generando un PDF real en cada una de
  las 3 alineaciones.

## Nota de metodología (para la próxima sesión)

`curl -d` en Git Bash rompe caracteres acentuados en JSON — usar siempre
`node -e "fetch(...)"` para probar la API con texto en español. `start-sigbo.ps1`
siempre compila y sirve en modo producción (`npm run build` + `npm start`/`node
dist/main.js`); un cambio de código no se refleja hasta correr ese script de nuevo — no
alcanza con guardar el archivo.
