---
id: domain--servicios
tipo: DOMAIN
nombre: Servicios
nivel: L0
dominio: servicios
estado: ACTIVO
resumen: "Modulo funcional \"Servicios\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [servicios]
---

# Servicios

Modulo funcional "Servicios". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--comunicacion-servicio|ComunicacionServicio]] `belongs_to` →
- [[entity--personal-servicio|PersonalServicio]] `belongs_to` →
- [[entity--servicio|Servicio]] `belongs_to` →
- [[entity--tipo-servicio|TipoServicio]] `belongs_to` →
- [[table--servicios-tipos-servicio|servicios.tipos_servicio]] `belongs_to` →
- [[table--servicios-servicios|servicios.servicios]] `belongs_to` →
- [[table--servicios-personal-servicio|servicios.personal_servicio]] `belongs_to` →
- [[table--servicios-historial-servicios|servicios.historial_servicios]] `belongs_to` →
- [[table--servicios-comunicaciones-servicio|servicios.comunicaciones_servicio]] `belongs_to` →
- [[component--modulo-servicios|servicios (modulo NestJS)]] `belongs_to` →
- [[service--servicios-servicios|ServiciosService]] `belongs_to` →
- [[api--servicios-servicios|ServiciosController]] `belongs_to` →
- [[screen--dashboard-servicios-nuevo|/dashboard/servicios/nuevo]] `belongs_to` →
- [[screen--dashboard-servicios|/dashboard/servicios]] `belongs_to` →
- [[decision--body-parser-8mb|Body parser de 8 MB y CORS permisivo para recursos, por el croquis embebido]] `belongs_to` →
- [[decision--comunicacion-como-json|La comunicacion de servicio se guarda como documento JSON validado]] `belongs_to` →
- [[error--413-croquis-grande|413 Payload Too Large al guardar una comunicacion con croquis]] `belongs_to` →
- [[rule--una-comunicacion-por-servicio|Un servicio tiene como maximo una comunicacion, y borrar el servicio la borra]] `belongs_to` →
- [[workflow--comunicacion-de-servicio|Ciclo de vida de la comunicacion de servicio]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
