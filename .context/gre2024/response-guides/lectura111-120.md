# GRE24-LECTURA-GUIAS-111-120 — primer lote de guías naranjas

Entrada superior: [índice GRE](../index.md), [guías de respuesta](../response-guides.md).
Fuente: [PDF original](../../../docs/Manuales/GRE2024-Spa-Web-a.pdf).
Registro por cláusula: [lectura111-120.json](lectura111-120.json).

Este lote abarca **10 guías, 20 páginas originales PDF158–177 / impresas156–175**.
El revisor `lectura_guias` leyó individualmente las 20 imágenes completas originales
mediante `view_image`, incluidos encabezados, negritas, zonas verdes, pies, unidades
y notas; también leyó el texto nativo y lo comparó con el candidato existente.
No se ha realizado una segunda revisión de estas interpretaciones ni implementado
o probado un motor operativo en esta subtarea. No acredita dominio de las restantes
52 guías con contenido ni de las 392 páginas.

## Método, fuentes y límites de la evidencia

El SHA-256 del PDF es
`bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`.
El candidato cotejado es `catalogo-1/busqueda-1/PyMuPDF1.28.2`, SHA-256
`0a936d3c97fd95195fa24fa7b0f9538ef946e726adf6f8542b65b0a5da10b543`.
La revisión encontró igualdad exacta del texto nativo en las20 páginas y conservó
100 bloques. Los identificadores `GRE24-G111-B06-C01`, por ejemplo, corresponden
a guía/bloque/cláusula de este lote; los `ref-*` se resuelven únicamente en el
candidato con el SHA indicado. La caja en puntos se conserva por cada línea fuente.

Ejecutar desde la raíz:

```powershell
python .context/gre2024/response-guides/auditar111_120.py
```

El script vuelve a leer el PDF y candidato, verifica textos originales y presencia
de cada referencia nativa, calcula huellas y actualiza el JSON. No vuelve a efectuar
la lectura visual ni valida semántica por sí mismo. El campo de revisión visual es
un registro de la inspección de esta sesión. Las20 imágenes son renders del PDF a
escala1.8, no ilustraciones generadas. El JSON incluye sus huellas individuales.

Cada grupo de cláusula guarda literal completo, extracto breve, sección/subsección,
modalidad, condiciones literales, entradas, procedimiento, resultado documental,
referencias cruzadas, fuente y estado. Las interpretaciones contextuales comunes
**no son predicados ejecutables individualmente formalizados**. Las interpretaciones
específicas y excepciones se desarrollan debajo. Una viñeta puede incluir varias
acciones o peligros; el número de grupos no es el número final de reglas atómicas.

## Condiciones comunes que deben conservarse

Para todas estas guías, confirmar la selección antes de aplicar indicaciones. La
identificación de material, la clasificación del escenario y su certeza son entradas,
no resultados inferibles del título. Las111–116 y118 presentan primero incendio/
explosión;117,119,120 presentan primero salud. No reordenar ese significado en una
interfaz. Todas remiten a primeros auxilios generales; ninguna página de auxilios
específicos debe presentarse como protocolo médico autónomo.

Las llamadas al911, al contacto de respuesta de documentos de embarque y, si faltan
documentos o respuesta, al número de contraportada se conservan como texto GRE.
No trasladar automáticamente teléfonos a un protocolo local de SIGBO. El ERA es de
presión positiva; la ropa de incendio estructural tiene protección térmica y solamente
protección química limitada. En117–119, la ropa química específicamente recomendada
por el fabricante está indicada **cuando no exista riesgo de incendio**. No convertir
ese límite en certificación de protección adecuada frente a fuego.

La fórmula española «manténgase con viento a favor, en zonas altas y/o corriente
arriba» aparece en seguridad pública; distinguir ese texto de la **evacuación a favor
del viento**, cuya dirección sí forma parte de una distancia protectora. La frase
de ubicación del respondedor necesita resolución con las instrucciones generales
y terminología original antes de codificar un vector; este lote no resuelve
silenciosamente esa ambigüedad de traducción.

La autorización para detener una fuga o mover contenedores no dañados está condicionada
a poder hacerlo sin riesgo o de manera segura. Retirarse si aumentan sonidos de
ventilas o decoloración de tanque y mantenerse apartado de tanques bajo llamas son
límites expresos. Las indicaciones no autorizan acciones automáticas del sistema.

