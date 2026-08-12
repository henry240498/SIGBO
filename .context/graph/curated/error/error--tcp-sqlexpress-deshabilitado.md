---
id: error--tcp-sqlexpress-deshabilitado
tipo: ERROR
nombre: SQL Server Express llega con TCP/IP deshabilitado y el backend no conecta
nivel: L1
resumen: El backend falla al conectar aunque las credenciales sean correctas, porque SQLEXPRESS trae el protocolo TCP/IP desactivado de fabrica.
severidad: ALTA
archivos: [database/enable-tcp-sqlexpress.ps1]
terminos: [tcp, sqlexpress, conexion, puerto, 1433, protocolo, econnrefused, habilitar]
edges:
  - [originates_from, dependency--sqlserver-express]
  - [originates_from, configuration--conexion-datos]
---

## Sintoma

El backend arranca pero toda consulta falla en la conexion. Las credenciales son
correctas y el login SQL `sigbo_app` existe y es valido. Conectarse por named pipes
(SSMS local) funciona; por TCP, no.

## Causa

**SQL Server Express deshabilita TCP/IP por defecto.** No es un problema de permisos ni
de firewall: el protocolo esta apagado en la configuracion de la instancia.

TypeORM con `mssql` conecta por TCP a `localhost:1433`. Si el protocolo esta apagado, no
hay nada escuchando.

## Solucion

`database/enable-tcp-sqlexpress.ps1` habilita el protocolo y fija el puerto. Requiere
**privilegios de administrador de Windows** para modificar la configuracion de la
instancia y reiniciar el servicio.

Verificar despues:

```powershell
Test-NetConnection -ComputerName localhost -Port 1433
```

## Por que reaparece

Se puede tener rol `sysadmin` **dentro** de SQL Server y no ser administrador de
Windows. Son dos permisos distintos: el primero manda sobre los datos, el segundo sobre
la configuracion del servicio. Habilitar TCP necesita el segundo.

Si no hay administrador de Windows disponible, el camino alternativo es conectar por
named pipes ajustando la cadena de conexion, no insistir con el puerto.
