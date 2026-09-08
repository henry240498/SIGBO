# SIGBO-CBVC — Guía de Estilo y Patrones de Frontend

> Documento de referencia para construir o modificar cualquier pantalla del frontend
> de SIGBO manteniendo consistencia visual y de código con lo ya existente. Todo lo
> descrito aquí está **verificado contra el código real** (`frontend/src/`), no es
> una propuesta — es la documentación de lo que ya existe y debe replicarse.
>
> Regla de oro: **no traer una librería de componentes, no usar Tailwind.** El sistema
> visual son las clases de `globals.css` (~116: las 4 base más las de cada dominio) y
> las variables de `:root`. Lo que no cubran se resuelve con `style={{...}}` inline,
> **siempre con `var(--…)` y nunca con un hex de texto**: los hex sueltos son la falla
> que se limpió de 121 pantallas al pasar el tema a claro. `npm run audit:contraste`
> falla si vuelve a entrar alguno.
>
> **Estado de este documento (2026-09-01).** Las secciones 1 a 3 están reverificadas
> contra `globals.css`. De la 4 en adelante se actualizaron los colores, pero las
> medidas y los patrones de pantalla no se volvieron a comprobar uno por uno: ante
> una diferencia, manda el código.

---

## 1. Stack y principios generales

- **Next.js 16, App Router, TypeScript, React 19.** Todas las páginas son
  `'use client'` — no hay Server Components con datos; todo se carga desde el
  cliente contra la API vía `fetch`.
- **Sin librería de UI** (no Material UI, no Chakra, no shadcn, no Ant Design).
  Sin Tailwind. Sin CSS Modules. Un único `globals.css` global + `style={{}}` inline.
- **Tema claro fijo**, sin modo oscuro, sin selector de tema. La única pantalla
  oscura es el **login**, que es una portada sobre foto y tiene su propia paleta.
- Cada pantalla es dueña de su propio estado (`useState`/`useEffect`), no hay store
  global (ni Redux ni Zustand ni React Query/SWR). Los datos se recargan con una
  función `cargar()` local que se vuelve a invocar tras cada mutación.
- Todo el texto de la interfaz está en **español**, sin internacionalización.

---

## 2. Tokens de diseño (colores, tipografía, radios)

Definidos como **custom properties en `:root`** de `frontend/src/app/globals.css`.
En una pantalla se escriben `var(--nombre)`, nunca el hex: los hex sueltos son
justamente lo que se limpió de las 121 pantallas cuando el tema pasó a claro y el
texto secundario quedó en 2,5:1 sobre tarjeta blanca. `npm run audit:contraste`
falla si vuelve a entrar alguno.

### 2.1 Paleta de color

Los contrastes son contra la tarjeta blanca (`--surface`); el mínimo AA para texto
es 4,5:1.

| Uso | Token | Valor | Contraste |
|---|---|---|---|
| Fondo general de la app | `--paper` | `#f3f7f8` | — |
| Fondo de tarjetas/paneles | `--surface` | `#ffffff` | — |
| Fondo suave (barras de filtro, `thead`) | `--surface-soft` | `#eaf1f3` | — |
| Borde estándar | `--line` | `#d5e0e3` | — |
| Borde de fila de tabla (sutil) | `--line-soft` | `#e6edef` | — |
| Texto principal | `--ink` | `#10263f` | 15,8:1 |
| Texto secundario/atenuado | `--muted` | `#5a6b76` | 5,5:1 |
| Azul primario (acento, enlaces, pestaña activa) | `--signal` | `#2563eb` | 5,2:1 |
| Azul primario hover | `--signal-dark` | `#1d4ed8` | 6,7:1 |
| Verde éxito | `--success` | `#12705a` | 6,0:1 |
| Rojo error | `--danger` | `#bd3d39` | 5,4:1 |
| Ámbar advertencia | `--warning` | `#96570f` | 5,7:1 |

