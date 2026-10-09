# Fase 3D — importación y administración GRE

Fecha: 2026-10-09. Estado: implementación backend en validación.
Fuente estructurada de fase 3C; catálogo institucional pendiente de cotejo humano.

## Implementación

`GreModule` está registrado en `AppModule`. El controlador administrativo en
`/matpel/administracion` permite descubrir fuentes por contenido, solicitar y
consultar importaciones, listar versiones, revisar referencias y páginas de
tablas, obtener fuente/PDF, comparar versiones, validar y activar.
Las pantallas de administración y consulta se implementan en las fases siguientes.

La petición de importación encola el trabajo y devuelve su identidad. La carga
ocurre en el trabajador local, con límite de intentos, token de reclamación,
vencimiento y una transacción para todo el contenido. El trabajador permanece
apagado salvo `GRE_TRABAJADOR=activo`; `npm run gre:procesar` procesa la cola por
solicitud explícita. Iniciar la API no carga documentos.

Identidad: hash documental + parser/PyMuPDF + normalizador + esquema + revisión de
correcciones. Reimportar la misma identidad devuelve el candidato existente;
los errores permiten reintentar. La comprobación serializada evita crear dos
trabajos por solicitudes simultáneas. Artefactos privados se comprueban por ruta,
hash, contrato, herramienta y metadatos del documento antes de cargar.
La salida es `REQUIERE_REVISION`: no se valida ni activa mediante importación.

## Revisión y decisión humana

`GET versiones/:versionGreId/referencias` admite filtros `paginaPdf`, `pagina` y
`tamano` (máximo 3.000), con texto/caja/estado. El detalle de una referencia y el
PDF permiten cotejo contra la fuente, también fuera de las tablas.
Las revisiones aceptan filas, referencias o una página de tabla, un objetivo por
solicitud. Rechazan objetivos ajenos a la versión. Verificación, rechazo y
propuesta de corrección conservan responsable, fundamento y auditoría.
Una nueva propuesta se registra aunque la referencia ya esté rechazada.

Validar exige reporte comprobado sin hallazgos, contenido existente, todas las
filas y referencias verificadas y ninguna celda `NO_VALIDADO`. Esto incluye notas,
condiciones, índices, guías y reglas. Una propuesta no modifica el original:
debe corregirse el extractor/candidato y cotejar la nueva versión.
No hay editor de candidatos derivados en esta entrega.

La activación exige versión validada, motivo, revisión esperada del puntero por
idioma y clave idempotente. El historial permanece inmutable. Recuperar una
edición anterior utiliza el mismo endpoint con su id y revisión actual; no
reescribe ediciones ni decisiones históricas. Los reintentos de importación,
revisión y validación conservan resultado y rechazan reutilizar la clave para
otro actor o contenido; activación contrasta versión/actor/motivo/revisión.

## Seguridad y operación

Capacidades separadas: `matpel:administrar_gre`, `matpel:validar_gre` y
`matpel:activar_gre`. Las rutas de lectura administrativa aceptan alternativas
explícitas; escritura exige su permiso propio. Ninguna acredita mando operativo.
PDF privado con hash verificado; no se exponen rutas locales al cliente.
Auditoría de solicitud, carga, error, revisión, validación y activación.

Migraciones 094 y 095 preparadas/registradas. La 095 registra permisos y
asignaciones iniciales; su aplicación institucional permanece pendiente.
No se ejecuta el runner de migraciones ni se altera `sigbo_cbvc` en esta tarea.

## Prueba SQL aislada

`node scripts/matpel/probar_integracion.cjs` crea una base nueva
`sigbo_gre_prueba_<16 hex>` en el contenedor local `sigbo-sqlserver`, instala solo
el soporte mínimo de seguridad y la 094, ejecuta Jest con el catálogo real y
elimina únicamente esa base al finalizar. Rechaza nombres ajenos y no recrea la
base de una sesión anterior. La suite ordinaria omite esta prueba salvo selección
explícita de base temporal. No imprimir credenciales.

La verificación de referencias y activación de esa suite son simulaciones del
flujo en una base desechable; no acreditan cotejo institucional de las distancias.
La prueba detectó aislamiento SERIALIZABLE heredado en una conexión del pool;
la reclamación declara READ COMMITTED para usar READPAST correctamente.

Resultados: 46/46 Python, 43/43 backend GRE y 9/9 SQL aprobados; compilaci?n
aprobada. SQL incluye importaci?n sin duplicados, bloqueo antes del cotejo,
propuestas/idempotencia, inmutabilidad, comparaci?n de contenido/condiciones,
activaciones concurrentes y recuperaci?n con tres eventos de historial.
La base temporal final se elimin?. Regresi?n general: 473 casos aprobados y los
mismos dos fallos previos de Despacho; no corregidos en esta entrega.

Grafo: 1.103 nodos, 3.859 aristas, validaci?n sin errores y ocho avisos previos.
Permisos expl?citos en el controlador y correcci?n del l?mite de 400 caracteres
del generador: las catorce rutas administrativas quedan trazadas con autorizaci?n.

[Evidencia con comandos, entorno y huellas](evidencia/fase3cd/validacion.json).
La fase 3 permanece abierta hasta el cotejo/aceptación institucional; el motor,
las pantallas y la integración de incidentes/SCI permanecen en fases posteriores.
