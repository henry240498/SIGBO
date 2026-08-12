---
id: decision--tolerancias-parametrizables
tipo: DECISION
nombre: Las reglas de asistencia son datos parametrizables, no constantes de codigo
nivel: L2
resumen: Las tolerancias de horario viven en operaciones.tolerancias_asistencia, con una fila de regla general (tipoEventoId NULL) y filas especificas por tipo de evento.
estado: VIGENTE
dominio: asistencia
archivos: [backend/src/shared/entities/tolerancia-asistencia.entity.ts, backend/src/modules/operaciones/tolerancias.service.ts]
terminos: [tolerancia, asistencia, minutos, entrada, salida, parametro, regla, evento]
edges:
  - [affects, entity--tolerancia-asistencia]
  - [constrains, rule--tolerancia-null-es-la-general]
---

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
