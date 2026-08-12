---
id: service--seguridad-apariencia
tipo: SERVICE
nombre: AparienciaService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de apariencia (modulo seguridad).
capa: backend
archivos:
  - backend/src/modules/seguridad/apariencia.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-seguridad]
  - [uses, entity--configuracion-sistema]
  - [reads, table--seguridad-configuracion-sistema]
terminos: [apariencia, seguridad, configuracion, sistema]
---

# AparienciaService

Logica de negocio de apariencia (modulo seguridad).


## Metodos

`obtener()` · `actualizarTextos()` · `actualizarImagen()` · `actualizarPoliticaPerfil()`

## Archivos

- `backend/src/modules/seguridad/apariencia.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-seguridad|seguridad (modulo NestJS)]]
- `uses` → [[entity--configuracion-sistema|ConfiguracionSistema]]
- `reads` → [[table--seguridad-configuracion-sistema|seguridad.configuracion_sistema]]

## Referenciado por

- [[service--seguridad-perfil|PerfilService]] `uses` →
- [[api--seguridad-apariencia|AparienciaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