## Distancias: modalidad, escenario y geometría

Estos valores están cotejados visualmente en las páginas de la tabla siguiente.
Los pies/millas indicados son los equivalentes impresos originales; no recalcularlos
para cambiar el texto de la GRE. «Considere» conserva juicio del responsable; «inicie»
es una indicación distinta. **Nunca usar solamente el mayor o menor número de una guía.**

| Guía / PDF | Derrame/escape: acción inmediata mínima todas direcciones | Derrame grande: evacuación considerada | Incendio con contenedor/vehículo especificado |
|---|---|---|---|
|111 /158|100m /330pies|Sin cifra aparte en esa subsección|Tanque/vagón/autotanque: aislar800m /½milla y considerar evacuación800m a la redonda|
|112 /160|500m /1600pies|800m /½milla a la redonda|Carro ferroviario/remolque: aislar1600m /1milla e iniciar evacuación incluidos respondedores1600m|
|113 /162|100m /330pies|500m /⅓milla a la redonda|Tanque/vagón/autotanque: aislar800m /½milla y considerar evacuación800m a la redonda|
|114 /164|100m /330pies|250m /800pies a la redonda|Carro ferroviario/remolque: aislar800m /½milla e iniciar evacuación de respondedores800m; leer excepción1.4S|
|115 /166|100m /330pies|Por lo menos800m /½milla a favor del viento|Tanque/vagón/autotanque: aislar1600m /1milla y considerar evacuación1600m a la redonda|
|116 /168|100m /330pies|Por lo menos800m /½milla a favor del viento|Tanque/vagón/autotanque: aislar1600m /1milla y considerar evacuación1600m a la redonda|
|117 /170|100m /330pies|Remite aTabla1 en subsección Derrame, sin limitar aquí a «grande»|Tanque/vagón/autotanque: aislar1600m /1milla y considerar evacuación1600m a la redonda|
|118 /172|100m /330pies|Resaltados→Tabla1; otros→aumentar según necesidad en dirección del viento, sin cifra definida|Tanque/vagón/autotanque: aislar1600m /1milla y considerar evacuación1600m a la redonda|
|119 /174|100m /330pies|Resaltados→Tabla1; otros→aumentar según necesidad en dirección del viento, sin cifra definida|Tanque/vagón/autotanque: aislar1600m /1milla y considerar evacuación1600m a la redonda|
|120 /176|100m /330pies|Por lo menos100m /330pies a favor del viento|Tanque/vagón/autotanque: aislar800m /½milla y considerar evacuación800m a la redonda|

Distancias anteriores corresponden a `B06` de cada guía. La acción inmediata, la
distancia de expulsión de fragmentos, la protección a favor del viento y el perímetro
por incendio son propósitos diferentes. Una consulta aTabla1 requiere entradas y
notas de la sección verde: este lote no declara suficientes los100m naranjas.

## Guía 111

**Fuente:** PDF158–159; carga mixta/sin identificar. `B02/B03` advierten explosión por
calor, choque, fricción o contaminación, reacciones al aire/agua/espuma, ignición,
retroceso de llama, proyección de cilindros y efectos de salud/asfixia/quemaduras y
contaminación. Son posibilidades; desconocido no equivale a ausencia de peligro.
Seguridad y ropa siguen las condiciones comunes, sin certificar compatibilidad química.

`B08-C01` señala reacción posible con agente extinguidor. En fuego pequeño se citan
polvo seco,CO₂,rocío o espuma regular; en grande rocío,niebla o espuma regular y
movimiento seguro de contenedores no dañados. Tanques: enfriar, no introducir agua,
retirarse ante signos y mantenerse apartado. La alerta de reacción precede esas
alternativas; elegir un agente sin identificar compatibilidad no queda demostrado.
`B09` distingue absorción no combustible para derrame pequeño y dique adelantado
para grande; exige eliminar ignición, puesta a tierra, apartar combustibles, impedir
entrada a vías/alcantarillas/sótanos/confinados y evitar contacto del flujo de agua
con material cuando se abaten vapores. Auxilios: remisión general, sin detalle adicional.

## Guía 112

