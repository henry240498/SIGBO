# Base de datos SIGBO-CBVC — Réplica reconstruida

Este directorio contiene la reconstrucción de la base de datos del sistema
**SIGBO-CBVC** (SQL Server 2019 Express), generada a partir de la documentación
técnica disponible del proyecto — no del código fuente original, que no está
presente en este repositorio. **Antes de usar nada de esta carpeta, leer
[`REPORTE_REPLICACION.md`](REPORTE_REPLICACION.md) sección 0 y 10**: explica
exactamente de dónde sale cada dato y qué no se pudo verificar.

## Ejecución rápida

Contra una instancia SQL Server 2019 Express (o superior) vacía, con `sqlcmd`:

```bash
sqlcmd -S <servidor> -E -i scripts/01_create_database.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/02_create_schemas.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/03_create_types.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/04_create_tables.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/05_create_sequences.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/06_create_constraints.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/07_create_indexes.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/08_create_functions.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/09_create_procedures.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/10_create_triggers.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/11_create_views.sql
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/12_insert_master_data.sql
# 13_insert_initial_data.sql es una plantilla: completar solo si se dispone de datos reales
sqlcmd -S <servidor> -E -d sigbo_cbvc -i scripts/14_validation.sql
```

(`-E` = Windows Authentication; usar `-U <usuario> -P <password>` para autenticación SQL.)

Antes de `12_insert_master_data.sql`, asegurarse de que exista la fila del rol
"Administrador General" en `seguridad.roles` — ver `REPORTE_REPLICACION.md`
sección 8, apartado final.

## Contenido

| Archivo | Qué hace |
|---|---|
| `REPORTE_REPLICACION.md` | Reporte completo: arquitectura, diccionario de datos, relaciones, información faltante, riesgos |
| `scripts/01`–`14` | Scripts SQL Server ejecutables, en orden, ver `REPORTE_REPLICACION.md` secciones 7-8 |

## Qué NO incluye esta carpeta

- Datos operativos reales (usuarios, bomberos, servicios, etc.) — no estaban
  disponibles. `13_insert_initial_data.sql` es una plantilla vacía con instrucciones.
- Ningún secreto, credencial, cadena de conexión o backup real.
- Estructura de un eventual modelo multi-institución: no está implementada en el
  sistema documentado, así que no se inventó aquí.

## Origen de los datos de esta carpeta

Ver `REPORTE_REPLICACION.md` sección 0. En resumen: el repositorio de GitHub
`SIGBO` es un scaffold inicial sin base de datos configurada; la estructura real se
reconstruyó a partir de `SIGBO-CBVC_Documentacion_Sistema_2026-08-04.docx`
(documentación técnica del sistema, no el código fuente), que fue la mejor
evidencia disponible en esta máquina.
