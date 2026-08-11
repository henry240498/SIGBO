# SIGBO-CBVC — Registro de actualizaciones y modificaciones (2026-08-07)

> Documento generado el 2026-08-07. Resume **todo** lo que se hizo sobre el proyecto y
> la base de datos SIGBO-CBVC en esta sesión: diagnóstico y reconstrucción del sistema,
> recuperación del código real, y la carga de personal real (Combatientes, Incorporados,
> Activos, Honorarios, Brigadistas). Incluye un checklist explícito de datos pendientes
> de completar — **léase la sección 4 antes de dar por cerrada la carga de personal.**

---

## 1. Resumen ejecutivo

| Bloque | Estado |
|---|---|
| Diagnóstico de por qué el ejecutable no funcionaba | ✔ Resuelto |
| Recuperación del código real del backend/frontend (desde transcripts de una sesión anterior) | ✔ Completo — 276 archivos |
| Login, JWT, permisos, pantallas de Seguridad/Organización/Personal | ✔ Verificado funcionando |
| Acceso directo del escritorio (`SIGBO-CBVC`) | ✔ Recreado y probado |
| Carga de personal real (164 personas) | ✔ Insertado, con datos pendientes marcados explícitamente |
| Datos de identidad (cédula, fecha nacimiento, teléfono, rango, fecha de ingreso) | ⚠ **Pendientes** — ver sección 4 |

---

## 2. Diagnóstico inicial y reconstrucción del sistema

### 2.1 Qué estaba roto

El ejecutable del escritorio (`SIGBO Login.url`) apuntaba a `http://localhost:3000/login`,
pero:
- El backend (`backend/src`) era un scaffold NestJS vacío sin conexión a base de datos
  ni módulo de autenticación.
- Una sesión previa de otro asistente había empezado a parchear esto con una
  implementación mínima (login con hash inventado, credenciales `sa`/`YourStrong!Passw0rd`
  que no existían, entidad `Session` con columnas que no coinciden con la tabla real),
  y el `npm install` había quedado a medias (faltaban `mssql`, `typeorm`,
  `@nestjs/typeorm`).

### 2.2 Hallazgo clave: el proyecto real ya existía

Se confirmó que **sí existe** una instancia SQL Server local (`localhost\SQLEXPRESS`)
con la base `sigbo_cbvc` completamente migrada (11 esquemas, ~180+ tablas incluyendo
la expansión del módulo Personal) y datos reales de usuarios/roles/permisos. El código
fuente que generó esa base había sido escrito en una sesión anterior de Claude Code en
esta misma máquina (`C:\Users\PC-HORIZONTE\sigbo-cbvc`), pero esa carpeta ya no existe
en disco.

Se recuperaron **276 archivos** (99.5% de fidelidad) parseando directamente los
transcripts JSONL de esa sesión anterior guardados localmente por Claude Code
(sesión principal + 4 workflows de sub-agentes en paralelo: Seguridad,
Organización, Personal-frontend, Personal-subrecursos), incluyendo:
- Backend completo: JWT real firmado + refresh tokens, Policy Engine de permisos,
  módulos Auth, Seguridad, Personal (bomberos + 10 sub-recursos), Organización
  (12 catálogos), Vehículos, Equipos.
- Frontend completo: 29 rutas reales (antes solo existían `/login` y `/dashboard`).
- Las 17 migraciones SQL originales (`000_create_database.sql` a
  `016_personal_expansion.sql`).
- `docs/README.md` y `docs/CREDENCIALES-Y-ROLES.md` (usuarios de prueba con sus
  contraseñas reales).
- `start-sigbo.ps1` / `start-sigbo.cmd` (el launcher real que arranca ambos
  servidores y abre el navegador).

Ese código reemplazó por completo el parche mínimo. Se completaron las dependencias
que faltaban en `package.json` (`docx`, `exceljs`, `multer`, `pdfkit`,
`typeorm-naming-strategies` y sus `@types`), se reinstalaron `node_modules` de cero
en `backend/` y `frontend/`, y ambos compilan sin errores.

### 2.3 Verificación end-to-end

- Login real probado con `admin` / (contraseña en `docs/CREDENCIALES-Y-ROLES.md`):
  devuelve JWT válido, 7 roles, 158 permisos.
