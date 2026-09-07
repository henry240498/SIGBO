---
id: service--deposito-consultas-deposito
tipo: SERVICE
nombre: ConsultasDepositoService
nivel: L2
dominio: deposito
resumen: Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 23 del pedido). Ningun metodo escribe nada. La IA hereda exactamente los permisos del usuario que consulta (RequirePermission del controller) -- nunca decide autorizacion por su cuenta, nunca modifica inventarios, nunca aprueba bajas ni registra movimientos.
capa: backend
archivos:
  - backend/src/modules/deposito/consultas-deposito.service.ts
edges:
  - [belongs_to, domain--deposito]
  - [uses, component--modulo-deposito]
  - [uses, entity--articulo]
  - [reads, table--deposito-articulos]
  - [uses, entity--equipo]
  - [reads, table--equipos-equipos]
  - [uses, entity--tenencia-deposito]
  - [reads, table--deposito-tenencias]
  - [uses, entity--prestamo-deposito]
  - [reads, table--deposito-prestamos]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--deposito-integracion-deposito]
terminos: [consultas, deposito, articulo, equipo, tenencia, prestamo, parametro]
---

# ConsultasDepositoService

Capa de consulta de SOLO LECTURA preparada para Snoopy (seccion 23 del pedido). Ningun metodo escribe nada. La IA hereda exactamente los permisos del usuario que consulta (RequirePermission del controller) -- nunca decide autorizacion por su cuenta, nunca modifica inventarios, nunca aprueba bajas ni registra movimientos.


## Metodos

`disponiblesPorCategoria()` · `quienTiene()` · `vencidos()` · `porVehiculoYEstado()`

## Archivos

- `backend/src/modules/deposito/consultas-deposito.service.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `uses` → [[component--modulo-deposito|deposito (modulo NestJS)]]
- `uses` → [[entity--articulo|Articulo]]
- `reads` → [[table--deposito-articulos|deposito.articulos]]
- `uses` → [[entity--equipo|Equipo]]
- `reads` → [[table--equipos-equipos|equipos.equipos]]
- `uses` → [[entity--tenencia-deposito|TenenciaDeposito]]
- `reads` → [[table--deposito-tenencias|deposito.tenencias]]
- `uses` → [[entity--prestamo-deposito|PrestamoDeposito]]
- `reads` → [[table--deposito-prestamos|deposito.prestamos]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--deposito-integracion-deposito|IntegracionDepositoService]]

## Referenciado por

- [[api--deposito-consultas-deposito|ConsultasDepositoController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
