---
id: rule--api-v1-y-contrato-http
tipo: RULE
nombre: Toda la API vive bajo /api/v1 y el frontend nunca escribe ese prefijo
nivel: L1
<<<<<<< Updated upstream
resumen: setGlobalPrefix('api/v1') en el backend. apiFetch ya incluye el origen y el prefijo, asi que las pantallas pasan rutas relativas como /guardias/grupos.
=======
resumen: setGlobalPrefix('api/v1') en el backend. apiFetch ya incluye el origen y el prefijo, asi que las pantallas pasan rutas relativas como /organizacion/rangos.
>>>>>>> Stashed changes
severidad: ALTA
archivos: [backend/src/main.ts, frontend/src/lib/api.ts]
terminos: [api, v1, prefijo, ruta, apifetch, swagger, puerto, 3001, 3000, cors]
edges:
  - [affects, component--front-api]
---

## El invariante

<<<<<<< Updated upstream
**Backend:** `app.setGlobalPrefix('api/v1')`. Un `@Controller('guardias/grupos')` se
sirve realmente en `/api/v1/guardias/grupos`.

**Frontend:** `apiFetch('/guardias/grupos')` — sin `/api/v1`, sin host. El helper
compone `${API_URL}${path}` donde `API_URL` ya trae el prefijo.

Escribir `apiFetch('/api/v1/guardias/grupos')` produce `/api/v1/api/v1/...` y un 404
confuso.
=======
**Backend:** `app.setGlobalPrefix('api/v1')`. Un `@Controller('organizacion/rangos')`
se sirve realmente en `/api/v1/organizacion/rangos`.

**Frontend:** `apiFetch('/organizacion/rangos')` — sin `/api/v1`, sin host. El helper
compone `${API_URL}${path}` donde `API_URL` ya trae el prefijo.

Escribir `apiFetch('/api/v1/organizacion/rangos')` produce
`/api/v1/api/v1/...` y un 404 confuso.
>>>>>>> Stashed changes

## Puertos y origenes

| Que | Donde |
|---|---|
| Backend | `http://localhost:3001/api/v1` (`PORT`) |
| Swagger | `http://localhost:3001/api/docs` |
| Frontend | `http://localhost:3000` |
| Estaticos subidos | `http://localhost:3001/uploads` (via `API_ORIGIN`) |
| CORS permitido | `CORS_ORIGIN`, default `http://localhost:3000`, con `credentials: true` |

`API_ORIGIN` se deriva quitando `/api/v1` de `API_URL`: es lo que se usa para armar
`src` de imagenes, porque los estaticos **no** estan bajo el prefijo de la API.

<<<<<<< Updated upstream
## Rutas anidadas con parametro

Guardias usa prefijos con parametro en el propio `@Controller`:

```ts
@Controller('guardias/:guardiaId/novedades')
@Controller('guardias/:guardiaId/inspecciones-estacion')
```

El grafo registra el prefijo tal cual (`/api/v1/guardias/:guardiaId/novedades`), asi
que la arista `SCREEN --calls--> API` **no se detecta** para estas rutas: la pantalla
arma la URL interpolando el id. Es un limite conocido del analisis estatico — ver
[[rule--el-grafo-no-es-la-verdad]].

## Swagger esta activo y es la referencia rapida

`http://localhost:3001/api/docs` expone los 55 controladores con `.addBearerAuth()`.
Para saber la forma exacta de un payload suele ser mas rapido que leer los DTOs.

## Al agregar un endpoint

El nodo `API` del grafo lista las rutas con su verbo y el permiso exigido:

```bash
node .context/graph/context.mjs <recurso> --level L2
```
=======
## Swagger esta activo y es la referencia rapida

`http://localhost:3001/api/docs` expone los 49 controladores con
`.addBearerAuth()`. Para saber la forma exacta de un payload suele ser mas rapido que
leer los DTOs.

## Al agregar un endpoint

El nodo `API` del grafo lista las rutas con su verbo y el permiso exigido. Consultar
`node .context/graph/context.mjs <recurso> --level L2` da el contrato completo del
controlador sin abrir el archivo.
>>>>>>> Stashed changes