**Chips de estado (`.badge`).** `.badge` fija `color: var(--ink)`, así que el fondo
de un chip es siempre un **tinte claro** — con un sólido oscuro el texto queda en
1,5:1, que fue el defecto que volvía ilegibles ~200 badges:

| Estado | Token de fondo | Valor | Contraste con `--ink` |
|---|---|---|---|
| Activo, vigente, aprobado | `--ok-fill` | `#e3f3ec` | 12,4:1 |
| Inactivo, anulado, vencido | `--bad-fill` | `#fdeaea` | 13,0:1 |
| Atención, pendiente | `--warn-fill` | `#fdf2e0` | 13,4:1 |
| Informativo, en curso | `--info-fill` | `#e6efff` | 12,8:1 |
| Neutro, borrador | `--neutral-fill` | `#e9eff1` | 12,7:1 |

**Botones (`.btn-primary`).** Al revés que los chips: `.btn-primary` fija texto
blanco, así que el fondo es **sólido oscuro** y los hex se escriben literales
porque no hay token para ellos:

| Acción | Hex | Contraste con blanco |
|---|---|---|
| Primaria | `var(--ink)` `#10263f` | 15,8:1 |
| Peligro (Eliminar, Anular, Dar de baja, Denegar) | `#7f1d1d` | 10,4:1 |
| Secundaria / Cancelar | `#475569` | 7,4:1 |
| Confirmar en verde (Conceder, Cerrar guardia) | `#166534` / `#16a34a` | 7,4:1 / 4,6:1 |

**Regla de estados ACTIVO/INACTIVO:** en toda la app, `ACTIVO` = verde, cualquier
estado "malo" (`INACTIVO`, `BLOQUEADO`, denegado) = rojo. No usar otros colores
para este binario. Lo que cambia según el elemento es el tono, no el significado:
en un chip `--ok-fill` / `--bad-fill`, en un botón `#166534` / `#7f1d1d`.

### 2.2 Tipografía

Tres familias, importadas de Google Fonts en la primera línea de `globals.css`:

- **DM Sans** — cuerpo. Es la de `body`, así que es la que se aplica si no se dice nada.
- **Manrope** — títulos (`h1`, `h2`, `h3`) y nombres destacados, con `letter-spacing: -.03em`.
- **Space Mono** — etiquetas cortas en mayúsculas: `.badge`, `th`, `.side-group-header`,
  `.topbar-eyebrow`, la hora del hero. Siempre `700`, `9px`–`11px`, con `letter-spacing`.

Tamaños (no hay escala formal, son valores puntuales repetidos):

- Título de página (`<h2>` de sección principal): `16px`, a veces con el conteo
  entre paréntesis: `Rangos (12)`.
- Título de tarjeta/sección (`<h2>` dentro de `.card`): `15px`–`16px`.
- Cuerpo de tabla y formularios: `13px`.
- Labels de campo: `12px`, `display: block`, `marginBottom: 4`.
- Texto de ayuda/aclaración: `11px`–`12px`, color `var(--muted)`.
- Badges: `10px` Space Mono `700` (lo fija la clase).

### 2.3 Radios y espaciados

- Radio de `.card`: `14px`. Radio de `.input-field`/`.btn-primary`: `8px`. Radio de
  `.badge`: `999px` (píldora completa). Swatches de color e íconos circulares
  (avatares): `border-radius: '50%'` o `4px` para swatches cuadrados pequeños.
- Separación estándar entre secciones apiladas de una página:
  `style={{ display: 'flex', flexDirection: 'column', gap: 16 }}` (listados) o
  `gap: 20` (páginas tipo expediente/perfil con muchas secciones).
- Padding de `.card`: `22px`. Padding de `.btn-primary`: `9px 16px` (o
  `4px 8px`/`fontSize: 12` para botones de acción dentro de una fila de tabla).