- Las 29 rutas del frontend cargan (todos los catálogos de Organización, todas las
  pantallas de Seguridad, Personal, Mi Perfil).
- Se recreó el acceso directo del escritorio **SIGBO-CBVC** (`start-sigbo.ps1` vía
  `start-sigbo.cmd`), que verifica los puertos 3001/3000, compila si hace falta,
  y abre el navegador automáticamente. Reemplaza al `.url` provisional anterior.

### 2.4 Archivos de infraestructura agregados/actualizados en el repo

- `.gitignore` (nuevo, en la raíz): excluye `node_modules/`, `dist/`, `.next/`,
  `.env`, `backend/uploads/`, `logs/`, etc.
- `backend/.env` (nuevo, **no versionado**): credenciales reales de conexión
  (`sigbo_app`) y secretos JWT.
- `database/migrations/000..016_*.sql` (17 archivos): migraciones originales
  reales, reemplazando la reconstrucción inferida que se había hecho antes a partir
  de un documento Word de documentación (esa reconstrucción, en `database/scripts/`
  y `database/REPORTE_REPLICACION.md`, sigue en el repo como referencia histórica
  pero ya no es la fuente autoritativa — las migraciones reales lo son).

---

## 3. Cómo iniciar el sistema

**Doble clic en el acceso directo "SIGBO-CBVC" del Escritorio.** Verifica que el
backend y el frontend queden operativos (los compila si hace falta) y abre el
navegador en `http://localhost:3000/login`.

Manual:
```powershell
cd backend; npm run start:dev    # http://localhost:3001/api/v1  (Swagger: /api/docs)
cd frontend; npm run dev         # http://localhost:3000
```

Usuarios de prueba (7 roles distintos) con sus contraseñas: `docs/CREDENCIALES-Y-ROLES.md`.

---

## 4. Carga de personal real — Combatientes, Incorporados, Activos, Honorarios, Brigadistas

### 4.1 Qué se cargó

Se registraron **164 personas reales** en `personal.bomberos`, provistas por el
usuario en dos listados físicos (fotografías de planillas). Total en la tabla tras
la carga: **169** (164 nuevas + 5 de prueba preexistentes con prefijo `CBVC-00X`,
sin conflicto).

| Lista de origen | Cantidad | `condicion_institucional` asignada | `estado` |
|---|---|---|---|
| Bomberos Combatientes (BCF-1 a BCF-49, BC-50 a BC-103) | 103 | `COMBATIENTE` | `ACTIVO` (ninguno marcado fallecido) |
| Bomberos Incorporados (BI-1 a BI-4) | 4 | `INCORPORADO` | `ACTIVO` |
| Lista de Activos (BVAF01-11, BVA12-39) | 39 | *(sin asignar, ver 4.3)* | `ACTIVO` o `FALLECIDO` según la columna OBS de la planilla (6 fallecidos) |
| Lista de Honorarios (BH01-09) | 9 | `HONORARIO` | `ACTIVO` o `FALLECIDO` según OBS (2 fallecidos) |
| Brigadistas (BJ10-12, BJ14-19) | 9 | *(sin asignar)*, `brigada_id` = Brigada de Rescate (`BR-RESC`) | `ACTIVO` |

`numero_bombero` = el código exacto de la planilla (ej. `BCF-1`, `BC-50`, `BH01`,
`BVAF01`, `BJ10`).

### 4.2 ⚠️ CAMPOS OBLIGATORIOS PENDIENTES DE COMPLETAR (todas las 164 personas)

La tabla `personal.bomberos` exige por esquema **cédula, fecha de nacimiento,
teléfono principal, rango y fecha de ingreso** — ninguno de estos datos estaba en
las planillas provistas. **No se inventaron**: se cargaron con centinelas
explícitos que hay que reemplazar por los datos reales:

| Campo | Valor cargado | Cómo identificarlos para corregir |
|---|---|---|
| `cedula` | `PENDIENTE-<código>` (ej. `PENDIENTE-BCF-1`) | `SELECT * FROM personal.bomberos WHERE cedula LIKE 'PENDIENTE-%'` |
| `fecha_nacimiento` | `1900-01-01` (centinela, no es una fecha real) | `SELECT * FROM personal.bomberos WHERE fecha_nacimiento = '1900-01-01'` |
| `telefono_principal` | `'PENDIENTE'` | `SELECT * FROM personal.bomberos WHERE telefono_principal = 'PENDIENTE'` |
| `rango` | `'PENDIENTE'` (no existe catálogo real de rangos cargado en `organizacion.rangos` — solo hay un rango de prueba) | `SELECT * FROM personal.bomberos WHERE rango = 'PENDIENTE'` |
| `fecha_ingreso` | `1900-01-01` (centinela) | mismo filtro que fecha_nacimiento |

Además, cada fila tiene en su columna `metadata` (JSON) la marca
`{"datos_pendientes": ["cedula","fecha_nacimiento","telefono_principal","rango","fecha_ingreso"], "origen": "Carga masiva desde listas físicas (nómina en papel), 2026-08-07"}`
para poder identificarlas programáticamente incluso si se edita alguno de los
campos anteriores.

**Recomendación:** hasta que se complete esta información, estas 164 personas
funcionan como "prerregistro" — visibles en el listado de Personal, pero sin datos
suficientes para trámites que dependan de cédula/edad/contacto real (fojas de
servicio, notificaciones, etc.).

### 4.3 Decisiones e inferencias que requieren tu confirmación

1. **Separación nombre/apellido**: las planillas traen el nombre completo en una
   sola celda. Se separó con una heurística (últimas 2 palabras = apellido para
   nombres de 3+ palabras, salvo casos de 4+ palabras donde se parte a la mitad).
   **Esta heurística falla en varios casos visibles** — por ejemplo nombres
   compuestos como "Juan Alberto Peralta" o "María de Jesús Pinienta" pueden haber
   quedado mal divididos. Ver las tablas completas en la sección 4.4 y corregir
   manualmente donde corresponda vía `PATCH /personal/bomberos/:id`. El nombre
   completo original no se perdió — está implícito en `nombre + ' ' + apellido`
   reconstruido, pero la división específica debe revisarse persona por persona.
2. **Lista "Activos" y "Brigadistas" sin condición institucional**: el sistema solo
   define 4 valores para `condicion_institucional`
   (`INCORPORADO`/`COMBATIENTE`/`APOYO_ECONOMICO`/`HONORARIO`). Ninguno describe
   con precisión "activo genérico" ni "brigadista", así que se dejó ese campo en
   `NULL` para esas 48 personas. Si "Activos" en realidad corresponde a una de las
   4 categorías (por ejemplo, también son combatientes), avisame y lo corrijo.
3. **Brigada asignada a los 9 Brigadistas**: en `organizacion.brigadas` existe una
   única brigada real (`BR-RESC — Brigada de Rescate`); se les asignó esa por ser
   la única opción disponible. Confirmar que es correcta.
4. **`estado` = `FALLECIDO`**: se tomó literalmente de la columna "OBS" de las
   planillas (8 personas en total: BVAF02, BVAF03, BVAF05, BVAF07, BVA21, BVA26,
   BH01, BH03). El sistema no borra estos registros — quedan en el legajo con ese
   estado, sin `fecha_baja`/`motivo_baja` (también pendientes si se quieren
   completar).
5. **`nacionalidad`**: se asumió `'Paraguaya'` para las 164 personas (coincide con
   el default de la tabla y el contexto del CBVC). No verificado individualmente.

### 4.4 Listado completo cargado (código, nombre/apellido usado, estado)

### Bomberos Combatientes (103)

