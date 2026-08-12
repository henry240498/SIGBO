---
id: service--configuracion-configuracion
tipo: SERVICE
nombre: ConfiguracionService
nivel: L2
dominio: seguridad
resumen: Logica de negocio de configuracion (modulo configuracion).
capa: backend
archivos:
  - backend/src/modules/configuracion/configuracion.service.ts
edges:
  - [belongs_to, domain--seguridad]
  - [uses, component--modulo-configuracion]
  - [uses, entity--configuracion-valor]
  - [reads, table--seguridad-configuracion-valores]
  - [uses, entity--configuracion-version]
  - [reads, table--seguridad-configuracion-versiones]
  - [uses, service--seguridad-auditoria]
terminos: [configuracion, valor, version]
---

# ConfiguracionService

Logica de negocio de configuracion (modulo configuracion).


## Metodos

`registro()` · `resolver()` · `publica()` · `preferencias()` · `guardarPreferencias()` · `crearBorrador()` · `obtenerBorrador()` · `actualizarBorrador()` · `validarBorrador()` · `publicar()` · `versiones()` · `restaurar()` · `exportar()` · `validar()`

## Archivos

- `backend/src/modules/configuracion/configuracion.service.ts`

## Relaciones

- `belongs_to` → [[domain--seguridad|Seguridad]]
- `uses` → [[component--modulo-configuracion|configuracion (modulo NestJS)]]
- `uses` → [[entity--configuracion-valor|ConfiguracionValor]]
- `reads` → [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]]
- `uses` → [[entity--configuracion-version|ConfiguracionVersion]]
- `reads` → [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--configuracion-configuracion|ConfiguracionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
