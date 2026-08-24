---
id: dependency--nestjs
tipo: DEPENDENCY
nombre: NestJS 11 + TypeORM 0.3
nivel: L1
resumen: Framework del backend. NestJS 11 con TypeORM 0.3.20, mssql 11, Passport JWT, class-validator, Swagger y pruebas Jest.
archivos: [backend/package.json]
terminos: [nestjs, typeorm, mssql, passport, jwt, swagger, classvalidator, framework, backend]
---

## Version y piezas en uso

| Paquete | Version | Para que |
|---|---|---|
| `@nestjs/core`, `common`, `platform-express` | ^11.2.1 | Framework |
| `@nestjs/typeorm` + `typeorm` | ^11.0.3 / ^0.3.20 | ORM y repositorios |
| `mssql` | ^11.0.1 | Driver de SQL Server |
| `@nestjs/jwt`, `passport`, `passport-jwt` | ^11.0.2 / ^0.7 / ^4.0 | Autenticacion |
| `class-validator`, `class-transformer` | ^0.14 / ^0.5 | Validacion de DTOs |
| `@nestjs/swagger` | ^11.4.7 | Documentacion en `/api/docs` |
| `bcryptjs` | ^2.4.3 | Hash de contrasenas |
| `helmet` | ^7.2.0 | Cabeceras de seguridad |
| `typeorm-naming-strategies` | ^4.1.0 | `SnakeNamingStrategy` |

## Generacion de documentos y planillas

`pdfkit` ^0.15.2 (PDF de comunicaciones), `docx` ^9.1.0 y `exceljs` ^4.4.0
(importacion del marcador y exportaciones), `multer` 2.2.0 (subidas). No se usa
`xlsx`.

## Restricciones que impone

- **TypeORM 0.3** cambio la API respecto de 0.2: `find` recibe `{ where: {} }` y
  `createQueryBuilder` es el camino para consultas complejas. Los ejemplos de 0.2 que
  circulan no compilan.
- **Ninguna entidad usa relaciones del ORM** (`@ManyToOne` y compania): las FKs son
  columnas planas. No existe `relations: ['bombero']` — todo join es explicito. Es la
  particularidad que mas sorprende al escribir un servicio nuevo.
- `reflect-metadata` debe importarse **primero** en `main.ts`, antes de cualquier
  decorador.
- NestJS 11 se ejecuta con Node 20 o posterior. Ver [[dependency--nodejs]].

## Lo que NO esta instalado

Sin Redis, sin Kafka, sin Elasticsearch ni MinIO — ver
[[decision--monolito-modular]]. El backend usa Jest con `ts-jest`; CI ejecuta
`npm run test:ci` además de compilar y auditar dependencias.
