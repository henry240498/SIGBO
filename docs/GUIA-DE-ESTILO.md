# SIGBO-CBVC — Guía de Estilo y Patrones de Frontend

> Documento de referencia para construir o modificar cualquier pantalla del frontend
> de SIGBO manteniendo consistencia visual y de código con lo ya existente. Todo lo
> descrito aquí está **verificado contra el código real** (`frontend/src/`), no es
> una propuesta — es la documentación de lo que ya existe y debe replicarse.
>
> Regla de oro: **no inventar clases CSS nuevas, no traer una librería de
> componentes, no usar Tailwind.** Todo el sistema visual se resuelve con 4 clases
> utilitarias en `globals.css` + estilos inline puntuales. Si una pantalla nueva
> necesita algo que estas 4 clases no cubren, se resuelve con `style={{...}}` inline
> usando los mismos colores/medidas documentados acá, no con una clase nueva.

---

## 1. Stack y principios generales

- **Next.js 14, App Router, TypeScript, React 18.** Todas las páginas son
  `'use client'` — no hay Server Components con datos; todo se carga desde el
  cliente contra la API vía `fetch`.
- **Sin librería de UI** (no Material UI, no Chakra, no shadcn, no Ant Design).
  Sin Tailwind. Sin CSS Modules. Un único `globals.css` global + `style={{}}` inline.
- **Tema oscuro fijo**, sin modo claro, sin selector de tema.
- Cada pantalla es dueña de su propio estado (`useState`/`useEffect`), no hay store
  global (ni Redux ni Zustand ni React Query/SWR). Los datos se recargan con una
  función `cargar()` local que se vuelve a invocar tras cada mutación.
- Todo el texto de la interfaz está en **español**, sin internacionalización.

---

## 2. Tokens de diseño (colores, tipografía, radios)

Definidos en `frontend/src/app/globals.css` y repetidos como valores inline en el
resto del código (no hay variables CSS/custom properties — los hex se repiten
literalmente en cada archivo, así que al copiar un patrón hay que copiar el valor
exacto, no inventar uno parecido).

### 2.1 Paleta de color

| Uso | Hex | Dónde se usa |
|---|---|---|
| Fondo general de la app | `#0f172a` | `body`, fondo de `.input-field`, fondo del login |
| Fondo de tarjetas/paneles | `#1e293b` | `.card` |
| Borde estándar | `#334155` | bordes de `.card`, `.input-field`, separadores de tabla (`thead`), pestañas |
| Borde de fila de tabla (sutil) | `#1f2937` | `<tr>` de `<tbody>` |
| Texto principal | `#e2e8f0` | `body`, texto activo del menú |
| Texto secundario/atenuado | `#94a3b8` | textos de ayuda, "Cargando...", labels de navegación inactivos |
| Texto muy atenuado (terciario) | `#64748b` | aclaraciones pequeñas entre paréntesis |
| Azul primario (acento/marca) | `#2563eb` | `.btn-primary`, borde de foco de inputs, subrayado de pestaña activa |
| Azul primario hover | `#1d4ed8` | `.btn-primary:hover` |
| Azul claro (links secundarios) | `#60a5fa` | enlaces tipo "Abrir enlace ↗" |
| Verde éxito / estado activo | `#4ade80` (texto) / `#166534` (fondo badge) / `#16a34a` (fondo botón) | mensajes de éxito, badge ACTIVO, botón "Conceder" |
| Rojo error / estado inactivo o peligro | `#f87171` (texto) / `#7f1d1d` (fondo badge/botón) | mensajes de error, badge INACTIVO/BLOQUEADO, botones "Eliminar"/"Dar de baja"/"Denegar" |
| Ámbar advertencia | `#b45309` (borde) / `#451a03` (fondo) | aviso de "edición bloqueada por el administrador" en Mi Perfil |
| Gris neutro (botón secundario/deshabilitado) | `#475569` | botón "Cancelar" dentro de un formulario, `.btn-primary:disabled` |
| Gris badge por defecto | `#334155` | `.badge` sin color específico |

**Regla de estados ACTIVO/INACTIVO:** en toda la app, `ACTIVO` = verde
(`#166534` fondo de badge / `#16a34a` botón), cualquier estado "malo"
(`INACTIVO`, `BLOQUEADO`, denegado) = rojo oscuro `#7f1d1d`. No usar otros colores
para este binario.

