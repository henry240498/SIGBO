# Fase 1 — análisis documental GRE

Fecha: 2026-10-07. Fuente real: [GRE2024-Spa-Web-a.pdf](../Manuales/GRE2024-Spa-Web-a.pdf). SHA-256 `bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`.

## 1. Identidad y cobertura

PDF 1.7, 8.182.725 bytes, 392 páginas. Portada y metadatos identifican GRE 2024 en español. Documento no cifrado, generado con Adobe InDesign/PDF Library. El diagnóstico selecciona por carpeta y contenido; no depende de un nombre fijo. Si hay varios archivos, exige selección explícita.

| Medición del documento real | Resultado |
|---|---:|
| Páginas con texto nativo | 392 de 392 |
| Caracteres nativos extraídos | 833.520 |
| Secciones de cobertura exacta | 42 |
| Páginas con dibujos vectoriales | 377 |
| Páginas con imágenes bitmap referenciadas | 0 |
| Páginas con regiones verdes candidatas | 157 |
| Cabeceras de guía distintas | 64: 111–174 |
| Guías con contenido | 62 |
| Guías intencionalmente sin materiales | 121 y 167 |
| Hojas de notas | PDF 31, 157, 293, 389 |
| Páginas con alerta del inspector | PDF 154: numeración múltiple |

El [inventario JSON](evidencia/fase1/inventario-gre.json) conserva dimensiones, hashes de texto, cantidad de palabras, dibujos, colores, candidatos, cabeceras, notas y alertas por página. El [mapa documental](evidencia/fase1/mapa-documental.md) cubre cada página exactamente una vez.

Se revisaron las 392 páginas en ocho hojas de contacto, y a mayor escala muestras de índices, tablas, figuras e instrucciones: PDF 3, 35, 297, 298, 335, 341, 368 y 10. Representaciones locales en `logs/matpel/fase1/visual/`, no versionadas. La revisión de cobertura y maquetación no certifica lectura exacta de todas las celdas; esa validación corresponde al importador de fase 3.

## 2. Tratamiento de todo el documento

Las páginas siguientes son del **archivo PDF**, desde 1; «impresa» se refiere al rótulo interno. No confundirlas con índices de página desde 0 que usan las bibliotecas.

