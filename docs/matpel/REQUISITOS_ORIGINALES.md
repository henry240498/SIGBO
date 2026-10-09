# IMPLEMENTACIÓN DEFINITIVA — INTEGRACIÓN COMPLETA DE LA GRE EN SIGBO / MATPEL / SCI

## ROL

Actúa simultáneamente como:

- arquitecto de software senior;
- desarrollador full-stack;
- especialista en sistemas de gestión de emergencias;
- especialista en MATPEL / HAZMAT;
- diseñador de sistemas de apoyo a la decisión;
- especialista GIS;
- especialista en extracción documental;
- especialista en OCR y visión artificial clásica;
- ingeniero de datos;
- especialista en UX para sistemas críticos y operación en campo;
- auditor técnico de trazabilidad y calidad de datos.

Tu misión es **analizar, diseñar, implementar, integrar, probar y dejar funcionando dentro del proyecto SIGBO una integración completa de la GRE**, no como un simple PDF ni como un buscador documental, sino como una **fuente de conocimiento operacional estructurada capaz de asistir tanto la consulta MATPEL como el trabajo del Sistema de Comando de Incidentes (SCI).**

---

# 0. UBICACIÓN DEL PROYECTO Y DE LA GRE

El proyecto existente se encuentra en:

```text
C:\Proyectos\Personal\SIGBO
```

La documentación/manuales se encuentra en:

```text
C:\Proyectos\Personal\SIGBO\docs\Manuales
```

IMPORTANTE:

Dentro de:

```text
C:\Proyectos\Personal\SIGBO\docs\Manuales
```

existe actualmente **un único archivo**.

Ese archivo es la GRE que debe utilizarse como fuente documental.

Por lo tanto:

1. inspecciona el directorio;
2. detecta automáticamente el único archivo existente;
3. identifica su formato;
4. valida que corresponda a la GRE;
5. calcula y registra su hash;
6. determina edición, versión y metadatos disponibles;
7. utilízalo como fuente documental oficial de esta implementación.

No asumas que el nombre del archivo será exactamente:

```text
GRE2024.pdf
```

No codifiques innecesariamente un nombre de archivo fijo.

La detección debe realizarse por el contenido y la ubicación del documento.

Si en el futuro aparecen varios manuales en esa carpeta, la arquitectura debe permitir seleccionar explícitamente cuál corresponde a la GRE.

---

# 1. PRINCIPIO FUNDAMENTAL

La GRE NO debe tratarse solamente como una base de datos de:

```text
ONU
material
guía
distancias
```

La GRE es una **guía operacional de respuesta a emergencias con materiales peligrosos**.

Por lo tanto, debes analizar no solamente:

> qué información contiene,

sino especialmente:

> qué indica hacer ante cada situación;

> qué precauciones establece;

> qué decisiones operacionales condiciona;

> qué advertencias establece;

> qué información necesita conocer el respondiente;

> qué acciones recomienda;

> qué acciones deben priorizarse;

> qué riesgos deben considerarse;

> qué diferencias existen dependiendo del material o escenario;

> y cómo esos criterios pueden incorporarse al flujo operacional de SIGBO y al SCI.

La integración debe transformar:

```text
GRE
↓
Información
↓
Criterios operacionales
↓
Contexto del incidente
↓
Asistencia operacional
↓
SCI
```

SIN convertir la GRE en un sistema autónomo de toma de decisiones.

SIGBO debe **asistir al personal**, no sustituir el criterio profesional, el mando ni los procedimientos institucionales.

---

# 2. FUENTE DE VERDAD

La GRE encontrada en:

```text
C:\Proyectos\Personal\SIGBO\docs\Manuales
```

será la fuente documental para cualquier información que se atribuya a la GRE.

No reemplaces información de la GRE con:

- conocimiento general;
- datos inventados;
- inferencias de una IA;
- contenido generado;
- respuestas de ChatGPT;
- resultados obtenidos de otras fuentes sin identificarlas;
- aproximaciones;
- datos "probables".

Debe existir una separación explícita entre:

```text
DATOS OFICIALES DE LA GRE
```

y cualquier:

```text
FUNCIONALIDAD COMPLEMENTARIA DE SIGBO
```

Si SIGBO agrega cálculos, mapas, información meteorológica, GIS, registros propios o procedimientos internos, indicar claramente que son datos complementarios del sistema y no contenido original de la GRE.

---

# 3. PROHIBICIÓN DE API DE IA EN ESTA FASE

En esta implementación NO utilizar:

- OpenAI API;
- Anthropic API;
- Gemini API;
- Groq;
- OpenRouter;
- APIs externas de modelos de lenguaje;
- APIs de visión generativa;
- APIs de IA propietarias;
- asistentes en la nube para resolver funcionalidad operacional.

La aplicación final debe poder funcionar sin ninguna API de IA.

Para cada necesidad utilizar soluciones programáticas y determinísticas.

Ejemplos:

### Texto de PDF

Usar herramientas como:

- PyMuPDF;
- pdfplumber;
- extracción nativa del PDF.

### OCR

Evaluar:

- Tesseract;
- PaddleOCR;
- OCRmyPDF.

### Procesamiento visual

Evaluar cuando corresponda:

- OpenCV;
- procesamiento de imagen;
- detección de contornos;
- corrección de perspectiva;
- OCR;
- reconocimiento determinístico de patrones.

### Tablas

Evaluar:

- Camelot;
- Tabula;
- pdfplumber;
- parsing propio.

### Identificación

Utilizar:

- expresiones regulares;
- reglas;
- diccionarios;
- índices;
- tablas;
- relaciones.

### Cálculos

Utilizar código.

### GIS

Utilizar geometría y librerías geoespaciales.

No utilizar una LLM para decidir:

```text
qué hacer
qué distancia usar
qué peligro existe
qué material corresponde
qué procedimiento aplicar
qué zona crear
qué valor seleccionar
```

si dicha información debe provenir de la GRE.

---

# 4. PRIMERA FASE OBLIGATORIA: ANALIZAR EL SISTEMA EXISTENTE

ANTES de implementar nada:

Analiza completamente:

```text
C:\Proyectos\Personal\SIGBO
```

Debes comprender:

- arquitectura;
- frontend;
- backend;
- base de datos;
- estructura de paquetes;
- módulos;
- rutas;
- APIs;
- autenticación;
- permisos;
- usuarios;
- roles;
- servicios;
- incidentes;
- SCI;
- MATPEL existente;
- gestión de móviles;
- personal;
- ubicación;
- mapas;
- GIS;
- geolocalización;
- meteorología si existe;
- unidades;
- cálculos;
- auditoría;
- notificaciones;
- formularios;
- UX;
- almacenamiento;
- archivos;
- historial;
- modo móvil;
- modo offline si existe;
- PWA o APK si existe;
- servicios existentes;
- utilidades reutilizables.