**Fuente:** PDF160–161; explosivos divisiones1.1,1.2,1.3,1.5. `B02-C01` advierte
fragmentos a1600m o más si el fuego llega a la carga: **no es cota máxima segura**.
`B08` distingue incendio de carga del de llanta/vehículo. Si está en contacto con
carga, no combatir, detener tráfico, despejar por lo menos1600m y dejar consumir;
no mover carga/vehículo expuestos al calor. Si es llanta/vehículo, usar agua abundante
y, sin agua,CO₂/polvo seco/barro; los monitores exigen posibilidad sin ningún riesgo
y máxima distancia, evitando propagación a carga. Vigilar reencendido de neumáticos.

`B09-C04` prohíbe radios transmisores dentro de100m /330pies de detonadores eléctricos;
no aplicar a cualquier objeto o usarlo como perímetro general de explosivos.
`B09-C05` reserva limpieza/desecho a supervisión especialista. Seguridad manda alejar
personas de ventanas y ventilar confinados antes de ingresar solo con capacitación y
equipo adecuados. Nota con asterisco remite al glosario para grupo de compatibilidad.
Nota canadiense ERAP es remisión jurisdiccional condicional, no requisito paraguayo
ni instrucción de primeros auxilios aunque el catálogo la ubique al final de ese bloque.

## Guía 113

**Fuente:** PDF162–163; explosivos húmedos/desensibilizados. `B02-C03/C04`: material
seco expuesto a calor/llamas/fricción/impacto puede explotar; mantener húmedo con agua
**o tratar como explosivoGUIA112**. No elegir113 y luego ignorar humedad ni remisión.
Se mencionan específicamente como tóxicos dinitrofenolUN1320,dinitrofenolatosUN1321,
dinitro-o-cresolato de sodioUN1348,azida de barioUN1571; no afirmar que solo ellos
pueden ser tóxicos. El texto dice que algunos son tóxicos y estos se saben tóxicos.

`B08` conserva la distinción carga versus llanta/vehículo y el despeje mínimo1600m
en incendio de carga, aunque `B06` presente800m para escenario de tanque/vagón/
autotanque: son contextos y textos diferentes, que deben mostrarse sin borrar uno.
`B09`: derrame pequeño se inunda con grandes cantidades de agua; grande se humedece
rociando, con dique y continuación lenta de cantidades abundantes. No trasladar a
otros materiales la orden de humedecer. Auxilios generales y ERAP condicional canadiense.

## Guía 114

**Fuente:** PDF164–165; explosivos1.4,1.6. `B02` advierte fragmentos800m o más si fuego
llega a carga, no máximo seguro. `B06-C04` pide considerar aislamiento mínimo15m a
la redonda **si fuego amenaza carga con embalajesetiqueta1.4S/materiales1.4S**. Esa
modalidad, etiqueta y escenario son entradas obligatorias. No reducir automáticamente
el perímetro800m de otro escenario por ver un código1.4.

`B08` carga: no combatir contacto, despejar mínimo800m, dejar consumir, no mover si
expuesta a calor; llanta/vehículo: agentes y límites como112. Incendio clase1.4S:
embalajes diseñados para detonar localmente/proyectar fragmentos, efectos usualmente
limitados a cercanía; combatir con precauciones normales desde distancia razonable.
«Usualmente» y «razonable» no autorizan al motor a declarar seguridad o inventar metros.
Radios100m de detonadores y limpieza supervisada como112; remisión al glosario y ERAP.

## Guía 115

**Fuente:** PDF166–167; gases inflamables incluidos líquidos refrigerados. `B02`:
vapores licuados inicialmente pesados, peroH₂UN1049,D₂UN1957,H₂refrigeradoUN1966,
metanoUN1971 y mezclaH₂/metanoUN2034 son más livianos y se elevan. H₂/D₂ tienen
llama invisible; usar detección alternativa. La alerta de llama de `B08-C02` lista
1049,1957,1966,2034; no agregar1971 a esa lista específica. UN1972 cerca/sobre agua
puede vaporizarse explosivamente. Ropa térmica para criogénicos/refrigerados; materiales
pueden volverse quebradizos por contacto y romperse sin aviso (`B09-C09`).

