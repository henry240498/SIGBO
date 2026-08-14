---
id: error--413-croquis-grande
tipo: ERROR
nombre: 413 Payload Too Large al guardar una comunicacion con croquis
nivel: L2
dominio: servicios
resumen: "El croquis viaja como PNG en base64 dentro del JSON. Con el limite por defecto de Express (100 KB) el guardado falla; por eso el limite esta en 8 MB."
severidad: MEDIA
archivos:
  - backend/src/main.ts
edges:
  - [originates_from, configuration--conexion-datos]
  - [belongs_to, domain--servicios]
terminos: [413, payload, large, croquis, png, base64, limite, bodyparser, 8mb, guardar, too, comunicacion, viaja, dentro, json, defecto, express, 100, guardado, falla, eso, esta]
---

# 413 Payload Too Large al guardar una comunicacion con croquis

El croquis viaja como PNG en base64 dentro del JSON. Con el limite por defecto de Express (100 KB) el guardado falla; por eso el limite esta en 8 MB.

## Sintoma

Guardar una comunicacion de servicio devuelve **413** o falla sin llegar al
<<<<<<< Updated upstream
controlador. Las comunicaciones sin croquis, o con un croquis simple, guardan bien:
solo fallan las escenas dibujadas con detalle.
=======
controlador. Las comunicaciones sin croquis, o con un croquis simple, guardan bien: solo
fallan las escenas dibujadas con detalle.
>>>>>>> Stashed changes

## Causa

El croquis se serializa como PNG en base64 **dentro** del JSON de `datos`. Base64 infla
~33% sobre el binario, asi que una escena real supera con facilidad los 100 KB que
Express acepta por defecto.

## Mitigacion aplicada

```ts
app.useBodyParser('json', { limit: '8mb' });
app.useBodyParser('urlencoded', { extended: true, limit: '8mb' });
```

Ver [[decision--body-parser-8mb]].

## Si vuelve a aparecer con el limite en 8 MB

Subir el limite otra vez es el camino equivocado. El problema de fondo es que la imagen
viaja embebida en el documento:

- Cada guardado retransmite el croquis completo, aunque no haya cambiado.
- El PNG en base64 se guarda dentro de `NVARCHAR(MAX)`, engordando cada fila.
- Todo lector del formulario paga el costo de leer la imagen.

La solucion estructural es subir el croquis como archivo a `/uploads` y guardar solo la
referencia en el JSON. La infraestructura ya existe (`multer` en las dependencias,
estaticos servidos desde `/uploads`). Ver [[decision--comunicacion-como-json]].


## Archivos

- `backend/src/main.ts`

## Relaciones

- `originates_from` → [[configuration--conexion-datos|Conexion a SQL Server (TypeORM)]]
- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo **curado** (editable a mano).</sub>