No crear arquitecturas paralelas innecesarias.

No reescribir componentes funcionales sin motivo.

No duplicar funcionalidades.

No cambiar tecnologías porque sí.

No destruir funcionalidades existentes.

No modificar nomenclaturas o estructuras existentes sin necesidad técnica real.

La solución debe parecer una evolución natural de SIGBO.

---

# 5. SEGUNDA FASE: ANALIZAR LA GRE COMPLETA

No comenzar programando el importador a ciegas.

Primero analiza el documento completo.

Determina:

- estructura general;
- índice;
- tipos de páginas;
- secciones;
- códigos;
- números ONU;
- nombres de materiales;
- números de guía;
- guías;
- tablas;
- símbolos;
- notas;
- excepciones;
- llamadas;
- referencias cruzadas;
- páginas introductorias;
- instrucciones de uso;
- información operacional;
- tablas especiales;
- criterios de selección;
- advertencias;
- distancias;
- unidades;
- diferencias día/noche;
- categorías de derrame cuando existan;
- cualquier estructura utilizada por la GRE.

No asumas estructuras solamente porque las conoces de otras ediciones.

Debes obtenerlas del documento real encontrado en el proyecto.

---

# 6. LA GRE DEBE ENTENDERSE COMO UNA GUÍA

Este punto es CRÍTICO.

Analiza cuidadosamente todas las páginas que expliquen:

```text
cómo utilizar la GRE;
qué hacer inicialmente;
cómo identificar un material;
cómo seleccionar una guía;
cómo interpretar tablas;
qué limitaciones posee;
qué precauciones deben observarse;
qué información debe buscar primero el respondiente;
qué acciones recomienda la propia GRE.
```

Debes extraer estos conceptos explícitamente.

Crear dentro del sistema una representación estructurada de:

```text
criterios de utilización de la GRE
reglas de consulta
reglas de navegación
criterios operacionales
advertencias
limitaciones
dependencias
condiciones
referencias cruzadas
```

El objetivo es que SIGBO no solamente sepa:

```text
ONU 1203 = X
```

sino también qué información de la GRE corresponde presentar al operador para ese escenario y cómo la propia guía organiza esa respuesta.

---

# 7. ARQUITECTURA CONCEPTUAL

La arquitectura final debe aproximarse a:

```text
                       GRE ORIGINAL
                            │
                            ▼
                  EXTRACTOR DOCUMENTAL
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
      TEXTO               TABLAS             IMÁGENES
        │                   │                   │
        └───────────┬───────┴───────────┬───────┘
                    ▼                   ▼
                 PARSER          OCR / VISIÓN
                    │                   │
                    └──────────┬────────┘
                               ▼
                        NORMALIZACIÓN
                               │
                               ▼
                          VALIDACIÓN
                               │
                               ▼
                    BASE GRE ESTRUCTURADA
                               │
          ┌────────────────────┼────────────────────┐
          ▼                    ▼                    ▼
     CONSULTA GRE         MOTOR MATPEL       FUENTES/TRAZA
          │                    │
          └────────────┬───────┘
                       ▼
                 INCIDENTE SIGBO
                       │
                       ▼
                      SCI
                       │
             ┌─────────┼─────────┐
             ▼         ▼         ▼
           MAPA     ACCIONES   RECURSOS
             │         │         │
             └─────────┼─────────┘
                       ▼
               INTERFAZ OPERACIONAL
```

---

# 8. PROCESO DE INGESTIÓN REPRODUCIBLE

Construir un importador real.

Flujo:

```text
archivo GRE
↓
identificación documental
↓
hash
↓
extracción nativa
↓
detección de páginas problemáticas
↓
OCR selectivo
↓
detección de estructura
↓
detección de tablas
↓
parsing
↓
normalización
↓
relaciones
↓
validación
↓
base estructurada
↓
informe de importación
```

No cargar manualmente miles de registros.

El proceso debe ser reproducible.

En el futuro debe ser posible colocar otra edición de la GRE y ejecutar nuevamente el importador.

---

# 9. NO APLICAR OCR A TODO INNECESARIAMENTE

Implementar una estrategia escalonada.

### Nivel 1

Extracción nativa del PDF.

### Nivel 2

Validación del resultado.

### Nivel 3

Si la extracción falla:

```text
renderizar página
↓
preprocesar
↓
OCR
```

### Nivel 4

Comparar OCR con patrones esperados.

Ejemplos:

```text
ONU
número de guía
unidades
distancias
encabezados
```

### Nivel 5

Marcar valores dudosos.

El OCR recupera caracteres.

NO decide significado.

---

# 10. TRAZABILIDAD A NIVEL DE DATO

Siempre que resulte técnicamente razonable conservar:

```text
documento
edición
hash
página
sección
tabla
fila
columna
texto original
valor estructurado
método de extracción
confianza cuando proceda
fecha de importación
```

Debe poder recorrerse:

```text
dato mostrado
↓
registro estructurado
↓
fuente
↓
página
↓
fragmento original
```

---

# 11. BASE DE CONOCIMIENTO GRE

Modelar la información siguiendo la estructura REAL descubierta en el documento.

Como mínimo, cuando exista en la fuente, contemplar:

## Material

```text
ONU
nombre
sinónimos explícitos
clasificación
número de guía
referencias
observaciones
```

## Guía

```text
número
título
peligros potenciales
incendio/explosión
salud
seguridad pública
ropa protectora
evacuación
respuesta de emergencia
incendio
derrame/fuga
primeros auxilios
otras secciones existentes
```

No presupongas exactamente esos títulos.

Respeta los encabezados reales encontrados.

---

# 12. TABLAS

Las tablas deben transformarse en datos estructurados.

Especial atención a las relacionadas con:

- aislamiento;
- protección;
- distancias;
- cantidades;
- condiciones;
- día/noche;
- materiales específicos;
- referencias especiales.

No guardar únicamente:

```text
"ver tabla de la página 300"
```

Debes convertir la información tabular a registros consultables sin perder:

```text
fila
columna
unidad
condición
encabezados
notas
fuente
```

---

# 13. INTEGRIDAD

Nunca:

- redondear silenciosamente;
- inferir;
- completar;
- corregir automáticamente;
- reconciliar inconsistencias;
- transformar valores ambiguos en datos seguros.

Ejemplo:

Si aparece:

```text
300 m
```

guardar conceptualmente:

```text
valor_original = "300 m"
valor = 300
unidad = "m"
```

Si dos lugares del documento presentan valores diferentes:

```text
NO elegir uno mediante heurística silenciosa.
```

Registrar la inconsistencia.

---

# 14. VALIDADOR DE IMPORTACIÓN

Generar automáticamente un informe similar a:

