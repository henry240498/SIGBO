---
id: rule--cedula-y-numero-bombero-unicos
tipo: RULE
nombre: Cedula y numero de bombero son unicos en toda la institucion
nivel: L2
resumen: La BD impone UQ_bomberos_cedula y UQ_bomberos_numero. Ninguna persona puede repetir cedula ni numero de bombero, ni siquiera si esta de baja.
severidad: ALTA
dominio: personal
archivos: [database/migrations/003_personal.sql, backend/src/modules/personal/bomberos.service.ts]
terminos: [cedula, numero, bombero, unico, duplicado, identidad, baja]
edges:
  - [affects, table--personal-bomberos]
  - [affects, entity--bombero]
---

## El invariante

```sql
CONSTRAINT UQ_bomberos_cedula UNIQUE (cedula),
CONSTRAINT UQ_bomberos_numero UNIQUE (numero_bombero),
```

## Lo que esto implica al programar

- La unicidad **no se limita a los activos**. Una persona dada de baja sigue
  ocupando su cedula y su numero. Reincorporar a alguien es actualizar su fila
  existente, no crear una nueva.
- El servicio debe validar antes de insertar y devolver un error legible; si se
  confia solo en el constraint, el usuario recibe un error crudo de SQL Server en
  vez de "esa cedula ya esta registrada".
- Los dos constraints son independientes: se puede chocar con uno y no con el otro.
  El mensaje de error tiene que decir **cual** de los dos fallo.

## Relacionado

`personal.historial_codigo` guarda los codigos que una persona tuvo antes. Al cambiar
el numero de bombero de alguien, ese historial es lo que permite encontrarlo por su
codigo antiguo — importante porque el marcador biometrico importa por codigo
(ver [[workflow--importacion-marcador]]).

Ver tambien [[rule--reglas-duplicadas-bd-y-codigo]].