- Padding de celdas de tabla: `12px 14px` (lo fija `td` en `globals.css`); varias
  pantallas lo bajan a `6px 4px` inline.

---

## 3. Las 4 clases base (`globals.css`)

`globals.css` tiene hoy **~116 clases**: estas cuatro, más las de cada dominio
(`.service-*`, `.denuncia-*`, `.croquis-*`, `.side-*`, `.dashboard-hero`, …). Estas
cuatro son las que aparecen en cualquier pantalla. Transcritas del archivo:

```css
.card { background: rgba(255,255,255,.88) !important; border: 1px solid var(--line) !important;
        border-radius: 14px !important; padding: 22px !important;
        box-shadow: 0 7px 22px rgba(16,38,63,.045); backdrop-filter: blur(10px); }

.btn-primary { min-height: 38px; padding: 9px 16px; color: white; background: var(--ink);
               border: 0; border-radius: 8px; font-weight: 700; cursor: pointer;
               box-shadow: 0 5px 12px rgba(16,38,63,.12); }
.btn-primary:hover { background: var(--ink-2); transform: translateY(-1px); }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; transform: none; }

.input-field { width: 100%; min-height: 42px; padding: 10px 12px; color: var(--ink);
               background: white; border: 1px solid #c8d6da; border-radius: 8px; }
.input-field:focus { outline: 3px solid rgba(49,168,184,.16); border-color: var(--cyan); }

.badge { display: inline-flex; align-items: center; gap: 5px; padding: 4px 9px;
         color: var(--ink); background: var(--surface-soft); border: 1px solid var(--line);
         border-radius: 999px; font: 700 10px 'Space Mono', monospace; }
```

**`.btn-primary` no tiene variantes por clase** (no existe `.btn-danger` ni
`.btn-secondary`). Los botones "peligrosos" o "secundarios" son `.btn-primary`
con un `style={{ background: '#7f1d1d' }}` (rojo, acción destructiva) o
`style={{ background: '#475569' }}` (gris, acción neutra tipo "Cancelar")
sobrescrito inline. Nunca se crea una clase CSS nueva para esto.

**Ojo con el par fondo/texto.** `.btn-primary` fija texto **blanco** y `.badge` fija
texto **`var(--ink)`**, así que el mismo fondo no sirve para los dos: sobre un botón va
un sólido oscuro, sobre un chip va un tinte claro (sección 2.1). Poner un tinte claro
en un botón lo deja en blanco sobre blanco; poner un sólido oscuro en un chip lo deja
en 1,5:1. Las dos cosas pasaron y `npm run audit:contraste` vigila la segunda.

**`.badge` tampoco tiene variantes por clase** — el color se sobrescribe inline
según el dato (`style={{ background: rol.color }}` para badges de rol con color
propio de BD, o el mapeo verde/rojo de la sección 2.1 para estados).

Cuando el color del badge viene de la base (rol, rango: lo elige un administrador con
un selector, así que puede ser cualquiera), usar `estiloBadgeColor(color)` de
`lib/color.ts`: calcula si el texto va oscuro o blanco según la luminancia del fondo.
Con el gris por defecto `#6B7280` y el `var(--ink)` de la clase, la etiqueta quedaba
en 3,2:1.

---

## 3 bis. Piezas compartidas de pantalla

Tres patrones se repetían en casi todas las pantallas y ahora tienen componente. Usarlos
en vez de volver a escribir el párrafo suelto:

```tsx
{error && <Aviso tipo="error" texto={error} />}       {/* role="alert",  se queda */}
{mensaje && <Aviso tipo="exito" texto={mensaje} />}   {/* role="status", se va a los 6 s */}

if (!datos) return <Cargando texto="Cargando guardias…" />;   {/* esqueleto + role="status" */}
```

- **`Aviso`** (`app/components/Aviso.tsx`). Antes eran párrafos de color sin `role`: al
  guardar o al fallar, un lector de pantalla no anunciaba nada, y el mensaje de éxito
  quedaba en pantalla indefinidamente hasta hacer dudar de a qué acción correspondía.
  El de error **no** se retira solo: un fallo se atiende.