```text
IMPORTACIÓN GRE

Documento:
Edición:
Hash:

Páginas totales:
Páginas procesadas:
Páginas extracción directa:
Páginas OCR:
Páginas fallidas:

Números ONU:
Materiales:
Guías:
Tablas:
Relaciones:
Distancias:
Registros:

ERRORES
- ...

ADVERTENCIAS
- ...

INCONSISTENCIAS
- ...

VALIDACIONES
- ...
```

No considerar válida una importación si quedan secciones críticas sin procesar.

---

# 15. CONSULTA MATPEL

SIGBO debe disponer de una consulta extremadamente rápida.

Permitir búsqueda por los criterios realmente soportados por la información extraída, incluyendo cuando corresponda:

```text
ONU
nombre
nombre parcial
sinónimo explícito
número de guía
clasificación
```

Resultado:

```text
ONU XXXX
MATERIAL

Guía
Clasificación

PELIGROS

SEGURIDAD PÚBLICA

RESPUESTA

INCENDIO

DERRAME/FUGA

PRIMEROS AUXILIOS

DISTANCIAS

ADVERTENCIAS

FUENTE
```

---

# 16. "VER FUENTE"

Toda información crítica debe ofrecer:

```text
Ver fuente
```

Al ejecutarlo:

- abrir el documento original;
- posicionarse, si técnicamente es viable, en la página pertinente;
- mostrar edición;
- página;
- sección;
- referencia.

El operador nunca debe quedar obligado a confiar ciegamente en el dato estructurado.

Debe poder comprobar el documento original.

---

# 17. MODO CONSULTA Y MODO INCIDENTE

Crear dos contextos claramente diferenciados.

## CONSULTA

Para estudiar o buscar información.

Ejemplo:

```text
buscar ONU
consultar guía
consultar material
consultar peligros
consultar primeros auxilios
consultar distancias
abrir GRE
```

## INCIDENTE

Cuando la consulta ocurre dentro de un servicio MATPEL activo.

En este modo SIGBO debe combinar:

```text
GRE
+
incidente
+
SCI
+
mapa
+
recursos
+
personal
+
móviles
+
ubicación
+
condiciones disponibles
```

sin confundir datos oficiales con datos derivados del sistema.

---

# 18. INTEGRACIÓN PROFUNDA CON SCI

Este es uno de los principales objetivos.

Analiza primero cómo está implementado actualmente el módulo SCI de SIGBO.

Después determina qué información MATPEL debe incorporarse al SCI.

NO crees un segundo SCI.

Amplía el existente.

Un incidente MATPEL debería poder alimentar automáticamente las áreas relevantes del SCI.

Por ejemplo:

```text
INCIDENTE
│
├── identificación
├── material involucrado
├── ubicación
├── situación
├── peligros
├── objetivos
├── zonas
├── seguridad
├── recursos
├── personal
├── comunicaciones
├── evacuación
├── mapa
└── historial
```

La estructura exacta deberá adaptarse al SCI ya existente.

---

# 19. LA GRE DEBE MEJORAR EL SCI

No quiero simplemente un botón:

```text
Consultar GRE
```

dentro del incidente.

Quiero que la información pertinente de la GRE mejore la operación del SCI.

Ejemplo conceptual:

```text
Se identifica material
        ↓
SIGBO obtiene información GRE
        ↓
detecta qué apartados son pertinentes
        ↓
los presenta dentro del incidente
        ↓
el SCI dispone inmediatamente de:
- peligros
- seguridad pública
- respuesta
- incendio
- derrame/fuga
- primeros auxilios
- distancias
- advertencias
        ↓
el mando utiliza esa información
```

El sistema debe reducir la cantidad de navegación manual necesaria durante una emergencia.

---

# 20. NO CONFUNDIR GUÍA CON ORDEN AUTOMÁTICA

La GRE orienta la respuesta.

SIGBO debe presentar esa orientación claramente.

Pero nunca transformar automáticamente una recomendación de la GRE en una orden operacional irreversible.

Diferenciar visualmente:

```text
INFORMACIÓN GRE
```

de:

```text
DECISIÓN DEL SCI
```

Ejemplo:

```text
GRE:
[contenido correspondiente]

Decisión operacional SCI:
[registrada por el responsable]
```

Esto permite conservar tanto la fuente como la responsabilidad del mando.

---

# 21. PANEL MATPEL DENTRO DEL SCI

Diseñar un panel contextual.

Cuando exista un incidente MATPEL mostrar prioritariamente:

```text
MATERIAL

ONU

GUÍA

PELIGROS CRÍTICOS

SEGURIDAD PÚBLICA

AISLAMIENTO / PROTECCIÓN

VIENTO

INCENDIO

DERRAME/FUGA

PRIMEROS AUXILIOS

MAPA

FUENTE
```

Evitar pantallas saturadas.

La información crítica debe aparecer primero.

Los detalles secundarios podrán expandirse.

---

# 22. CHECKLIST OPERACIONAL

Cuando la estructura de la GRE lo permita, SIGBO puede convertir información explícita de la guía en elementos de consulta/checklist.

Pero aplicar la siguiente regla:

```text
GRE → checklist
```

solo si cada elemento puede rastrearse inequívocamente a contenido de la GRE.

NO inventar procedimientos.

NO generar checklist mediante IA.

Cada elemento debe poder indicar:

```text
fuente
guía
sección
página
```

---

# 23. REGISTRO DE DECISIONES SCI

Cuando el responsable utilice información MATPEL para adoptar una decisión, permitir registrar:

```text
decisión
responsable
fecha/hora
fuente consultada
material
ONU
guía
edición GRE
parámetros del incidente
observación
```

Esto proporciona trazabilidad operacional.

---

# 24. INCIDENTE MATPEL

Adaptar el incidente actual de SIGBO.

Debe permitir, según la arquitectura existente:

### Identificación

```text
ONU
nombre
material desconocido
```

### Tipo de evento

Cuando corresponda:

```text
derrame
fuga
incendio
explosión
otro
```

### Cantidad

```text
valor
unidad
desconocida
estimada
confirmada
```

No obligar al operador a inventar un valor.

### Ubicación

Tomar del incidente o mapa existente.

### Hora

Automática.

### Condiciones

Reutilizar información ya disponible.

### Viento

Reutilizar el servicio existente si existe.

---

# 25. DATOS DESCONOCIDOS

Un sistema de emergencias debe funcionar incluso con información incompleta.

Permitir explícitamente:

```text
DESCONOCIDO
NO CONFIRMADO
ESTIMADO
CONFIRMADO
```

No sustituir datos faltantes con estimaciones silenciosas.

Visualizar la calidad de información.

Ejemplo:

```text
Material: NO CONFIRMADO
ONU observado: 1203
Cantidad: ESTIMADA
Viento: 12 km/h - fuente meteorológica
```

---

# 26. ACTUALIZACIÓN PROGRESIVA DEL INCIDENTE