### 2.2 Tipografía

- Fuente: `"Segoe UI", system-ui, sans-serif` (definida en `body`; no se importa
  ninguna fuente externa/Google Fonts).
- Tamaños usados consistentemente (no hay escala tipográfica formal, son valores
  puntuales repetidos):
  - Título de página (`<h2>` de sección principal): `16px`, a veces con el conteo
    entre paréntesis: `Rangos (12)`.
  - Título de tarjeta/sección (`<h2>` dentro de `.card`): `15px`–`16px`.
  - Cuerpo de tabla y formularios: `13px`.
  - Labels de campo: `12px`, `display: block`, `marginBottom: 4`.
  - Texto de ayuda/aclaración: `11px`–`12px`, color `#64748b` o `#94a3b8`.
  - Badges: `12px`, `font-weight: 600`.

### 2.3 Radios y espaciados

- Radio de `.card`: `10px`. Radio de `.input-field`/`.btn-primary`: `6px`. Radio de
  `.badge`: `999px` (píldora completa). Swatches de color e íconos circulares
  (avatares): `border-radius: '50%'` o `4px` para swatches cuadrados pequeños.
  Radio de imágenes de vista previa: `10px`.
- Separación estándar entre secciones apiladas de una página:
  `style={{ display: 'flex', flexDirection: 'column', gap: 16 }}` (listados) o
  `gap: 20` (páginas tipo expediente/perfil con muchas secciones).
- Padding de `.card`: `24px`. Padding de `.btn-primary`: `10px 18px` (o
  `4px 8px`/`fontSize: 12` para botones de acción dentro de una fila de tabla).
- Padding de celdas de tabla: `6px 4px`.

---

## 3. Las 4 clases utilitarias (`globals.css`)

Copiar textual, no reinterpretar:

```css
.card {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 24px;
}

.btn-primary {
  background: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
}
.btn-primary:hover { background: #1d4ed8; }
.btn-primary:disabled { background: #475569; cursor: not-allowed; }

.input-field {
  width: 100%;
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #334155;
  background: #0f172a;
  color: #e2e8f0;
}
.input-field:focus { outline: 2px solid #2563eb; }

.badge {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: #334155;
}
```

**`.btn-primary` no tiene variantes por clase** (no existe `.btn-danger` ni
`.btn-secondary`). Los botones "peligrosos" o "secundarios" son `.btn-primary`
con un `style={{ background: '#7f1d1d' }}` (rojo, acción destructiva) o
`style={{ background: '#475569' }}` (gris, acción neutra tipo "Cancelar")
sobrescrito inline. Nunca se crea una clase CSS nueva para esto.

**`.badge` tampoco tiene variantes por clase** — el color se sobrescribe inline
según el dato (`style={{ background: rol.color }}` para badges de rol con color
propio de BD, o el mapeo verde/rojo de la sección 2.1 para estados).

---

## 4. Estructura de layout

### 4.1 `RootLayout` (`app/layout.tsx`)
Solo importa `globals.css` y envuelve `<html lang="es"><body>{children}</body></html>`.
Sin `<head>` custom, sin metadata avanzada.

### 4.2 `DashboardLayout` (`app/dashboard/layout.tsx`)
Shell fijo de dos columnas, aplicado a **todo** lo que cuelga de `/dashboard/*`:

- **Sidebar izquierdo**, ancho fijo `240px`, `borderRight: 1px solid #334155`:
  - Logo + nombre del sistema arriba (dinámico desde `GET /seguridad/apariencia`,
    con fallback a 🚒 + "SIGBO-CBVC" si no hay configuración).
  - Navegación: un link "Inicio" fijo + un link por cada módulo de `MODULOS`
    (`lib/modulos.ts`) que el usuario tenga permiso de ver
    (`moduloVisible(modulo, permisos)` — el usuario necesita al menos un permiso
    que empiece con `${slug}:`).
  - Link fijo a "Mi Perfil" al pie, separado por un `borderTop`.
  - Botón "Cerrar sesión" (`.btn-primary`, `width: 100%`) al final.
  - Item de menú activo: fondo `#1e293b`, texto `#e2e8f0`, `font-weight: 600`;
    inactivo: texto `#94a3b8`, sin fondo.
