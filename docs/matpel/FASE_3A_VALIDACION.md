# Fase 3A — validación y cierre recuperado

Fecha: 2026-10-09. Entorno: checkout local de SIGBO en Windows, rama `main`, con cambios previos sin commit. Revisión base: `686f8c7d9778c28d02555f00725d410f1fb24522`. Las comprobaciones corresponden al árbol de trabajo, cuya identidad se conserva por archivo en [validacion.json](evidencia/fase3a/validacion.json).

## Recuperación de la tarea

Se identificó la sesión de SIGBO «Planificar integración GRE por fases». El último pedido era continuar la fase 3A. La sesión dejó preparada la implementación documental y el modelo, con una modificación final de la relación entre versiones corregidas; faltaba este informe y el cierre verificable. Las fases 1 y 2 conservan sus entregas anteriores. Se completa la etapa interrumpida, conforme al trabajo por fases solicitado.

El manifiesto de hashes ya coincidía con la migración 094 al revisarlo. Se comprobó nuevamente mediante `-ValidateOnly`, sin abrir una conexión SQL. No se modificó ninguna migración histórica ni se aplicó DDL.

Antes de modificar pruebas/documentación y regenerar el grafo, se respaldaron 1.113 archivos seleccionados: fuentes afectadas y nodos/aristas/índices existentes. Respaldo local ignorado por Git: `logs/matpel/recuperacion-20261009/antes.zip`, SHA-256 `431eb4d40e32e4d0c81309b2edf893cfc6c93b647258851c75037e872dd6c3e5`. Se conservaron los cambios locales de otros trabajos, incluidos incidente-nucleo y móvil.

## Alcance comprobado

| Criterio de 3A | Evidencia |
|---|---|
| Descubrimiento por contenido y selección con varias fuentes | GRE real con nombre sin extensión; PDF no GRE, archivo auxiliar y PDF truncado descartados; varias fuentes requieren selección explícita |
| Identidad y copia documental | GRE 2024 en español, 8.182.725 bytes, 392 páginas, hash `bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`; copia privada y manifiesto UTF-8 |
| Numeración y coordenadas | Etiquetas PDF `i`, `ii`, `1`; numeración múltiple de PDF 154 conservada; dimensiones sin rotar y rotación original verificadas |
| Inmutabilidad y recuperación | Reintento sin duplicación; corrupción de PDF/manifiesto rechazada; recuperación tras interrupción entre publicaciones; fallo de enlace sin archivo final parcial; publicaciones simultáneas conservan una sola copia íntegra |
| Modelo compatible con driver | 18 entidades/tablas GRE cotejadas por columnas, tipos normalizados MSSQL, longitudes y nulabilidad; identificador textual distinto del id de entrada; no se inicializa DataSource |
| Lectura interna de fuente | Lectura del PDF real y rechazo de referencia/ruta ajena, corrupción, tamaño inválido, archivo ausente, versión/página/rotación/caja/confianza incoherentes |
| Lectura de catálogo | Solo versión explícita VALIDADA; referencia perteneciente a la versión; rango y fuente obligatorios; identificadores inválidos rechazados antes de consulta |
| Orden e integridad de migraciones | Manifiesto de archivos/orden/hashes validado sin conexión SQL |
| Contexto y trazabilidad | Informe, plan, contexto MATPEL y decisión del grafo actualizados; evidencia por archivo |

## Comandos reproducibles

| Comprobación de esta recuperación | Resultado |
|---|---|
| Pruebas documentales Python, incluidas las cinco nuevas | 16/16 aprobadas, salida 0 |
| Backend GRE: catálogo, fuentes y metadata del modelo | 3/3 suites, 21/21 casos aprobados, salida 0 |
| Compilación backend | `npm run build`, salida 0 |
| Importador sobre la fuente privada existente | Salida 0; `copiaNueva = false`; PDF y manifiesto sin cambios; 392 páginas y 40 marcadores |
| Manifiesto de migraciones | `-ValidateOnly`, salida 0; sin conexión SQL |
| Generación y validación del grafo | Comando estándar completado; 1.095 nodos, 3.836 aristas, salida 0; ocho avisos previos |
| Whitespace y enlaces de documentos de la entrega | Sin errores; registro final en evidencia JSON |

Las 37 pruebas relevantes aprobadas corresponden a esta entrega. No se repitieron pruebas de frontend/móvil ni la suite completa del backend: no se modificaron esas pantallas o flujos, y la compilación comprueba la compatibilidad de las fuentes backend recuperadas.

Desde la raíz del repositorio:

```powershell
python -m unittest discover -s scripts/matpel -p test_documento_gre.py -v
python scripts/matpel/importar_gre.py
& ./database/run-migrations.ps1 -ValidateOnly
node .context/graph/build-graph.mjs --quiet
node .context/graph/validar.mjs
git diff --check
```

Desde `backend`:

```powershell
npm test -- --runTestsByPath src/modules/gre/gre-modelo.spec.ts src/modules/gre/gre-fuentes.spec.ts src/modules/gre/gre-catalogo.spec.ts
npm run build
```

Las pruebas documentales usan el PDF auténtico, copias temporales y alteraciones deliberadas para comprobar errores. Los repositorios de las pruebas de catálogo son dobles en memoria. El test de metadata utiliza el driver MSSQL instalado sin conectarlo a DB. Ninguna de estas comprobaciones acredita ejecución del T-SQL.

Los resultados finales de pruebas, compilación, reintento documental y grafo se registran en [validacion.json](evidencia/fase3a/validacion.json), junto con las huellas de las fuentes. La evidencia documental previa está en [documento.json](evidencia/fase3a/documento.json); los registros de ejecución de esta recuperación están bajo `logs/matpel/recuperacion-20261009/`.

## Límites y siguiente etapa

3A concluye como **base documental y modelo preparado**. La migración 094 sigue sin aplicar. Las restricciones, triggers, transacciones y concurrencia en SQL Server requieren un entorno de prueba identificado y autorización aplicable. Las pruebas simultáneas de publicación de archivos no validan concurrencia SQL.

No hay catálogo estructurado importado/validado/activado, controladores HTTP GRE registrados, permisos nuevos concedidos ni pantallas MATPEL terminadas. Los 40 marcadores del PDF no sustituyen las 42 secciones documentadas en fase 1. Materiales, guías, tablas y reglas conservan sus entregas pendientes. Los dos fallos previos de Despacho son antecedentes de la línea base de fase 1; esta recuperación no modifica Despacho ni declara que hayan sido resueltos.

**Próxima entrega: 3B, índices y guías**, seguida de 3C (tablas/condiciones) y 3D (revisión/importación/activación). La fase 3 completa permanece en curso. No se realizaron commits, pushes, despliegues ni cambios de datos institucionales.