El incidente debe poder evolucionar.

Ejemplo:

```text
09:32
Material desconocido

09:35
Se observa placa ONU

09:36
ONU 1203 identificado

09:37
SIGBO carga información GRE

09:39
Cantidad estimada

09:42
Cantidad confirmada
```

Cada cambio debe:

- recalcular solamente lo necesario;
- actualizar el mapa;
- actualizar recomendaciones visibles;
- conservar historial.

---

# 27. RECONOCIMIENTO DE ONU POR IMAGEN

Implementar una opción de captura o carga de fotografía.

Objetivo:

```text
foto
↓
preprocesamiento OpenCV
↓
detección de regiones
↓
OCR
↓
búsqueda de patrón ONU
↓
candidatos
↓
confirmación humana
```

Nunca:

```text
OCR → acción automática irreversible
```

Mostrar:

```text
Número detectado: 1203
Confianza: ...
[Confirmar]
[Corregir]
```

Después de la confirmación:

```text
1203
↓
consulta GRE
```

---

# 28. FUNCIONAMIENTO SIN INTERNET CUANDO SEA POSIBLE

La GRE estructurada debe residir localmente en la infraestructura de SIGBO.

La consulta esencial debe poder funcionar sin depender de Internet cuando la arquitectura actual permita operación offline.

Idealmente:

```text
material
guía
peligros
distancias
fuente
```

deben poder consultarse localmente.

Los servicios que sí requieran Internet, como determinados datos meteorológicos externos, deben degradarse correctamente.

La GRE nunca debe dejar de poder consultarse solamente porque falle una API externa.

---

# 29. MAPA OPERACIONAL

Reutilizar el mapa actual de SIGBO.

NO crear un segundo motor cartográfico sin necesidad.

Para incidentes MATPEL representar mediante capas independientes:

```text
incidente
aislamiento
protección
viento
perímetro
infraestructura relevante
unidades
recursos
puntos sensibles
```

siempre que esos datos estén disponibles.

---

# 30. GEOMETRÍA

Utilizar geometrías GIS reales.

No simular zonas mediante dibujos arbitrarios sobre la interfaz.

Separar:

```text
valor GRE
```

de:

```text
geometría SIGBO
```

Ejemplo conceptual:

```text
GRE
distancia = X

SIGBO
↓
convierte distancia a geometría geoespacial
↓
renderiza capa
```

Conservar trazabilidad:

```text
zona creada a partir de:
GRE ...
tabla ...
página ...
valor ...
```

---

# 31. VIENTO

Integrar la información de viento existente.

Mostrar:

```text
dirección
velocidad
fuente
fecha/hora
antigüedad
```

Si SIGBO utiliza un proveedor meteorológico externo, identificarlo.

No atribuir a la GRE información meteorológica obtenida externamente.

Distinguir:

```text
GRE
+
meteorología SIGBO
```

---

# 32. REACTIVIDAD

Todo parámetro que pueda modificar resultados visualizados debe disparar la actualización correspondiente.

Por ejemplo:

```text
material
cantidad
clasificación del incidente
hora
día/noche
ubicación
viento
```

cuando corresponda según las reglas reales implementadas.

Evitar recalcular innecesariamente todo el sistema.

---

# 33. FICHA OPERACIONAL

Cuando se identifica un material, generar una ficha compacta.

Ejemplo conceptual:

```text
ONU XXXX
NOMBRE

GUÍA XXX

⚠ PELIGROS

🛡 SEGURIDAD PÚBLICA

🔥 INCENDIO

💧 DERRAME/FUGA

✚ PRIMEROS AUXILIOS

📏 AISLAMIENTO / PROTECCIÓN

🗺 MAPA

📖 VER FUENTE
```

Los iconos son conceptuales.

Adáptalos al lenguaje visual actual de SIGBO.

---

# 34. INTERFAZ DE EMERGENCIA

Durante un servicio activo aplicar una UX de emergencia:

- botones grandes;
- mínima escritura;
- información crítica primero;
- navegación corta;
- alto contraste;
- responsive;
- usable bajo estrés;
- usable con una mano;
- confirmaciones solamente para acciones críticas;
- no utilizar diálogos innecesarios;
- evitar pantallas saturadas;
- mantener visible el contexto del incidente.

No intentar mostrar toda la GRE simultáneamente.

---

# 35. ACCESO A INFORMACIÓN PROFUNDA

La información debe organizarse por niveles.

### NIVEL 1 — crítico

Lo necesario inmediatamente.

### NIVEL 2 — operacional

Detalles relevantes.

### NIVEL 3 — documento

Información completa + fuente original.

Esto evita saturar al operador.

---

# 36. MOTOR MATPEL

La GRE proporciona información oficial.

El motor MATPEL combina cuando corresponde:

```text
GRE
+
material
+
tipo de incidente
+
cantidad
+
unidad
+
ubicación
+
fecha/hora
+
día/noche
+
viento
+
contexto SIGBO
```

El cálculo debe ser:

- determinístico;
- reproducible;
- testeable;
- auditable.

Guardar:

```text
inputs
reglas aplicadas
datos GRE utilizados
resultados
versión del motor
GRE utilizada
```

---

# 37. NO INVENTAR MODELOS

No crear automáticamente modelos físicos de dispersión únicamente porque existan datos de viento.

Si la GRE no define un cálculo, no afirmes que dicho cálculo pertenece a la GRE.

Si SIGBO ya posee o incorpora posteriormente un modelo adicional:

```text
ALOHA
modelo de dispersión
modelo atmosférico
etc.
```

debe aparecer claramente separado como:

```text
MODELO COMPLEMENTARIO
```

y no como resultado GRE.

---

# 38. API INTERNA

Crear o adaptar servicios reutilizables siguiendo la arquitectura existente.

Conceptualmente:

```text
GET /matpel/material/{onu}

GET /matpel/search?q=

GET /matpel/guides/{number}

GET /matpel/material/{onu}/hazards

GET /matpel/material/{onu}/response

GET /matpel/material/{onu}/distances

GET /matpel/material/{onu}/source

POST /matpel/incidents

POST /matpel/incidents/{id}/calculate

GET /matpel/incidents/{id}/operational

GET /matpel/incidents/{id}/map
```

NO copies esos endpoints literalmente si no encajan con el proyecto.

Primero analiza los patrones API existentes.

---

# 39. CAPA DE SERVICIOS

Separar claramente:

```text
GreDocumentService
GreImportService
GreValidationService
GreSearchService
GreGuideService
GreDistanceService
MatpelCalculationService
MatpelIncidentService
MatpelSourceService
MatpelMapService
```

o equivalentes de acuerdo con los patrones reales del proyecto.

No crear clases artificiales solamente para cumplir nombres.

---

# 40. PREPARACIÓN PARA FUTURA IA

