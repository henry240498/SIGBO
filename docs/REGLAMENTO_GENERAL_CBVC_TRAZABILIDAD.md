# Reglamento General del CBVC - criterios para SIGBO

Documento fuente: `REGLAMENTO GRAL CBVC Formato 2021.pdf`, Reglamento General del
Cuerpo de Bomberos Voluntarios de Carapeguá, aprobado en Asamblea General
Extraordinaria el 30 de octubre de 2004 y revisado en su formato en 2020.

Este documento no reemplaza al reglamento. Su finalidad es mantener trazabilidad entre
las reglas institucionales y el software. Ante ambigüedad, contradicción, reforma o duda
de vigencia, prevalece la interpretación formal de las autoridades competentes del CBVC.

## Principios obligatorios de implementación

- Toda regla automatizada debe registrar el artículo del que deriva y conservar evidencia
  de la decisión tomada.
- El sistema puede advertir, calcular y proponer; no debe dictar sanciones, bajas,
  ascensos, admisiones o resoluciones que el reglamento reserva a una autoridad.
- Las decisiones de Comandancia, Comisión Directiva, Tribunal de Honor, Junta Superior
  de Oficiales, Academia o Tribunal Electoral deben identificar autoridad, fecha,
  resolución, fundamento, vigencia y documentos asociados.
- Debe existir historial inmutable de cambios relevantes y separación de permisos entre
  quien registra, revisa, aprueba y notifica.
- Los datos médicos, disciplinarios y personales deben tratarse como información
  restringida; su publicación pública queda prohibida salvo autorización expresa y base
  institucional válida.

## Matriz de trazabilidad funcional

| Área de SIGBO | Artículos principales | Requisitos funcionales derivados |
|---|---:|---|
| Organización institucional | 10-54 | Representar organismos, órganos, cargos, jerarquía, suplencias, sesiones, actas, acuerdos, resoluciones y responsables. |
| Asambleas y padrón electoral | 11-21 | Calcular un padrón preliminar con juramento, situación, sanciones, cuotas y porcentaje de asistencia; permitir revisión, reclamo y aprobación por autoridad. |
| Personal y clasificación | 2-4, 123-142 | Registrar categorías Fundador, Combatiente, Activo, Incorporado, Protector/Colaborador y Adherente; conservar ingreso, juramento, traspasos, renuncia, baja y expulsión. |
| Admisión y aspirantes | 91-106, 127-135 | Expediente de solicitud, documentos, selección, orden de preferencia, formación, resultado, juramento y resolución. No aceptar automáticamente por completar un formulario. |
| Academia | 55-66, 131, 134, 158 | Administrar cursos, niveles, programas, asistencia, certificados y requisitos académicos para ascensos. |
| Jerarquías, cargos y ascensos | 23, 42, 46, 143-171 | Separar grado, categoría, situación y cargo; documentar propuesta, requisitos, antigüedad, formación y resolución de ascenso o designación. |
| Asistencia | 12, 146-155 | Computar actos de servicio, guardias, prácticas y citaciones; generar cortes bimestrales y promedio anual; aplicar el mínimo reglamentario del 51% como alerta y antecedente, no como sanción automática. |
| Reserva, fuera de cuadro y baja | 145-157, 256, 261-264 | Manejar estados con vigencia, causal, autoridad, resolución y posibilidad de reintegro; bloquear participación operativa cuando corresponda. |
| Disciplina | 71-86, 115-122, 172-198 | Denuncias, competencia, sumario, defensa, clasificación de faltas, evidencia, resolución, recursos, notificación, sanciones y puntos favorables. Preservar debido proceso. |
| Foja de servicio e identificación | 46, 199-203 | Generar foja anual, historial de cursos/servicios/reconocimientos y control de carnet, entrega, vigencia y devolución. |
| Documentos y libros oficiales | 204-211 | Informes correlativos, firmados y sellados; libros de servicios, guardias, prácticas, inventario y novedades; solicitudes formales de informes. |
| Guardias y pernoctes | 42, 102-103, 207, 212-219 | Turnos definidos por Comandancia, personal Combatiente, horarios, visitas, pernocte, novedades y responsabilidad sobre bienes. |
| Servicios y mando operativo | 5-8, 220-227, 259-274 | Registrar mando único, asignación de roles, participantes habilitados, datos del incidente, retorno a base e informe final; impedir participación de personal suspendido o con licencia. |
| Vehículos y conductores | 230-248 | Autorización de conductores, licencia vigente, conductor por guardia, checklist previo, kilometraje, combustible, fallas, colisiones, responsables y autorización de salida. |
| Radio y comunicaciones | 249-258 | Designar radio operador, registrar llamada, dirección, despacho, horarios, apoyo solicitado y novedades durante el servicio. |
| Patrimonio, depósito y equipos | 48, 88-90, 209, 217, 246 | Inventario codificado, custodios, entrega/recepción, movimientos, controles periódicos y responsabilidad por materiales. |
| Finanzas | 35, 47-49 | Caja, valores, comprobantes, intervención de responsables, rendición e inventario de entrega al sucesor. |
| Relaciones públicas y Publicaciones | 107-110 | Publicación institucional bajo roles autorizados, con revisión y trazabilidad; excluir datos operativos o personales sensibles. |
| Prevención e investigación | 7, 111-114 | Solicitudes de inspección, evaluación de riesgos, informes, autoridades destinatarias y archivo técnico. |

## Reglas que deben parametrizarse

Aunque el texto vigente menciona valores concretos, deben guardarse con vigencia y
fuente normativa para permitir futuras reformas sin alterar código:

- Porcentaje mínimo de asistencia: 51%.
- Periodicidad ordinaria del control de asistencia: dos meses.
- Anticipaciones y plazos electorales.
- Horarios de guardia y límite de visitas.
- Horas de guardia o formación requeridas para niveles y ascensos.
- Cantidades de inasistencias que restringen la salida a servicios.
- Duración y efectos de licencias, reserva, suspensión y sanciones.

## Modelo de autorización recomendado

- `registrar`: carga hechos y documentos sin decidir consecuencias.
- `revisar`: valida integridad y requisitos.
- `proponer`: eleva ascensos, admisiones, cambios de situación o medidas.
- `resolver`: reservado al órgano competente.
- `notificar`: deja constancia de comunicación al afectado.
- `consultar_restringido`: acceso a expedientes personales o disciplinarios.
- `publicar`: autoriza contenido de comunicación pública.

Una misma persona no debe completar todas las etapas de un procedimiento sensible sin
que quede explícitamente justificada y auditada la excepción.

## Prioridad de implementación derivada

1. Completar Academia, porque condiciona admisión, formación y ascensos.
2. Completar Disciplina y expedientes con debido proceso.
3. Consolidar asistencia bimestral/anual, estados de Personal y elegibilidad operativa.
4. Completar Documentos y libros correlativos.
5. Completar Depósito/Patrimonio y custodia de materiales.
6. Integrar conductores, checklist, radio operador y mando con Guardias y Servicios.
7. Implementar Finanzas con segregación de funciones.
8. Incorporar prevención e investigación de incendios.

## Validación pendiente con autoridades

- Confirmar si existe una reforma posterior al texto aprobado en 2004.
- Confirmar la vigencia exacta de requisitos de edad, formación, horas y porcentajes.
- Definir equivalencias entre categorías/grados históricos y los catálogos actuales.
- Confirmar qué documentos admiten firma electrónica y cuáles requieren libro físico.
- Definir políticas de conservación, confidencialidad y acceso a sumarios.
- Acordar qué indicadores pueden exponerse en la página pública.

