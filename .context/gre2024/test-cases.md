# GRE24-TESTS — pruebas y evidencia

Evidencia histórica conservada: [fase3CD](../../docs/matpel/evidencia/fase3cd/validacion.json)
registra46 pruebas Python,43 GRE backend y9 SQL desechable aprobadas. No son resultados
repetidos de esta misión ni pruebas del motor de selección actual, incorporado después.
La revisión/verificación/activación de SQL era una simulación de flujo administrativo.

Control actual reproducible, desde raíz:

```powershell
python scripts/matpel/auditar_conocimiento.py
```

Lee PDF y artefacto, escribe [auditoria-documental.json](evidencia/auditoria-documental.json)
y devuelve1 si encuentra discrepancias técnicas. Exit0 significa que pasaron esos
controles específicos; no significa dominio integral, aprobación visual o institucional.
`auditorSha256`, artefacto/PDF, versiónPyMuPDF, fecha y revisiónGit conservan alcance.

Casos derivados implementados posteriormente en `motor-matpel.spec.ts`: exclusión del flujo con varios materiales(PDF3);
ONU con múltiples nombres y selección condicionada(PDF296); verde/incendio;
208L inclusive y masa sin densidad; límites viento10/20km/h;
agua/tierra/ambos/desconocido; materiales solo-agua en derrame seco(PDF334);
gas producido no sustituye material; remisión aTabla3; contenedor no soportado;
`+`; liberación total/ambigüedad de formulaciones; círculo/cuadrado/dirección.
Cada esperado numérico deberá cotejarse con su celda original, no generarse desde
la salida del propio motor. No se publican cifras esperadas sin ese cotejo.

La auditoría independiente se interrumpió inicialmente y después se reanudó.
[Siete casos](test-cases/casos-independientes-iniciales.json) registran comprensión
documental manual del segundo agente con fuente, sin motor ejecutado. El
[informe](evidencia/auditoria-independiente-inicial.md) documenta dos falsos negativos
del auditor y su reparación. **No acredita comprensión de todo el inventario.**
El control automático escrito por el investigador es una verificación técnica
separada del extractor, no una auditoría independiente humana/multiagente terminada.

Controles nuevos: `cd scripts/matpel; python -m unittest test_auditar_conocimiento -v`
aprobó3/3 en117.379s con alteraciones coordinadas de campos/refs/verde detectadas.
`python scripts/matpel/validar_conocimiento.py` comprueba descubrimiento, enlaces,
fuentes literales, hashes de evidencia, estados y correspondencia auditor/código.
Las instrucciones de ambos checks delimitan qué prueban y qué no.

Reanudación2026-10-10: auditor4/4; integridad/cantidades7/7. Ejecutar desde
`scripts/matpel`:

```powershell
python -m unittest test_auditar_conocimiento test_validar_conocimiento -v
```

Los casos nuevos adulteran campos derivados de manera coordinada, y literales,
cajas, bloques, huellas y cobertura del lote111–120. Los de cantidades cotejan
unidades métricas/imperiales, extremos e inventario contraPDF340 / impresa338, y
detectan alteración de valor junto a literal. No son casos de ejecución del motor.
El [estudio deTabla3](estudio-tabla3.md) conserva ocho conclusiones documentales
con fuentes; su revisión independiente y prueba operativa permanecen pendientes.
[Resultados actuales](evidencia/validacion-reanudacion-20261010.json).

Continuación121–130: desde `scripts/matpel`,
`python -m unittest test_validar_conocimiento test_documentar_guias -v` aprobó14/14
en3.682s (10 controles de integridad/cantidades y4 de preparación documental).
Comprueba omisión de cláusula con conteo ajustado, numeración impresa falsa,
atribución visual sin registro, guía121 vacía, literales/remisiones y nota canadiense
fuera de primeros auxilios. El auditor sin cambios conserva su resultado anterior;
no se repitió en este lote.

[Ocho casos propuestos](test-cases/casos-guias121-130.json) conservan condiciones
y esperados documentales; resultado independiente nulo y motor pendiente.
[Evidencia del lote](evidencia/validacion-guias121-130-20261010.json) separa ambos
tipos de comprobación.

## Cierre documental de todas las guías —2026-10-10

Desde `scripts/matpel`, ejecutar:

```powershell
python -m unittest test_validar_conocimiento test_documentar_guias -v
```