- **Área de contenido** a la derecha, `flex: 1`, `padding: 28px 32px`,
  `maxWidth: 1100`:
  - Header con el título del módulo actual (ícono + nombre) a la izquierda, y a la
    derecha el username + badge con la cantidad de roles.
  - Debajo, `{children}` — el contenido de cada página.
- Antes de renderizar, verifica sesión (`obtenerSesion()`); si no hay, redirige a
  `/login` (`router.replace`).

### 4.3 Sub-navegación de módulo (patrón "tabs", ej. `dashboard/organizacion/layout.tsx`)
Los módulos con varias pantallas hijas (Organización, Seguridad) tienen su propio
`layout.tsx` con una barra de pestañas horizontal debajo del header del dashboard:

```tsx
<nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid #334155', marginBottom: 20 }}>
  {TABS.map((tab) => {
    const activo = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
    return (
      <Link href={tab.href} style={{
        padding: '8px 12px', fontSize: 13, textDecoration: 'none',
        color: activo ? '#e2e8f0' : '#94a3b8',
        fontWeight: activo ? 600 : 400,
        borderBottom: activo ? '2px solid #2563eb' : '2px solid transparent',
      }}>{tab.label}</Link>
    );
  })}
</nav>
```
El array `TABS` se declara arriba del componente con `{ href, label, exact? }`.
`exact: true` solo en el ítem "Dashboard" del propio módulo (para que no quede
marcado activo en todas las subrutas).

---

## 5. Patrones de página completos

Hay 4 "moldes" de pantalla que cubren prácticamente todo el sistema. Al crear una
pantalla nueva, identificar cuál de estos 4 aplica y copiar su estructura, no
improvisar una quinta.

### 5.1 Molde A — Catálogo CRUD (ej. `organizacion/rangos/page.tsx`)
El más común (12 pantallas de Organización lo usan). Estructura, en orden:

1. **Header de página**: `<h2>Nombre ({total})</h2>` a la izquierda, botones a la
   derecha en `display:flex, gap:8`: "Exportar a Excel", "Exportar a PDF" (ambos
   `.btn-primary` llamando a `descargarArchivo(...)`, ver §7), y "Nuevo {entidad}"
   /"Cancelar" (toggle del formulario).
2. **Barra de filtros** dentro de una `.card`: input de búsqueda (`q`), `<select>`
   de estado, checkbox "Mostrar eliminados". Cualquier cambio dispara `cargar()`
   vía `useEffect([q, filtroEstado, mostrarEliminados])`.
3. **Mensajes**: `{error && <p style={{color:'#f87171'}}>{error}</p>}` y
   `{mensaje && <p style={{color:'#4ade80', fontSize:13}}>{mensaje}</p>}` — SIEMPRE
   estos dos, siempre en ese orden, siempre estos colores exactos.
4. **Formulario inline** (solo si `mostrarForm`): `<form className="card">` con
   los campos en `display:grid, gridTemplateColumns` (2 a 4 columnas según
   cantidad de campos cortos), cada campo como:
   ```tsx
   <div>
     <label style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>Campo</label>
     <input className="input-field" value={...} onChange={...} required />
   </div>
   ```
   Un mismo formulario sirve para crear y editar (estado `editandoId: string|null`;
   si tiene valor se hace `PATCH`, si no `POST`). Botón submit cambia de texto
   ("Crear X" / "Guardar cambios" / "Guardando...") y se deshabilita mientras
   guarda. Si está editando, aparece un botón "Cancelar" extra
   (`background:'#475569'`).
5. **Tabla**: `<table style={{width:'100%', borderCollapse:'collapse', fontSize:13}}>`,
   `<thead>` con `borderBottom:1px solid #334155`, filas de `<tbody>` con
   `borderBottom:1px solid #1f2937`. Última columna siempre "Acciones", con
   botones pequeños (`padding:'4px 8px', fontSize:12`): "Editar" (azul por
   defecto), y "Eliminar"/"Reactivar" alternados según `eliminadoEn === null`
   (rojo `#7f1d1d` para eliminar, verde `#166534` para reactivar). Borrado siempre
   vía `window.confirm(...)` antes de llamar a la API — nunca se borra sin
   confirmación.

