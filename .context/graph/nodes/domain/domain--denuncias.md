---
id: domain--denuncias
tipo: DOMAIN
nombre: Denuncias
nivel: L0
dominio: denuncias
estado: ACTIVO
resumen: "Modulo funcional \"Denuncias\". Habilitado en la navegacion."
archivos:
  - frontend/src/lib/modulos.ts
terminos: [denuncias]
---

# Denuncias

Modulo funcional "Denuncias". Habilitado en la navegacion.


## Archivos

- `frontend/src/lib/modulos.ts`

## Referenciado por

- [[entity--categoria-denuncia|CategoriaDenuncia]] `belongs_to` →
- [[entity--denuncia|Denuncia]] `belongs_to` →
- [[entity--evidencia-denuncia|EvidenciaDenuncia]] `belongs_to` →
- [[entity--historial-estado-denuncia|HistorialEstadoDenuncia]] `belongs_to` →
- [[table--denuncias-categorias-denuncia|denuncias.categorias_denuncia]] `belongs_to` →
- [[table--denuncias-denuncias|denuncias.denuncias]] `belongs_to` →
- [[table--denuncias-historial-estados-denuncia|denuncias.historial_estados_denuncia]] `belongs_to` →
- [[table--denuncias-evidencias-denuncia|denuncias.evidencias_denuncia]] `belongs_to` →
- [[component--modulo-denuncias|denuncias (modulo NestJS)]] `belongs_to` →
- [[service--denuncias-denuncias|DenunciasService]] `belongs_to` →
- [[api--denuncias-denuncias-publicas|DenunciasPublicasController]] `belongs_to` →
- [[api--denuncias-denuncias|DenunciasController]] `belongs_to` →
- [[screen--dashboard-denuncias|/dashboard/denuncias]] `belongs_to` →
- [[screen--dashboard-denuncias-id|/dashboard/denuncias/[id]]] `belongs_to` →
- [[screen--denuncias|/denuncias]] `belongs_to` →
- [[decision--rate-limit-propio|Rate limiting propio en memoria en vez de @nestjs/throttler]] `belongs_to` →
- [[rule--datos-tecnicos-de-denuncia-restringidos|La IP, el GPS y el user agent de una denuncia exigen un permiso aparte]] `belongs_to` →
- [[workflow--denuncia-rapida|Denuncia rapida: formulario publico, evidencias y gestion interna]] `belongs_to` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
