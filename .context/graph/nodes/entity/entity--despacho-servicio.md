---
id: entity--despacho-servicio
tipo: ENTITY
nombre: ServicioParticipante
nivel: L1
dominio: servicios
resumen: Quien participa en un servicio activo y en que situacion esta (migracion 090).
tabla: servicios.servicio_participantes
archivos:
  - backend/src/shared/entities/despacho-servicio.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-servicio-participantes]
terminos: [servicio, participante, participantes, servicios, estado, camino, sitio, retirado, formulario, borrador, completado, anulado, accion, crear, modificar, completar, anular, sujeto, pantalla, rol, usuario, rango, cargo]
---

# ServicioParticipante

Quien participa en un servicio activo y en que situacion esta (migracion 090).

- **Tabla:** [[table--servicios-servicio-participantes|servicios.servicio_participantes]]
- **Columnas mapeadas:** 76

## Estados y enumeraciones

- `EstadoParticipante`: `EN_CAMINO` · `EN_SITIO` · `RETIRADO`
- `EstadoFormulario`: `BORRADOR` · `COMPLETADO` · `ANULADO`
- `AccionFormulario`: `CREAR` · `MODIFICAR` · `COMPLETAR` · `ANULAR`
- `SujetoPantalla`: `ROL` · `USUARIO` · `RANGO` · `CARGO`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/despacho-servicio.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-servicio-participantes|servicios.servicio_participantes]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
