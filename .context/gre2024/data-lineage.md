# GRE24-LINEAGE — trazabilidad comprobable

Cadena documental existente: SHA PDF → versión de artefacto → página/etiqueta/caja
→ referencia `ref-*` → campo de entrada/bloque/fila/celda/regla. Coordenadas:
`PYMUPDF_SIN_ROTAR_PT`; origen superior izquierdo, puntos PDF, página sin rotación.
Las tablas1/3 tienen texto girado aunque la página declare rotación0.

En SQL `planDeCarga` genera UUID y enlaza cada campo mediante `GreCampoFuente`.
Los `ref-*` del JSON no son esos UUID. Para recuperar una referencia del contexto
abrir **el artefacto exacto** identificado por hash; para una referencia HTTP seguir
su UUID y `versionGreId`, con autorización. Mezclar ids entre ediciones invalida
la justificación, aunque nombres o valores coincidan.

[auditar_conocimiento.py](../../scripts/matpel/auditar_conocimiento.py) abre PDF y
artefacto sin importar el extractor. Comprueba hash de página, texto de referencia
por línea/caja o caracteres dentro de caja, rectángulo/RGB de verde, relaciones
de índices y coherencia de decimal/modificador original. Registra resultado por
referencia, celda y fila; nunca cambia su estado SQL ni simula revisión institucional.

Corrección tras auditoría independiente: comprobar también que textoOriginal de
celda/fila/entrada corresponde a sus referencias, unidad a columna/texto, guía/P
a original y verde a fondo de palabras. Igualdad entre valores internos modificados
en conjunto no es prueba de fidelidad. Mantener los [casos de corrupción](../../scripts/matpel/test_auditar_conocimiento.py).

Reanudación2026-10-10: normalización derivada de nombres/contenedores y guía/P de
filas cotejadas contra originales. Los parámetros de cantidades deTabla3 tienen
literal y fuente propia; el validador conserva el vínculo del lote111–120 con el
mismoSHA de candidato que la auditoría y verifica cajas/páginas/bloques e imágenes.

Una caja válida de franja/ausencia de verde es solo ubicación: su interpretación
queda pendiente. La comprobación textual no elimina notas/condiciones originales
ni sustituye la inspección visual. Revisar [estado y límites](validation-report.md).

Fuente privada servida por `GreFuentesService` con ruta/hash comprobados, pertenencia
de referencia a versión y permisos administrativos. No exponer rutas arbitrarias
ni fragmentos de documentos ajenos. Para agentes web sin filesystem el mecanismo
HTTP operativo aún está pendiente; no confundir acceso administrativo con consulta.
## Cierre de trazabilidad de guías2026-10-10

El [inventario global](response-guides/inventario-guias.json) enlaza64 números con
seis registros de lectura,128 páginas PDF/impresas y estudios particulares.
Cada cláusula enlaza su bloque, referencias/cajas y literal de fuente. El
validador coteja cobertura global contra el candidato, los textos contra PDF,
las huellas de imágenes y las identidades de revisión registradas.

Para los cuatro lotes nuevos se comprueba además que el subapartado corresponde
al último título en negrita anterior, con sus continuaciones. Las43 condiciones
particulares enlazan cláusulas originales y dos casos propuestos; se verifican
fuentes coincidentes y estados pendientes. Este recorrido termina en evidencia
documental, sin resultado de motor/SCI al que atribuir trazabilidad operativa.
