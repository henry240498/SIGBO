# Fase 2 — matriz GRE → consulta / incidente / SCI

Fecha: 2026-10-08. Ubicaciones propuestas, no registros operativos.

Fuente: [inventario de fase 1](evidencia/fase1/inventario-gre.json). Se conservan las 42 secciones y las 392 páginas del documento real.

Toda sección tiene acceso al documento íntegro. El contenido contextual se presenta por reglas explícitas o por contexto declarado por el operador; no se inventa una detección automática de BLEVE, QBRN, AEI o idoneidad de recursos.

| Id | PDF | Sección original | Consulta | Incidente / SCI | Condición / límite |
|---|---|---|---|---|---|
| SEC01 | 1–1 | PORTADA | Fuente y ficha de edición | Edición visible; portada al abrir documento | Identidad del documento, sin generar instrucciones |
| SEC02 | 2–2 | DOCUMENTOS (PAPELES) DE EMBARQUE | Ayuda de identificación | Detalle de identificación y evidencia del operador | Referencia a documento de transporte; no inferir contenido ausente |
| SEC03 | 3–3 | CÓMO USAR ESTA GUÍA | Cómo usar GRE | Advertencia de alcance y selección de información | Diagrama excluye varios materiales; decisiones humanas |
| SEC04 | 4–4 | NÚMEROS DE TELÉFONOS LOCALES DE EMERGENCIA | Contactos locales: documento | Contactos institucionales separados y validados | Formulario vacío no genera teléfonos |
| SEC05 | 5–5 | TABLA DE CONTENIDOS | Navegador del documento | Acceso a fuente del apartado seleccionado | Índice como navegación |
| SEC06 | 6–6 | PRECAUCIONES DE SEGURIDAD | Seguridad general | Advertencias pertinentes junto a peligros/seguridad | Texto y condiciones completos |
| SEC07 | 7–7 | NOTIFICACIÓN Y SOLICITUD DE INFORMACIÓN TÉCNICA | Información técnica y notificación | Acceso a contactos y fuentes por jurisdicción | No automatizar llamadas ni solicitudes externas |
| SEC08 | 8–8 | SISTEMA DE CLASIFICACIÓN DE PELIGRO | Clasificación y glosario | Detalle solo si clasificación está respaldada | No deducir clasificación nueva |
| SEC09 | 9–9 | INTRODUCCIÓN A LA TABLA DE MARCAS, ETIQUETAS Y CARTELES/PLACAS | Ayuda de identificación por placa | Referencia provisional cuando no hay nombre/id | Sustituir por información específica al estar disponible |
| SEC10 | 10–11 | TABLA DE MARCAS, ETIQUETAS Y CARTELES/PLACAS Y GUÍA DE RESPUESTA INICIAL PARA SER UTILIZADA EN LA ESCENA | Figuras de placas y guías | Identificación provisional y guía vinculada | Figuras/leyendas visibles; no confirmación OCR automática |
| SEC11 | 12–14 | TABLA DE IDENTIFICACIÓN PARA CARROS DE FERROCARRIL | Figuras de carros de ferrocarril | Detalle de identificación si contexto lo requiere | No inferir material exacto de la silueta |
| SEC12 | 15–17 | TABLA DE IDENTIFICACIÓN PARA REMOLQUES | Figuras de remolques | Detalle de identificación si contexto lo requiere | No convertir tipo de remolque en sustancia confirmada |
| SEC13 | 18–19 | SISTEMA GLOBALMENTE ARMONIZADO DE CLASIFICACIÓN Y ETIQUETADO DE PRODUCTOS QUÍMICOS (SGA) | SGA: figuras y texto | Consulta auxiliar de símbolos, bajo demanda | Sistema de símbolos separado de identificación ONU |
| SEC14 | 20–24 | NÚMEROS DE IDENTIFICACIÓN DE PELIGROS FIJADOSEN CONTENEDORES INTERMODALES | Códigos de peligro | Ayuda de lectura del panel y validación de candidatos | Número superior de peligro distinto del identificador inferior |
| SEC15 | 25–31 | TRANSPORTE POR TUBERÍAS (O DUCTOS) | Tuberías y advertencias | Detalle si operador declara contexto de tubería | Conservar figuras y limitaciones; notas PDF 31 |
| SEC16 | 32–93 | ÍNDICE DE NÚMEROS DE IDENTIFICACIÓN (SECCIÓN AMARILLA) | Búsqueda por identificador | Elegir entrada, guía, P y verde | Instrucciones PDF 32; filas desde 33; múltiples nombres |
| SEC17 | 94–153 | ÍNDICE DE NOMBRES DE MATERIALES (SECCIÓN AZUL) | Búsqueda por nombre | Elegir entrada y fuentes de índices | Instrucciones PDF 94; filas desde 95; alias solo explícitos |
| SEC18 | 154–155 | CÓMO USAR LA SECCIÓN NARANJA | Uso de guías naranjas | Orden de peligros y explicación de apartados | Ejemplo incrustado no se importa como otra guía |
| SEC19 | 156–157 | PRIMEROS AUXILIOS GENERALES | Primeros auxilios generales | Respuesta: abrir contenido pertinente íntegro | Sin recomendaciones nuevas; notas PDF 157 |
| SEC20 | 158–285 | GUÍAS (SECCIÓN NARANJA) | Ficha/guía completa | Peligros, seguridad, respuesta pertinente y fuente | 62 con contenido y dos intencionalmente vacías; orden original |
| SEC21 | 286–288 | INTRODUCCIÓN A LAS TABLAS VERDES | Introducción a tablas verdes | Condiciones, límites y advertencias de distancia | Separar regla explícita de factor cualitativo sin fórmula |
| SEC22 | 289–290 | ACCIONES DE PROTECCIÓN | Acciones de protección | Factores al registrar decisión de mando | No elegir evacuación/refugio automáticamente |
| SEC23 | 291–293 | FACTORES A CONSIDERAR EN LA DECISIÓN DE ACCIONES DE PROTECCIÓN | Factores de protección | Detalle de decisión y fundamento del responsable | Tabla cualitativa, sin puntuación inventada; notas PDF 293 |
| SEC24 | 294–295 | INFORMACIÓN ACERCA DE LA TABLA 1 - DISTANCIAS DEAISLAMIENTO INICIAL Y ACCIÓN PROTECTORA | Información sobre tabla 1 | Explicación de alcance y día/noche/tamaño | Contexto estadístico, no garantía individual |
| SEC25 | 296–333 | TABLA 1 - DISTANCIAS DE AISLAMIENTO INICIAL Y ACCION PROTECTORA | Tabla 1 y uso | Distancias pertinentes, condiciones y capas calculadas | Instrucciones/diagramas 296–297; filas 298–333; referencias y + |
| SEC26 | 334–339 | TABLA 2 - MATERIALES REACTIVOS CON EL AGUA QUE PRODUCEN GASES TÓXICOS | Tabla 2 y uso | Reactividad al agua y gases informativos | No sustituir distancia por la del gas generado |
| SEC27 | 340–343 | CÓMO USAR LA TABLA 3 - DISTANCIAS DE AISLAMIENTO INICIAL Y ACCIONES DE PROTECCIÓN PARA DERRAMES GRANDES PARA DIFERENTES CANTIDADES DE SEIS GASES PTI MÁS COMUNES | Tabla 3 y uso | Contenedor, viento, período y selección aplicable | Seis grupos y siete ids; no generalizar fuera de alcance |
| SEC28 | 344–349 | GUÍA DEL USUARIO GRE2024 | Guía del usuario | Ayuda contextual y límites de interpretación | No reemplaza capacitación/juicio; navegación completa |
| SEC29 | 350–351 | ROPA DE PROTECCIÓN PERSONAL | Protección personal | Detalle de seguridad y verificación humana de recursos | Disponibilidad no equivale a compatibilidad; no asignación automática |
| SEC30 | 352–352 | DESCONTAMINACIÓN | Descontaminación | Apartado de respuesta bajo demanda | Contenido original completo, sin checklist inventado |
| SEC31 | 353–355 | CONTROL DE INCENDIOS Y DERRAMES | Control de incendios/derrames | Respuesta pertinente y fuente | No convertir orientación en orden automática |
| SEC32 | 356–356 | CONSIDERACIONES PARA INCENDIOS DE BATERÍASDE LITIO Y VEHÍCULOS ELÉCTRICOS (VE) | Baterías/vehículos eléctricos | Anexo si ese contexto se declara; acceso manual siempre | No deducir batería/tipo de vehículo solo por nombre del servicio |
| SEC33 | 357–357 | BLEVE Y ROTURA INDUCIDA POR CALOR | BLEVE: contexto | Advertencia y anexo si el contexto fue declarado | No afirmar BLEVE por temperatura sola |
| SEC34 | 358–359 | BLEVE - PRECAUCIONES DE SEGURIDAD | BLEVE: tabla especial y notas | Consulta de tabla independiente con condiciones | Valores aproximados; no contador garantizado de ruptura |
| SEC35 | 360–367 | USO CRIMINAL O TERRORISTA DE AGENTES QUÍMICOS,BIOLÓGICOS, RADIOLÓGICOS | QBRN: indicadores y tabla especial | Anexo por contexto declarado y decisión de mando | No diagnóstico automático ni umbrales de tabla 1; incluye tabla PDF 367 |
| SEC36 | 368–369 | ARTEFACTOS EXPLOSIVOS IMPROVISADOS (AEI) | AEI: tablas y figuras | Anexo pertinente por contexto declarado | Categorías/unidades/notas propias; no combinar con distancias químicas |
| SEC37 | 370–382 | GLOSARIO | Glosario | Ayuda contextual de términos y clasificaciones | Texto/tablas completos; no reinterpretar términos |
| SEC38 | 383–385 | DATOS DE PUBLICACIÓN | Publicación y sugerencias | Fuente/edición; consulta documental bajo demanda | No enviar sugerencias ni mensajes externos automáticamente |
| SEC39 | 386–386 | CENTROS NACIONALES DE RESPUESTAS DE CANADÁ Y ESTADOS UNIDOS | Centros de respuesta: fuente | Contactos por jurisdicción, detalle manual | Teléfonos publicados no acreditan vigencia actual |
| SEC40 | 387–389 | ERAP - PLANES DE ASISTENCIA EN CASO DE EMERGENCIA | ERAP/NRC y notas | Advertencias solo en jurisdicción aplicable; consulta manual | Marcador abarca NRC y notas PDF 389; no imponer regla local canadiense |
| SEC41 | 390–391 | NÚMEROS DE TELÉFONO DE RESPUESTA DE EMERGENCIA 24 HORAS | Contactos 24 horas: fuente | Detalle por jurisdicción y configuración institucional | Sin números inventados ni llamadas automáticas |
| SEC42 | 392–392 | CONTRAPORTADA | Contraportada y límites | Ayuda y advertencia de alcance | No certificados de cumplimiento ni fichas de seguridad nuevas |

Las hojas de notas PDF 31, 157, 293 y 389 se conservan como fuente; no se convierten en filas o procedimientos. Los rangos de marcadores contienen subtipos: instrucciones, figuras, filas y notas se separan durante la importación.

La tabla 1 se muestra en Distancias cuando es aplicable; la tabla 2 en Reactividad al agua; la tabla 3 en la selección contextual de derrame grande. Las tablas especiales BLEVE, agentes químicos y AEI tienen estructuras y contextos propios. El glosario y las tablas cualitativas permanecen navegables.

Registro verificable: [matriz-gre.json](evidencia/fase2/matriz-gre.json). Ver [experiencia](FASE_2_EXPERIENCIA.md) y [arquitectura](FASE_2_ARQUITECTURA.md).