| Código | Nombre (usado) | Apellido (usado) | Estado |
|---|---|---|---|
| BCF-1 | JUAN VALENTÍN | GARCÍA MIRO | ACTIVO |
| BCF-2 | HORACIO PEDRO | CABALLERO VERÓN | ACTIVO |
| BCF-3 | JOSÉ REMIGIO | MIRANDA SOSA | ACTIVO |
| BCF-4 | OSCAR SIMÓN | BRÍTEZ MONTIEL | ACTIVO |
| BCF-5 | ABEL ANTONIO | FIGUEREDO LEZCANO | ACTIVO |
| BCF-6 | WALTER ARIEL | CÁCERES GALEANO | ACTIVO |
| BCF-7 | CARLOS ALBERTO | CÁCERES CHÁVEZ | ACTIVO |
| BCF-8 | VICTOR FELICIANO | CAMACHO ARMOA | ACTIVO |
| BCF-9 | PEDRO MANUEL | GARCÍA MIRO | ACTIVO |
| BCF-10 | CARLOS BUENAVENTURA | AMARILLA FALCO | ACTIVO |
| BCF-11 | JUAN DOMINGO | BRÍTEZ ROMÁN | ACTIVO |
| BCF-12 | CECILIO | SAMANIEGO LÓPEZ | ACTIVO |
| BCF-13 | ISMAEL | LEZCANO BÁEZ | ACTIVO |
| BCF-14 | FABIO DIONICIO | BARRIOS VARGAS | ACTIVO |
| BCF-15 | FRANCISCO | MIRANDA CABELLO | ACTIVO |
| BCF-16 | MARTA CONCEPCIÓN | MIRANDA SOSA | ACTIVO |
| BCF-17 | RODOLFO EDUARDO | GÓMEZ PÁEZ | ACTIVO |
| BCF-18 | EVELINA FELIA | OJEDA SILVA | ACTIVO |
| BCF-19 | JUAN GERARDO | SEGOVIA RODRÍGUEZ | ACTIVO |
| BCF-20 | NESTOR RAUL | ESPINOZA DELGADO | ACTIVO |
| BCF-21 | JOSÉ ARMANDO | LEZCANO MARTÍNEZ | ACTIVO |
| BCF-22 | JUAN | ALBERTO PERALTA | ACTIVO |
| BCF-23 | JOSÉ DIONISIO | CÁCERES CHÁVEZ | ACTIVO |
| BCF-24 | JULIO CÉSAR | BENÍTEZ ORTIZ | ACTIVO |
| BCF-25 | ADALBERTO | ORTIZ ÁRA | ACTIVO |
| BCF-26 | GUIDO ALBERTO | BENÍTEZ LEZCANO | ACTIVO |
| BCF-27 | JAIME ALFREDO | AYALA ORUE | ACTIVO |
| BCF-28 | JOSÉ LUIS | RAMÍREZ TRINIDAD | ACTIVO |
| BCF-29 | JUAN MIGUEL ANGEL | CHÁVEZ ARANDA | ACTIVO |
| BCF-30 | VICTOR PABLO ARIEL | MARTÍNEZ DUARTE | ACTIVO |
| BCF-31 | SERGIO LUIS | LOVERA CABAÑAS | ACTIVO |
| BCF-32 | PEDRO ANTONIO | RECALDE GONZÁLEZ | ACTIVO |
| BCF-33 | ALDO DARIO | GALEANO FIGUEREDO | ACTIVO |
| BCF-34 | EDGAR MARCELO | GONZÁLEZ LEZCANO | ACTIVO |
| BCF-35 | VICTOR RAMÓN | JARA BARRIOS | ACTIVO |
| BCF-36 | DONATO ALEXANDER | PÁEZ GAONA | ACTIVO |
| BCF-37 | ALFREDO | OSMAR CABALLERO | ACTIVO |
| BCF-38 | OSCAR DIOSNEL | BARRETO GONZÁLEZ | ACTIVO |
| BCF-39 | CELSO DANIEL | NOTARIO LEZCANO | ACTIVO |
| BCF-40 | GRACIELA | ELIZABETH LEZCANO | ACTIVO |
| BCF-41 | LOURDES KARINA | MORAN CUEVAS | ACTIVO |
| BCF-42 | BLANCA ELIZABETH DIAZ | DE PINO | ACTIVO |
| BCF-43 | JOSÉ GABRIEL | LEZCANO MORÁN | ACTIVO |
| BCF-44 | JUAN PABLO JUNIOR | ACOSTA ORTIGOZA | ACTIVO |
| BCF-45 | WILMA ESTHER | FIGUEREDO LEIVA | ACTIVO |
| BCF-46 | CARLOS | ALBERTO RIQUELME | ACTIVO |
| BCF-47 | ANTOLIANO | FIGUEREDO QUIÑONES | ACTIVO |
| BCF-48 | NICOLÁS | GÓMEZ TORALES | ACTIVO |
| BCF-49 | ALEXANDER ARIEL | BOGADO CABRERA | ACTIVO |
| BC-50 | LIZ PAMELA | CAÑIZA CABALLERO | ACTIVO |
| BC-51 | ALEXIS | SEBASTIÁN CABELLO | ACTIVO |
| BC-52 | ALICIA | BENÍTEZ CABALLERO | ACTIVO |
| BC-53 | JORGE | ANTONIO CABALLERO | ACTIVO |
| BC-54 | DARIO | MIRANDA NÚÑEZ | ACTIVO |
| BC-55 | CARMELO RAMÓN | MEDINA FIGUEREDO | ACTIVO |
| BC-56 | ALDO GABRIEL | MARTÍNEZ TORALES | ACTIVO |
| BC-57 | MARÍA RUMILDA | SANTACRUZ SILVA | ACTIVO |
| BC-58 | YANINA ISIDORA | CANTERO BENÍTEZ | ACTIVO |
| BC-59 | EMILCE ROMINA | CANTERO OJEDA | ACTIVO |
| BC-60 | MARÍA SOLEDAD | ZÁRATE OVIEDO | ACTIVO |
| BC-61 | HENRY WALTER | MARTÍNEZ CÁCERES | ACTIVO |
| BC-62 | ANDREA NOELIA | MEDINA CÁCERES | ACTIVO |
| BC-63 | SARA IGNACIA | VILLALBA CORREA | ACTIVO |
| BC-64 | LUCAS MIGUEL | MONTIEL CRISTALDO | ACTIVO |
| BC-65 | DIANA GISELLE | MORINIGO MELGAREJO | ACTIVO |
| BC-66 | CINTHIA LORENA | RECALDE JARA | ACTIVO |
| BC-67 | CRISTIAN ANDRES | MONTIEL AYALA | ACTIVO |
| BC-68 | MARIANA ELIZABETH | ORTIZ OCAMPOS | ACTIVO |
| BC-69 | HENRY DAVID | GALEANO GARCÍA | ACTIVO |
| BC-70 | MARÍA | JUSTA ALMADA | ACTIVO |
| BC-71 | MILCIADES | GONZÁLEZ FIGUEREDO | ACTIVO |
| BC-72 | TERESA DE | JESÚS PINIENTA | ACTIVO |
| BC-73 | MARCOS ANTONIO | SANTACRUZ MARTÍNEZ | ACTIVO |
| BC-74 | MATÍAS HERNÁN | NÚÑEZ DUARTE | ACTIVO |
| BC-75 | LIZ LILIANA | ESPÍNOLA BENÍTEZ | ACTIVO |
| BC-76 | ELIAS EZEQUIEL | RAMÍREZ HASTEDT | ACTIVO |
| BC-77 | LIZ KARINA | FLORENTÍN CAJE | ACTIVO |
| BC-78 | LISSA FELICIANA | RUIZ RODRÍGUEZ | ACTIVO |
| BC-79 | JÓNNATHAN RODRIGO | OBREGÓN CARDOZO | ACTIVO |
| BC-80 | JUANA LORENA | BOGARIN MORALES | ACTIVO |
| BC-81 | EVA SULMINA | CENTURIÓN FRANCO | ACTIVO |
| BC-82 | JOEL MATÍAS | PÁEZ ALMADA | ACTIVO |
| BC-83 | FÁTIMA LIDIANA | VERA OVELAR | ACTIVO |
| BC-84 | PAZ MARÍA | CABALLERO QUINTANA | ACTIVO |
| BC-85 | ÁLVARO | MATÍAS DURÉ | ACTIVO |
| BC-86 | JAZMÍN DEL ROCÍO | GALEANO CÁCERES | ACTIVO |
| BC-87 | FERNANDO JOSÉ | GUERRERO OJEDA | ACTIVO |
| BC-88 | ROCÍO JAZMÍN | GARCÍA BENÍTEZ | ACTIVO |
| BC-89 | CRISTHIAN DAVIDA | JARA BENÍTEZ | ACTIVO |
| BC-90 | TOBÍAS RAFAEL | RAMÍREZ HASTEDT | ACTIVO |
| BC-91 | OMAR | BÁEZ MACIEL | ACTIVO |
| BC-92 | JOSÉ CARLOS | INSFRÁN GÓMEZ | ACTIVO |
| BC-93 | JONÁS EMANUEL | MARTÍNEZ CÁCERES | ACTIVO |
| BC-94 | ZULMA ELENA | ROA CANDIA | ACTIVO |
| BC-95 | NOELIA ELIZABETH | MONTIEL AYALA | ACTIVO |
| BC-96 | LIDA YOHANA | GONZÁLEZ RAMÍREZ | ACTIVO |
| BC-97 | CÉSAR JOEL | CARDOZO ÁVALOS | ACTIVO |
| BC-98 | YANINA GABRIELA | FIGUEREDO ACHAR | ACTIVO |
| BC-99 | ÁNGEL MOISÉS | LEGUIZAMÓN MENDOZA | ACTIVO |
| BC-100 | NOELIA LIBRADA | TORRES AQUINO | ACTIVO |
| BC-101 | JUAN ENRIQUE | MIRANDA AQUINO | ACTIVO |
| BC-102 | MARÍA VICTORIA | ALMADA PAREDES | ACTIVO |
| BC-103 | YANINA BEATRIZ | FIGUEREDO ACHAR | ACTIVO |

