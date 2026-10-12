# GRE24-ENGINE — implementación frente a conocimiento

Actualización local2026-10-11: [mejora aplicada](../../docs/matpel/IMPLEMENTACION_MEJORA_20261011.md).
Motor con fuentes/resultados separados, Tabla3 estructurada, identificación/ámbito,
consulta guiada y traza; biblioteca Flutter por partes verificadas. Pruebas técnicas
registradas en [evidencia](evidencia/implementacion-mejora-20261011.json).
La aceptación operacional, teléfono físico y decisionesSCI siguen pendientes.

Registro de implementación anterior2026-10-10: `GreModule` incorpora `MatpelConsultaController`,
`MatpelConsultaService` y `MotorMatpelService`. Hay consulta de versiones validadas,
selección condicionada de Tablas1–3 y geometría complementaria de PDF297 /
impresa295. La [entrega local](../../docs/matpel/FASE_4_5_CONSULTA_MOTOR.md)
conserva alcance y pruebas; no equivale a validación institucional ni catálogo activo.
La descarga documental HTML incluye catálogo y PDF con comprobación de integridad;
su lectura desde disco sin red está probada. El motor no se duplica en ese archivo.
El lector documental Flutter incorpora descarga, verificación, biblioteca local,
búsqueda y fuentes; tests/análisis y APK de depuración aprobados. El motor
desconectado y el dispositivo físico siguen pendientes.
La API de contexto/historial/decisionesSCI sigue pendiente del contrato y del
Reglamento original que el usuario confirmó no tener disponible todavía.

`reglas_gre.py` conserva26 reglas y marca11 de selección como ejecutables;
esa marca es metadata del artefacto. Las pruebas de selección actuales están en
`motor-matpel.spec.ts`; no convierten todas las cláusulas documentales en lógica.
Las entidades/migración094 modelan el catálogo y procedencia. La095 prepara
permisos; no se aplicaron migraciones compartidas en esta misión.

La UI existente en `frontend/src/app/dashboard/servicios/nuevo/page.tsx` ofrece
ONU y descripción MATPEL como datos del formulario de comunicación. No consume
un motorGRE ni representa zonas de aislamiento/protección. No reemplazar esos
campos/historial antes de integrar el mismo Servicio y núcleo existentes.

El núcleo `IncidenteNucleoModule` exporta cronología y motor de fases del incidente;
no confundir ese motor de fases con interpretación GRE. La integración propuesta
está en [arquitectura anterior](../../docs/matpel/FASE_2_ARQUITECTURA.md) y
[contratos](../../docs/matpel/FASE_2_CONTRATOS.md). Mantener una sola lógica de
evaluación en servidor, consumida por consulta ySCI, sin duplicarla en frontend.

Correspondencia provisional:

| Capacidad | Código existente | Estado real |
|---|---|---|
| Extracción documental | `scripts/matpel/extraer_gre.py`, `extraer_tablas.py` | Candidato con referencias |
| Revisión/activación | `gre-revision.service.ts`, `gre-activacion.service.ts` | Pruebas técnicas previas; sin aceptación institucional |
| Consulta/selección/condiciones | `matpel-consulta.*`, `motor-matpel.service.ts` | Implementación local probada; cotejo institucional pendiente |
| GeometríaGRE trazable | `matpel-geometria.ts`, `MapaMatpel.tsx` | Consulta relativa probada; integración con incidente pendiente |
| SCI consume motor único | No implementado | Pendiente |
| Conocimiento para agentes | Este índice e instrucciones | Persistencia inicial; comprensión no demostrada |
## Actualización de cobertura documental

La [inspección de páginas](paginas/README.md) llegó a392/392 y conserva246
anotaciones nuevas. Es documentación y evidencia; no agrega evaluadores al motor,
consultas operativas, geometría ni consumo porSCI por sí sola. La implementación
posterior se registra arriba. Para cualquier ampliación,
consultar los hallazgos y las condiciones completas, no solo los conteos.