| Páginas PDF | Contenido | Tratamiento posterior |
|---|---|---|
| 1–9 | Portada, documentos de embarque, flujo de uso, teléfonos locales, índice, seguridad, notificación y clasificación | Texto íntegro navegable y reglas explícitas con procedencia. Teléfonos locales en blanco no se convierten en registros |
| 10–19 | Placas/etiquetas, carros de ferrocarril, remolques y SGA | Figuras vectoriales visibles en fuente; referencias a guías y texto contextual. No reducir iconos a OCR de palabras |
| 20–31 | Códigos de peligro y tuberías; notas | Texto, tablas cualitativas y figuras. Separar número de peligro superior e identificación inferior |
| 32 | Instrucciones del índice amarillo | Reglas de consulta |
| 33–93 | Filas del índice amarillo, 61 páginas | Entradas por identificador, nombre, guía, P y resaltado verde; relaciones no necesariamente uno a uno |
| 94 | Instrucciones del índice azul | Reglas de consulta |
| 95–153 | Filas del índice azul, 59 páginas | Entradas por nombre, identificador, guía y señales; reconciliar con amarillo sin eliminar nombres diferentes |
| 154–157 | Uso de guías naranjas, ejemplo, primeros auxilios y notas | Reglas y texto con referencias. El ejemplo de guía 117 en PDF 154 no es otra guía del catálogo |
| 158–285 | Guías naranjas; dos páginas por número | Contenido y jerarquía completos; 121 (178–179) y 167 (270–271) son páginas intencionalmente sin materiales |
| 286–295 | Introducción verde, acciones protectoras, evacuación/refugio, factores, tabla cualitativa, notas y explicación de tabla 1 | Reglas, condiciones y notas; conservar distinción entre reglas explícitas y factores sin fórmula |
| 296–297 | Uso y diagramas de tabla 1 | Condiciones de aplicabilidad, geometría explicada y advertencias |
| 298–333 | Filas de tabla 1, 36 páginas | Distancias, unidades, tamaño, día/noche, nombres y condiciones tierra/agua; referencias a tabla 3 y modificadores como `+` |
| 334 | Uso de tabla 2 | Condiciones y prohibición de sustituir distancia por la del gas generado |
| 335–339 | Filas de tabla 2, 5 páginas | Material y gases PTI producidos, nombres/fórmulas y leyendas, solo para condición de derrame en agua |
| 340 | Uso de tabla 3, contenedores y tabla de estimación de viento | Condiciones, unidades y categorías |
| 341–343 | Filas de tabla 3, 3 páginas | Material/grupo, contenedor, aislamiento y protección por día/noche y viento |
| 344–356 | Guía del usuario, protección personal, descontaminación, control de incendio/derrame y baterías/vehículos eléctricos | Texto íntegro, reglas contextuales y advertencias; no crear checklists omitiendo condiciones |
| 357–359 | BLEVE y tabla especial de seguridad | Anexo íntegro + estructura tabular propia, con advertencias de aproximación y variabilidad |
| 360–367 | Uso criminal/terrorista, indicadores QBRN, definiciones y tabla de agentes químicos; introducción AEI | Anexo, tablas cualitativas y tabla especial. Mantener contexto y umbrales propios |
| 368–369 | Tablas AEI: equivalentes TNT y GLP | Tablas especiales con notas y figuras; no mezclarlas con distancias de tabla 1 |
| 370–382 | Glosario y clasificaciones/tablas explicativas | Texto y tablas cualitativas íntegros, término y página localizables |
| 383–391 | Publicación, contactos, formulario de sugerencias, centros nacionales, ERAP, NRC, notas y contactos 24 horas | Fuente navegable y registros documentales con jurisdicción. El marcador ERAP también abarca NRC/nota; no asumir que todo su rango sea una sola regla canadiense |
| 392 | Contraportada y limitaciones | Texto original y límites de uso visibles |

Las tablas especiales de BLEVE, agentes químicos y AEI deben figurar en el alcance. Inventariar únicamente las tres tablas verdes dejaría contenido relevante omitido.

## 3. Hallazgos que condicionan el importador

### Texto y coordenadas

Las 392 páginas disponen de texto; no procede ejecutar OCR masivo por defecto. `get_text()` obtiene 833.520 caracteres; ordenar automáticamente por posición con `sort=True` incrementó espacios y no resolvió el orden de lectura tabular. El parsing deberá usar palabras/bloques, cajas y orientación, con encabezados y columnas comprobados visualmente.

Tablas 1 y 3 y varias tablas de anexos contienen contenido girado 90° aunque la propiedad de rotación de la página no lo indique. Normalizar orientación de texto y coordenadas antes de detectar filas/columnas. Hay encabezados repetidos, celdas combinadas, referencias y filas de varios renglones. Una celda vacía no equivale a cero ni a una instrucción de copiar el valor anterior sin evidencia.

### Color y significado

El verde se conserva como dibujo vectorial; se detectaron rellenos aproximados RGB `(0.552, 0.778, 0.247)`. Hay verde de margen y encabezado además de filas. Los 157 resultados son **páginas con candidatos geométricos**, no 157 materiales. La futura bandera exige vincular el rectángulo a la fila y comprobarla contra ambos índices. El sufijo P pertenece a la relación de material/guía, no a un número de guía diferente.

### Numeración y guías

Habitualmente página PDF menos dos coincide con la impresa, pero no es un contrato. PDF 154 incluye páginas 152, 168 y 169 por el ejemplo insertado. Hay portada, contraportada y página sin numeración extraída. Guardar ambas referencias y la caja del contenido, evitando desplazar todos los datos por una constante.

