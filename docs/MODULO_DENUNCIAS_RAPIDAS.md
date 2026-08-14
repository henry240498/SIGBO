# Módulo de Denuncias Rápidas

## Propósito y alcance

El módulo permite a una persona, con o sin sesión, registrar una denuncia mediante
texto breve o audio. Está integrado con Servicios, Vehículos, Usuarios, Permisos y el
registro central de auditoría. Es un canal de recepción y gestión: no determina por sí
solo responsabilidad ni sustituye un procedimiento disciplinario o una resolución de la
autoridad competente.

## Persistencia

La migración `031_denuncias_rapidas.sql` crea el esquema `denuncias`:

- `categorias_denuncia`: catálogo activo y ordenable; no está fijado en el frontend.
- `denuncias`: datos aportados, vínculo opcional a servicio/móvil, datos técnicos
  mínimos, usuario autenticado si existe, estado y código de seguimiento.
- `historial_estados_denuncia`: registro inmutable de recepción, asignación y cambios de
  estado.
- `evidencias_denuncia`: metadatos, hash y referencia de audio/evidencias privadas.

El código público tiene formato `DEN-año-correlativo` y se genera en el servidor usando
una secuencia SQL. La clave UUID de idempotencia evita duplicados por doble toque,
reintento de red o reenvío accidental.

## API

| Ruta | Acceso | Uso |
|---|---|---|
| `GET /denuncias/publicas/categorias` | Público | Categorías activas. |
| `GET /denuncias/publicas/servicios` | Público | Búsqueda limitada de servicios recientes con datos operativos mínimos. |
| `POST /denuncias/publicas` | Público / sesión opcional | Registra texto, audio, ubicación y evidencias multipart. |
| `GET /denuncias` y `GET /denuncias/:id` | `denuncias:ver` | Panel y detalle interno. |
| `PATCH /denuncias/:id/estado` | `denuncias:gestionar` / `denuncias:cerrar` | Cambio de estado con historial. |
| `POST /denuncias/:id/asignar` | `denuncias:asignar` | Asigna responsable. |
| `GET /denuncias/:id/archivos/:archivoId` | `denuncias:ver` | Descarga privada autorizada. |

## Seguridad, privacidad y archivos

- Nombre, celular, categoría y una explicación por texto o audio son los únicos datos
  necesarios del formulario rápido.
- El teléfono paraguayo se normaliza como `+595...`.
- La ubicación es opcional; se solicita solo por acción explícita. Si se comparte se
  conserva latitud, longitud, precisión y hora de captura del servidor.
- IP, agente de usuario y tipo de dispositivo se capturan en backend. Solo el permiso
  `denuncias:ver_datos_tecnicos` los expone en el detalle.
- El backend no confía en extensiones: valida firmas de WebM, Ogg, WAV, MP4, JPEG, PNG,
  WebP y PDF. El grabador limita la captura a 120 segundos y el backend rechaza la
  duración declarada fuera de ese rango; el audio admite hasta 10 MB y las evidencias
  hasta tres archivos de 5 MB.
- Los archivos se almacenan en `private_uploads/denuncias`, fuera de la carpeta pública
  `uploads/`, y se sirven únicamente mediante el endpoint autorizado.
- El límite público es de diez envíos por IP por hora. La cabecera de proxy solo se toma
  en cuenta si `TRUST_PROXY=true` fue configurado explícitamente.

## Estados y permisos

Estados: `NUEVA`, `EN_REVISION`, `ASIGNADA`, `EN_INVESTIGACION`, `RESUELTA`,
`CERRADA`, `DESCARTADA` y `DUPLICADA`. Las transiciones se validan en backend y los
estados de decisión requieren comentario.

Permisos: `denuncias:ver`, `denuncias:gestionar`, `denuncias:asignar`,
`denuncias:cerrar`, `denuncias:ver_datos_tecnicos` y
`denuncias:configurar_categorias`. El rol Administrador General los recibe mediante la
migración; los demás roles se configuran desde el motor de permisos existente.

## Interfaz

- `/denuncias`: formulario público responsive, audio mediante `MediaRecorder`, GPS
  opcional, servicio/móvil progresivos y confirmación con código de seguimiento.
- `/dashboard/denuncias`: panel interno con indicadores, búsqueda y filtro de estado.
- `/dashboard/denuncias/[id]`: detalle, evidencias privadas, datos técnicos autorizados
  e historial.

## Verificación realizada

- Migración 031 aplicada en la base local.
- Endpoint de categorías consultado contra la base real.
- Pruebas unitarias de teléfono, explicación, audio, GPS, firma de archivo e
  idempotencia.
- Compilación de backend y frontend, auditoría de accesibilidad y validación del grafo.
