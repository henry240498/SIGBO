---
id: dependency--nestjs
tipo: DEPENDENCY
nombre: NestJS 10 + TypeORM 0.3
nivel: L1
resumen: Framework del backend. NestJS 10.4 con TypeORM 0.3.20, mssql 11, Passport JWT, class-validator y Swagger.
archivos:
  - backend/package.json
terminos: [nestjs, typeorm, mssql, passport, jwt, swagger, classvalidator, framework, backend, nest, type, orm, class, validator]
---

# NestJS 10 + TypeORM 0.3

Framework del backend. NestJS 10.4 con TypeORM 0.3.20, mssql 11, Passport JWT, class-validator y Swagger.

## Version y piezas en uso

| Paquete | Version | Para que |
|---|---|---|
| `@nestjs/core`, `common`, `platform-express` | ^10.4.15 | Framework |
| `@nestjs/typeorm` + `typeorm` | ^10.0.2 / ^0.3.20 | ORM y repositorios |
| `mssql` | ^11.0.1 | Driver de SQL Server |
| `@nestjs/jwt`, `passport`, `passport-jwt` | ^10.2 / ^0.7 / ^4.0 | Autenticacion |
| `class-validator`, `class-transformer` | ^0.14 / ^0.5 | Validacion de DTOs |
| `@nestjs/swagger` | ^7.4.2 | Documentacion en `/api/docs` |
| `bcryptjs` | ^2.4.3 | Hash de contrasenas |
| `helmet` | ^7.2.0 | Cabeceras de seguridad |
| `typeorm-naming-strategies` | ^4.1.0 | `SnakeNamingStrategy` |

## Generacion de documentos y planillas

`pdfkit` ^0.15.2 (PDF de comunicaciones), `docx` ^9.1.0, `exceljs` ^4.4.0 y
`xlsx` ^0.18.5 (importacion del marcador y exportaciones), `multer` ^1.4.5 (subidas).

## Restricciones que impone

- **TypeORM 0.3** cambio la API respecto de 0.2: `find` recibe `{ where: {} }` y
  `createQueryBuilder` es el camino para consultas complejas. Los ejemplos de 0.2 que
  circulan no compilan.
- **Ninguna entidad usa relaciones del ORM** (`@ManyToOne` y compania): las FKs son
  columnas planas. No existe `relations: ['bombero']` — todo join es explicito. Es la
  particularidad que mas sorprende al escribir un servicio nuevo.
- `reflect-metadata` debe importarse **primero** en `main.ts`, antes de cualquier
  decorador.
- NestJS 10 requiere Node 18+. Ver [[dependency--nodejs]].

## Lo que NO esta instalado

Sin Redis, sin Kafka, sin Elasticsearch, sin MinIO — ver
[[decision--monolito-modular]]. Y **sin framework de pruebas configurado**: no hay
suite de tests en el backend, asi que la verificacion de un cambio es manual o via
Swagger.


## Archivos

- `backend/package.json`

## Referenciado por

- [[decision--monolito-modular|Monolito modular NestJS en vez de microservicios]] `depends_on` →
- [[decision--rate-limit-propio|Rate limiting propio en memoria en vez de @nestjs/throttler]] `depends_on` →

---
<sub>Nodo **curado** (editable a mano).</sub>
