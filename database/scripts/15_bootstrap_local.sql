/*
============================================================================
 ARCHIVADO - no ejecutar
============================================================================

 Este nombre se conserva solamente para impedir que automatizaciones antiguas
 creen un administrador local con privilegios amplios. La ruta vigente es:

   1. database/run-migrations.ps1
   2. backend npm run seed, con SIGBO_DEMO_PASSWORD definido solo en el
      entorno local

 El seed vigente no incluye una contrasena en el repositorio y no crea datos
 operativos sinteticos. Este archivo falla intencionalmente antes de modificar
 la base de datos.
============================================================================
*/

THROW 51000, N'15_bootstrap_local.sql esta archivado. Use run-migrations.ps1 y el seed vigente.', 1;
GO