### 5.2 Molde B — Listado simple de solo lectura
Para pantallas que todavía no tienen CRUD propio: una sola `<section className="card">`,
`<h2>` + tabla sin filtros ni formulario. Estado vacío explícito y honesto (no un
spinner infinito ni una tabla vacía sin explicación):
```tsx
{datos && datos.length === 0 && (
  <p style={{ color: '#94a3b8', fontSize: 13 }}>Todavia no hay {cosa} registrados...</p>
)}
```

### 5.3 Molde C — Expediente/detalle con múltiples secciones (ej. `seguridad/usuarios/[id]/page.tsx`)
Para páginas dinámicas `[id]` que muestran un registro completo con varias facetas
independientes (datos, roles, permisos, sesiones, auditoría, listas dinámicas).
Estructura:
- `<div style={{display:'flex', flexDirection:'column', gap:20}}>` como contenedor.
- Cada faceta es su propia `<section className="card">` con su propio `<h2>`
  (`fontSize:15-16`) y, cuando aplica, su propio botón de guardado independiente
  (no hay un único "Guardar todo" — cada sección se guarda por separado con su
  propio estado `guardando`/mensaje).
- **Listas dinámicas** (teléfonos, correos, permisos directos): array en estado,
  cada fila con sus inputs + un botón de texto "quitar"
  (`background:none, border:none, color:#f87171, textDecoration:underline`,
  cursor pointer) y un botón "+ Agregar {cosa}" (`.btn-primary` chico,
  `padding:'4px 10px', fontSize:12`) al final de la lista.
- **Subida de archivo/foto**: `<input type="file" accept="image/png,image/jpeg,image/webp,image/gif">`
  + `FormData` + `fetch` manual (no `apiFetch`, porque hay que mandar
  `multipart/form-data` sin forzar `Content-Type: application/json`) — ver §7.2.
  Avatar circular `56px`–`64px`, `objectFit:'cover'`, `border:1px solid #334155`;
  si no hay foto, un círculo con emoji 👤 del mismo tamaño.
- **Estados vacíos por sección**, siempre en `fontSize:13, color:#94a3b8`: "Sin
  sesiones activas.", "Sin actividad registrada.", "Sin excepciones directas...".

### 5.4 Molde D — Configuración/ajustes con permiso y vista previa (ej. `seguridad/apariencia/page.tsx`, `mi-perfil/page.tsx`)
Para pantallas de configuración global o de autogestión:
- **Gate de permiso explícito ANTES de cargar nada**, mensaje claro de por qué no
  se puede acceder (no un simple 403 en blanco):
  ```tsx
  if (!tienePermiso) return <p style={{color:'#94a3b8', fontSize:13}}>Solo un usuario con el permiso <code>x</code> puede acceder...</p>;
  ```
- Cuando una política del sistema puede **bloquear la edición** (ej. "Modo Fijo"
  de Mi Perfil), mostrar un aviso destacado en amarillo/ámbar
  (`borderColor:'#b45309', background:'#451a03'`) y deshabilitar (`disabled`) los
  campos afectados — no ocultarlos, dejarlos visibles pero inactivos.
- Toggles de dos estados exclusivos (ej. Libre/Fijo): dos `.btn-primary` uno al
  lado del otro, el activo resaltado con su color semántico
  (verde `#16a34a` / rojo `#7f1d1d`) y un `✓` al lado del texto; el inactivo en
  gris `#334155`.
- **Vista previa en vivo**: cuando la pantalla edita algo visual (logos, colores,
  textos institucionales), incluir una `<section className="card">` aparte que
  renderiza una maqueta simplificada del resultado (ver `apariencia/page.tsx`,
  sección "Vista previa - Login"), actualizada en tiempo real con los mismos
  `useState` del formulario (no espera a guardar).

