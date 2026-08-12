---
id: rule--elegibilidad-de-rol-guardia
tipo: RULE
nombre: La elegibilidad para un rol de guardia se configura en tablas, con OR entre filas y AND entre columnas
nivel: L1
resumen: Un bombero califica para un rol si coincide con ALGUNA fila activa de requisitos_rol_guardia, cumpliendo TODAS las columnas no nulas de esa fila. Sin filas configuradas, no se restringe.
severidad: ALTA
dominio: guardias
fuente: backend/src/modules/guardias/elegibilidad.service.ts (comentario de la clase)
archivos: [backend/src/modules/guardias/elegibilidad.service.ts, backend/src/shared/entities/requisito-rol-guardia.entity.ts]
terminos: [elegibilidad, requisito, rol, guardia, titular, chofer, autorizado, cargo, rango, tipo]
edges:
  - [affects, entity--requisito-rol-guardia]
  - [affects, service--guardias-elegibilidad]
  - [affects, entity--vehiculo-autorizado]
---

## El invariante

`ElegibilidadService.validar(rol, bomberoId)` decide si una persona puede ocupar un
rol de guardia. La logica exacta:

- **OR entre filas:** alcanza con cumplir **alguna** fila activa de
  `operaciones.requisitos_rol_guardia` para ese rol.
- **AND entre columnas:** dentro de una fila, hay que cumplir **todas** las columnas
  no nulas (`cargoIdRequerido`, `rangoIdRequerido`, `tipoBomberoIdRequerido`).
  Una columna en `NULL` significa "no exijo nada por esta via".
- **Sin filas configuradas para el rol: no se restringe.** Ausencia de requisitos es
  permisivo, no restrictivo. Es la decision que hace que el sistema funcione antes de
  que alguien configure nada — y tambien significa que borrar los requisitos **abre**
  el rol en vez de cerrarlo.

## El caso especial de CHOFER, que si esta en el codigo

```ts
if (rol === 'CHOFER') {
  const autorizado = await this.autorizadoRepo.findOne({ where: { bomberoId } });
  if (!autorizado) throw new BadRequestException(...);
}
```

Ademas de los requisitos configurables, CHOFER exige **al menos un registro en
`personal.vehiculos_autorizados`**. Viene del pedido: *"Solamente otro personal
autorizado como chofer puede reemplazarlo"*.

Es la unica regla de elegibilidad **hardcodeada**, y es deliberada: manejar un movil
sin autorizacion registrada no es algo que la configuracion deba poder habilitar.

## Los roles de grupo

`RolGrupoGuardia` = `TITULAR` | `CHOFER`. La columna `rol` de
`requisitos_rol_guardia` es texto libre, no un `CHECK` contra ese tipo: se pueden
configurar requisitos para un rol que no existe, y quedan inertes.

## Al tocar esto

- No filtrar candidatos solo en el frontend: la validacion vive en el backend
  ([[rule--frontend-no-autoriza]]).
- El mensaje de error incluye nombre y apellido del bombero y el rol: es para un jefe
  de guardia, no para un desarrollador ([[rule--espanol-y-auditoria]]).
- Agregar una dimension de requisito (por ejemplo "especialidad requerida") es una
  columna nueva en la tabla **y** una condicion nueva en el `some(...)`: los dos
  lados, como siempre ([[rule--entidad-y-tabla-en-paralelo]]).
