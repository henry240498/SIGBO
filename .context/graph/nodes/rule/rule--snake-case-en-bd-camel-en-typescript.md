---
id: rule--snake-case-en-bd-camel-en-typescript
tipo: RULE
nombre: snake_case en la base, camelCase en TypeScript, traducido por SnakeNamingStrategy
nivel: L2
resumen: "SnakeNamingStrategy convierte automaticamente los nombres. Escribir @Column({ name }) a mano solo hace falta cuando el nombre real se aparta de esa conversion."
severidad: MEDIA
archivos:
  - backend/src/core/database/data-source-options.ts
edges:
  - [configured_by, configuration--conexion-datos]
terminos: [snake, camel, naming, strategy, columna, nombre, convencion, plural, case, base, type, script, traducido, convierte, automaticamente, nombres, escribir, column, name, mano, solo, hace, falta, cuando, real, aparta, esa, conversion]
---

# snake_case en la base, camelCase en TypeScript, traducido por SnakeNamingStrategy

SnakeNamingStrategy convierte automaticamente los nombres. Escribir @Column({ name }) a mano solo hace falta cuando el nombre real se aparta de esa conversion.

## El invariante

```ts
namingStrategy: new SnakeNamingStrategy()
```

`numeroBombero` ↔ `numero_bombero`. `fechaExpiracion` ↔ `fecha_expiracion`.
Automatico, sin anotacion.

## Cuando SI hace falta `name` explicito

Cuando el nombre en la base no es la conversion directa. En este repositorio se usa
sistematicamente en los timestamps porque el patron es fijo:

```ts
@CreateDateColumn({ name: 'creado_en', type: 'datetimeoffset', precision: 3 })
creadoEn: Date;

@UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
actualizadoEn: Date;
```

## Convenciones de nombres de tabla

Los nombres de tabla son **explicitos** en cada entidad, no derivados de la clase:

```ts
@Entity({ name: 'grupos_guardia', schema: 'operaciones' })
```

Y son **plurales** en su mayoria (`bomberos`, `roles`, `guardias`, `pernoctes`,
`novedades_guardia`, `inspecciones_estacion`, `requisitos_rol_guardia`), con
excepciones deliberadas en singular para tablas de condicion
(`condicion_combatiente`, `condicion_honorario`, `condicion_apoyo_economico`,
`condicion_incorporado`, `actividad_profesional`, `personal_servicio`,
`historial_codigo`).

Al agregar una tabla: mirar como se llama su vecina en el mismo esquema y seguir ese
patron, en vez de aplicar una regla general que el repositorio no cumple del todo.

Y **cuidado con el esquema**: las tablas de guardias van en `operaciones`, no en un
esquema `guardias` — ver [[rule--guardias-vive-en-operaciones]].

## Columnas de auditoria

El patron repetido es `creado_en`, `actualizado_en`, `creado_por`, `actualizado_por`.
Las de `_por` son `UNIQUEIDENTIFIER NULL` apuntando a `seguridad.usuarios`, en general
**sin** llave foranea declarada.


## Archivos

- `backend/src/core/database/data-source-options.ts`

## Relaciones

- `configured_by` → [[configuration--conexion-datos|Conexion a SQL Server (TypeORM)]]

---
<sub>Nodo **curado** (editable a mano).</sub>
