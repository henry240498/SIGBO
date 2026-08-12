---
id: decision--body-parser-8mb
tipo: DECISION
nombre: Body parser de 8 MB y CORS permisivo para recursos, por el croquis embebido
nivel: L2
dominio: servicios
estado: VIGENTE
resumen: El limite de JSON se subio de 100 KB a 8 MB porque el croquis viaja en base64, y crossOriginResourcePolicy se puso en cross-origin para que el frontend cargue imagenes del backend.
archivos:
  - backend/src/main.ts
edges:
  - [configured_by, configuration--conexion-datos]
  - [belongs_to, domain--servicios]
terminos: [bodyparser, limite, 8mb, croquis, base64, cors, helmet, imagenes, uploads, body, parser, permisivo, recursos, embebido, json, subio, 100, porque, viaja, cross, origin, resource, policy, puso, cargue]
---

# Body parser de 8 MB y CORS permisivo para recursos, por el croquis embebido

El limite de JSON se subio de 100 KB a 8 MB porque el croquis viaja en base64, y crossOriginResourcePolicy se puso en cross-origin para que el frontend cargue imagenes del backend.

## Dos ajustes de `main.ts`, misma causa raiz

### 1. Limite del body

```ts
app.useBodyParser('json', { limit: '8mb' });
app.useBodyParser('urlencoded', { extended: true, limit: '8mb' });
```

El croquis de una comunicacion viaja como PNG codificado en base64 dentro del JSON.
El limite por defecto de Express (100 KB) no alcanza para una escena real. Ver
[[decision--comunicacion-como-json]] y [[error--413-croquis-grande]].

### 2. Politica de recursos cruzados

```ts
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
```

El frontend corre en el puerto 3000 y necesita cargar `<img>` servidas por el
backend en 3001 desde `/uploads`. El default de Helmet (`same-origin`) las bloquea.

## Consecuencia de seguridad a tener presente

Aflojar `crossOriginResourcePolicy` es aceptable mientras `/uploads` sirva solo
material institucional publico. Si alguna vez se sirven documentos sensibles desde
esa ruta, este ajuste hay que revisarlo: hoy `/uploads` se expone como estatico
**sin pasar por el guard de permisos**.


## Archivos

- `backend/src/main.ts`

## Relaciones

- `configured_by` → [[configuration--conexion-datos|Conexion a SQL Server (TypeORM)]]
- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo **curado** (editable a mano).</sub>
