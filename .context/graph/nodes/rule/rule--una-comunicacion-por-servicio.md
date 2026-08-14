---
id: rule--una-comunicacion-por-servicio
tipo: RULE
nombre: Un servicio tiene como maximo una comunicacion, y borrar el servicio la borra
nivel: L2
dominio: servicios
resumen: UQ_comunicaciones_servicio_servicio impone 1:1. La FK va con ON DELETE CASCADE, asi que eliminar el servicio elimina el formulario sin aviso.
severidad: ALTA
archivos:
  - database/migrations/017_comunicaciones_servicio.sql
edges:
  - [affects, table--servicios-comunicaciones-servicio]
  - [affects, entity--comunicacion-servicio]
  - [belongs_to, domain--servicios]
terminos: [comunicacion, servicio, unico, cascade, borrado, uno, formulario, tiene, maximo, borrar, borra, comunicaciones, impone, delete, asi, eliminar, elimina, aviso]
---

# Un servicio tiene como maximo una comunicacion, y borrar el servicio la borra

UQ_comunicaciones_servicio_servicio impone 1:1. La FK va con ON DELETE CASCADE, asi que eliminar el servicio elimina el formulario sin aviso.

## El invariante

```sql
CONSTRAINT UQ_comunicaciones_servicio_servicio UNIQUE (servicio_id),
CONSTRAINT FK_comser_servicio FOREIGN KEY (servicio_id)
  REFERENCES servicios.servicios(id) ON DELETE CASCADE
```

Dos hechos que hay que tener juntos en la cabeza:

<<<<<<< Updated upstream
1. **1:1.** Un servicio no puede tener dos comunicaciones. El endpoint de guardado es
   un upsert por `servicioId`, no un insert.
=======
1. **1:1.** Un servicio no puede tener dos comunicaciones. El endpoint de guardado
   es un upsert por `servicioId`, no un insert.
>>>>>>> Stashed changes
2. **Cascade.** Borrar el servicio borra su comunicacion **en silencio**, sin pasar
   por ninguna validacion de la aplicacion.

## La consecuencia peligrosa del cascade

Una comunicacion `FINALIZADA` —el registro formal de un servicio, potencialmente con
valor legal— desaparece si alguien borra el servicio. El estado `FINALIZADA` no la
protege: el cascade actua en el motor, por debajo de la logica de negocio.

Por eso `DELETE /servicios/:id` exige `servicios:eliminar` y existe el estado
`ANULADO` como camino correcto. **Anular, no borrar.** Ver
[[workflow--comunicacion-de-servicio]].

Si esto importa formalmente, el cambio a considerar es pasar la FK a
`ON DELETE NO ACTION` y obligar a anular primero. Hoy no es asi.

## Nota de precision entre capas

<<<<<<< Updated upstream
La migracion declara `estado NVARCHAR(30)`; la entidad TypeORM declara `length: 20`.
Los cinco valores del `CHECK` caben en 20, asi que no hay falla practica, pero la
entidad y la tabla no coinciden. Al agregar un estado, verificar ambos numeros.
=======
La migracion declara `estado NVARCHAR(30)`; la entidad TypeORM declara
`length: 20`. Los cinco valores del `CHECK` caben en 20, asi que no hay falla
practica, pero la entidad y la tabla no coinciden exactamente. Al agregar un estado
nuevo, verificar ambos numeros.
>>>>>>> Stashed changes


## Archivos

- `database/migrations/017_comunicaciones_servicio.sql`

## Relaciones

- `affects` → [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]]
- `affects` → [[entity--comunicacion-servicio|ComunicacionServicio]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[workflow--comunicacion-de-servicio|Ciclo de vida de la comunicacion de servicio]] `contains` →

---
<sub>Nodo **curado** (editable a mano).</sub>
