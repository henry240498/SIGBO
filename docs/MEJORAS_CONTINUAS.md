# Registro permanente de mejoras

Este documento resume las mejoras transversales ya aplicadas y los siguientes
pasos que requieren evidencia o decisión institucional. Una capacidad externa no
se marca como implementada sin infraestructura y prueba real.

## Estado

| Área | Estado actual | Próxima acción verificable |
|---|---|---|
| Semántica y teclado | Diálogos compartidos y auditoría estática | Recorrido manual con teclado, lector de pantalla y zoom al 200 % |
| Contraste y preferencias | Preferencias disponibles | Auditoría WCAG manual en flujos críticos |
| Formularios | Límites de entrada y errores accesibles | Asociar todos los errores con su campo y reducir estilos heredados |
| Autenticación | Sesiones revocables; JWT corto en cookie HttpOnly; CSRF | Evaluar MFA sólo con proveedor, enrolamiento y recuperación aprobados |
| Archivos sensibles | Privados y descargables con permiso | Definir retención, clasificación y borrado institucional |
| Publicaciones | Persistencia, estados y programación | Biblioteca de medios aislada, sólo tras definir gobierno de contenidos |
| Rendimiento | Builds de producción y cabeceras de caché | Medir Web Vitals y paginar o virtualizar listados con datos reales |
| Internacionalización | Español fijo | Extraer cadenas únicamente si se aprueba soporte multidioma/RTL |
| PWA/offline/push | No disponible | Requiere estrategia de caché, consentimiento y conflictos aprobada |
| Integraciones externas | No disponibles | Cada integración requiere OAuth, permisos, desconexión y auditoría |
| Pruebas | Unitarias de seguridad, compilación, accesibilidad y CI | Añadir integración/E2E contra entorno controlado sin datos personales |
| Observabilidad | Auditoría funcional y endpoint de salud | Monitoreo y alertas con política de privacidad aprobada |

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
- 2026-08-24: las credenciales de sesión se mueven de almacenamiento accesible
  desde JavaScript a cookies HttpOnly; las operaciones mutables por cookie exigen
  origen permitido y cabecera CSRF.
- 2026-08-24: fojas de servicio, órdenes de guardia, importaciones, firmas y
  perfiles se almacenan como referencias privadas; las rutas públicas heredadas
  de esas carpetas se bloquean.
- 2026-08-24: las migraciones pasan a tener orden explícito y manifiesto SHA-256,
  verificable sin modificar SQL Server mediante `-ValidateOnly`.

## Mejoras aplicadas

- Enlace visible al recibir foco para saltar al contenido principal.
- Región principal enfocable en página pública y panel administrativo.
- Foco visible global sin eliminar el contorno del navegador sin alternativa.
- Modal público con foco inicial, ciclo de foco, cierre mediante Escape y
  restauración al control de origen.
- Auditoría estática de HTML peligroso, `tabIndex` positivo, imágenes sin
  alternativa y pestañas nuevas inseguras.
- Diálogos compartidos de confirmación y entrada con etiquetas ARIA y validación.
- Sesiones invalidadas cuando cambian roles o permisos directos.
- Renovación y cierre de sesión con cookies seguras, límites de tamaño de entrada
  y limitación de solicitudes de autenticación.
- Descarga autenticada de documentos privados con `Cache-Control: no-store` y
  `X-Content-Type-Options: nosniff`.
- Auditoría de accesibilidad y compilación incluidas en GitHub Actions, junto con
  la verificación del manifiesto de migraciones y del grafo de contexto.

## Línea base de refactor heredado

La auditoría de interfaz cubre 105 archivos: no quedan confirmaciones, entradas o
alertas nativas, ni botones sin tipo explícito. CI evita aumentar esta línea base.
Las cargas de sesión se cancelan al desmontar y exponen estados accesibles de carga,
error y procesamiento.
