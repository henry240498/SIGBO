---
id: error--start-script-no-reinicia-servicios
tipo: ERROR
nombre: start-sigbo.ps1 deja corriendo el proceso viejo si el puerto ya escucha
nivel: L1
resumen: El script comprueba si el puerto responde y, si escucha, no reinicia nada. Queda sirviendo el proceso anterior con codigo viejo, y el cambio recien compilado parece no surtir efecto.
severidad: ALTA
archivos: [start-sigbo.ps1]
terminos: [start, script, reiniciar, puerto, proceso, viejo, cache, cambio, efecto, 3000, 3001]
edges:
  - [originates_from, dependency--nodejs]
---

## Sintoma, y por que engana tanto

Editas el codigo, compila sin errores, corres el script de arranque y **el
comportamiento viejo sigue ahi**. Da toda la impresion de que el cambio esta mal o de
que hay cache en el navegador.

## Causa

`start-sigbo.ps1` verifica si el puerto ya esta escuchando y, en ese caso, **no levanta
nada nuevo**: da el servicio por operativo. El proceso viejo —con el codigo viejo en
memoria— sigue atendiendo.

Es una guarda razonable para no abrir dos instancias, pero significa que **el script no
es un reinicio**.

## Solucion

Matar los procesos antes de arrancar:

```powershell
Get-NetTCPConnection -LocalPort 3000,3001 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

<<<<<<< Updated upstream
y despues correr el script. O en desarrollo usar directamente `npm run start:dev`
(backend) y `npm run dev` (frontend), que recargan al detectar cambios.
=======
y despues correr el script. O en desarrollo usar directamente
`npm run start:dev` (backend) y `npm run dev` (frontend), que recargan al detectar
cambios.
>>>>>>> Stashed changes

## Como confirmar el diagnostico en 5 segundos

Antes de dudar del cambio, verificar **cuanto hace que arranco el proceso**:

```powershell
Get-Process node | Select-Object Id, StartTime
```

Si el `StartTime` es anterior a tu edicion, el codigo que corre no es el tuyo. Antes de
depurar cualquier "cambio que no funciona", descartar esto.