Aunque esta versión NO empleará IA operacional, preparar la arquitectura para una futura capa opcional.

La futura IA nunca debería consumir directamente:

```text
PDF → LLM
```

como fuente principal.

Debe consumir:

```text
API MATPEL
↓
base estructurada
↓
fuente GRE
```

Conceptualmente:

```text
GRE
↓
Base de conocimiento
↓
Servicios MATPEL
↓
API
├── UI
├── MCP futuro
├── voz futura
├── agentes futuros
└── IA futura
```

---

# 41. PREPARACIÓN MCP

Diseñar servicios que posteriormente puedan exponerse como herramientas.

Por ejemplo:

```text
matpel.buscar_material
matpel.obtener_material
matpel.obtener_guia
matpel.obtener_peligros
matpel.obtener_respuesta
matpel.obtener_distancias
matpel.obtener_fuente
matpel.obtener_contexto_incidente
```

Pero NO es obligatorio implementar ahora un servidor MCP si no aporta valor inmediato.

Lo obligatorio es no diseñar el núcleo de una manera que impida incorporarlo después.

---

# 42. VOZ FUTURA

Preparar interfaces para que posteriormente pueda incorporarse:

```text
voz
↓
texto
↓
consulta estructurada
```

Sin alterar el motor MATPEL.

No es necesario depender actualmente de servicios de voz externos.

---

# 43. VERSIONAMIENTO DE LA GRE

Registrar:

```text
edición
versión
documento
hash
fecha incorporación
fecha importación
estado
```

Cada incidente MATPEL debe poder registrar la edición utilizada.

Nunca mezclar silenciosamente dos ediciones.

Arquitectura preparada para:

```text
GRE 2024
GRE 2028
GRE futura
```

o las ediciones que realmente existan.

No inventar años de edición.

---

# 44. REIMPORTACIÓN

Cuando exista una nueva GRE:

```text
nuevo documento
↓
importación
↓
validación
↓
comparación
↓
activación
```

No eliminar automáticamente versiones anteriores.

Los incidentes históricos deben conservar la versión que utilizaron.

---

# 45. AUDITORÍA

Registrar operaciones críticas.

Como mínimo cuando corresponda:

```text
usuario
fecha/hora
incidente
material
ONU
guía
GRE
parámetros
resultado
fuentes
decisión SCI relacionada
```

Debe ser posible reconstruir posteriormente:

> qué información tenía el sistema cuando se tomó determinada decisión.

---

# 46. SEGURIDAD

Analiza y respeta:

- roles;
- permisos;
- auditoría;
- acceso a incidentes;
- modificación de decisiones;
- información operacional.

La consulta de la GRE puede tener un nivel de acceso diferente a la modificación del SCI.

No otorgar privilegios administrativos a usuarios operacionales.

---

# 47. MODO SOLO CONSULTA

SIGBO debe permitir utilizar la GRE aunque no exista un incidente.

Ejemplo:

```text
MATPEL
↓
Buscar material
↓
ONU 1203
↓
Ficha
↓
Guía
↓
Fuente
```

Sirve para:

- capacitación;
- consulta preventiva;
- planificación;
- familiarización.

---

# 48. MODO SCI

Durante un servicio:

```text
SERVICIO
↓
SCI
↓
MATPEL
↓
material
↓
GRE
↓
información operacional
↓
mapa
↓
decisiones
↓
recursos
```

El usuario no debería tener que abandonar el incidente para buscar repetidamente la información.

---

# 49. RELACIÓN CON PERSONAL Y RECURSOS SIGBO

Analiza si SIGBO ya conoce:

- personal presente;
- personal disponible;
- especialidades;
- móviles;
- equipos;
- recursos;
- ubicación.

Cuando sea útil, el SCI debe poder utilizar estos datos dentro del incidente MATPEL.

Pero NO asumir automáticamente que disponer de un recurso significa que sea apropiado para determinado peligro.

La GRE y el mando continúan siendo la referencia operacional.

---

# 50. EVENTOS E HISTORIAL

Crear o reutilizar una línea temporal.

Ejemplo:

```text
09:32 incidente creado
09:35 MATPEL detectado
09:36 ONU 1203 confirmado
09:36 guía cargada
09:39 viento actualizado
09:42 perímetro modificado
09:45 decisión SCI registrada
```

Registrar quién realizó cambios cuando corresponda.

---

# 51. CALIDAD DE DATOS

Implementar estados:

```text
CONFIRMADO
ESTIMADO
NO CONFIRMADO
DESCONOCIDO
```

especialmente para datos del incidente.

Nunca convertir:

```text
"creemos que..."
```

en:

```text
CONFIRMADO
```

---

# 52. OCR DE CAMPO

En reconocimiento fotográfico guardar, cuando corresponda:

```text
imagen
resultado OCR
candidatos
selección humana
valor final
usuario
fecha/hora
```

La imagen original puede mantenerse según las políticas de almacenamiento existentes.

---

# 53. PRUEBAS DEL IMPORTADOR

Crear pruebas para:

- detección del documento;
- extracción;
- identificación de páginas;
- números ONU;
- guías;
- relaciones;
- tablas;
- distancias;
- unidades;
- referencias;
- duplicados;
- OCR;
- datos faltantes;
- inconsistencias.

Utilizar casos reales extraídos del documento.

---

# 54. PRUEBAS DE TRAZABILIDAD

Para muestras representativas verificar:

```text
BD
=
PDF
```

Validar especialmente datos críticos.

Generar pruebas que permitan demostrar:

```text
registro X
↓
provino realmente de página Y
```

---

# 55. PRUEBAS DEL MOTOR

Cada cálculo debe ser reproducible.

Implementar pruebas con:

```text
entrada conocida
↓
resultado esperado
```

No aceptar cálculos no testeables.

---

# 56. PRUEBAS DE INTERFAZ

Verificar:

- escritorio;
- móvil;
- pantallas pequeñas;
- modo incidente;
- consulta;
- fuentes;
- mapa;
- cambios de material;
- pérdida de conectividad cuando corresponda;
- OCR;
- actualización dinámica.

---

# 57. NO HACER UNA DEMO

No quiero:

- HTML aislado;
- mockups sin backend;
- JSON temporal;
- scripts sin integrar;
- datos hardcodeados;
- demo visual;
- prototipo desconectado.

Quiero una implementación integrada a SIGBO.

---

# 58. NO DEJAR FUNCIONALIDAD "SIMULADA"

Si un componente dice:

```text
Ver fuente
```

debe funcionar.

Si dice:

```text
Buscar ONU
```

debe consultar datos reales.

Si aparece:

```text
Mapa
```

debe utilizar el mapa real.

Si aparece:

```text
distancia
```

debe provenir del procesamiento real de la GRE.

No crear interfaces engañosas.

---

