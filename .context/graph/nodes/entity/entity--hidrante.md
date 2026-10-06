---
id: entity--hidrante
tipo: ENTITY
nombre: Hidrante
nivel: L1
dominio: servicios
resumen: "Hidrante de la zona (migracion 080). Se da de baja con `activo = false`, nunca se borra."
tabla: servicios.hidrantes
archivos:
  - backend/src/shared/entities/hidrante.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-hidrantes]
terminos: [hidrante, hidrantes, servicios, estado, operativo, fuera, servicio, verificar]
---

# Hidrante

Hidrante de la zona (migracion 080). Se da de baja con `activo = false`, nunca se borra.

- **Tabla:** [[table--servicios-hidrantes|servicios.hidrantes]]
- **Columnas mapeadas:** 12

## Estados y enumeraciones

- `EstadoHidrante`: `OPERATIVO` · `FUERA_SERVICIO` · `SIN_VERIFICAR`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/hidrante.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-hidrantes|servicios.hidrantes]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
