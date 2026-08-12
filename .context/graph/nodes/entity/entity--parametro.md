---
id: entity--parametro
tipo: ENTITY
nombre: Parametro
nivel: L1
dominio: organizacion
resumen: "Catalogo generico de valores parametrizables administrados desde Organizacion Institucional -> Parametros. `padreId` solo se usa en la jerarquia geografica (DEPARTAMENTO->PAIS, CIUDAD->DEPARTAMENTO, BARRIO->CIUDAD); el resto de los tipos son planos."
tabla: organizacion.parametros
archivos:
  - backend/src/shared/entities/parametro.entity.ts
edges:
  - [belongs_to, domain--organizacion]
  - [persisted_in, table--organizacion-parametros]
terminos: [parametro, parametros, organizacion, tipo, pais, departamento, ciudad, barrio, profesion, idioma, nivel, grupo, sanguineo, factor, seguro, aseguradora, evento, asistencia, ubicacion, equipo, estado, presencia, guardia, sector, estacion]
---

# Parametro

Catalogo generico de valores parametrizables administrados desde Organizacion Institucional -> Parametros. `padreId` solo se usa en la jerarquia geografica (DEPARTAMENTO->PAIS, CIUDAD->DEPARTAMENTO, BARRIO->CIUDAD); el resto de los tipos son planos.

- **Tabla:** [[table--organizacion-parametros|organizacion.parametros]]
- **Columnas mapeadas:** 11

## Estados y enumeraciones

- `TipoParametro`: `PAIS` · `DEPARTAMENTO` · `CIUDAD` · `BARRIO` · `PROFESION` · `IDIOMA` · `NIVEL_IDIOMA` · `GRUPO_SANGUINEO` · `FACTOR_RH` · `TIPO_SEGURO` · `ASEGURADORA` · `TIPO_EVENTO_ASISTENCIA` · `UBICACION_EQUIPO` · `ESTADO_PRESENCIA_GUARDIA` · `SECTOR_ESTACION`

## Archivos

- `backend/src/shared/entities/parametro.entity.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `persisted_in` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[service--equipos-equipos|EquiposService]] `uses` →
- [[service--guardias-inspecciones-estacion|InspeccionesEstacionService]] `uses` →
- [[service--operaciones-dashboard-asistencia|DashboardAsistenciaService]] `uses` →
- [[service--organizacion-parametros|ParametrosService]] `uses` →
- [[service--personal-foja-servicio|FojaServicioService]] `uses` →
- [[service--personal-idiomas|IdiomasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