# 59. DOCUMENTACIÓN TÉCNICA

Documentar:

```text
arquitectura
modelo de datos
importador
parsers
OCR
validaciones
fuentes
motor MATPEL
integración SCI
mapa
versionamiento
auditoría
limitaciones
pruebas
procedimiento de actualización de GRE
```

---

# 60. DOCUMENTACIÓN OPERACIONAL

Crear documentación orientada al usuario.

Explicar:

```text
cómo buscar
cómo identificar material
cómo confirmar OCR
cómo acceder a fuente
cómo utilizar MATPEL dentro del SCI
qué significa estimado/no confirmado
qué información pertenece a GRE
qué información pertenece a SIGBO
```

No convertir la documentación en un tratado técnico innecesario.

---

# 61. INDICADORES DE PROCEDENCIA

Toda información operacional importante deberá ser visualmente diferenciable.

Ejemplo:

```text
GRE
```

```text
SIGBO
```

```text
OPERADOR
```

```text
METEOROLOGÍA
```

```text
CALCULADO
```

Esto es especialmente importante durante un incidente.

---

# 62. PRIORIDAD DE INFORMACIÓN

Durante un incidente priorizar:

1. identificación;
2. peligros críticos;
3. seguridad;
4. aislamiento/protección cuando aplique;
5. acciones relevantes;
6. mapa;
7. fuente;
8. detalles secundarios.

La jerarquía final deberá ajustarse al contenido real de la GRE analizada.

---

# 63. NUNCA ESCONDER LA INCERTIDUMBRE

Si el sistema no puede determinar algo:

mostrar:

```text
NO DETERMINADO
```

en lugar de inventar.

Si OCR tiene dudas:

```text
REQUIERE CONFIRMACIÓN
```

Si la tabla no pudo procesarse:

```text
DATOS NO DISPONIBLES — VER FUENTE
```

Eso es preferible a mostrar información incorrecta.

---

# 64. FALLBACK A DOCUMENTO ORIGINAL

Ante un error en la base estructurada, el operador debe poder acceder fácilmente al documento original.

El PDF continúa siendo la referencia documental.

La aplicación estructurada es una herramienta para agilizar su utilización.

---

# 65. FUNCIONAMIENTO DEGRADADO

Diseñar degradación progresiva.

Ejemplo:

### Sin meteorología

GRE sigue funcionando.

### Sin Internet

La base local GRE sigue funcionando cuando la infraestructura lo permita.

### OCR falla

Permitir ingreso manual de ONU.

### mapa externo falla

Continuar mostrando la información textual crítica.

### extracción incompleta

Mostrar fuente y advertencia.

Nunca convertir una dependencia secundaria en un bloqueo total de la consulta GRE.

---

# 66. MEJORAS AL SCI BASADAS EN LA GRE

Después de comprender la GRE y el SCI existente, identifica oportunidades concretas para mejorar el flujo operacional.

Por cada mejora propuesta especificar internamente:

```text
problema actual
↓
información GRE relacionada
↓
mejora propuesta
↓
componente SCI afectado
↓
beneficio operacional
↓
riesgo
↓
trazabilidad
```

Implementar directamente las mejoras que sean claras, seguras y coherentes con la arquitectura.

No agregar funciones simplemente porque sean técnicamente interesantes.

---

# 67. PREGUNTA CENTRAL QUE DEBES HACERTE

Para cada sección de la GRE:

> ¿Esta información solamente necesita ser consultada o debería aparecer automáticamente en algún punto del flujo de un incidente MATPEL?

Y después:

> ¿En qué parte del SCI sería útil mostrarla sin saturar al operador?

Ese análisis debe dirigir la integración.

---

# 68. SEGUNDA PREGUNTA CENTRAL

Para cada funcionalidad SCI relacionada con MATPEL:

> ¿La GRE contiene información que permita mejorar esta decisión, contexto o visualización?

Si la respuesta es sí:

integrarla manteniendo trazabilidad.

Si la respuesta es no:

NO inventarla.

---

# 69. EXPERIENCIA OBJETIVO

Un escenario ideal debe aproximarse a:

```text
entra servicio
↓
se crea incidente
↓
se identifica posible MATPEL
↓
operador abre MATPEL
↓
fotografía placa / introduce ONU
↓
SIGBO propone identificación
↓
operador confirma
↓
SIGBO carga inmediatamente:
    material
    guía
    peligros
    seguridad
    respuesta
    distancias aplicables
↓
SCI incorpora información relevante
↓
mapa representa datos aplicables
↓
responsable registra decisiones
↓
todo queda auditado
↓
cada dato permite abrir su fuente GRE
```

---

# 70. CONSULTA ULTRARRÁPIDA

Desde cualquier contexto pertinente debería existir acceso rápido a MATPEL.

Ejemplo:

```text
ONU
[____]
BUSCAR
```

El resultado crítico debe aparecer con la menor cantidad razonable de pasos.

Durante emergencias, evitar flujos de 5 o 6 pantallas para obtener información crítica.

---

# 71. NO ABUSAR DE OPCIONES

Mantener todas las funcionalidades necesarias, pero utilizar:

- progresive disclosure;
- pestañas;
- acordeones;
- paneles contextuales;
- accesos rápidos;
- filtros;
- favoritos si resultan útiles.

No esconder información crítica detrás de configuraciones complejas.

---

# 72. DETECCIÓN DE CAMBIOS ENTRE EDICIONES

Preparar el importador para comparar futuras versiones.

Ejemplo:

```text
materiales agregados
materiales eliminados
guías modificadas
distancias modificadas
texto modificado
tablas modificadas
```

Generar reporte de diferencias.

Nunca sobrescribir silenciosamente datos históricos.

---

# 73. INTEGRIDAD DOCUMENTAL

Guardar hash criptográfico del archivo.

Por ejemplo:

```text
SHA-256
```

Debe ser posible demostrar qué archivo exacto originó determinada importación.

---

# 74. ALMACENAMIENTO

Antes de crear tablas nuevas, estudiar completamente la base existente.

Reutilizar convenciones de:

- IDs;
- timestamps;
- auditoría;
- soft delete;
- usuarios;
- claves;
- índices;
- naming;
- migraciones;
- repositorios;
- DAOs;
- ORM si existe.

No introducir una segunda filosofía de base de datos.

---

# 75. ÍNDICES

Optimizar búsquedas frecuentes.

Especialmente:

```text
ONU
nombre normalizado
guía
edición
relaciones
```

No realizar búsquedas completas costosas sobre miles de registros si pueden indexarse.

---

# 76. BÚSQUEDA NORMALIZADA

Permitir tolerancia razonable de búsqueda mediante programación tradicional:

- mayúsculas/minúsculas;
- acentos;
- espacios;
- normalización;
- coincidencia parcial;
- alias explícitos presentes en la fuente.