`B08-C01` no extinguir fuga de gas incendiada salvo que pueda detenerse la fuga.
Pequeño:polvo seco/CO₂; grande:rocío/niebla. **ExcepciónUN1972 incendio de charco**
(`B08-C06`): noagua; polvo seco o espuma de alta expansión. Esa excepción prevalece
sobre ofrecer indiscriminadamente la lista general. Tanques: monitores/distancia
máxima, enfriar con agua sin dirigirla a fuga/dispositivos por congelamiento, retirarse
por signos; incendio masivo sin medios→retirarse/dejar arder.

`B09-C06`, derrameUN1972: noagua,espuma regular ni resistente al alcohol directamente
al derrame; si disponible espuma alta expansión para vapores. Abatir vapores con rocío
sin que el flujo contacte material no equivale a aplicar agua directamente. Voltear
contenedores si posible para que escapen gases y no líquido conserva esa condición;
no es procedimiento automático. Auxilios congelación: descongelar ropa antes de
quitarla; solo personal médico intenta descongelar partes heladas por gas licuado;
quemaduras: enfriar piel sin retirar ropa adherida. IncendiosGLP1075,1011,1012,1055,
1077,1969,1978 remitenBLEVE (`B06-C04`); no presentar distancia de guía como sustituto
de precaucionesBLEVE. ERAP condicional canadiense.

## Guía 116

**Fuente:** PDF168–169; gases inflamables inestables. `B02`: acetilenoUN1001/UN3374
puede explotar sin aire; disilanoUN3553 y silanoUN2203 pueden encenderse al aire y
reencenderse; marca(P) indica posible polimerización explosiva al calor/incendio.
No inferir desaparición de riesgo al eliminar aire o apagar inicialmente una llama.
Peligros de asfixia, toxicidad de algunos, congelación y cilindros conservados.

Fuego: no extinguir fuga que no puede detenerse; pequeño polvo seco/CO₂, grande
rocío/niebla; tanques con restricciones de enfriamiento, congelamiento, retiro y
medios/imposibilidad de combate de incendio masivo. Fuga: puesta a tierra, eliminar
ignición, detener sin riesgo, no aplicar agua directamente, rocío sin contacto del
flujo, si posible liberar fasegas, evitar vías/confinados, aislar hasta dispersión.
Auxilios específicos reservan descongelación a personal médico, enfriar quemaduras
sin quitar ropa adherida. No importar la excepciónGNL ni BLEVE de115 sin otra fuente.

## Guía 117

**Fuente:** PDF170–171; gases tóxicos inflamables de peligro extremo. Salud primero:
fatal por inhalación/absorción, olor inicial puede reducir olfato; **el olor no permite
declarar seguridad**. Marca(P) y peligros inflamables/proyección conservados.
Ropa química solo sin riesgo de incendio. `B06-C02` remiteTabla1 para derrame; necesita
identidad de entrada y condiciones de la tabla, no devolver100m como toda la respuesta.

Fuego: no extinguir fuga salvo poder detenerla; pequeño polvo seco,CO₂,rocío/espuma
regular; grande rocío,niebla/regular. Cilindros dañados solo especialistas. Tanques
con máximadistancia, enfriamiento sin agua directa a fuga/dispositivos, retiro y
alejamiento. `B09-C10` **considera encender derrame/fuga para eliminar peligro tóxico**.
Es consideración que requiere juicio y recursos competentes; sistema debe mostrar
literal y límites de guía, jamás iniciar ignición ni transformarlo en recomendación
incondicional. No inventar criterio o algoritmo de conveniencia no dado en esta página.
Resto fuga/auxilios conserva límites comunes y ERAP condicional canadiense.

## Guía 118

**Fuente:** PDF172–173; gases inflamables corrosivos. Algunos reaccionan violentamente
con agua; vapores extremadamente irritantes. `B06-C02` materiales resaltados→Tabla1.
`B06-C03` otros→aumentar distancia de precaución como sea necesario en dirección
del viento: **no aporta magnitud para que el motor la calcule**. Resaltado desconocido
no equivale a falso; si falta certeza, declarar que la ruta no puede resolverse.

Fuego: pequeño polvo seco/CO₂; grande rocío,niebla/espuma regular; no extinguir fuga
que no puede detenerse; cilindros dañados solo especialistas. Fuga: noagua directa,
rocío sin contacto del flujo, si posible fasegas, puesta a tierra, no caminar material,
detener sin riesgo, aislar hasta dispersión. Riesgo de reacción de algunos conagua
requiere compatibilidad antes de interpretar la alternativa general de rocío.
Auxilios descongelación personalmédico y quemaduras ropa adherida; ERAP condicional.

