# Registro permanente de mejoras

Este documento resume y prioriza el listado de criterios entregado para SIGBO. Se actualiza en cada iteración; una capacidad externa nunca se marca como implementada sin infraestructura y prueba real.

## Estado

| Área | Estado actual | Próxima acción verificable |
|---|---|---|
| Semántica y teclado | En revisión continua | Sustituir confirmaciones nativas y completar patrones de foco en todos los overlays |
| Contraste y preferencias | Implementado parcialmente | Ejecutar auditoría WCAG automatizada y manual con zoom 200 % |
| Formularios | Implementado parcialmente | Asociar errores por campo y eliminar estilos inline heredados gradualmente |
| Autenticación | Sesiones, bloqueo y renovación reales | Migrar tokens de `localStorage` a cookies HttpOnly mediante cambio coordinado de API |
| MFA/biometría | No disponible | Requiere proveedor, enrolamiento, recuperación y auditoría reales |
| Publicaciones | Persistencia SQL, estados y programación | Incorporar biblioteca de medios y optimización de imágenes en servidor |
| Rendimiento | Builds optimizados de Next | Medir Core Web Vitals y paginar/virtualizar listados de mayor volumen |
| Internacionalización | Español fijo | Extraer cadenas solo si se aprueba soporte multidioma/RTL |
| PWA/offline/push | No disponible | Requiere estrategia de caché, consentimiento y resolución de conflictos |
| Integraciones externas | No disponibles | Cada integración requerirá OAuth, permisos, desconexión y registro de actividad |
| Pruebas | Build y smoke tests | Añadir pruebas unitarias, integración, E2E y accesibilidad a CI |
| Observabilidad | Auditoría funcional | Incorporar monitoreo y alertas con política de privacidad aprobada |

## Criterios para priorizar

1. Riesgo para personas, datos, autenticación o continuidad operativa.
2. Barreras de accesibilidad y tareas que impiden completar operaciones.
3. Integridad, auditoría y recuperación de datos.
4. Rendimiento medido en flujos reales.
5. Conveniencia, personalización e integraciones opcionales.

## Registro de decisiones

- 2026-08-11: se adopta `AGENTS.md` como estándar permanente del repositorio.
- 2026-08-11: no se simulan MFA, biometría, push, offline, colaboración o integraciones.
- 2026-08-11: se priorizan skip links, foco de modal, Escape, estados dinámicos y controles automáticos antes de funciones ornamentales.

## Mejoras aplicadas en la auditoría inicial

- Enlace visible al recibir foco para saltar al contenido principal.
- Región principal enfocable en página pública y panel administrativo.
- Foco visible global sin eliminar el contorno del navegador sin alternativa.
- Modal público con foco inicial, ciclo de foco, cierre mediante Escape y restauración al control de origen.
- Auditoría estática de `dangerouslySetInnerHTML`, `tabIndex` positivo, imágenes sin `alt` y pestañas nuevas inseguras.
- Auditoría incorporada a GitHub Actions junto con la compilación.
- Línea base de deuda heredada en CI: una entrega no puede aumentar confirmaciones nativas, botones sin tipo, estilos inline ni usos de `any`.
- Anuncio accesible de cambios de ruta y estados globales de carga, error y pérdida de conexión.
- Sincronización de cierre de sesión entre pestañas mediante eventos de almacenamiento.
- Panel global de preferencias con foco inicial, ciclo de foco, Escape y restauración del foco.

## Línea base de refactor heredado

La auditoría completa cubre 61 archivos de interfaz. La línea base actual es: 23 confirmaciones nativas, 207 botones heredados sin tipo explícito, 1636 estilos inline y 85 usos de `any`. CI impide que estas cifras aumenten. No se realizan reemplazos masivos porque podrían cambiar accidentalmente envíos de formularios o acciones destructivas; la reducción se hace por módulo con pruebas del flujo afectado.

- Segunda etapa: diálogo de confirmación compartido aplicado a sesiones propias, sesiones administrativas, Publicaciones, Roles y Permisos.
- Las cargas de sesiones se cancelan al desmontar y exponen estados accesibles de error, carga y procesamiento.
