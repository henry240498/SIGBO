---
id: rule--confidencial-lo-decide-la-matriz
tipo: RULE
nombre: Qué información confidencial ve una persona lo decide la matriz de pantallas, en el backend
nivel: L1
dominio: seguridad
resumen: "Dirección exacta, descripción, coordenadas, ubicación y campos confidenciales de formularios solo se envían si PantallasService.permite(..., 'confidencial'); sin reglas rige despacho:confidencial y cada acceso se audita."
severidad: ALTA
archivos:
  - backend/src/modules/pantallas/pantallas.logica.ts
  - backend/src/modules/pantallas/pantallas.service.ts
  - backend/src/modules/despacho/servicio-activo.service.ts
edges:
  - [affects, component--modulo-auth]
  - [belongs_to, domain--seguridad]
terminos: [confidencial, matriz, pantalla, permisos, rango, cargo, rol, usuario, denegar, 0xA006, auditoria, informacion, persona, decide, pantallas, direccion, exacta, descripcion, coordenadas, ubicacion, campos, confidenciales, formularios, solo, envian, permite, reglas, rige, despacho, cada, acceso, audita]
---

# Qué información confidencial ve una persona lo decide la matriz de pantallas, en el backend

Dirección exacta, descripción, coordenadas, ubicación y campos confidenciales de formularios solo se envían si PantallasService.permite(..., 'confidencial'); sin reglas rige despacho:confidencial y cada acceso se audita.

## Invariante

`seguridad.pantalla_permisos` da, por pantalla (`0xA001`…) y por **rol, usuario, rango o cargo**, las columnas ver, crear,
editar, eliminar y confidencial. Se resuelve en el backend (`decidir`):

- La **denegación** de cualquier regla aplicable gana siempre.
- Ver/crear/editar/eliminar: la matriz solo **restringe** (hace falta el permiso por rol Y que una regla lo conceda), así
  que no puede dar más de lo que el endpoint ya exige.
- **Confidencial**: si hay reglas aplicables deciden ellas (pueden conceder o quitar); si no, rige `despacho:confidencial`.
- Una pantalla sin reglas funciona como antes: activar la matriz no rompe lo que ya anda.

Lo confidencial de un servicio: dirección, ciudad, descripción, coordenadas, posición de los móviles y los campos
marcados `confidencial` en los formularios. Lo operativo (que hay un servicio, tipo, estado, cuántas personas y móviles,
quién viene en camino) lo ve cualquier participante.

## Cómo se ve si se rompe

El frontend ocultando algo no es seguridad: la prueba viva (`servicio-vivo.mjs`) comprueba que el bombero recibe `null` en
esos campos y que una regla de denegación le cierra la pantalla con 403. Cada acceso concedido deja
`ACCESO_CONFIDENCIAL` en `logs_auditoria`.

Ver también [[rule--frontend-no-autoriza]].


## Archivos

- `backend/src/modules/pantallas/pantallas.logica.ts`
- `backend/src/modules/pantallas/pantallas.service.ts`
- `backend/src/modules/despacho/servicio-activo.service.ts`

## Relaciones

- `affects` → [[component--modulo-auth|auth (modulo NestJS)]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[workflow--servicio-activo|Servicio activo: incorporarse, comunicarse y completar formularios]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