### Bomberos Incorporados (4)

| Código | Nombre (usado) | Apellido (usado) | Estado |
|---|---|---|---|
| BI-1 | CLEMENTE | BORDESSOLLES | ACTIVO |
| BI-2 | NESTOR | INSFRÁN | ACTIVO |
| BI-3 | ANGEL | MORENO | ACTIVO |
| BI-4 | JOEL | DE MATTOS | ACTIVO |

### Activos (sin condición institucional específica) (39)

| Código | Nombre (usado) | Apellido (usado) | Estado |
|---|---|---|---|
| BVAF01 | NICOLASA MONTIEL | DE BRÍTEZ | ACTIVO |
| BVAF02 | ÁNGEL | GONZÁLEZ | FALLECIDO |
| BVAF03 | MARÍA | EMILIA ORUÉ | FALLECIDO |
| BVAF04 | ELENA VERÓN | DE CABALLERO | ACTIVO |
| BVAF05 | AMADO | OJEDA | FALLECIDO |
| BVAF06 | HERMES | BRÍTEZ | ACTIVO |
| BVAF07 | LIDA FALCÓN | DE RAMOS | FALLECIDO |
| BVAF08 | ANGELA | MARILÍN VERA | ACTIVO |
| BVAF09 | ISMAEL | DAMIÁN CÁCERES | ACTIVO |
| BVAF10 | AMADO | DANABRIA FLECHAS | ACTIVO |
| BVAF11 | CARLOS DAVID | BRÍTEZ MONTIEL | ACTIVO |
| BVA12 | SIMÓN | CESARINO BENÍTEZ | ACTIVO |
| BVA13 | ZUNILDA SANABRIA | DE MIRANDA | ACTIVO |
| BVA14 | CARLOS | ALBERTO TORRES | ACTIVO |
| BVA15 | ROSA YGNACIA SOSA | DE MIRANDA | ACTIVO |
| BVA16 | ROSA | GRACIELA ARMOA | ACTIVO |
| BVA17 | ADA | ANDREA RAMÍREZ | ACTIVO |
| BVA18 | ALFIRIO | FRANCO BORDÓN | ACTIVO |
| BVA19 | MARÍA | WILMA PÁEZ | ACTIVO |
| BVA20 | AURORA | DIAZ | ACTIVO |
| BVA21 | MIGUEL ÁNGEL | CHÁVEZ OSORIO | FALLECIDO |
| BVA22 | BONIFACIO | ROMERO | ACTIVO |
| BVA23 | PATRICIO | BARRIOS | ACTIVO |
| BVA24 | MARÍA | JORGELINA VELILLA | ACTIVO |
| BVA25 | CIRILA MIRANDA | DE BARUJA | ACTIVO |
| BVA26 | SIMÓN | BRÍTEZ BRÍTEZ | FALLECIDO |
| BVA27 | PEDRO | CABALLERO SANTACRUZ | ACTIVO |
| BVA28 | DOLORES | ARMOA AGÜERO | ACTIVO |
| BVA29 | FIRNA MATTO | DE AGUAYO | ACTIVO |
| BVA30 | CHARLES | BENÍTEZ FALCÓN | ACTIVO |
| BVA31 | LILIAN BRÍTEZ | DE ROLÓN | ACTIVO |
| BVA32 | HÉCTOR ADRIÁN | CHÁVEZ MORÁN | ACTIVO |
| BVA33 | CARLOS DARIO | DEL PUERTO | ACTIVO |
| BVA34 | CASIMIRO | MARTÍNEZ | ACTIVO |
| BVA35 | GLADYS | AYALA ACUÑA | ACTIVO |
| BVA36 | MARIELA | MARTÍNEZ | ACTIVO |
| BVA37 | SILVINO | SANTACRUZ MENDOZA | ACTIVO |
| BVA38 | RODOLFO | VERA RODRÍGUEZ | ACTIVO |
| BVA39 | RAMÓN | RODRÍGUEZ LEZCANO | ACTIVO |

