<#
============================================================================
 ARCHIVADO - no modifica la red de SQL Server
============================================================================

 El script anterior habilitaba TCP/IP, fijaba un puerto y reiniciaba SQL Server
 sin verificar interfaz de escucha, firewall, ACL ni aprobacion institucional.
 Esas acciones pueden ampliar la exposicion de una base que contiene datos
 personales y operativos.

 La configuracion de red debe realizarla la persona administradora mediante un
 cambio aprobado, con alcance de interfaz/firewall, respaldo y verificacion de
 conectividad. SIGBO no automatiza ese cambio desde el repositorio.
============================================================================
#>

[CmdletBinding()]
param(
    [string] $Instancia = 'MSSQL15.SQLEXPRESS',
    [int] $Puerto = 1433
)

throw "enable-tcp-sqlexpress.ps1 esta archivado. Solicite un cambio de infraestructura aprobado para '$Instancia' y el puerto $Puerto."