Hay 64 números de guía y **62 guías con contenido**, sin inconsistencia pendiente en ese conteo: 121 y 167 declaran que no hay materiales que hagan referencia a ellas. Conservarlas como guías intencionalmente vacías, sin inventar procedimientos. La prioridad de peligros no tiene orden fijo: PDF 154 especifica que el peligro primario se enumera primero. No ordenar todas las guías por incendio antes de salud.

### Relaciones y distancias

Identificador de cuatro dígitos no determina necesariamente un solo nombre/fila. Tabla 3 se describe como seis gases comunes, pero comprende siete identificadores: 1005, 1017, 1040, 1050, 2186, 1052, 1079; 1040 incluye dos nombres. No generar validación que rechace la fuente por esperar seis ids.

Tabla 1 puede remitir a tabla 3 en vez de contener una cifra para un derrame grande, por ejemplo Cloro/1017 en PDF 298. Conservar esa referencia como dato válido. `11.0+` mantiene el operador `+`, la unidad y la advertencia; no es un techo exacto. Los diagramas indican aislamiento circular y protección cuadrada en dirección del viento; no acreditan una simulación de dispersión.

## 4. Casos reales para la siguiente fase

| Caso de la fuente | Dónde verificar | Qué debe demostrar |
|---|---|---|
| 1092, Acroleína estabilizada, guía 131P y resaltado verde | PDF 35; explicación PDF 345 | P y verde no se pierden al normalizar/buscar |
| Varios nombres para un identificador | Índice amarillo PDF 35 y regla PDF 296 | Resultado y selección conservan la entrada concreta |
| 1017, Cloro, remisión a tabla 3 | PDF 298 y 341 | No tratar la referencia como valor ausente ni aplicar un único número para todo contenedor/viento |
| 1689, Cianuro de sodio, generación de HCN al agua | Ejemplo explícito PDF 334, filas PDF 335 | Consultar distancia del material según fuente; gas producido informativo |
| Guía 117 dentro de explicación | PDF 154 frente a la sección 158–285 | Evitar importar el ejemplo como guía duplicada |
| Guías 121 / 167 | PDF 178–179 / 270–271 | Estado intencionalmente sin materiales, distinto de extracción fallida |
| Derrame de 208 L; día/noche y viento 10/20 km/h | PDF 294–296 y 340 | Límites y unidades preservados; hora solar y dato desconocido explícitos |
| Liberación instantánea de todo un embalaje | PDF 286–287 y nota 3 PDF 297 | Conservar diferencias de formulación, causa y fuente; no duplicar todo accidente automáticamente |
| Agentes de guerra químicos y AEI | PDF 365, 367–369 | Umbrales/categorías y notas de anexos independientes de tabla 1 |

Estos son casos documentales para pruebas posteriores; no se insertaron registros de incidentes, personas, publicaciones ni materiales en una base operativa.

## 5. OCR selectivo y validación pendiente

Si una futura edición o región no tiene texto útil, marcar página/región afectada, rasterizarla y ejecutar OCR local de manera selectiva. Mantener imagen, motor/versión, texto nativo y OCR separados. No se encontró `tesseract` en PATH en este entorno y no se instaló durante el diagnóstico.

Antes de activar un catálogo: reconciliar entradas de ambos índices, validar enlaces a guías/tablas, cotejar valores críticos y notas contra el PDF, detectar filas/columnas sin asignación y registrar discrepancias. Revisar todas las celdas críticas y condiciones, además de muestras visuales, con responsables del contenido. La disponibilidad de texto o un OCR exitoso no sustituyen esa validación.

Para reproducir el inventario: `python scripts/matpel/inspeccionar_gre.py --salida docs/matpel/evidencia/fase1`. Dependencia diagnóstica: PyMuPDF, versión registrada en JSON. No es un servicio productivo, no importa datos ni accede a red/DB. Los resultados de aceptación del diagnóstico se detallan en [FASE_1_VALIDACION.md](FASE_1_VALIDACION.md).
