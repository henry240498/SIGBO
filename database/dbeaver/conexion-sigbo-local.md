# Conexion DBeaver — SIGBO local

Si `setup_dbeaver.ps1` no pudo escribir la configuracion (por ejemplo porque
DBeaver estaba abierto o usa otro workspace), esta es el alta manual. Toma
menos de un minuto.

## Alta manual

1. DBeaver → **Base de datos → Nueva conexion** (o `Ctrl+Shift+N`).
2. Elegir **SQL Server** → driver **Microsoft SQL Server**
   (identificador interno `mssql_jdbc_ms_new`; **no** el driver jTDS).
3. Pestana **Principal**:

   | Campo | Valor |
   |---|---|
   | Host | `localhost` |
   | Puerto | `1433` |
   | Base de datos / Esquema | `sigbo_cbvc` |
   | Autenticacion | `SQL Server Authentication` |
   | Usuario | `sigbo_app` |
   | Contrasena | `Sigbo.Local.2026` |
   | Guardar contrasena | si |

4. Pestana **Driver properties** (solo si la conexion falla por TLS):

   | Propiedad | Valor |
   |---|---|
   | `encrypt` | `false` |
   | `trustServerCertificate` | `true` |

5. **Probar conexion**. La primera vez DBeaver descarga el driver JDBC de
   Microsoft (requiere internet una sola vez). Luego **Finalizar**.

## URL JDBC directa

Si preferis pegar la URL en lugar de rellenar campos, cambiar
*Connect by* a **URL**:

```
jdbc:sqlserver://localhost:1433;databaseName=sigbo_cbvc;encrypt=false;trustServerCertificate=true
```

## Ver los 11 esquemas

SQL Server agrupa por base de datos → esquema. Si en el arbol solo aparece
`dbo`, activar en la conexion:
**Editar conexion → SQL Server → "Mostrar todas las bases de datos"**, o en
**Driver properties** poner `@dbeaver-show-non-default-db@` = `true`.

Los 11 esquemas del sistema son:

```
seguridad  organizacion  personal   academia   operaciones  vehiculos
equipos    servicios     finanzas   deposito   documentos
```

## Primeras consultas para comprobar que todo esta

```sql
-- 1. las 59 tablas, por esquema
SELECT s.name AS esquema, COUNT(*) AS tablas
FROM sys.tables t JOIN sys.schemas s ON s.schema_id = t.schema_id
GROUP BY s.name ORDER BY s.name;

-- 2. las 68 relaciones
SELECT COUNT(*) AS foreign_keys FROM sys.foreign_keys;

-- 3. consulta real con JOIN (necesita -TestData)
SELECT b.numero_bombero, b.nombre, b.apellido,
       r.nombre AS rango, c.nombre AS compania, q.nombre AS cuartel,
       b.antiguedad
FROM personal.bomberos b
LEFT JOIN organizacion.rangos    r ON r.id = b.rango_id
LEFT JOIN organizacion.companias c ON c.id = b.compania_id
LEFT JOIN organizacion.cuarteles q ON q.id = b.cuartel_id
ORDER BY b.numero_bombero;

-- 4. RBAC: permisos del rol Administrador General
SELECT p.nombre, p.recurso, p.accion, p.categoria
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.roles    r ON r.id = a.rol_id
JOIN seguridad.permisos p ON p.id = a.permiso_id
WHERE r.nombre = N'Administrador General'
ORDER BY p.categoria, p.nombre;
```

## Si la conexion falla

| Sintoma | Causa habitual | Solucion |
|---|---|---|
| `The TCP/IP connection to the host localhost, port 1433 has failed` | TCP/IP apagado o puerto dinamico (por defecto en Express) | `.\install_local.ps1 -SkipServerConfig:$false` como Administrador, o SQL Server Configuration Manager → Protocolos de SQLEXPRESS → TCP/IP = Habilitado; Direcciones IP → IPAll → Puertos TCP = `1433`, Puertos TCP dinamicos = vacio; reiniciar el servicio |
| `Login failed for user 'sigbo_app'` | autenticacion mixta desactivada | `install_local.ps1` la activa (`LoginMode = 2`); requiere reiniciar el servicio |
| `The driver could not establish a secure connection... SSL` | TLS | agregar `encrypt=false;trustServerCertificate=true` a la URL |
| No aparecen los esquemas | vista filtrada | activar "Mostrar todas las bases de datos" |

Comprobacion rapida desde PowerShell:

```powershell
Get-Service 'MSSQL$SQLEXPRESS'
Test-NetConnection 127.0.0.1 -Port 1433
sqlcmd -S localhost\SQLEXPRESS -E -Q "SELECT COUNT(*) FROM sigbo_cbvc.sys.tables"
```
