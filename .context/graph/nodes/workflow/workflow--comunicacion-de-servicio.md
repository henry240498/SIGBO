---
id: workflow--comunicacion-de-servicio
tipo: WORKFLOW
nombre: Ciclo de vida de la comunicacion de servicio
nivel: L1
dominio: servicios
resumen: BORRADOR a PENDIENTE_REVISION, de ahi a OBSERVADO o FINALIZADA, y ANULADO como salida. Cada transicion es un endpoint con su propio permiso.
archivos:
  - backend/src/modules/servicios/servicios.controller.ts
  - backend/src/modules/servicios/servicios.service.ts
  - database/migrations/017_comunicaciones_servicio.sql
edges:
  - [contains, rule--una-comunicacion-por-servicio]
  - [contains, decision--comunicacion-como-json]
  - [affects, entity--comunicacion-servicio]
<<<<<<< Updated upstream
=======
  - [affects, api--servicios-servicios]
>>>>>>> Stashed changes
  - [belongs_to, domain--servicios]
terminos: [comunicacion, servicio, estado, borrador, revision, observado, finalizada, anulado, pdf, ciclo, vida, pendiente, ahi, salida, cada, transicion, endpoint, propio, permiso]
---

# Ciclo de vida de la comunicacion de servicio

BORRADOR a PENDIENTE_REVISION, de ahi a OBSERVADO o FINALIZADA, y ANULADO como salida. Cada transicion es un endpoint con su propio permiso.

## Maquina de estados

```
                  enviar-revision
   BORRADOR ─────────────────────────► PENDIENTE_REVISION
      ▲                                    │        │
      │ reabrir                    observar│        │finalizar
      │                                    ▼        ▼
      └──────────────────────────────  OBSERVADO   FINALIZADA
                     reabrir
                                    (anular desde cualquiera) ──► ANULADO
```

<<<<<<< Updated upstream
Los cinco valores son los del `CHECK` de la tabla: `BORRADOR`,
`PENDIENTE_REVISION`, `OBSERVADO`, `FINALIZADA`, `ANULADO`.

## Endpoints y permisos
=======
Los cinco valores son los del `CHECK` de la tabla:
`BORRADOR`, `PENDIENTE_REVISION`, `OBSERVADO`, `FINALIZADA`, `ANULADO`.

## Endpoints y permisos, tal como estan hoy
>>>>>>> Stashed changes

| Transicion | Endpoint | Permiso |
|---|---|---|
| Crear | `POST /servicios/comunicaciones` | `servicios:crear` |
| Editar contenido | `PATCH /servicios/comunicaciones/:id` | `servicios:editar` |
| Enviar a revision | `POST .../:id/enviar-revision` | `servicios:editar` |
| Observar | `POST .../:id/observar` | `servicios:editar` |
| Reabrir | `POST .../:id/reabrir` | `servicios:editar` |
| Finalizar | `POST .../:id/finalizar` | `servicios:finalizar` |
| Anular | `POST .../:id/anular` | `servicios:eliminar` |
| Borrar | `DELETE .../:id` | `servicios:eliminar` |
| Exportar PDF | `GET .../:id/exportar/pdf` | `servicios:exportar_informe` |

Cuatro transiciones comparten `servicios:editar`: quien puede editar tambien puede
mover el formulario entre borrador, revision y observado. Solo **finalizar** y
**anular** exigen permisos distintos. Es la separacion deliberada entre redactar y
cerrar formalmente.

## Trazas que deja el cierre

`finalizado_por`, `finalizado_en` y `motivo_estado` se llenan al finalizar/anular.
`actualizado_por` y `version` acompanan cada edicion.

## Dos advertencias

1. **`ANULADO` es la baja correcta, no `DELETE`.** La FK tiene `ON DELETE CASCADE`
   desde el servicio: borrar el servicio destruye la comunicacion en silencio, incluso
   `FINALIZADA`. Ver [[rule--una-comunicacion-por-servicio]].
2. El contenido del formulario es un JSON opaco para la BD. Los campos reales de cada
   tipo (`OTRAS_OCURRENCIAS`, `INCENDIO`) estan en los DTOs de
   `modules/servicios/dto/` y en la pantalla `/dashboard/servicios/nuevo`. El PDF se
   arma en `comunicacion-servicio.pdf.ts`, que es donde se ve la forma esperada
   completa.


## Archivos

- `backend/src/modules/servicios/servicios.controller.ts`
- `backend/src/modules/servicios/servicios.service.ts`
- `database/migrations/017_comunicaciones_servicio.sql`

## Relaciones

- `contains` → [[rule--una-comunicacion-por-servicio|Un servicio tiene como maximo una comunicacion, y borrar el servicio la borra]]
- `contains` → [[decision--comunicacion-como-json|La comunicacion de servicio se guarda como documento JSON validado]]
- `affects` → [[entity--comunicacion-servicio|ComunicacionServicio]]
<<<<<<< Updated upstream
=======
- `affects` → [[api--servicios-servicios|ServiciosController]]
>>>>>>> Stashed changes
- `belongs_to` → [[domain--servicios|Servicios]]

---
<sub>Nodo **curado** (editable a mano).</sub>