## Guía 119

**Fuente:** PDF174–175; gases tóxicos inflamables. Salud primero; óxido de etileno
UN1040 puede explotar sin aire, marca(P) puede polimerizar porcalor/incendio; algunos
reaccionan conagua. Derrame resaltados→Tabla1, otros→aumentar según necesidad a
favor del viento sin cifra, como118; no deducir que todos los materiales sonTabla1.

Fuego: no extinguir fuga sin poder detenerla; pequeño polvo seco,CO₂,rocío/espuma
resistente al alcohol; grande rocío,niebla/alcohol. **Clorosilanos: noagua,espuma
resistente al alcohol** en fuego grande (`B08-C04`). Para fuga, espuma resistente
al alcohol reduce vapores (`B09-C07`), mientras regla general de rocío evita contacto
del flujo y noagua directa. IdentidadfamiliaClorosilano es entrada, no inferencia de
que todo gas tóxico necesita prohibición general agua. Cilindros soloespecialistas;
tanques con restricciones comunes. Auxilios y ERAP condicional canadiense.

## Guía 120

**Fuente:** PDF176–177; gases inertes incluidos líquidos refrigerados. Salud primero:
asfixia sinadvertencia/confinados, vapores licuados pesados y lesiones/congelación.
No inflamables no equivale a inocuos; contenedores porcalor explotan/cilindros
proyectan. Protección térmica para líquidos **o sólidos** criogénicos/refrigerados.
No importar las cifras800m a favor del viento de115/116: grande120 considera100m.

Fuego alrededor: agente apropiado para ese fuego, alejamiento seguro de contenedores
no dañados; cilindros dañados soloespecialistas. No hay subsecciones pequeño/grande
con lista de agentes; no inventarlas. Tanques: máxima distancia/monitores, enfriar
sin dirigiragua a fuga/dispositivos porcongelamiento, retirarse por signos, apartado
de llamas. Fuga: detener sinriesgo, rocío sincontacto del flujo, noagua directa, si
posible fasegas, evitar vías/confinados, dejar evaporar y ventilar. No sustituir esto
por aislar hasta dispersión copiando otra guía sin fuente. Criogénicos quiebran
materiales sinaviso; auxilios ropa congelada antes dequitar y descongelación reservada
a personalmédico. En estas dos páginas no figura notaERAP.

## Discrepancias, ambigüedades y elementos no validados

1. **Literal fuente114, PDF165:** el texto de radios presenta `330 PIES DE...` sin
   cierre de paréntesis;112 PDF161 sí presenta `330 PIES) DE...`. La imagen confirma
   omisión tipográfica en114. Conservar fuente literal; no alterar catálogo para
   uniformarlo. Semántica100m /330pies y detonadores permanece legible.
2. **Ubicación de notas:** el catálogo adjunta ERAP a bloquePRIMEROSAUXILIOS y grupo
   de compatibilidad aEVACUACIÓN. Visualmente son notas exteriores al final de página,
   no una indicación médica ni nueva distancia. Este lote clasifica remisiones y
   documenta ubicación; no cambia el extractor de otro agente.
3. **Solapamientos de escenario113:** `B06` incendio tanque/vagón/autotanque800m
   frente `B08` carga incendiada despeje1600m. No se borra diferencia. Para escenario
   que cumpla ambas condiciones falta decisión formal documentada, aunque ambas
   indicaciones deben estar visibles y se requiera personal competente.
4. **114 clase1.4S:** la consideración15m y reglas800m no admiten un algoritmo de
   reemplazo general con solo código1.4. Falta formalizar precedencia tras revisar
   glosario, descripción de divisiones y contexto del incidente.
5. **«Viento a favor» ubicaciónrespondedor:** no resolver silenciosamente como
   desplazamiento vectorial; cotejar instruccionesgenerales/terminología.
6. **«Pequeño/grande», máxima distancia y distancia razonable:** estas20 páginas
   no definen límites cuantitativos de todas esas categorías. Resolver en sección
   correspondiente; no equiparar incendios y derrames por tamaño numérico.
7. No se validóTabla1/2/3 en este lote niBLEVE/ERAP/glosario/auxiliosgenerales completos;
   referencias son dependencias abiertas, no prueba de comprensión conjunta.
