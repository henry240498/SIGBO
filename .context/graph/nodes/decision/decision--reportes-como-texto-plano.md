---
id: decision--reportes-como-texto-plano
tipo: DECISION
nombre: Los reportes de errores y sugerencias se guardan como archivos de texto plano en el servidor
nivel: L1
dominio: servicios
estado: VIGENTE
resumen: "POST /reportes escribe un .txt por reporte en backend/storage/reportes; no hay tabla ni pantalla de lectura, a propósito, para que sea simple y revisable con cualquier editor."
archivos:
  - backend/src/modules/reportes/reportes.service.ts
  - backend/src/modules/reportes/reportes.controller.ts
  - database/migrations/087_reportes_permiso.sql
  - .movile/lib/reportes.dart
  - frontend/src/app/dashboard/reportar/page.tsx
edges:
  - [constrains, component--modulo-app-movil]
  - [belongs_to, domain--servicios]
terminos: [reportes, bug, sugerencia, mejora, buzon, texto plano, txt, feedback, storage, reportar, errores, sugerencias, guardan, archivos, texto, plano, servidor, post, escribe, reporte, hay, tabla, pantalla, lectura, proposito, sea, simple, revisable, cualquier, editor]
---

# Los reportes de errores y sugerencias se guardan como archivos de texto plano en el servidor

POST /reportes escribe un .txt por reporte en backend/storage/reportes; no hay tabla ni pantalla de lectura, a propósito, para que sea simple y revisable con cualquier editor.

## Decisión

Se pidió un apartado **simple** para que quienes prueben el sistema (web y app) dejen errores
y sugerencias, guardados **en texto plano en una carpeta del servidor**. Cada reporte es un
archivo `AAAAMMDD_HHMMSS_TIPO_<id>.txt` en `backend/storage/reportes/` (o `REPORTES_DIR`).

Contenido: id, tipo (`ERROR`/`SUGERENCIA`/`OTRO`), origen (`APP_MOVIL`/`WEB`), hora escrita y
recibida (UTC), usuario, pantalla, versión, dispositivo, título y mensaje.

## Por qué así

- Se lee con cualquier editor, se copia, se adjunta a un correo o se pasa a un agente sin
  consultar la base.
- No agrega tablas ni migraciones de esquema (la 087 solo siembra el permiso).
- `backend/storage/` está en `.gitignore`, así que el texto de las personas no llega al repo.

## Garantías

- El nombre del archivo lo arma el servidor; nada de lo que escribe la persona entra a la ruta.
- `flag: 'wx'`: nunca pisa un archivo; el id del cliente hace idempotente el reenvío sin conexión.
- Se limpian caracteres de control y se acotan los largos; la hora declarada se acota con
  [[rule--hora-del-hecho-acotada]]; límite de 30 por hora y persona.
- Permiso `reportes:enviar` ([[rule--todo-endpoint-mutante-con-permiso]]).

## Costo aceptado

- No hay pantalla para **leer** los reportes ni para marcarlos como resueltos: se revisan en la
  carpeta. Si el volumen crece, habrá que pasar a una tabla.
- El permiso se asignó a los roles que existían al migrar; un rol nuevo no lo tiene.
- Sin copia de seguridad automática: `backend/storage` no entra en el respaldo de la base.


## Archivos

- `backend/src/modules/reportes/reportes.service.ts`
- `backend/src/modules/reportes/reportes.controller.ts`
- `database/migrations/087_reportes_permiso.sql`
- `.movile/lib/reportes.dart`
- `frontend/src/app/dashboard/reportar/page.tsx`

## Relaciones

- `constrains` → [[component--modulo-app-movil|app-movil (modulo NestJS)]]
- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo **curado** (editable a mano).</sub>
