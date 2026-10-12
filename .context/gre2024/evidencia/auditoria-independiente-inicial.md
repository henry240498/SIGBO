# GRE24-INDEPENDENT-INITIAL — revisión independiente inicial

Revisor: `/root/auditoria_independiente`, distinto del investigador principal.
Estado: **revisión parcial real, no auditoría integral de conocimiento/motor**.
Primer intento interrumpido por límite de uso; reanudado posteriormente. Consultó
índice/contexto, originales nativos y renders propios. No modificó código ni datos.

## Defectos demostrados y corrección requerida

Auditor inicialmente revisado: SHA-256
`1c4efce2625be56ac61fc0f72a88542de668632f0dca417296afea2d1fd4f25e`.
Dos alteraciones independientes sobre copias temporales del artefacto original:

1. Celda `t1-0298-01-01:PEQUENO_AISLAR_M`: de `30 m/30/m` a
   `999 m/999/kg`, conservando fuente `ref-027945` real de30m. Cero discrepancias
   en el auditor inicial: faltaba comparar texto/valor/unidad del campo con fuente.
2. Entrada `entrada-00008`(amoniaco anhidro, guía125, verde) y ambos índices:
   cambiar conjuntamente nombre/guía/verde a valores internos coherentes pero
   falsos respecto del PDF. Cero discrepancias iniciales: faltaba enlazar campos
   con referencias y fondo verde de las palabras originales.

El investigador añadió comparaciones celda→fuente, unidad→columna/texto,
fila→fuente, entrada→fuente, `P`/número→guía y verde→geometría de palabras originales.
El test de corrupción reproduce alteraciones coordinadas. **La reparación se
considera comprobada solo con la repetición independiente y sus códigos registrados.**

Repetición independiente concluida: auditor corregido SHA-256
`95294ed9fee0f423c39f730d456620c9480c69fe6a5429ff298ada61ed054c6d`.
Primer payload rechazado con3hallazgos de texto/unidad; segundo con6hallazgos
de nombre/guía/verde. [Resultados persistidos](independiente-resultados.json)
con hashes de payload, fuente y auditor, y detalle de cada hallazgo. Ninguna de
las dos repeticiones produjo alertas ajenas al payload. Esto verifica la reparación
de esas vulnerabilidades; no prueba un auditor universal.

Límites restantes de lectura estática: nombre normalizado frente al original;
guíaNumero/P de filas frente a guíaOriginal; unidades y condiciones estructuradas
deTabla3 frente a cabeceras originales. Seguir los [pendientes](../open-issues.md).

Otros hallazgos aceptados: acentos dañados por el transporte de texto de PowerShell;
literal originalPDF3 `agua cómo agente extintor`; referencia de agua debe buscarse
en la filaTabla1 y puede faltar en el nombre del índice; cantidades deTabla3 deben
conservar valores imperiales originales además de métricos. Se corrigieron JSON
y se añadió el control de fuente literal/codificación al validador de contexto.

## Escenarios resueltos por el auditor

Resultados documentales obtenidos por consulta de contexto y PDF, **sin motor**:

| Entrada/condiciones | Resultado obtenido | Fuente PDF / impresa |
|---|---|---|
| 1689 sólido, agua,209L,noche | Guía157, aislamiento60m, protección0.9km; HCN informativo | 303/301 y334/332 |
| 1689 sólido, seco | Tablas1/2 no aplican; consultar guía | 334/332 |
| 1746,grande,noche,agua/tierra incierto | Protección mayor2.8km(agua), frente0.5km(tierra) | 304/302 y287/285 |
| 1017,grande,autotanque,noche,10–20km/h | Aislamiento600m, protección5.0km; viento moderado | 340/338 y341/339 |
| Mismo escenario,20.01km/h | Protección4.1km; viento fuerte | 341/339 |
| Mismo escenario,viento desconocido | Condición insuficiente para distancia final | 340/338 |

Esto acredita resolución de esos escenarios por el segundo agente con fuentes,
no cobertura representativa de todas las secciones. La fuente debe seguir estando
disponible; memorizar estas cifras no sustituye seleccionar material/fila/condición.
Faltan casos unitarios/integración del motor con resultados esperados derivados y
comparados independientemente. No presentar esta tabla como un motor validado.

El mensaje inicial del revisor y sus payloads se conservaron temporalmente; los
hallazgos, mutaciones y conclusiones relevantes quedan persistidos aquí y en las
pruebas. Las imágenes de evidencia independiente seleccionadas se conservan en
`visual-independiente/` con su manifest dehashes.
