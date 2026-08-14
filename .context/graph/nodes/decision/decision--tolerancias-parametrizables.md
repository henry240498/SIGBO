---
id: decision--tolerancias-parametrizables
tipo: DECISION
nombre: Las reglas de asistencia son datos parametrizables, no constantes de codigo
nivel: L2
dominio: asistencia
estado: VIGENTE
resumen: Las tolerancias de horario viven en operaciones.tolerancias_asistencia, con una fila de regla general (tipoEventoId NULL) y filas especificas por tipo de evento.
archivos:
  - backend/src/shared/entities/tolerancia-asistencia.entity.ts
  - backend/src/modules/operaciones/tolerancias.service.ts
edges:
  - [affects, entity--tolerancia-asistencia]
  - [constrains, rule--tolerancia-null-es-la-general]
  - [belongs_to, domain--asistencia]
terminos: [tolerancia, asistencia, minutos, entrada, salida, parametro, regla, evento, reglas, son, datos, parametrizables, constantes, codigo, tolerancias, horario, viven, operaciones, fila, general, tipo, null, filas, especificas]
---

# Las reglas de asistencia son datos parametrizables, no constantes de codigo

Las tolerancias de horario viven en operaciones.tolerancias_asistencia, con una fila de regla general (tipoEventoId NULL) y filas especificas por tipo de evento.

## Decision

Los minutos de tolerancia de entrada y salida son filas de
`operaciones.tolerancias_asistencia`, no constantes. El comentario de la entidad lo
dice explicitamente: *"nunca codificadas rigidamente en el backend"*.

```ts
tipoEventoId: string | null   // NULL = regla general por defecto
minutosToleranciaEntrada: number
minutosToleranciaSalida: number
estado: 'ACTIVO' | 'INACTIVO'
```

## Motivo

Una guardia nocturna y una capacitacion no toleran lo mismo, y quien decide eso es
la comandancia, no quien programa. Cambiar la tolerancia debe ser una pantalla, no
un despliegue.

<<<<<<< Updated upstream
## El mismo principio, aplicado de nuevo

Guardias repitio este patron con `requisitos_rol_guardia`: quien puede ser TITULAR o
CHOFER se configura en tablas, no en el codigo. Ver
[[rule--elegibilidad-de-rol-guardia]]. Es el patron dominante del sistema: **si una
regla la decide la institucion, es una fila**.

## Cuatro mecanismos de parametrizacion coexisten

`organizacion.parametros` (valores institucionales generales),
`operaciones.tolerancias_asistencia` (horarios), `operaciones.requisitos_rol_guardia`
(elegibilidad) y el registro de Configuracion (`configuracion_valores` +
`configuracion_versiones`, comportamiento de la app).

Al agregar un parametro nuevo conviene elegir el que corresponde en vez de crear un
quinto.
=======
## Como resolver la tolerancia aplicable

1. Buscar fila `ACTIVO` con `tipoEventoId` = el tipo del evento.
2. Si no existe, usar la fila `ACTIVO` con `tipoEventoId IS NULL` (la general).

Ver [[rule--tolerancia-null-es-la-general]].

## El mismo patron en otro lugar

`organizacion.parametros` cumple un rol equivalente para valores institucionales
generales, y el modulo de Configuracion (`configuracion_valores` +
`configuracion_versiones`) lo hace para el comportamiento de la aplicacion. Tres
mecanismos distintos de parametrizacion coexisten; al agregar un parametro nuevo
conviene elegir el que corresponde en vez de crear un cuarto.
>>>>>>> Stashed changes


## Archivos

- `backend/src/shared/entities/tolerancia-asistencia.entity.ts`
- `backend/src/modules/operaciones/tolerancias.service.ts`

## Relaciones

- `affects` → [[entity--tolerancia-asistencia|ToleranciaAsistencia]]
- `constrains` → [[rule--tolerancia-null-es-la-general|La tolerancia con tipoEventoId NULL es la regla general por defecto]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

---
<sub>Nodo **curado** (editable a mano).</sub>
