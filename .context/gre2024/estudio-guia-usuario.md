# GRE24-STUDY-USER — estudio de PDF344–349

Fuente: [PDF original](source-of-truth.md), páginas344–349, impresas342–347.
Método: lectura completa del texto nativo directamente del PDF, cotejo de sus
referencias y relaciones documentales. Esa lectura inicial no incluyó cotejo visual.
La continuación de2026-10-10 inspeccionó individualmente las seis páginas:
véanse [anotaciones y evidencia](paginas/README.md). No se implementaron sus reglas.
Esta lectura inicia el estudio exhaustivo;
sus conclusiones deben contrastarse con instrucciones, tablas, guías y anexos.

## Alcance, fase inicial y ayuda técnica

PDF344 define fase inicial desde el arribo del respondedor al accidente. Incluye
confirmar presencia/identidad, iniciar protección/aseguramiento y solicitar personal
especializado. No usar el instante de recepción de llamada como definición GRE de
esa fase. El sistema puede guardar ambas horas con finalidades distintas; la
aplicación de fases del núcleoSCI debe conservar sus propios contratos y no
confundirlos con esta definición documental.

Uso diseñado para carretera/ferrocarril, limitado para instalaciones fijas/avión/barco.
No provee propiedades físicas/químicas ni cubre toda circunstancia; no sustituye
capacitación, conocimiento o juicio. PDF345 exige buscar información específica
pronto mediante contactos pertinentes, teléfono/documentos del embarque y organismo
de respuesta. Mostrar guía y referencias no permite declarar información suficiente
para decidir todas las acciones. Los teléfonos/jurisdicciones de anexos requieren
interpretación local; no convertirlos automáticamente en números institucionales.

## Identificación, grupos y lectura naranja

PDF344–345: explosivos se agrupan; no inferir pérdida de catálogo por ausencia
del listado individual de nombre/ONU. Índices se consultan por identificación o
nombre y guías se asignan a grupos de características similares. El título de
guía es peligro general, no identidad única del material. `P` significa peligro
de polimerización **bajo ciertas condiciones**, no certeza de reacción en el caso.

PDF346: consultar peligros potenciales primero; conservar el primero como primario
y no fijar incendio antes de salud en la UI. Seguridad pública incluye precauciones,
protección y evacuación sugerida por escenario. Respuesta de emergencia separa fuego,
derrame/fuga y primeros auxilios particulares **además** de los generales(PDF156).
Estructura de bloques conservada no basta para interpretar cada instrucción.

## Distancias y condiciones: no una cifra única

PDF347 separa radio de aislamiento en todas direcciones de distancia protectora
a favor del viento. Describe protección requerida dentro del aislamiento y acciones
de protección que incluyen evacuar y/o proteger en el lugar; la elección no la
automatiza por ser software. Ejemplo documentalUN1955: radio150m, diámetro300m;
protección de día1.0km y noche3.9km para derrame pequeño. Es un ejemplo de esa
entrada/condición, no valor aplicable a todos los materiales de la guía.

208L inclusive corresponde a pequeño; mayor a208L corresponde a grande. Día/noche
se definen por amanecer/atardecer, no por una hora fija mundial. La explicación de
dispersión general no es un algoritmo que calcule distancias arbitrarias mediante
temperatura/viento: las tablas y condiciones pertinentes siguen siendo necesarias.

PDF348 distingue entradas tierra/agua para el mismo material y exclusión de
Tablas1/2 cuando solo hay entradaagua y el derrame es seco. Ejemplos1746/1836
no justifican aplicar la regla idéntica sin examinar las filas de otros materiales.
El gas deTabla2 es informativo y ya se considera enTabla1: conservar identificación
de1689 y su distancia, sin sustituirla por la deHCN. Esto fue resuelto también por
el [auditor independiente](evidencia/auditoria-independiente-inicial.md).

Tabla3 presenta seis grupos específicos, siete identificadores, distintos
contenedores/cantidades, día/noche y tres clases de viento(PDF348–349).
No extrapolar sus valores a otros gases/recipientes. Revisar cantidades/unidades
enPDF340 y sus filas341–343; [regla estructurada](reglas-operativas.json).

PDF349 determina fuentes de distancias por verde e incendio. Para noverde consultar
guía; una remisión aTabla1 en esa guía es recordatorio **solo para materiales verdes**.
Para verde sin incendio consultarTabla1 y guía; con incendio aplicar evacuación de
incendio en guía y consultarTabla1 por material residual. No fundir finalidades en
una sola distancia ni elegir siempre la mayor cifra de todos los apartados.

## Enlaces y tareas derivados

AntecedentesR01/R03/R08/R09/R13–R17/R20/R21/R23/R14–R15 respaldados por estas
páginas deben mantener su alcance original; la reconstrucción estructurada integral
aún debe completarse. Tareas: fases/horas separadas; incertidumbre y asistencia;
`P` condicionado; estructura/auxilios cruzados; finalidades/unidades; tablaagua
no aplicable; gas informativo; viento/contenedor; incendio/residual; jurisdicción.
Para cada rama construir inputs/esperado/fuente/resultado real y abstención. Los
[casos iniciales](test-cases/casos-independientes-iniciales.json) son resolución
manual documental del revisor, todavía no pruebas del motor.