- **`Cargando`** (`app/components/Cargando.tsx`). Esqueleto en lugar de "Cargando…" en
  texto plano. `filas` ajusta cuántas barras, para que ocupe algo parecido a lo que viene.
- **`ComboBuscable`** (`components/ComboBuscable.tsx`) para cualquier combo que pueda
  crecer. **Siempre con `ariaLabel`**, porque su disparador es un `<button>` y sin eso
  se anuncia sin nombre.
- **`Paginador` + `usePaginacion`** (`app/components/Paginador.tsx`) para los listados
  que traen todo el conjunto en una consulta. Se aplica sobre el array ya filtrado y
  ordenado, al final del pipeline:

  ```tsx
  const paginado = usePaginacion(bomberosOrdenados ?? []);
  …
  {paginado.visibles.map((b) => …)}
  <Paginador {...paginado} mostrados={paginado.visibles.length} etiqueta="bomberos" />
  ```

  El hook **recorta** la página al rango válido en cada render en vez de reiniciarla con
  un efecto: al filtrar y achicar la lista uno queda en la última página con datos, nunca
  en una vacía, y no hay que acordarse de reiniciar en cada cambio de filtro. El conteo
  (`1–25 de 348`) se muestra aunque haya una sola página, para que nada parezca oculto.
  Los listados que ya paginan contra el servidor (`seguridad/auditoria`) no lo usan.

### Etiquetas: toda etiqueta nombra a su control

Una `<label>` cerrada antes del control es decorativa — no nombra el campo y hacer clic
en ella no enfoca nada. Eran 723 en el sistema. La forma correcta, por orden de preferencia:

```tsx
{/* 1. Lo normal: htmlFor + id */}
<label htmlFor="fecha-emision">Fecha de emisión</label>
<input id="fecha-emision" className="input-field" … />

{/* 2. Si el componente se renderiza dentro de un .map(), el id se repetiría por fila */}
const idCampo = useId();
<label htmlFor={`${idCampo}-fecha`}>Fecha</label>
<input id={`${idCampo}-fecha`} className="input-field" … />

{/* 3. Si el texto de la etiqueta es dinámico, viaja como aria-label */}
<label>{label}</label>
<input aria-label={label} className="input-field" … />
```

Los `<th>` llevan `scope="col"` (todos los del sistema son encabezados de columna).
`npm run audit:a11y` falla si vuelve a entrar una etiqueta suelta o un `th` sin scope.

---

## 4. Estructura de layout

### 4.1 `RootLayout` (`app/layout.tsx`)
Solo importa `globals.css` y envuelve `<html lang="es"><body>{children}</body></html>`.
Sin `<head>` custom, sin metadata avanzada.

### 4.2 `DashboardLayout` (`app/dashboard/layout.tsx`)
Shell fijo de dos columnas, aplicado a **todo** lo que cuelga de `/dashboard/*`:

- **Sidebar izquierdo**, ancho fijo `276px`, `borderRight: 1px solid var(--line)`:
  - Logo + nombre del sistema arriba (dinámico desde `GET /seguridad/apariencia`,
    con fallback a 🚒 + "SIGBO-CBVC" si no hay configuración).
  - Navegación: un link "Inicio" fijo + los módulos de `MODULOS` (`lib/modulos.ts`)
    que el usuario tenga permiso de ver (`moduloVisible(modulo, permisos)` — necesita
    al menos un permiso que empiece con `${slug}:`).
  - Los módulos **no van en una lista plana**: cada uno declara un `grupo` y
    `agruparModulos()` los reparte en las cinco secciones de `GRUPOS`, en orden de
    uso diario a configuración — Operaciones, Personal y formación, Recursos,
    Administración, Sistema. Un grupo vacío no se dibuja, así que un usuario con
    pocos permisos ve pocas secciones.
  - Cada sección tiene un encabezado plegable (`.side-group-header`). Lo que el
    usuario pliega se guarda en `localStorage` bajo `sigbo_menu_plegados`; el grupo
    del módulo abierto se muestra siempre, aunque esté plegado, para no esconder
    dónde está parado.
  - Link fijo a "Mi Perfil" al pie, separado por un `borderTop`.
  - Botón "Cerrar sesión" (`.btn-primary`, `width: 100%`) al final.
  - Item de menú activo: fondo `rgba(49,168,184,.14)`, texto blanco, `font-weight: 600`;
    inactivo: texto `var(--muted)`, sin fondo.