No utilizar búsqueda semántica basada en embeddings en esta fase salvo que ya exista y pueda funcionar localmente sin alterar la fuente, y aun así no utilizarla para sustituir coincidencias oficiales.

---

# 77. FUENTE DE CADA CAMPO

Cuando un material combine información de distintos lugares de la GRE, la trazabilidad debería poder ser incluso por campo.

Ejemplo:

```text
Nombre → página X
Guía → página X
Distancia → tabla Y / página Z
Respuesta → Guía 128 / página W
```

No asumir una única página como origen de toda la ficha.

---

# 78. PRECAUCIONES Y NOTAS

No descartar:

- notas al pie;
- asteriscos;
- llamadas;
- símbolos;
- excepciones;
- leyendas;
- instrucciones especiales.

En documentación de emergencia pueden alterar la interpretación de una tabla.

Deben preservarse estructuralmente cuando sean relevantes.

---

# 79. NORMALIZACIÓN SIN PERDER EL ORIGINAL

Guardar:

```text
valor original
```

y cuando sea útil:

```text
valor normalizado
```

Ejemplo:

```text
original: "300 m"
normalizado:
    value: 300
    unit: m
```

Pero nunca eliminar la representación original.

---

# 80. OBSERVABILIDAD

Agregar logs útiles para:

- importación;
- parsing;
- OCR;
- validación;
- cálculos;
- errores.

No exponer información sensible innecesariamente.

Los logs deben ayudar a identificar exactamente:

```text
documento
página
parser
problema
```

---

# 81. PERFORMANCE

La consulta operacional debe ser rápida.

No procesar el PDF completo en cada búsqueda.

El flujo correcto es:

```text
PDF
↓
importación
↓
BD estructurada
↓
consultas rápidas
```

El documento original se utiliza para trazabilidad/verificación, no como motor de búsqueda principal en cada operación.

---

# 82. PROCESAMIENTO ASÍNCRONO DEL IMPORTADOR

La importación documental puede ser costosa.

Debe ejecutarse como proceso administrativo/controlado.

No procesar toda la GRE dentro de una petición HTTP del usuario si eso puede bloquear SIGBO.

Proporcionar:

```text
estado
progreso
errores
resultado
```

siguiendo los mecanismos del proyecto.

---

# 83. IMPORTACIÓN IDEMPOTENTE

Reejecutar una importación sobre el mismo documento no debe generar duplicación descontrolada.

Utilizar:

```text
hash
versión
identificadores
upserts/control
```

según la arquitectura existente.

---

# 84. BACKUP / RECUPERACIÓN

No destruir una importación válida antes de confirmar que una nueva importación fue exitosa.

Idealmente:

```text
importar
↓
validar
↓
activar
```

La edición previa debe permanecer recuperable.

---

# 85. ESTADO DE VERSIÓN

Conceptualmente:

```text
IMPORTANDO
VALIDANDO
VÁLIDA
ACTIVA
HISTÓRICA
ERROR
```

Adapta los nombres a las convenciones actuales.

---

# 86. PANEL ADMINISTRATIVO GRE

Si encaja con SIGBO, proporcionar a administradores:

```text
edición activa
archivo
hash
fecha
estado
estadísticas
errores
advertencias
reimportar
validar
comparar
```

No mostrar estas opciones a usuarios operacionales normales.

---

# 87. MODO OPERACIONAL SIMPLE

Un bombero en campo NO debe ver:

```text
parser
OCR engine
hash
pipeline
ETL
```

Debe ver:

```text
material
riesgo
acciones
distancias
mapa
fuente
```

La complejidad técnica debe quedar detrás del sistema.

---

# 88. RESPONSABILIDAD HUMANA

Mantener confirmación humana para:

- identificación OCR;
- datos estimados;
- decisiones SCI;
- selección cuando existan candidatos ambiguos.

No automatizar una decisión crítica basándose únicamente en reconocimiento imperfecto.

---

# 89. IMPORTANTE: NO REINTERPRETAR LA GRE

El software puede:

```text
estructurar
buscar
relacionar
filtrar
mostrar
calcular cuando haya reglas explícitas
georreferenciar valores
```

pero no debe modificar el significado del contenido.

Evitar resúmenes que puedan eliminar condicionantes críticos.

Cuando presentes información condensada, permitir acceder inmediatamente al texto íntegro relevante de la fuente.

---

# 90. VALIDACIÓN HUMANA DE LA IMPORTACIÓN

Crear herramientas que permitan a un administrador revisar:

```text
registro estructurado
↔
fragmento original
```

especialmente para:

- distancias;
- tablas;
- OCR;
- valores críticos.

No asumir que automatización documental equivale a 100 % de exactitud.

---

# 91. RESULTADOS DERIVADOS

Todo resultado generado debe indicar conceptualmente:

```text
FUENTE BASE
GRE

PARÁMETROS
...

RESULTADO
...

REGLA
...

FECHA
...
```

cuando sea relevante para auditoría.

---

# 92. NO HACER AFIRMACIONES MÉDICAS O OPERACIONALES NUEVAS

Primeros auxilios y acciones operativas mostradas como procedentes de la GRE deben conservar fielmente el contenido del documento.

SIGBO no debe agregar recomendaciones médicas propias bajo la etiqueta GRE.

---

# 93. INTEGRACIÓN NATIVA

El usuario no debe percibir:

```text
SIGBO
+
otra aplicación MATPEL pegada
```

Debe percibir:

```text
SIGBO
└── MATPEL
    └── GRE
```

con la misma:

- navegación;
- autenticación;
- diseño;
- componentes;
- tipografía;
- permisos;
- auditoría;
- mapa;
- estructura.

---

# 94. ANALIZAR ANTES DE CREAR

Regla obligatoria:

```text
EXISTE → REUTILIZAR
EXISTE PARCIALMENTE → EXTENDER
NO EXISTE → CREAR
```

Aplicar a:

```text
mapas
formularios
servicios
usuarios
permisos
modales
componentes
API
auditoría
tablas
geolocalización
incidentes
SCI
```

---

# 95. NO ROMPER COMPATIBILIDAD

Antes de modificar estructuras existentes:

- localizar consumidores;
- localizar APIs;
- localizar tests;
- localizar frontend;
- localizar migraciones;
- evaluar impacto.

Preferir cambios aditivos cuando sea razonable.

---

# 96. IMPLEMENTACIÓN POR FASES INTERNAS

Trabaja internamente siguiendo:

```text
FASE 1
Análisis SIGBO

FASE 2
Análisis GRE

FASE 3
Mapa de integración GRE ↔ SIGBO ↔ SCI

FASE 4
Modelo de datos

FASE 5
Importador

FASE 6
Validación

FASE 7
Servicios/API

FASE 8
Consulta MATPEL

FASE 9
Incidente MATPEL

FASE 10
Integración SCI

FASE 11
GIS

FASE 12
OCR de campo

FASE 13
Auditoría

FASE 14
Pruebas

FASE 15
Documentación

FASE 16
Validación final
```

