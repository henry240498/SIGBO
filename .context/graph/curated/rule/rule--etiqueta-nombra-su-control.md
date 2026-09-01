---
id: rule--etiqueta-nombra-su-control
tipo: RULE
nombre: Toda etiqueta nombra a su control, y todo th declara su scope
nivel: L1
resumen: Una label cerrada antes del control es decorativa: no nombra el campo ni lo enfoca al hacer clic. Se asocia con htmlFor+id, con useId si el control se repite en una lista, o con aria-label si el texto es dinamico.
severidad: MEDIA
archivos: [frontend/scripts/audit-accessibility.mjs, frontend/src/components/ComboBuscable.tsx, docs/GUIA-DE-ESTILO.md]
terminos: [label, htmlFor, aria-label, accesibilidad, formulario, campo, tabla, scope, th, useId]
edges:
  - [affects, component--front-modulos]
---

## El invariante

El patron dominante en SIGBO era una `<label>` **hermana** del control, cerrada antes:

```tsx
<label style={{ fontSize: 12 }}>Fecha</label>
<input className="input-field" type="date" />
```

Eso es texto decorativo. El campo se anuncia sin nombre, y hacer clic en la etiqueta no
enfoca nada -- que es lo que uno espera y lo nota cualquiera, no solo quien usa lector
de pantalla. Habia 723 asi, contra 4 bien asociadas.

## Como se asocia, por orden de preferencia

1. **`htmlFor` + `id`.** Lo normal.
2. **`useId()` como prefijo** cuando el componente se renderiza dentro de un `.map()`:
   un id fijo se repite por fila y el clic termina enfocando siempre la primera. Fue el
   caso de ocho componentes (`FilaPago`, `FilaAnular`, `PanelTurno`, ...).
3. **`aria-label={expresion}`** cuando el texto de la etiqueta es dinamico (`{label}`,
   `{campo}`), porque no hay cadena estatica de la que derivar un id.

`ComboBuscable` no es un control nativo: su disparador es un `<button>`, asi que se le
pasa la prop **`ariaLabel`** con el texto de la etiqueta.

Los `<th>` llevan `scope="col"` -- los 599 del sistema son encabezados de columna, no
hay ninguno de fila.

## La red

`npm run audit:a11y` cuenta etiquetas sueltas y `th` sin scope contra una linea base en
cero, y falla si crece. Es lo unico que lo vigila: el frontend no tiene pruebas.
Ver tambien [[rule--sin-clases-css-nuevas]] para el lado visual.