- **Área de contenido** a la derecha, `flex: 1`, `padding: 28px 32px`,
  `maxWidth: 1100`:
  - Header con, a la izquierda, las **migas de pan** (`migasDePan()` de
    `lib/navegacion.ts`), el título de la pantalla y —sólo en la portada de un módulo—
    su descripción. Antes decía únicamente el nombre del módulo, así que en
    `/dashboard/deposito/articulos/<id>` no había forma de saber dónde estabas ni de
    volver un nivel. Un segmento que parece un id se muestra como "Detalle".
  - A la derecha, el **botón de búsqueda** y el username + badge de roles. El botón
    abre el mismo panel que `Ctrl+K` y lleva el atajo escrito encima, porque un atajo
    que nadie ve no sirve.
  - Debajo, `{children}` — el contenido de cada página.

#### Buscador de pantallas (Ctrl+K)

`BuscadorPantallas` lista las ~97 pantallas del sistema filtradas por permiso. El menú
lateral sólo llega al módulo: para abrir "Inventarios físicos" había que entrar a
Depósito y encontrar la pestaña.

El registro sale de **`src/lib/pantallas.generado.ts`**, que **no se edita a mano**: lo
produce `npm run generar:pantallas` recorriendo el árbol de rutas y tomando el nombre
legible del array `TABS` del `layout.tsx` de cada módulo. Al agregar una pantalla:
declararla en el `TABS` de su módulo y regenerar. Si no se regenera, la pantalla existe
pero el buscador no la encuentra y las migas la muestran con el slug crudo.

#### En qué módulo va una pantalla

Decide el **prefijo de permiso de los endpoints que consume**, no el parecido temático del
nombre. Es lo que resolvió que "Guardias" apareciera dos veces en el menú:
`organizacion/guardias` consumía `/organizacion/tipos-guardia` y era en realidad el
catálogo de tipos (hoy `organizacion/tipos-guardia`), mientras que su subpantalla de
planificación consumía `/guardias/planificacion/manual` con permiso `guardias:editar` y
pasó a `guardias/planificacion`.

No es cosmético: quien tenía `guardias:editar` sin ningún permiso `organizacion:` no veía
el módulo Organización en el menú, así que **no tenía forma de llegar a una pantalla que
sí estaba autorizado a usar**. Al mover una pantalla, dejá la dirección vieja redirigida
en `next.config.js` — hay enlaces guardados y favoritos.
- Antes de renderizar, verifica sesión (`obtenerSesion()`); si no hay, redirige a
  `/login` (`router.replace`).

### 4.3 Sub-navegación de módulo (patrón "tabs", ej. `dashboard/organizacion/layout.tsx`)
Los módulos con varias pantallas hijas (Organización, Seguridad) tienen su propio
`layout.tsx` con una barra de pestañas horizontal debajo del header del dashboard:

```tsx
<nav style={{ display: 'flex', gap: 4, flexWrap: 'wrap', borderBottom: '1px solid var(--line)', marginBottom: 20 }}>
  {TABS.map((tab) => {
    const activo = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
    return (
      <Link href={tab.href} style={{
        padding: '8px 12px', fontSize: 13, textDecoration: 'none',
        color: activo ? 'var(--ink)' : 'var(--muted)',
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
3. **Mensajes**: `{error && <p style={{color:'var(--danger)'}}>{error}</p>}` y
   `{mensaje && <p style={{color:'var(--success)', fontSize:13}}>{mensaje}</p>}` — SIEMPRE
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
   `<thead>` con `borderBottom:1px solid var(--line)`, filas de `<tbody>` con
   `borderBottom:1px solid var(--line-soft)`. Última columna siempre "Acciones", con
   botones pequeños (`padding:'4px 8px', fontSize:12`): "Editar" (azul por
   defecto), y "Eliminar"/"Reactivar" alternados según `eliminadoEn === null`
   (rojo `#7f1d1d` para eliminar, verde `#166534` para reactivar). Borrado siempre
   mediante `useConfirmacion()` antes de llamar a la API — nunca se borra sin
   confirmación.

### 5.2 Molde B — Listado simple de solo lectura
Para pantallas que todavía no tienen CRUD propio: una sola `<section className="card">`,
`<h2>` + tabla sin filtros ni formulario. Estado vacío explícito y honesto (no un
spinner infinito ni una tabla vacía sin explicación):
```tsx
{datos && datos.length === 0 && (
  <p style={{ color: 'var(--muted)', fontSize: 13 }}>Todavia no hay {cosa} registrados...</p>
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
  (`background:none, border:none, color:var(--danger), textDecoration:underline`,
  cursor pointer) y un botón "+ Agregar {cosa}" (`.btn-primary` chico,
  `padding:'4px 10px', fontSize:12`) al final de la lista.
- **Subida de archivo/foto**: `<input type="file" accept="image/png,image/jpeg,image/webp,image/gif">`
  + `FormData` + `fetch` manual (no `apiFetch`, porque hay que mandar
  `multipart/form-data` sin forzar `Content-Type: application/json`) — ver §7.2.
  Avatar circular `56px`–`64px`, `objectFit:'cover'`, `border:1px solid var(--line)`;
  si no hay foto, un círculo con emoji 👤 del mismo tamaño.
- **Estados vacíos por sección**, siempre en `fontSize:13, color:var(--muted)`: "Sin
  sesiones activas.", "Sin actividad registrada.", "Sin excepciones directas...".

### 5.4 Molde D — Configuración/ajustes con permiso y vista previa (ej. `seguridad/apariencia/page.tsx`, `mi-perfil/page.tsx`)
Para pantallas de configuración global o de autogestión:
- **Gate de permiso explícito ANTES de cargar nada**, mensaje claro de por qué no
  se puede acceder (no un simple 403 en blanco):
  ```tsx
  if (!tienePermiso) return <p style={{color:'var(--muted)', fontSize:13}}>Solo un usuario con el permiso <code>x</code> puede acceder...</p>;
  ```
- Cuando una política del sistema puede **bloquear la edición** (ej. "Modo Fijo"
  de Mi Perfil), mostrar un aviso destacado en amarillo/ámbar
  (`borderColor:'#b45309', background:'#451a03'`) y deshabilitar (`disabled`) los
  campos afectados — no ocultarlos, dejarlos visibles pero inactivos.
- Toggles de dos estados exclusivos (ej. Libre/Fijo): dos `.btn-primary` uno al
  lado del otro, el activo resaltado con su color semántico
  (verde `#16a34a` / rojo `#7f1d1d`) y un `✓` al lado del texto; el inactivo en
  gris `var(--neutral-fill)`.
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
  `<label style={{fontSize:11, color:'var(--muted)'}}>` encima. Filtros de texto libre
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
  `style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer', textDecoration:'underline'}}`.
- **Confirmaciones destructivas**: usar `useConfirmacion()` del
  `ConfirmProvider`; ofrece foco inicial, ciclo de foco, Escape y restauración
  del foco. Para entradas de texto puntuales usar `useEntradaConfirmada()` del
  `InputProvider`; no usar `window.confirm`, `window.prompt` ni
  `window.alert`.