La suite ampliada controla todos los lotes, omisión de un lote con manifest
reducido, duplicación, estado vacío falso, subapartado adulterado con literal
intacto, títulos plurales de metales y título continuado de baterías. También
detecta pérdida de anotación/caso, cambio de fuente de condición y atribución
de resultado operativo a un caso propuesto.

Resultado de esta ejecución:23/23 aprobadas en28.863s, con17 controles de
integridad/cantidades/condiciones y6 del preparador. Integridad global: cero errores.

[87 casos nuevos](test-cases/casos-guias131-174.json):43 condiciones específicas,
43 situaciones de información incompleta y167 sin materiales. Conservan fuente,
esperado documental, resultado independiente nulo y motor pendiente. La
verificación técnica de su cobertura no constituye ejecución de esos escenarios.
[Evidencia final](evidencia/validacion-guias-completas-20261010.json).

## Inspección de las392 páginas

Desde `scripts/matpel`, ejecutar `python -m unittest test_validar_conocimiento
test_documentar_guias test_validar_paginas -v` en una sola línea. Los nuevos
controles detectan omisión/duplicación, render sin lectura, pérdida de anotación,
imagen o texto cambiado, registro visual ajeno, pie de miniatura confundido,
notas desincronizadas y atribución de validación operativa. La integridad global
también controla fuente, preparador, catálogo y antecedentes por página.

Los cuatro [hallazgos](paginas/hallazgos.json) incluyen criterio documental
esperado y fuentes. Conservan resultado independiente nulo y prueba de motor
pendiente. Verificar la integridad de estos registros no ejecuta sus escenarios.

## Consulta, motor, geometría y archivo web —2026-10-10

Backend: `npm test` ejecuta las pruebas generales. La corrida completa registrada
con `npm test -- --testPathPatterns=matpel-paquete` también recorrió todas las suites:
658 aprobadas,9 omitidas de SQL,56 suites aprobadas y1 omitida. La opción plural no
filtró Jest29; para selección usar `--testPathPattern=matpel-paquete`. Ese comando
correcto repitió4 pruebas del paquete con hash/bytes, exclusión de campos privados,
rechazo de PDF alterado y neutralización de cierre de script. El motor tiene28
casos locales con recorte real; no son las pruebas operativas de los87 escenarios
documentales propuestos, que conservan su estado pendiente.

Frontend: `npm test`66/66; builds de backend y frontend aprobados. Catálogo de
pantallas actualizado, auditorías estáticas de accesibilidad y contraste aprobadas.
El [recorrido UI](evidencia/recorrido-ui-matpel-20261010.json) intercepta toda API en
contexto separado y usa fuente/motor reales, sin acceso a SQL. El [recorrido offline](evidencia/recorrido-offline-matpel-20261010.json)
usa el candidato completo desde disco, con el navegador desconectado desde antes
de abrirlo. Sus15 y11 comprobaciones no equivalen a aceptación institucional,
lector de pantalla auditado, teléfono físico o funcionamiento SCI.

Desde `scripts/matpel`, `python -m unittest test_cotejo_motor test_validar_conocimiento
-v` controla recorte/cabeceras y conocimiento actualizado. El control de308celdas
de Tabla3 sigue cabeceras nativas dePDF341–343 / impresas339–341, conservando su
alcance técnico. El [informe de cierre local](evidencia/validacion-consulta-motor-20261010.json)
registra resultados finales, hashes, grafo y limitaciones; no activa catálogo.

Flutter: desde `.movile`, `flutter analyze --no-pub`,
`flutter test --no-pub --reporter expanded` y `flutter build apk --debug --no-pub`
aprobados.56 pruebas generales, incluyendo8 de MATPEL. Se cotejó el paquete del
exportador real con el recorte y con el candidato completo, sin activar ni publicar
datos. La biblioteca prueba integridad, conservación ante descarga fallida,
recuperación de versión anterior y reparación de copia corrupta. Widgets prueban
primera apertura, permiso negativo, selección explícita, fuente PDF/impresa y403.
La E/S de pruebas usa directorios temporales verificados; los widgets usan un
documento real ya verificado para separar el reloj de Flutter de la E/S de disco.
El exportador Node se ejecuta con UTF-8 explícito también en Windows.
Los casos de interoperabilidad se omiten con motivo cuando faltan backend compilado
o candidato original. La corrida registrada no omitió ninguno. El teléfono físico,
selector/lector PDF del sistema y aceptación de campo permanecen pendientes.