### Honorarios (9)

| Código | Nombre (usado) | Apellido (usado) | Estado |
|---|---|---|---|
| BH01 | PETER | LOGAN | FALLECIDO |
| BH02 | MARIO | PEREIRA | ACTIVO |
| BH03 | JOSÉ | FÉLIX MORENO | FALLECIDO |
| BH04 | BLAS | ROJAS | ACTIVO |
| BH05 | NÉSTOR | BARUJA | ACTIVO |
| BH06 | BLAS | PÁEZ | ACTIVO |
| BH07 | CARLOS | RODRÍGUEZ | ACTIVO |
| BH08 | VÍCTOR RAMÓN | GARCÍA PESOA | ACTIVO |
| BH09 | PELAGIO | GIMÉNEZ GÓMEZ | ACTIVO |

### Brigadistas (asignados a Brigada de Rescate — BR-RESC) (9)

| Código | Nombre (usado) | Apellido (usado) | Estado |
|---|---|---|---|
| BJ10 | ALICE | GONZÁLEZ | ACTIVO |
| BJ11 | FABIOLA | GODOY | ACTIVO |
| BJ12 | MERCEDES | MONTIEL | ACTIVO |
| BJ14 | LIZ | FRANZO | ACTIVO |
| BJ15 | MAGALI | SANTACRUZ | ACTIVO |
| BJ16 | BEATRIZ | SAMANIEGO | ACTIVO |
| BJ17 | ANALÍA | CÁCERES | ACTIVO |
| BJ18 | DANNA | JAQUET | ACTIVO |
| BJ19 | ALEXANDER | OZUNA | ACTIVO |