No detenerte después de entregar solamente un análisis.

La finalidad es implementar.

---

# 97. PUEDES AJUSTAR LA SOLUCIÓN

Este documento define los objetivos y restricciones, no una arquitectura rígida.

Si después de analizar SIGBO descubres una solución técnicamente superior:

puedes adaptarla.

Pero debes mantener:

- GRE como fuente documental;
- trazabilidad;
- determinismo;
- integración SCI;
- ausencia de APIs de IA;
- calidad operacional;
- compatibilidad;
- seguridad.

---

# 98. NO IMPLEMENTAR POR SUPOSICIÓN

Si este prompt menciona una entidad que SIGBO ya resuelve de otra manera:

adáptate a SIGBO.

Ejemplo:

Si SIGBO no utiliza:

```text
IncidentService
```

sino otro patrón:

utilizar el patrón real.

El código final manda sobre los nombres conceptuales de este prompt.

---

# 99. INVESTIGAR TODO EL FLUJO

Antes de tocar un módulo, rastrea:

```text
UI
↓
API
↓
servicio
↓
persistencia
↓
entidades
↓
auditoría
↓
tests
```

Evita modificaciones locales que ignoren dependencias.

---

# 100. INFORME FINAL

Al terminar proporcionar un informe técnico con:

## 1. GRE detectada

```text
archivo
formato
edición
hash
páginas
```

## 2. Análisis SIGBO

Principales componentes reutilizados.

## 3. Arquitectura implementada

## 4. Modelo de datos

## 5. Importador

## 6. Estadísticas

```text
páginas
ONU
materiales
guías
tablas
distancias
errores
advertencias
```

## 7. Integración MATPEL

## 8. Integración SCI

Explicar específicamente:

```text
qué cambió en el SCI gracias a la GRE
```

## 9. GIS

## 10. OCR

## 11. Trazabilidad

## 12. Auditoría

## 13. Pruebas

Mostrar:

```text
test
cantidad
pasaron
fallaron
```

## 14. Limitaciones reales

No esconder nada pendiente.

## 15. Archivos modificados

## 16. Migraciones

## 17. Forma de probar

## 18. Forma de reimportar una nueva GRE

---

# 101. CRITERIOS DE ACEPTACIÓN

NO considerar completa la tarea hasta comprobar:

- [ ] se identificó automáticamente la GRE dentro de `docs\Manuales`;
- [ ] se analizó el documento completo;
- [ ] se identificó cómo la propia GRE indica que debe utilizarse;
- [ ] se procesaron las secciones relevantes;
- [ ] los materiales están estructurados;
- [ ] las guías están estructuradas;
- [ ] las relaciones funcionan;
- [ ] las tablas críticas están estructuradas;
- [ ] las distancias son consultables;
- [ ] cada dato crítico tiene trazabilidad;
- [ ] existe acceso al documento original;
- [ ] existe consulta MATPEL;
- [ ] existe integración con incidentes;
- [ ] existe integración real con SCI;
- [ ] el SCI utiliza contextual y correctamente información GRE;
- [ ] no se generan órdenes automáticas injustificadas;
- [ ] el mapa utiliza datos reales;
- [ ] las zonas utilizan geometrías apropiadas;
- [ ] se reutilizaron componentes SIGBO;
- [ ] el OCR de campo exige confirmación;
- [ ] existe auditoría;
- [ ] existe versionamiento;
- [ ] la importación es reproducible;
- [ ] existen pruebas;
- [ ] no existen datos inventados;
- [ ] no existe dependencia de APIs de IA;
- [ ] el sistema funciona como parte nativa de SIGBO;
- [ ] los errores y limitaciones son visibles;
- [ ] se puede demostrar de dónde provino cada resultado importante.

---

# 102. RESULTADO FINAL ESPERADO

No quiero solamente:

```text
GRE → base de datos
```

Quiero:

```text
                        GRE
                         │
                         ▼
                 CONOCIMIENTO OFICIAL
                         │
              ┌──────────┴──────────┐
              ▼                     ▼
          CONSULTA                MATPEL
              │                     │
              └──────────┬──────────┘
                         ▼
                    INCIDENTE
                         │
                         ▼
                        SCI
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   INFORMACIÓN         MAPA           OPERACIÓN
        │                │                │
        └────────────────┼────────────────┘
                         ▼
                 DECISIÓN HUMANA
                         │
                         ▼
                    AUDITORÍA
                         │
                         ▼
                    TRAZABILIDAD
                         │
                         ▼
                      GRE
```

La GRE debe evolucionar dentro de SIGBO desde un documento que el usuario debe buscar manualmente hacia una **fuente de conocimiento operacional estructurada, contextual y trazable**, manteniendo siempre intacto el principio de que:

```text
LA GRE ES LA FUENTE DOCUMENTAL.

SIGBO ESTRUCTURA, RELACIONA, CALCULA Y PRESENTA.

EL SCI ORGANIZA LA RESPUESTA.

EL RESPONSABLE HUMANO TOMA LAS DECISIONES.
```

---

# 103. INSTRUCCIÓN FINAL

Comienza inspeccionando:

```text
C:\Proyectos\Personal\SIGBO
```

y:

```text
C:\Proyectos\Personal\SIGBO\docs\Manuales
```

Identifica el único documento presente en `Manuales`, determina qué GRE contiene y estudia primero tanto **el proyecto completo como el documento completo**.

No programes basándote únicamente en este prompt.

Este prompt indica QUÉ se busca.

El proyecto SIGBO y la GRE determinan CÓMO debe implementarse correctamente.

Analiza especialmente las instrucciones de uso de la propia GRE, porque la finalidad no es solamente disponer de sus datos:

**la finalidad es trasladar de forma fiel, rápida, contextual y trazable el criterio de utilización de la GRE al flujo MATPEL y al módulo SCI de SIGBO.**

Después del análisis:

1. diseña la integración;
2. implementa;
3. migra la base si corresponde;
4. integra frontend y backend;
5. integra MATPEL con SCI;
6. integra GIS;
7. implementa OCR local donde aporte valor;
8. valida contra la GRE original;
9. ejecuta las pruebas existentes;
10. crea nuevas pruebas;
11. corrige regresiones;
12. prueba el flujo completo de usuario;
13. documenta;
14. entrega el informe final.

No te detengas en una propuesta o análisis si puedes continuar con la implementación.

No marques como terminada ninguna funcionalidad que solamente esté simulada.

No inventes información para lograr que una prueba pase.

**La precisión, trazabilidad y fidelidad hacia la GRE tienen prioridad sobre aparentar que el sistema está completo.**