8. No existen pruebas del motor/SCI ni auditoría independiente de estas cláusulas.
   La igualdad nativa y lecturavisual demuestran fidelidad de este alcance, no
   ejecución operativa certificada.

## Casos de comprensión a ejecutar por otro auditor

Resultado esperado es documental; obtenido permanecePENDIENTE. Los casos no crean
datos operativos enSIGBO. El auditor debe localizar cláusula, preservar modalidad,
explicar condición y citar PDF; un número aislado no aprueba.

|Caso|Entradas|Esperado sustentado|Fuente|
|---|---|---|---|
|RG111-01|111,derrame/escape|Mínimo100m,todasdirecciones; no garantía de eliminación de riesgos|158,B06-C01|
|RG111-02|111,fuego,agente desconocido|Advertencia de reacción conagente; no certificar compatibilidad|159,B08-C01|
|RG112-01|112,fuego encarga|No combatir; despejar≥1600m; no mover si calor|161,B08|
|RG112-02|112,llanta,sinagua|AlternativasCO₂/polvo seco/barro en ese escenario; sinriesgo para monitores|161,B08|
|RG112-03|112,detonadoreléctrico,radio80m|Prohibiciónradio dentro100m; fuente det. eléctricos|161,B09-C04|
|RG113-01|113,materialseco|Tratar como112; no conservar113 sin condiciónhumedad|162,B02-C03/C04|
|RG113-02|113,carga expuestaalcalor|No mover; lecturaB08 juntoaB06 y explicitación de cifras distintas|162–163,B06/B08|
|RG114-01|114,etiqueta1.4S,fuego amenaza carga|Considerar≥15m; no reemplazo automático800m de otro escenario|164,B06-C04|
|RG114-02|114,código1.4sinS|No justificar15m con ese dato|164–165,B06/B08|
|RG115-01|115,UN1972,charcoincendiado|Noagua; polvoseco o espumaaltaexpansión|167,B08-C06|
|RG115-02|115,UN1972,derrame,espumaalcohol|Noaplicar directamente; altaexpansión si disponible|167,B09-C06|
|RG115-03|115,H₂1049,ningunallama visible|No descartar fuego; detección alternativa|166–167,B02/B08|
|RG115-04|115,metano1971|Más liviano; no añadirlo a lista específica de llama invisibleB08|166–167,B02/B08|
|RG115-05|115,1075,incendio|ConsultarBLEVE además de guía; no darla por resuelta|166,B06-C04|
|RG116-01|116,1001,sinaire|No descartar explosiónpor ausenciaaire|168,B02-C03|
|RG116-02|116,2203,llamaapagada|Posible igniciónespontánea/reencendido; no declarar seguro|168,B02-C04|
|RG117-01|117,fuga,tóxico,consultaautomática|Mostrar consideraciónencender con juicioresponsable; jamás ejecutar|171,B09-C10|
|RG117-02|117,derrame,sincondicionesTabla1|Remisión e insuficiencia;100m no resultado completo|170,B06-C02|
|RG118-01|118,derrame,resaltadodesconocido|Abstenerse de decidirrutaTabla1; no falso implícito|172,B06-C02/C03|
|RG118-02|118,noresaltado,viento conocido|Aumentar según necesidad; no inventar magnitud|172,B06-C03|
|RG119-01|119,clorosilano,fuegogrande|Noagua; espumaalcohol; conservar excepción|175,B08-C04|
|RG119-02|119,1040,sinaire|Persistencia posibilidadexplosión|174,B03|
|RG120-01|120,derramegrande|Considerar≥100m afavorviento; no800m copiadosde115|176,B06-C02|
|RG120-02|120,noinflamable,confinado|No declarar inocuo: asfixia sinaviso|176,B03|
|RG120-03|120,fuegopequeño alrededores|Agente apropiadopara fuego; no inventarlistasecciónpequeño|177,B08|
|RG-AUX-01|115/120,gaslicuado,partesheladas|Intento descongelarsolo personalmédico; remisiónauxiliosgenerales|167/177,B10|

Para todos: **prueba de implementación pendiente**, **resultado obtenido pendiente**,
**auditoría de comprensión independiente pendiente**. El informe global debe incluir
estos estados, no sumar los26 casos como pruebas aprobadas.
