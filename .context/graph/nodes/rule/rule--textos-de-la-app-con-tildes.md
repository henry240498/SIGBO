---
id: rule--textos-de-la-app-con-tildes
tipo: RULE
nombre: Los textos visibles de la app llevan tildes y ñ, y se corrigen con el script, no a mano en bloque
nivel: L1
dominio: servicios
resumen: "scripts/tildes-dart.py corrige solo el texto literal de las cadenas Dart (nunca rutas, claves ni interpolaciones) con un diccionario cerrado; revisar el diff antes de aplicar."
severidad: MEDIA
archivos:
  - scripts/tildes-dart.py
  - .movile/lib
edges:
  - [affects, component--modulo-app-movil]
  - [belongs_to, domain--servicios]
terminos: [tildes, acentos, eñe, ortografia, dart, texto, interrogativas, vehiculo, textos, visibles, llevan, corrigen, script, mano, bloque, scripts, corrige, solo, literal, cadenas, nunca, rutas, claves, interpolaciones, diccionario, cerrado, revisar, diff, antes, aplicar]
---

# Los textos visibles de la app llevan tildes y ñ, y se corrigen con el script, no a mano en bloque

scripts/tildes-dart.py corrige solo el texto literal de las cadenas Dart (nunca rutas, claves ni interpolaciones) con un diccionario cerrado; revisar el diff antes de aplicar.

## Uso

```bash
python scripts/tildes-dart.py --revisar > logs/tildes-revision.txt   # solo muestra el diff
python scripts/tildes-dart.py --aplicar
cd .movile && flutter analyze lib test && flutter test
```

## Cuidados

- Una ruta como `'/flota/moviles/$id/posicion'` se evalúa **entera** (con cada `${...}`
  reemplazado por un marcador) y no se toca.
- Las palabras interrogativas (`cómo`, `dónde`, `quién`, `qué`, `cuándo`…) **no** están en el
  diccionario general: solo se acentúan dentro de ¿…? o en `FRASES`. Si no, "Conectado como"
  pasaría a "Conectado cómo".
- Lo ambiguo (esté/este, rechazó/rechazo, cambio…) se resuelve con frases exactas.
- Hay que **leer el diff completo**: el script no entiende el sentido. Se le escaparon
  "Que se informa" (etiqueta sin ¿?) y "Tipo de vehiculo", que nace en el backend
  (`flota.service.ts`), y se corrigieron a mano.
- Los textos que muestran el **servidor y la web** no están cubiertos.


## Archivos

- `scripts/tildes-dart.py`
- `.movile/lib`

## Relaciones

- `affects` → [[component--modulo-app-movil|app-movil (modulo NestJS)]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[error--editor-guarda-tildes-como-interrogacion|Una edición externa guardó las tildes y los separadores de la app como signos de interrogación]] `affects` →

---
<sub>Nodo **curado** (editable a mano).</sub>
