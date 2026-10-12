# GRE24-SOURCE — fuente de verdad

Fuente local: [GRE2024-Spa-Web-a.pdf](../../docs/Manuales/GRE2024-Spa-Web-a.pdf).
Título nativo: «2024 GUÍA DE RESPUESTA EN CASO DE EMERGENCIA»; PDF 1.7,
392 páginas; 8.182.725 bytes; SHA-256
`bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af`.
Identidad reconfirmada leyendo el archivo completo en esta auditoría.

El sitio de [PHMSA](https://www.phmsa.dot.gov/training/hazmat/erg/gre2024-pdf-accesible-espanol)
publica la versión española accesible con fecha efectiva 2024-04-04 y enlace al
PDF del mismo nombre. La descarga directa para comparar bytes devolvió HTTP 403;
**no se acredita igualdad criptográfica con la copia remota**. Consulta web realizada
2026-10-09. No se sustituyó la fuente local.

[Transport Canada: correcciones](https://tc.canada.ca/en/dangerous-goods/canutec/emergency-response-guidebook/corrections)
no enumeraba correcciones para ERG2024 al consultarse. Las erratas de 2020, 2016 y
otras ediciones están separadas: no aplicarlas automáticamente a 2024. Esto acredita
el contenido publicado de esa página en esa fecha, no inexistencia universal de errores.

El artefacto candidato existente se identifica en la [auditoría](evidencia/auditoria-documental.json).
Parser `catalogo-1`, normalizador `busqueda-1`, PyMuPDF 1.28.2. Archivo inmutable en
`backend/private_uploads/gre`; no duplicarlo dentro de este contexto. Su SHA-256 es
`0a936d3c97fd95195fa24fa7b0f9538ef946e726adf6f8542b65b0a5da10b543`.

Los números `paginaPdf` comienzan en 1; `page.number` de PyMuPDF comienza en 0.
La numeración impresa y las etiquetas PDF son campos separados: PDF3 es impresa1,
PDF297 es impresa295, PDF340 es impresa338. No inferir siempre un desplazamiento.
PDF154 contiene numeración múltiple y ejemplo de guía: no importarlo como otra guía.

Criterios distintos de fidelidad: identidad criptográfica; integridad de inventario;
cotejo nativo por caracteres/cajas; cotejo visual de significado; interpretación
operativa; correspondencia con implementación; pruebas independientes; aceptación
institucional. Aprobar un nivel no implica aprobar los siguientes. Ver [validación](validation-report.md).

Portada, PDF344 y contraportada392 delimitan uso inicial de respuesta al transporte
y excluyen sustitución de capacitación/juicio o certificación de cumplimiento.
La aplicación no adquiere autoridad de mando mediante la GRE.

Actualización2026-10-10: [PHMSA](https://www.phmsa.dot.gov/training/hazmat/erg/gre2024-pdf-accesible-espanol)
mantiene el enlace a GRE2024-Spa-Web-a.pdf y la fecha efectiva2024-04-04. El
proveedor web leyó392 páginas del enlace oficial, pero la descarga de bytes desde
el workspace volvió a recibirHTTP403; el hash remoto sigue sin cotejarse.
[Transport Canada](https://tc.canada.ca/en/dangerous-goods/canutec/emergency-response-guidebook/corrections)
no enumera correcciones en la secciónERG2024 consultada. El pie mostrado2016-09-12
no se usa como fecha de actualización de esa sección. Los contactos locales no
quedan verificados por esta consulta. Véase [evidencia acotada](evidencia/fuentes-externas-20261010.json).
