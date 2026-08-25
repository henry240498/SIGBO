---
id: table--seguridad-usuarios
tipo: TABLE
nombre: seguridad.usuarios
nivel: L2
dominio: seguridad
resumen: Tabla seguridad.usuarios (26 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql, 011_seguridad_fase1.sql, 015_perfil_usuario.sql.
tabla: usuarios
archivos:
  - database/migrations/002_seguridad.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/011_seguridad_fase1.sql
  - database/migrations/015_perfil_usuario.sql
edges:
  - [defined_in, file--002-seguridad]
  - [belongs_to, domain--seguridad]
terminos: [seguridad, usuarios, bombero, email, username, password, hash, salt, two, factor, secret, enabled, avatar, url, idioma, zona, horaria, ultimo, acceso, user, agent, intentos, fallidos, bloqueado, hasta, estado, creado, actualizado, debe, cambiar, expira, whatsapp, facebook, instagram]
---

# seguridad.usuarios

Tabla seguridad.usuarios (26 columnas). Creada en 002_seguridad.sql, modificada por 009_foreign_keys.sql, 011_seguridad_fase1.sql, 015_perfil_usuario.sql.

- **Esquema:** seguridad · **Columnas:** 26
- **UNIQUE:** `email`, `username`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| email | NVARCHAR(255) |
| username | NVARCHAR(100) |
| password_hash | NVARCHAR(255) |
| salt | NVARCHAR(64) |
| two_factor_secret | NVARCHAR(255) |
| two_factor_enabled | BIT |
| avatar_url | NVARCHAR(MAX) |
| idioma | NVARCHAR(10) |
| zona_horaria | NVARCHAR(50) |
| ultimo_acceso | DATETIMEOFFSET(3) |
| ip_ultimo_acceso | VARCHAR(45) |
| user_agent | NVARCHAR(MAX) |
| intentos_fallidos | INT |
| bloqueado_hasta | DATETIMEOFFSET(3) |
| estado | NVARCHAR(30) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| debe_cambiar_password | BIT |
| password_expira_en | DATETIMEOFFSET(3) |
| whatsapp | NVARCHAR(30) |
| facebook_url | NVARCHAR(500) |
| instagram_url | NVARCHAR(500) |
| x_url | NVARCHAR(500) |

## Donde se usa

- **Pantallas:** `/dashboard`, `/dashboard/denuncias`, `/dashboard/denuncias/[id]`, `/dashboard/inteligencia`, `/dashboard/mi-perfil`, `/dashboard/mi-perfil/seguridad`, `/dashboard/organizacion`, `/dashboard/seguridad`, `/dashboard/seguridad/inteligencia-artificial`, `/dashboard/seguridad/inteligencia-artificial/auditoria`, `/dashboard/seguridad/inteligencia-artificial/configuracion`, `/dashboard/seguridad/inteligencia-artificial/conversaciones`, `/dashboard/seguridad/inteligencia-artificial/propuestas`, `/dashboard/seguridad/sesiones`, `/dashboard/seguridad/usuarios`, `/dashboard/seguridad/usuarios/[id]`
- **Endpoints:** AuthController, BitacoraController, CertificacionesAcademiaController, DashboardController, DashboardController, DenunciasController, DenunciasPublicasController, IaAdminConversacionesController, IaChatController, MeController, PerfilController, SesionesController, UsuariosController
- **Servicios:** AuthService, BitacoraService, CertificacionesAcademiaService, DashboardService, DenunciasService, IaConversacionesService, PerfilService, SesionesService, UsuariosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/002_seguridad.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/011_seguridad_fase1.sql`
- `database/migrations/015_perfil_usuario.sql`

## Relaciones

- `defined_in` → [[file--002-seguridad|002_seguridad.sql]]
- `belongs_to` → [[domain--seguridad|Seguridad]]

## Referenciado por

- [[table--seguridad-historial-contrasenas|seguridad.historial_contrasenas]] `references` →
- [[table--seguridad-usuario-telefonos|seguridad.usuario_telefonos]] `references` →
- [[table--seguridad-usuario-correos|seguridad.usuario_correos]] `references` →
- [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]] `references` →
- [[table--seguridad-configuracion-valores|seguridad.configuracion_valores]] `references` →
- [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]] `references` →
- [[table--seguridad-configuracion-versiones|seguridad.configuracion_versiones]] `references` →
- [[table--denuncias-denuncias|denuncias.denuncias]] `references` →
- [[table--denuncias-denuncias|denuncias.denuncias]] `references` →
- [[table--denuncias-historial-estados-denuncia|denuncias.historial_estados_denuncia]] `references` →
- [[table--deposito-movimientos|deposito.movimientos]] `references` →
- [[table--deposito-entradas|deposito.entradas]] `references` →
- [[table--deposito-mantenimientos|deposito.mantenimientos]] `references` →
- [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]] `references` →
- [[table--finanzas-turnos-caja|finanzas.turnos_caja]] `references` →
- [[table--finanzas-turnos-caja|finanzas.turnos_caja]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]] `references` →
- [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]] `references` →
- [[table--finanzas-movimientos-bancarios|finanzas.movimientos_bancarios]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-documentos-institucionales|documentos.documentos_institucionales]] `references` →
- [[table--documentos-relaciones|documentos.relaciones]] `references` →
- [[table--documentos-versiones-archivo|documentos.versiones_archivo]] `references` →
- [[table--documentos-expedientes|documentos.expedientes]] `references` →
- [[table--documentos-firmas-documento|documentos.firmas_documento]] `references` →
- [[table--ia-configuraciones|ia.configuraciones]] `references` →
- [[table--ia-historial-configuracion|ia.historial_configuracion]] `references` →
- [[table--ia-conversaciones|ia.conversaciones]] `references` →
- [[table--ia-ejecuciones-herramientas|ia.ejecuciones_herramientas]] `references` →
- [[table--ia-propuestas-mejora|ia.propuestas_mejora]] `references` →
- [[table--ia-propuestas-mejora|ia.propuestas_mejora]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[table--finanzas-socios-protectores|finanzas.socios_protectores]] `references` →
- [[table--finanzas-socios-historial-codigo|finanzas.socios_historial_codigo]] `references` →
- [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]] `references` →
- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[table--finanzas-beneficios-socios|finanzas.beneficios_socios]] `references` →
- [[table--finanzas-aplicaciones-beneficio|finanzas.aplicaciones_beneficio]] `references` →
- [[table--finanzas-numeraciones-comprobantes|finanzas.numeraciones_comprobantes]] `references` →
- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[table--finanzas-facturas|finanzas.facturas]] `references` →
- [[table--finanzas-notas-credito|finanzas.notas_credito]] `references` →
- [[entity--usuario|Usuario]] `persisted_in` →
- [[service--academia-certificaciones-academia|CertificacionesAcademiaService]] `reads` →
- [[service--auth-auth|AuthService]] `reads` →
- [[service--denuncias-denuncias|DenunciasService]] `reads` →
- [[service--guardias-bitacora|BitacoraService]] `reads` →
- [[service--ia-ia-conversaciones|IaConversacionesService]] `reads` →
- [[service--seguridad-dashboard|DashboardService]] `reads` →
- [[service--seguridad-perfil|PerfilService]] `reads` →
- [[service--seguridad-sesiones|SesionesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