---

## 5. Verificación de la carga (consultas de referencia)

```sql
-- Total y desglose por condicion/estado
SELECT condicion_institucional, estado, COUNT(*) 
FROM personal.bomberos 
GROUP BY condicion_institucional, estado;

-- Todo lo que sigue pendiente de completar
SELECT numero_bombero, nombre, apellido, cedula, fecha_nacimiento, 
       telefono_principal, rango, fecha_ingreso, estado
FROM personal.bomberos
WHERE cedula LIKE 'PENDIENTE-%'
ORDER BY numero_bombero;
```

## 6. Próximos pasos sugeridos

1. **Prioridad alta**: completar cédula, fecha de nacimiento y teléfono de las 164
   personas (dato mínimo para que el legajo sea utilizable). Puede hacerse por lote
   si se dispone de un padrón/planilla adicional con esos datos, o persona por
   persona desde la pantalla de Personal una vez que el módulo tenga edición
   habilitada en el frontend.
2. Revisar y corregir manualmente la separación nombre/apellido señalada en 4.3.1
   donde corresponda.
3. Confirmar o corregir la asignación de brigada de los 9 Brigadistas (4.3.3).
4. Decidir si "Activos" y/o "Brigadistas" deben llevar una `condicion_institucional`
   específica (4.3.2).
5. Cargar un catálogo real de `organizacion.rangos` (hoy solo existe un rango de
   prueba) para poder asignar `rango_id` en vez de dejar el campo de texto libre en
   `'PENDIENTE'`.
6. Confirmar `fecha_baja` / `motivo_baja` para las 8 personas marcadas `FALLECIDO`,
   si se dispone de esa información.
