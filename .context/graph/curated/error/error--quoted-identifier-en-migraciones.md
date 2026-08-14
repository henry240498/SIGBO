---
id: error--quoted-identifier-en-migraciones
tipo: ERROR
nombre: Las migraciones fallan sin QUOTED_IDENTIFIER ON
nivel: L2
resumen: Ejecutar las migraciones sin QUOTED_IDENTIFIER habilitado hace fallar las tablas con indices filtrados o constraints con expresiones. El runner ya lo activa.
severidad: MEDIA
archivos: [database/run-migrations.ps1]
terminos: [quoted, identifier, migracion, sqlcmd, ansi, set, option, index, filtrado]
edges:
  - [originates_from, dependency--sqlserver-express]
---

## Sintoma

Una migracion falla con un error de opciones SET al crear un indice filtrado, una
columna computada o un constraint con expresion. El mismo SQL corre bien desde SSMS.

## Causa

SQL Server exige `QUOTED_IDENTIFIER ON` para crear o modificar objetos que guardan
expresiones (indices filtrados, columnas computadas, vistas indexadas). La opcion **se
guarda con el objeto** y su valor por defecto depende del cliente que ejecuta el lote:
SSMS lo activa; `sqlcmd` u otros drivers no necesariamente.

De ahi que el mismo script funcione a mano y falle en el runner.

## Solucion aplicada

El commit `4f45d1f` — *"fix(database): habilitar QUOTED_IDENTIFIER al correr las
migraciones"* — lo activa en `database/run-migrations.ps1`.

## Regla al escribir migraciones nuevas

<<<<<<< Updated upstream
No confiar en las opciones SET de la sesion. Declararlas **dentro del archivo**, antes
del DDL, como ya hacen las migraciones recientes:

```sql
SET ANSI_NULLS ON;
=======
No confiar en las opciones SET de la sesion. Si una migracion necesita opciones
particulares, declararlas **dentro del archivo**, antes del DDL:

```sql
>>>>>>> Stashed changes
SET QUOTED_IDENTIFIER ON;
GO
```

Asi el archivo es correcto sin importar quien lo ejecute. Ver
[[rule--migracion-nunca-se-edita]].