- **Loading state**: `<p style={{color:'var(--muted)'}}>Cargando...</p>` como único
  contenido de la página mientras el dato principal es `null` — no hay
  spinners/skeletons en ningún lado del sistema.
- **Enlaces externos** (redes sociales, etc.): `target="_blank" rel="noopener noreferrer"`
  siempre, color `var(--signal)`, con "↗" al final del texto del link.

---

## 7. Integración con la API (frontend/src/lib/)

### 7.1 `apiFetch` (`lib/api.ts`) — usar SIEMPRE para llamadas JSON
Envuelve `fetch` agregando `Content-Type: application/json`,
`X-SIGBO-Request: 1` y `credentials: 'include'`. Las credenciales de
autenticación están en cookies HttpOnly; `localStorage` conserva únicamente el
perfil mínimo de sesión para la interfaz. Si una respuesta es `401`, intenta
renovar una vez mediante `POST /auth/refresh` y reintenta la solicitud.
**Nunca usar `fetch` directo para JSON** — solo `apiFetch`.

### 7.2 `fetch` manual — solo para `multipart/form-data` (subida de archivos)
Como `apiFetch` fuerza `Content-Type: application/json`, las subidas de archivo
(foto de perfil, imágenes de apariencia) usan `fetch` con `FormData`, cookies
incluidas y la cabecera CSRF:
```tsx
const formData = new FormData();
formData.append('archivo', archivo);
const headers: HeadersInit = { 'X-SIGBO-Request': '1' };
const res = await fetch(`${API_ORIGIN}/api/v1/...`, {
  method: 'PUT', headers, body: formData, credentials: 'include'
});
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
- No usar `window.confirm`, `window.prompt` o `window.alert`; utilizar los
  proveedores compartidos de confirmación y entrada.
- No hacer la UI responsive/mobile — el sistema está diseñado como panel de
  escritorio de una sola columna con sidebar fijo de `276px`; no hay media
  queries ni breakpoints en ningún archivo del proyecto.
- No confiar en el gating de permisos del frontend como medida de seguridad real
  — es solo UX, la autorización real vive en el backend.

---

## 10. Checklist rápido al crear una pantalla nueva

1. ¿Es un catálogo CRUD, un listado de solo lectura, un expediente con varias
   secciones, o una pantalla de configuración? → elegir el Molde (§5) correspondiente.
2. ¿El módulo ya tiene un `layout.tsx` con pestañas? Si se agrega una ruta nueva
   dentro de un módulo existente, sumar la entrada correspondiente al array `TABS`
   y después correr `npm run generar:pantallas`, o el buscador no la encontrará.
3. Usar las clases de `globals.css` + los **tokens** de la sección 2.1 —
   `var(--muted)`, nunca un hex de texto.
4. Cargar datos con `apiFetch` dentro de una función `cargar()` llamada desde
   `useEffect`; nunca `fetch` directo salvo subida de archivos (§7.2).
5. Mostrar el resultado con `<Aviso tipo="error|exito" …>` y la carga con
   `<Cargando …>` (§3 bis), aunque la pantalla sea simple.
6. Cada campo con su etiqueta asociada (`htmlFor` + `id`) y cada `<th>` con
   `scope="col"` (§3 bis).
7. Si hay acción destructiva, solicitarla con `useConfirmacion()` antes de ejecutarla.
8. Si hay export, usar `descargarArchivo` hacia un endpoint `/exportar/excel` y
   `/exportar/pdf` — nunca CSV.
9. Ocultar acciones según `obtenerSesion()?.usuario.permisos`, sabiendo que es
   solo cosmético.
10. Antes de cerrar: `npm run audit:contraste`, `npm run audit:a11y` y
    `npx tsc --noEmit`. No hay pruebas; esto es lo único que avisa.
