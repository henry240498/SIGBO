---
id: service--documentos-documentos
tipo: SERVICE
nombre: DocumentosService
nivel: L2
dominio: documentos
resumen: "Motor central del modulo Documentos (seccion 49 del pedido): registrar -> clasificar -> almacenar -> relacionar -> versionar -> revisar -> aprobar -> firmar -> publicar -> consultar -> auditar -> archivar. Reutiliza almacenamiento.ts sin cambios (ya es generico para cualquier extension), y AuditoriaService para todo el rastro (secciones 29, 42)."
capa: backend
archivos:
  - backend/src/modules/documentos/documentos.service.ts
edges:
  - [belongs_to, domain--documentos]
  - [uses, component--modulo-documentos]
  - [uses, entity--documento]
  - [reads, table--documentos-documentos-institucionales]
  - [uses, entity--version-archivo-documento]
  - [reads, table--documentos-versiones-archivo]
  - [uses, entity--documento-relacion]
  - [reads, table--documentos-relaciones]
  - [uses, entity--numeracion-documento]
  - [reads, table--documentos-numeraciones]
  - [uses, entity--parametro]
  - [reads, table--organizacion-parametros]
  - [uses, service--seguridad-auditoria]
terminos: [documentos, documento, version, archivo, relacion, numeracion, parametro]
---

# DocumentosService

Motor central del modulo Documentos (seccion 49 del pedido): registrar -> clasificar -> almacenar -> relacionar -> versionar -> revisar -> aprobar -> firmar -> publicar -> consultar -> auditar -> archivar. Reutiliza almacenamiento.ts sin cambios (ya es generico para cualquier extension), y AuditoriaService para todo el rastro (secciones 29, 42).


## Metodos

`findAll()` · `findOne()` · `alertaVigencia()` · `obtenerParametro()` · `crear()` · `actualizar()` · `subirArchivo()` · `versiones()` · `cambiarEstado()` · `anular()` · `archivar()` · `reabrir()` · `actualizarVencidos()` · `relacionar()` · `desrelacionar()` · `relacionesDe()` · `documentosDeEntidad()` · `buscarParaIa()` · `registrarVista()` · `registrarDescarga()` · `siguienteNumero()` · `previsualizarSiguienteNumero()` · `listarNumeraciones()` · `guardarNumeracion()` · `registrarDesdeOtroModulo()` · `eliminar()`

## Archivos

- `backend/src/modules/documentos/documentos.service.ts`

## Relaciones

- `belongs_to` → [[domain--documentos|Documentos]]
- `uses` → [[component--modulo-documentos|documentos (modulo NestJS)]]
- `uses` → [[entity--documento|Documento]]
- `reads` → [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]]
- `uses` → [[entity--version-archivo-documento|VersionArchivoDocumento]]
- `reads` → [[table--documentos-versiones-archivo|documentos.versiones_archivo]]
- `uses` → [[entity--documento-relacion|DocumentoRelacion]]
- `reads` → [[table--documentos-relaciones|documentos.relaciones]]
- `uses` → [[entity--numeracion-documento|NumeracionDocumento]]
- `reads` → [[table--documentos-numeraciones|documentos.numeraciones]]
- `uses` → [[entity--parametro|Parametro]]
- `reads` → [[table--organizacion-parametros|organizacion.parametros]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[service--academia-certificaciones-academia|CertificacionesAcademiaService]] `uses` →
- [[service--documentos-firmas-documento|FirmasDocumentoService]] `uses` →
- [[service--documentos-plantillas|PlantillasService]] `uses` →
- [[service--guardias-ordenes-guardia|OrdenesGuardiaService]] `uses` →
- [[service--ia-ia-tools|IaToolsService]] `uses` →
- [[service--servicios-servicios|ServiciosService]] `uses` →
- [[api--documentos-documentos|DocumentosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