### 5.5 Molde E — Grilla de gestión con filtros combinables (ej. `dashboard/personal/page.tsx`)
Para catálogos operativos grandes (Personal es el caso canónico: 164+ registros)
que necesitan búsqueda, múltiples filtros combinables y ordenamiento, manteniendo
la tabla plana (sin paginación — todo el filtrado/orden es client-side sobre el
listado completo, cargado una sola vez).
- **Barra de filtros visible** en una `<div className="card">` arriba de la
  tabla, sin menú desplegable adicional: cada filtro es un `<div>` con su
  `<label style={{fontSize:11, color:'#94a3b8'}}>` encima. Filtros de texto libre
  usan `.input-field`; filtros de catálogo/enum usan `ComboBuscable` (ver abajo),
  nunca un `<select>` plano una vez que la lista puede crecer.
  Botón final "Limpiar filtros" (`.btn-primary` gris) que vuelve todos los
  filtros a vacío/`''` (=`NINGUNA`) **y** el orden manual a `null` (vuelve al
  orden institucional por defecto).
- **Filtrado**: un solo `useMemo` que aplica todos los filtros con AND (early
  `return false` por cada condición que no matchee), sobre el listado completo
  ya cargado — no se re-consulta el backend por cada filtro.
- **Orden**: un segundo `useMemo` (encadenado sobre el resultado filtrado) que
  aplica el orden de columna manual si el usuario clickeó un encabezado
  (`<th onClick=...>Nombre{flecha}</th>`, alternando asc/desc), o si no, el
  **orden institucional por defecto** (nunca alfabético) — ver `lib/personal.ts`.
- El header muestra el conteo dinámico: `<h2>Titulo ({resultado.length})</h2>`,
  siempre sobre el array ya filtrado+ordenado, nunca sobre el array crudo.

### 5.6 Personal como catálogo centralizado — regla obligatoria para todo SIGBO
`frontend/src/lib/personal.ts` es el **único** lugar donde vive la lógica de
orden institucional y búsqueda de bomberos. Cualquier pantalla de cualquier
módulo que liste, filtre, busque o permita **seleccionar** personal (asignar
responsables, participantes de un servicio/guardia, capacitaciones, préstamos
de equipamiento, informes, etc.) **debe** importar de ahí — nunca reimplementar
el criterio:
- `cargarBomberos()` / `cargarTiposBombero()` — fetch canónico.
- `construirTipoPorId()` + `compararBomberosInstitucional()` — orden
  institucional (prioridad de tipo vía `personal.tipos_bombero.orden`, luego
  número de código bomberil como entero real vía `extraerNumeroCodigo()`,
  **nunca** como texto ni adivinado por prefijo de string — siempre a través
  del `tipoBomberoId` real del registro).
- `ESTADOS_BOMBERO` — los 7 estados válidos (constante de código, no
  parametrizable: es una máquina de estados fija impuesta por el backend).
- `cargarCatalogo(path)` — fetch genérico para catálogos de Organización
  (rangos, cargos, etc.) usados en combos relacionados con Personal.

Si en el futuro cambia el criterio de orden o búsqueda de Personal, se cambia
**una sola vez** en `lib/personal.ts` y todos los módulos que lo consuman se
actualizan automáticamente.

### 5.7 `ComboBuscable` (`components/ComboBuscable.tsx`) — combo con autocompletado
Reemplaza a `<select>` en cualquier combo que pueda crecer (personal, rangos,
cargos, tipos, parametros). Abrir → escribir → encontrar → seleccionar, con
`NINGUNA` siempre como primera opción (`value: ''`) cuando el filtro es
opcional. Búsqueda insensible a mayúsculas/tildes vía `coincideBusqueda` de
`lib/texto.ts`. Uso:
```tsx
<ComboBuscable
  opciones={tipos.map((t) => ({ value: t.id, label: `${t.prefijo} — ${t.nombre}` }))}
  value={filtroTipoId}
  onChange={setFiltroTipoId}
  placeholderBusqueda="Buscar tipo..."
  maxWidth={230}
/>
```
No reimplementar un combo de búsqueda distinto en otra pantalla — extender este
componente si le falta algo.

---

## 6. Convenciones de formularios y componentes

- **Label + input**: siempre `<label style={{fontSize:12, display:'block', marginBottom:4}}>Texto</label>`
  inmediatamente antes del `<input className="input-field">`. Nunca `<label>`
  envolvente ni `aria-label` como sustituto visual.
