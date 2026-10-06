---
id: entity--control-horas-fichaje
tipo: ENTITY
nombre: LimiteHorasServicio
nivel: L1
dominio: asistencia
resumen: Limites de horas de servicio que fija el cuartel (una fila activa). Migracion 082.
tabla: operaciones.limites_horas_servicio
archivos:
  - backend/src/shared/entities/control-horas-fichaje.entity.ts
edges:
  - [belongs_to, domain--asistencia]
  - [persisted_in, table--operaciones-limites-horas-servicio]
terminos: [limite, horas, servicio, limites, operaciones, tipo, fichaje, entrada, salida]
---

# LimiteHorasServicio

Limites de horas de servicio que fija el cuartel (una fila activa). Migracion 082.

- **Tabla:** [[table--operaciones-limites-horas-servicio|operaciones.limites_horas_servicio]]
- **Columnas mapeadas:** 14

## Estados y enumeraciones

- `TipoFichaje`: `ENTRADA` · `SALIDA`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/control-horas-fichaje.entity.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `persisted_in` → [[table--operaciones-limites-horas-servicio|operaciones.limites_horas_servicio]]

## Referenciado por

- [[rule--hora-del-hecho-acotada|La hora que declara un dispositivo se acota antes de guardarse]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
