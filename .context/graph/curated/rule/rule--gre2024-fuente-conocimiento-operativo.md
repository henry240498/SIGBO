---
id: rule--gre2024-fuente-conocimiento-operativo
tipo: RULE
nombre: GRE2024 exige fuente original, condiciones, trazabilidad y prueba operativa
nivel: L1
resumen: Consultar .context/gre2024/index.md y fuentes antes de GRE/MATPEL/SCI. Extracción y administración no demuestran dominio. Conservar reglas, excepciones y estados de validación; justificar conclusiones por página. Motor e integración únicos requieren pruebas documentales e independientes.
severidad: CRITICA
dominio: servicios
fuente: .context/gre2024/agent-instructions.md
archivos:
  - .context/gre2024/index.md
  - .context/gre2024/agent-instructions.md
  - .context/gre2024/validation-report.md
  - .context/gre2024/open-issues.md
  - .context/gre2024/reglas-operativas.json
  - scripts/matpel/auditar_conocimiento.py
  - scripts/matpel/validar_conocimiento.py
  - scripts/matpel/documentar_paginas.py
  - scripts/matpel/registrar_paginas_leidas.py
  - scripts/matpel/validar_paginas.py
  - scripts/matpel/test_validar_paginas.py
  - .context/gre2024/paginas/README.md
  - .context/gre2024/paginas/cobertura.md
  - .context/gre2024/paginas/inventario.json
  - .context/gre2024/paginas/notas.json
  - .context/gre2024/paginas/hallazgos.json
  - scripts/matpel/test_validar_conocimiento.py
  - .context/gre2024/response-guides/lectura111-120.md
  - .context/gre2024/response-guides/lectura121-130.md
  - .context/gre2024/response-guides/lectura131-140.md
  - .context/gre2024/response-guides/lectura141-150.md
  - .context/gre2024/response-guides/lectura151-160.md
  - .context/gre2024/response-guides/lectura161-174.md
  - .context/gre2024/response-guides/inventario-guias.md
  - .context/gre2024/response-guides/inventario-guias.json
  - .context/gre2024/response-guides/notas131-174.json
  - .context/gre2024/response-guides/dependencias.md
  - scripts/matpel/documentar_guias.py
  - scripts/matpel/documentar_guias_v2.py
  - scripts/matpel/cerrar_estudio_guias.py
  - scripts/matpel/test_documentar_guias.py
  - .context/gre2024/estudio-tabla3.md
  - docs/Manuales/GRE2024-Spa-Web-a.pdf
  - backend/src/modules/gre/gre-catalogo.service.ts
  - backend/src/modules/gre/motor-matpel.service.ts
  - backend/src/modules/gre/motor-matpel.spec.ts
  - backend/src/modules/gre/matpel-consulta.service.ts
  - backend/src/modules/gre/matpel-consulta.controller.ts
  - backend/src/modules/gre/matpel-geometria.ts
  - backend/src/modules/gre/matpel-paquete.ts
  - backend/src/modules/gre/matpel-paquete.spec.ts
  - frontend/src/app/dashboard/matpel/page.tsx
  - frontend/src/components/MapaMatpel.tsx
  - scripts/matpel/validar_recorte_motor.py
  - scripts/matpel/validar_cabeceras_tabla3.py
  - scripts/matpel/recorrido_offline.cjs
  - .movile/lib/matpel.dart
  - .movile/lib/matpel_documento.dart
  - .movile/lib/matpel_consulta.dart
  - .movile/lib/matpel_parametros.dart
  - .movile/lib/matpel_motor_local.dart
  - .movile/lib/matpel_foto.dart
  - .movile/test/matpel_motor_local_test.dart
  - .movile/test/matpel_foto_test.dart
  - backend/src/modules/gre/matpel-motor-local.spec.ts
  - backend/src/modules/gre/gre-importacion.service.ts
  - backend/src/modules/gre/gre-importacion-estado.spec.ts
  - scripts/matpel/compilar_motor_local.cjs
  - scripts/matpel/motor_local_runtime.js
  - .movile/docs/GRE_CIERRE_20261012.md
  - .movile/lib/mapa_matpel.dart
  - .movile/test/matpel_consulta_test.dart
  - scripts/matpel/evaluacion_prueba_movil.cjs
  - .movile/test/matpel_test.dart
  - .movile/docs/MATPEL.md
  - docs/matpel/FASE_4_5_CONSULTA_MOTOR.md
terminos: [gre, gre2024, matpel, sci, fuente, operativo, conocimiento, excepciones, cotejo, trazabilidad, agentes]
---

El PDF original determina el contenido de la GRE. El código demuestra lo que hace
SIGBO, que puede estar incompleto o contradecir la fuente; no ajustar la fuente al
programa. Consultar el índice y las instrucciones, seleccionar módulos afectados,
seguir referencias y estados de revisión. Ningún cotejo automático activa edición
institucional ni acredita comprensión integral por parte de un agente.

Mantener evidencia persistente, registrar cada discrepancia y sus límites,
actualizar reglas/implementación/pruebas en el mismo cambio pertinente. Para
resultados operativos exigir fuente exacta, condiciones y pruebas de aplicación;
para varios materiales o datos insuficientes conservar abstención explícita.