- **Grillas de campos cortos**: `style={{display:'grid', gridTemplateColumns:'1fr 2fr 1fr 1fr', gap:10}}`
  — las proporções de columna se ajustan a mano según el campo más largo (nombre
  suele ser `2fr`), no hay un sistema de grilla de 12 columnas.
  Campos de ancho completo (textareas, descripciones largas) van en un `<div>`
  fuera de la grilla, o con `style={{gridColumn:'1 / -1'}}` dentro de ella.
  Selects/inputs sueltos angostos usan `style={{maxWidth: 180-320}}` puntual.
- **Selects de relación (FK)**: `<select className="input-field">` con una opción
  placeholder `<option value="">-- ninguno --</option>` o
  `-- seleccionar permiso --`, poblado desde otro `GET` cargado en paralelo con
  `Promise.all` en el mismo `cargar()`.
- **Checkboxes**: sueltos, con su label al lado en la misma línea
  (`<label style={{fontSize:13, display:'flex', alignItems:'center', gap:6}}><input type="checkbox".../>Texto</label>`),
  nunca dentro de `.input-field`.
- **Campo de color**: `<input type="color" className="input-field">` (nativo del
  navegador, sin color picker custom) — usado en `rangos` para el color del badge
  del rango.
- **Botones de acción de fila** (dentro de `<td>`): `.btn-primary` con
  `style={{padding:'4px 8px', fontSize:12}}` + el color semántico si aplica.
  Varios botones en la misma celda van en
  `<td style={{display:'flex', gap:6, flexWrap:'wrap'}}>`.
- **Enlaces de "quitar" de una lista dinámica**: nunca un botón `.btn-primary`
  rojo — siempre texto plano subrayado:
  `style={{background:'none', border:'none', color:'#f87171', cursor:'pointer', textDecoration:'underline'}}`.
- **Confirmaciones destructivas**: `window.confirm('¿Pregunta clara?')` nativo del
  navegador — no hay modal custom de confirmación en todo el sistema. Para
  entradas de texto puntuales (motivo de baja, nueva contraseña temporal) se usa
  `window.prompt(...)`, también nativo.
- **Loading state**: `<p style={{color:'#94a3b8'}}>Cargando...</p>` como único
  contenido de la página mientras el dato principal es `null` — no hay
  spinners/skeletons en ningún lado del sistema.
- **Enlaces externos** (redes sociales, etc.): `target="_blank" rel="noopener noreferrer"`
  siempre, color `#60a5fa`, con "↗" al final del texto del link.

---

## 7. Integración con la API (frontend/src/lib/)

### 7.1 `apiFetch` (`lib/api.ts`) — usar SIEMPRE para llamadas JSON
Envuelve `fetch` agregando automáticamente `Content-Type: application/json` y el
header `Authorization: Bearer <accessToken>` desde la sesión en `localStorage`
(`sigbo_sesion`). Si la respuesta es `401`, intenta refrescar el token una vez
(`POST /auth/refresh`) y reintenta la request original antes de devolver el error.
**Nunca usar `fetch` directo para JSON** — solo `apiFetch`.

### 7.2 `fetch` manual — solo para `multipart/form-data` (subida de archivos)
Como `apiFetch` fuerza `Content-Type: application/json`, las subidas de archivo
(foto de perfil, imágenes de apariencia) arman el header a mano:
```tsx
const formData = new FormData();
formData.append('archivo', archivo);
const sesion = obtenerSesion();
const headers: HeadersInit = {};
if (sesion) headers['Authorization'] = `Bearer ${sesion.accessToken}`;
const res = await fetch(`${API_ORIGIN}/api/v1/...`, { method: 'PUT', headers, body: formData });
```
Nótese `API_ORIGIN` (sin el sufijo `/api/v1`) + el prefijo escrito a mano, porque
`apiFetch` no se usa acá.

### 7.3 `descargarArchivo` (`lib/exportar.ts`) — usar SIEMPRE para exportar Excel/PDF
```ts
export async function descargarArchivo(ruta: string, nombreArchivo: string): Promise<void> {
  const res = await apiFetch(ruta);
  if (!res.ok) return;
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nombreArchivo;
  a.click();
  URL.revokeObjectURL(url);
}
```
Nunca CSV — el sistema exporta exclusivamente a Excel (`.xlsx`) y PDF.

