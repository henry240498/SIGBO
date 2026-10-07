---
id: entity--campo
tipo: ENTITY
nombre: Adjunto
nivel: L1
dominio: servicios
resumen: "Foto o firma tomada con el celular (migracion 086). El archivo es privado: solo se sirve a usuarios autorizados."
tabla: servicios.adjuntos
archivos:
  - backend/src/shared/entities/campo.entity.ts
edges:
  - [belongs_to, domain--servicios]
  - [persisted_in, table--servicios-adjuntos]
terminos: [adjunto, adjuntos, servicios, entidad, servicio, despacho, vehiculo, hidrante, punto, riesgo, tipo, foto, firma, categoria, dano, victima, estructura, equipamiento, evidencia, otro, rescatada, herida, fallecida, evacuada, estado, ausencia, solicitada, aprobada, rechazada, cancelada]
---

# Adjunto

Foto o firma tomada con el celular (migracion 086). El archivo es privado: solo se sirve a usuarios autorizados.

- **Tabla:** [[table--servicios-adjuntos|servicios.adjuntos]]
- **Columnas mapeadas:** 27

## Estados y enumeraciones

- `EntidadAdjunto`: `SERVICIO` · `DESPACHO` · `VEHICULO` · `HIDRANTE` · `PUNTO_RIESGO`
- `TipoAdjunto`: `FOTO` · `FIRMA`
- `CategoriaFoto`: `DANO` · `VICTIMA` · `RIESGO` · `VEHICULO` · `ESTRUCTURA` · `EQUIPAMIENTO` · `EVIDENCIA` · `OTRO`
- `CategoriaVictima`: `RESCATADA` · `HERIDA` · `FALLECIDA` · `EVACUADA`
- `EstadoAusencia`: `SOLICITADA` · `APROBADA` · `RECHAZADA` · `CANCELADA`

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/campo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--servicios|Servicios]]
- `persisted_in` → [[table--servicios-adjuntos|servicios.adjuntos]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