### 7.4 Manejo de errores de la API
Todo bloque de guardado sigue el mismo patrón: `try { ... } catch(err:any) { setError(err.message) } finally { setGuardando(false) }`,
y al recibir una respuesta no-ok se intenta parsear el body para el mensaje real:
```ts
if (!res.ok) {
  const body = await res.json().catch(() => ({}));
  throw new Error(Array.isArray(body.message) ? body.message.join(', ') : body.message ?? 'Mensaje generico de fallback');
}
```
(`body.message` puede ser un array cuando viene de `class-validator` — siempre
contemplar ambos casos, string y array.)

### 7.5 Gating de UI por permisos
Los permisos efectivos del usuario logueado viven en
`obtenerSesion()?.usuario.permisos` (array de strings `'modulo:accion'`). Patrón
para ocultar una acción completa:
```ts
const tienePermiso = !!obtenerSesion()?.usuario.permisos.includes('seguridad:configurar_apariencia');
```
Esto es solo **cosmético** (UX) — el backend vuelve a validar el permiso real vía
`@RequirePermission` en cada endpoint, así que nunca confiar solo en el
ocultamiento del frontend como control de seguridad.

---

## 8. Íconos

Solo **emoji nativos**, ningún set de íconos SVG/font-icon (no Lucide, no
Heroicons, no FontAwesome). Cada módulo de `lib/modulos.ts` tiene un emoji fijo
(👨‍🚒 Personal, 🏛️ Organización, 🔐 Seguridad, 👤 Mi Perfil). Avatares sin foto
usan 👤. Logo por defecto del sistema (sin apariencia configurada): 🚒.

---

## 9. Qué NO hacer

- No agregar Tailwind, CSS Modules, styled-components ni ninguna librería de
  estilos — todo es `globals.css` + inline.
- No traer una librería de componentes (MUI, Ant, shadcn, Radix) "para ir más
  rápido" — rompe la consistencia visual con el resto de 27+ pantallas ya hechas.
- No crear una clase CSS nueva para una variante de color de botón/badge — se
  resuelve con `style={{background: '#hex'}}` inline usando los colores de la
  sección 2.1.
- No usar `fetch` directo para llamadas JSON (usar `apiFetch`).
- No ofrecer exportación a CSV — el estándar del sistema es Excel + PDF.
- No agregar spinners/skeletons/animaciones de carga — el patrón establecido es
  el texto simple "Cargando...".
- No agregar modales de confirmación custom — `window.confirm`/`window.prompt`
  nativos son el patrón establecido.
- No hacer la UI responsive/mobile — el sistema está diseñado como panel de
  escritorio de una sola columna con sidebar fijo de `240px`; no hay media
  queries ni breakpoints en ningún archivo del proyecto.
- No confiar en el gating de permisos del frontend como medida de seguridad real
  — es solo UX, la autorización real vive en el backend.

---

## 10. Checklist rápido al crear una pantalla nueva

1. ¿Es un catálogo CRUD, un listado de solo lectura, un expediente con varias
   secciones, o una pantalla de configuración? → elegir el Molde (§5) correspondiente.
2. ¿El módulo ya tiene un `layout.tsx` con pestañas? Si se agrega una ruta nueva
   dentro de un módulo existente, sumar la entrada correspondiente al array `TABS`.
3. Usar únicamente `.card`, `.btn-primary`, `.input-field`, `.badge` + los colores
   de la sección 2.1 — no valores de color nuevos "parecidos".
4. Cargar datos con `apiFetch` dentro de una función `cargar()` llamada desde
   `useEffect`; nunca `fetch` directo salvo subida de archivos (§7.2).
5. Incluir siempre los dos `<p>` de error/mensaje (§5.1 punto 3), aunque la
   pantalla sea simple.
6. Si hay acción destructiva, `window.confirm` antes de ejecutarla.
7. Si hay export, usar `descargarArchivo` hacia un endpoint `/exportar/excel` y
   `/exportar/pdf` — nunca CSV.
8. Ocultar acciones según `obtenerSesion()?.usuario.permisos`, sabiendo que es
   solo cosmético.
