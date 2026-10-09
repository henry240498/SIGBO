# Fase 2 — contratos API y autorización

Fecha: 2026-10-08. Especificación propuesta; endpoints no implementados. [Arquitectura](FASE_2_ARQUITECTURA.md), [experiencia](FASE_2_EXPERIENCIA.md) y [registro verificable de contratos](evidencia/fase2/contratos.json).

## 1. Convenciones

Prefijo existente `/api/v1`; las bibliotecas cliente pasan rutas relativas. Sesión, refresh, CSRF, `JwtAuthGuard`, `PermissionsGuard` y `ValidationPipe` existentes. No aceptar actor, permiso, estado de validación o responsable arbitrario desde el body. Fechas ISO 8601 con zona explícita; ids UUID y eventos bigint como string.

Cada respuesta GRE lleva `versionContrato: 1`, `versionGreId`, edición, idioma y estado de disponibilidad de la versión. No cambiar el sobre global de respuestas del resto del sistema. Endpoints de estado/importación usan su propia identidad cuando no existe aún una versión validada. Todas las consultas operativas se resuelven contra **una versión**, incluyendo peticiones paralelas de ficha, tabla y fuente.

`versionGreId` omitido en búsqueda inicial usa la activa disponible; la respuesta entrega el id resuelto para las siguientes peticiones. En operaciones de incidente, edición y entrada siempre son explícitas. Un id de entrada de otra versión se rechaza, no se traduce automáticamente por ONU. Versiones históricas validadas son consultables para reproducir decisiones; versiones candidatas solo para administración/revisión.

Paginación de búsqueda: `limite` por defecto 20, máximo 50; cursor opaco vinculado a consulta normalizada, filtros y versión, sin exponer SQL. `q` máximo 120 caracteres; identificador cuatro dígitos como string para conservar ceros; guías tres dígitos. Nombre parcial mínimo dos caracteres. Entrada de tres/cuatro dígitos puede buscar guía/identificador, pero el servidor identifica el tipo de coincidencia. Cero resultados es respuesta 200 vacía; error de servidor no se convierte en «sin coincidencias».

## 2. Capacidades y permisos

No se crean permisos ni se asignan roles en esta fase. Los nuevos se darán de alta junto a la implementación y su migración, sin conceder administración a usuarios de campo. La asignación institucional debe ser explícita y auditable.

| Capacidad | Requisito completo en servidor | Uso |
|---|---|---|
| `C` Consulta | `matpel:consultar`, sesión vigente; versión validada accesible | Catálogo y fuente GRE; no acceso a incidentes ajenos |
| `V` Ver incidente | C **y** acceso al Servicio concedido por el núcleo/Pantallas, con redacción de datos sensibles | Panel/contexto y decisiones autorizadas |
| `R` Registrar | V **y** `servicios:operar`, capacidad vigente para registrar en ese Servicio; estado permite la acción | Identificación, parámetros y evaluaciones; sin convertir registro en decisión de mando |
| `D` Decidir | V **y** `servicios:comandar`, autoridad de mando/delegación acreditada por el núcleo para acción y hora del hecho | Registrar/rectificar decisión o cambiar edición; un administrador técnico no obtiene mando por administrar GRE |
| `A` Administrar | `matpel:administrar_gre`, sesión vigente | Seleccionar documento, solicitar importación, revisar reporte/comparación; no activar solo con este permiso |
| `S` Validar contenido | `matpel:validar_gre`, versión candidata y alcance de revisión | Registrar revisión humana con fundamento. La misma persona puede tener A/S si institución lo autoriza; no imponer doble aprobación inventada |
| `P` Activar | `matpel:activar_gre`, versión VALIDADA, controles críticos satisfechos y revisión esperada del puntero | Activación/recuperación auditada; no valida ni corrige contenido por sí sola |
| `F` OCR/evidencia | R **y** `adjuntos:subir`, autorización al adjunto/Servicio y tipo permitido | Captura y reconocimiento; lectura exige también autorización al adjunto y `adjuntos:ver` |
| `E` Leer evidencia | V **y** `adjuntos:ver`, evidencia/reconocimiento pertenecientes al Servicio y alcance vigente | Consultar foto/candidatos/historial autorizado, sin conceder subir o modificar |
| `G` Posiciones | V **y** permiso GPS/mapa y confidencialidad existentes para la información concreta | Posiciones de personas/móviles. Leer geometría GRE no concede G |

Las filas con **y** son conjunciones. No implementarlas pasando varios permisos a `RequirePermission`, cuyo guard actual usa OR. `MatpelAutorizacionService.exigir(capacidad, usuario, servicio, accion, ocurridoEn)` reúne condiciones y consulta el adaptador del núcleo. Las alternativas institucionales de seguimiento/participación se resuelven allí, no mediante nuevos nombres de rol hardcodeados.

El servidor responde capacidades de presentación (`puedeRegistrar`, `puedeDecidir`, `puedeVerPosiciones`) para controles. Estas no sustituyen autorización en cada petición. Revocación de sesión/permiso/mando entre lectura y guardado se vuelve a verificar. Si no existe contrato de autoridad operativo del núcleo, D queda no disponible con razón; consulta C sigue utilizable.

## 3. Endpoints y efectos

| Id | Método y ruta relativa | Entrada principal | Resultado | Capacidad | Fase |
|---|---|---|---|---|---:|
| API01 | GET `/matpel/estado` | Sin parámetros | Edición activa accesible o estado SIN_EDICION_ACTIVA | C | 4 |
| API02 | GET `/matpel/buscar` | q, versionGreId?, tipo?, limite?, cursor? | Coincidencias por entrada/guía, motivo y fuentes; no asociación automática al incidente | C | 4 |
| API03 | GET `/matpel/materiales/:entradaId` | versionGreId obligatorio | Ficha, referencias por campo, guía y relaciones; varios resultados por ONU se resuelven antes por API02 | C | 4 |
| API04 | GET `/matpel/guias/:numero` | versionGreId obligatorio | Bloques originales ordenados, estado de contenido y fuentes | C | 4 |
| API05 | GET `/matpel/secciones/:seccionId` | versionGreId obligatorio | Contenido completo de instrucciones, glosario, anexos o figura, con fuente | C | 4 |
| API06 | GET `/matpel/tablas/:tablaId` | versionGreId, filtros soportados, limite?, cursor? | Filas/celdas/condiciones/notas paginadas; tabla íntegra navegable | C | 4 |
| API07 | GET `/matpel/fuentes/:referenciaId` | versionGreId obligatorio | Documento, página/etiqueta, fragmento y enlace autorizado a archivo | C | 4 |
| API08 | GET `/matpel/versiones/:versionGreId/archivo` | Referencia exacta de versión | PDF inline autorizado, con ETag/hash; descarga por opción explícita | C | 4 |
| API09 | POST `/matpel/evaluaciones/consulta` | EvaluacionConsultaDto | Selección/exposición de reglas sin crear incidente, snapshot operativo ni cronología | C | 4 |
| API10 | GET `/servicios/:servicioId/matpel` | Sin parámetros | Contexto y revisión, identificaciones, capacidades; CONTEXTO_NO_REGISTRADO si no existe | V | 6 |
| API11 | PUT `/servicios/:servicioId/matpel/contexto` | GuardarContextoDto | Contexto guardado, nueva revisión y evento | R | 6 |
| API12 | GET `/servicios/:servicioId/matpel/panel` | revision? | Guía pertinente, evaluación vigente o marcada desactualizada, advertencias, recursos permitidos y decisiones | V | 6 |
| API13 | POST `/servicios/:servicioId/matpel/evaluaciones` | GuardarEvaluacionDto | Snapshot persistido desde contexto de esa revisión; mismo motor que API09 | R | 6 |
| API14 | GET `/servicios/:servicioId/matpel/decisiones` | limite?, cursor? | Decisiones y rectificaciones autorizadas, con evaluaciones históricas | V | 6 |
| API15 | POST `/servicios/:servicioId/matpel/decisiones` | RegistrarDecisionDto | Decisión inmutable, responsable acreditado y evento; sin ejecutar orden externa | D | 6 |
| API16 | POST `/servicios/:servicioId/matpel/edicion` | CambiarEdicionDto | Nueva revisión/contexto tras selección explícita de versión y entradas correspondientes; anterior conservado | D | 6 |
| API17 | GET `/servicios/:servicioId/matpel/mapa` | evaluacionId | Geometrías/versiones y estado; posiciones solo con G | V, G solo para posiciones | 7 |
| API18 | POST `/servicios/:servicioId/matpel/reconocimientos` | ReconocerFotoDto | Candidatos y evidencia propia del Servicio; no altera identificación | F | 8 |
| API19 | GET `/matpel/versiones/:versionGreId/paquete` | formato compatible de paquete | Manifest/catálogo/PDF de versión validada; sin datos de incidentes | C | 9 |
| API20 | GET `/matpel/administracion/documentos` | Sin rutas locales del cliente | Fuentes detectadas mediante ids de selección, identidad y candidatos | A | 3 |
| API21 | POST `/matpel/administracion/importaciones` | SolicitarImportacionDto | 202, id de trabajo existente/nuevo; worker procesa fuera del request | A | 3 |
| API22 | GET `/matpel/administracion/importaciones/:importacionId` | Sin parámetros | Estado, progreso, reporte y errores con página/parser | A | 3 |
| API23 | POST `/matpel/administracion/versiones/:versionGreId/revisiones` | RegistrarRevisionDto | Revisión/hallazgo con fundamento; no sobrescribe catálogo publicado | S | 3 |
| API24 | GET `/matpel/administracion/comparacion` | versionAnteriorId, versionCandidataId | Diferencias de texto, tablas, entradas y señales con fuente | A | 3 |
| API25 | POST `/matpel/administracion/activacion` | ActivarVersionDto | Puntero actualizado, nueva revisión y auditoría; admite recuperación de una versión validada previa | P | 3 |
| API26 | GET `/servicios/:servicioId/matpel/reconocimientos/:reconocimientoId` | Sin parámetros | Estado de trabajo OCR, candidatos y evidencia autorizada; misma versión consultada | E | 8 |
| API27 | GET `/matpel/administracion/versiones/:versionGreId/registros` | tipoRegistro, filtros soportados, limite?, cursor? | Registros candidatos, hallazgos y referencias para revisar dato ↔ fuente | A o S | 3 |
| API28 | GET `/matpel/administracion/versiones/:versionGreId/fuentes/:referenciaId` | Sin parámetros | Fuente/fragmento de candidato o versión conservada, sin publicación operacional | A o S | 3 |
| API29 | GET `/matpel/administracion/versiones/:versionGreId/archivo` | Sin parámetros | PDF autorizado para revisión de la versión; nunca una ruta arbitraria | A o S | 3 |
| API30 | GET `/matpel/administracion/versiones` | estado?, limite?, cursor? | Versiones candidatas/conservadas y estado; lista para administrar, revisar o activar | A o S o P | 3 |

API09 es POST por tamaño/estructura de parámetros; no es una mutación de incidente. Su entrada excluye servicioId, actor o decisión. API10/12 no crean contexto al leer. API11 crea inicialmente solo si no existe y `versionEsperada = 0`; posteriores guardados requieren revisión vigente y cuerpo completo. Si cambia identificación y parámetros en una acción, registra un evento principal con ambos cambios. Añadir `MATPEL_CONTEXTO_CREADO` al contrato de eventos del núcleo para la creación inicial.

API18 devuelve 202 con reconocimientoId si el proceso no terminó; API26 permite consultar estado/candidatos. Un reconocimiento puede iniciarse antes de crear contexto, con revisión 0 y evidencia del mismo Servicio; no crea identificación ni atribuye certeza. La confirmación ocurre en API11, tras revisar candidato/corrección.

API08 solo sirve la referencia privada registrada para la versión; no acepta ruta/url arbitraria. Archivo se selecciona por FK/hash conocido, MIME comprobado y sesión. Una fuente en revisión no se vuelve pública por adivinar su UUID. API20 no devuelve rutas absolutas de la máquina. API21 selecciona una fuente registrada, no una orden de shell ni un archivo ajeno.

API27–29 permiten revisión de candidatos sin abrirlos a C ni exigir a un revisor permiso de importación. «A o S» es alternativa explícita OR en esas lecturas; cada capacidad conserva sus restricciones de escritura. API30 da selección de versiones a los tres perfiles administrativos, pero P por sí sola no permite consultar registros candidatos, corregir, revisar o importar. Estas alternativas no alteran las conjunciones de alcance/autoridad de V/R/D/F/G.

API17 exige V para las capas GRE sobre una ubicación accesible; G es adicional solo para posiciones/datos protegidos. Antes de devolver GeoJSON, caja envolvente o inputs de una evaluación, comprobar acceso a la ubicación base: una geometría no puede revelar por inferencia coordenadas que el núcleo oculta. Si la ubicación no es visible, responder geometría no disponible y conservar distancias textuales autorizadas. Historial/panel también redactan inputs/evidencias sensibles; el snapshot íntegro permanece protegido en servidor.

## 4. DTOs propuestos

Las siguientes declaraciones describen tipos, sin registros de ejemplo. La implementación añadirá decoradores y validación de coherencia; propiedades adicionales se rechazan.

```ts
type Certeza = 'DESCONOCIDO' | 'NO_CONFIRMADO' | 'ESTIMADO' | 'CONFIRMADO';
type OrigenDato = 'OPERADOR' | 'SIGBO' | 'METEOROLOGIA' | 'OCR';
type Dato<T> = {
  valor: T | null;
  certeza: Certeza;
  origen: OrigenDato;
  observadoEn: string | null;
  evidenciaId: string | null;
  fuenteDatoId: string | null;
};
type Cantidad = { valorDecimal: string; unidad: 'L' | 'm3' | 'kg' | 't' };
type Viento = {
  velocidadDecimal: string | null;
  unidad: 'km/h' | 'mph' | 'm/s' | null;
  direccionDesdeGrados: number | null;
  proveedorId: string | null;
};
type ParametrosMatpel = {
  eventos: Dato<Array<'DERRAME' | 'FUGA' | 'INCENDIO' | 'EXPLOSION' | 'OTRO'>>;
  incendio: Dato<boolean>;
  cantidad: Dato<Cantidad>;
  contactoAgua: Dato<'TIERRA' | 'AGUA' | 'AMBOS'>;
  periodo: Dato<'DIA' | 'NOCHE'>;
  contenedor: Dato<string>;
  viento: Dato<Viento>;
  ubicacion: Dato<{ latitud: number; longitud: number; precisionM: number | null }>;
};
type IdentificacionMatpel = {
  identificacionId: string | null;
  observacionOriginal: string | null;
  entradaId: string | null;
  certeza: Certeza;
  metodo: 'MANUAL' | 'PLACA' | 'OCR' | 'DESCONOCIDO';
  evidenciaId: string | null;
  reconocimientoId: string | null;
};
type MutacionMatpel = {
  versionEsperada: number;
  claveIdempotencia: string;
  ocurridoEn: string;
};
type EvaluacionConsultaDto = {
  versionGreId: string;
  entradaIds: string[];
  parametros: ParametrosMatpel;
};
type GuardarContextoDto = MutacionMatpel & {
  versionGreId: string;
  identificaciones: IdentificacionMatpel[];
  parametros: ParametrosMatpel;
};
type GuardarEvaluacionDto = MutacionMatpel;
type RegistrarDecisionDto = MutacionMatpel & {
  evaluacionId: string | null;
  texto: string;
  fundamento: string;
  referenciasConsultadas: string[];
  tipo: 'REGISTRO' | 'RECTIFICACION' | 'ANULACION';
  decisionAnteriorId: string | null;
};
type CambiarEdicionDto = MutacionMatpel & {
  versionGreId: string;
  identificaciones: IdentificacionMatpel[];
  motivo: string;
};
type ReconocerFotoDto = MutacionMatpel & { adjuntoId: string };
type SolicitarImportacionDto = { documentoSeleccionId: string; claveIdempotencia: string };
type RegistrarRevisionDto = {
  revisionEsperada: number;
  referenciaId: string;
  resultado: 'VERIFICADO' | 'HALLAZGO';
  fundamento: string;
  claveIdempotencia: string;
};
type ActivarVersionDto = {
  versionGreId: string;
  revisionActivacionEsperada: number;
  motivo: string;
  claveIdempotencia: string;
};
```

Unidades iniciales de cantidad para captura; si la fuente usa otra, ampliar el catálogo/contrato de forma explícita. Conversiones de volumen/massa del mismo tipo pueden ser exactas; **kg → L no** sin dato de densidad respaldado y contexto aplicable. Para R16 la cantidad desconocida o en masa sin conversión respaldada mantiene la selección indeterminada. No determinar «pequeño» por el tamaño del envase si el volumen realmente liberado es desconocido.

Validaciones: decimal no negativo y finito, sin notación ambigua; latitud −90..90, longitud −180..180, dirección 0 inclusive a 360 exclusiva; unidad de velocidad requerida con valor; `DESCONOCIDO → valor null`; confirmado/estimado exige valor. Observar «incendio» explícitamente; eventos pueden coexistir, pero INCENDIO + incendio confirmado falso es contradicción que se devuelve para corregir. Contenedor solo acepta código existente en esa versión para selección tabular; desconocido no fuerza coincidencia.

OCR: entrada no confirmada por resultado automático; si método OCR y certeza CONFIRMADO, servidor comprueba reconocimiento/evidencia, candidato o corrección registrada y confirmación humana de esa acción. IdentificaciónId pertenece al contexto; entrada, referencia y evaluación pertenecen a la versión del contexto. Para RECTIFICACION/ANULACION, decisionAnteriorId obligatorio y del mismo Servicio. El texto anterior permanece intacto. Responsable se obtiene/verifica mediante el núcleo; esta primera entrega no acepta atribuir una decisión a otra persona desde el body.

Fechas futuras/antiguas, límites de escritura, tamaño y retención se parametrizan conforme a políticas existentes; el servidor registra ajustes que realice `instanteDelHecho`. El body no manda precisión ficticia ni hora observada de un proveedor sin fuente verificable.

`origen` del body es una declaración, no una acreditación. SIGBO/METEOROLOGIA requieren fuenteDatoId verificable, valor y hora coincidentes con una observación/cálculo conservados y autorizados; el servidor reconstruye metadatos desde ella. Un valor escrito a mano es OPERADOR, aunque el usuario indique un proveedor. OCR requiere evidencia/reconocimiento propios. API09 muestra parámetros de consulta como declarados, sin certificar medición; las respuestas nunca atribuyen origen externo solo por recibir esa etiqueta del cliente.

## 5. Respuesta operacional

| Grupo | Campos necesarios |
|---|---|
| Identidad | versionContrato, versionGreId, edición, idioma, revisión de contexto y motorVersion |
| Evaluación | estado por apartado, inputs canónicos/hash, faltantes/contradicciones, reglas aplicadas, advertencias, fuentes y fecha |
| Valor de fuente | original, valorDecimal cuando existe, unidad, modificador y referenciaIds; referencias de encabezado/nota junto a celda |
| Procedencia | GRE / OPERADOR / SIGBO / METEOROLOGIA / CALCULADO / DECISION_SCI como rótulos de presentación; calidad separada |
| Historial | evaluacionId, eventoId, decisionId si corresponde, hora del hecho/registro, revisión y estado de vigencia |
| Geometría | tipo/finalidad, GeoJSON, distancia base/fuentes, convención de viento y inputs; NO_DETERMINADA con motivo si falta dato |

Una fila con «Consulte tabla 3» devuelve referencia, no distancia null que se pueda confundir con cero. `11.0+` mantiene modificador y nota. Un resultado NO_APLICABLE explica la regla excluyente; INDETERMINADO enumera datos necesarios; DATOS_NO_DISPONIBLES identifica contenido fallido/no validado y ofrece fuente. Ningún estado se etiqueta «sin riesgo».

Consulta inicial resuelve versión, coincidencias y ficha en peticiones cortas; detalle/API03 incluye los bloques críticos pertinentes y referencias, evitando una petición independiente por cada tarjeta. Guía íntegra, anexos, tablas grandes y PDF se cargan al abrir. OCR/job administrativo devuelven trabajo/candidatos sin bloquear consultas de otros usuarios.

## 6. Errores, reintentos y conflictos

| HTTP / código de dominio | Significado | Comportamiento cliente |
|---|---|---|
| 400 `ENTRADA_INVALIDA` | Forma, límites, propiedades extra, dato/certeza contradictorios | Mensaje junto al control; conservar entrada |
| 401 | Sesión expirada | Refresh existente; preservar borrador con alcance de sesión y pedir ingreso si falla |
| 403 `ACCESO_DENEGADO` | Permiso, alcance o autoridad no vigentes | Informar acción no disponible; no reintentar como otro usuario ni transformar en registro confirmado |
| 404 `RECURSO_NO_DISPONIBLE` | Entrada/versión/referencia inexistente o recurso no visible | No divulgar existencia de incidente ajeno; conservar búsqueda |
| 409 `VERSION_EN_CONFLICTO` | Nueva acción sobre revisión antigua | Mostrar revisión actual y diferencias autorizadas; preservar borrador para revisión humana |
| 409 `IDEMPOTENCIA_EN_CONFLICTO` | Clave ya usada por otra acción/entrada | Detener reintento; no generar nueva clave para repetir automáticamente |
| 409 `VERSION_NO_VALIDADA` / `SIN_EDICION_ACTIVA` | No se puede usar/activar el catálogo solicitado | Informar estado y fuente autorizada si existe; no sustituir otra edición silenciosamente |
| 413 | Archivo/body supera límite | Explicar límite y permitir nuevo archivo/entrada manual |
| 422 `CONDICIONES_CONTRADICTORIAS` | Datos válidos en forma, incompatibles para selección | Explicar conflicto; no inventar salida |
| 429 / 503 | Límite temporal o dependencia no disponible | Reintento acotado; mantener última información marcada con fecha, fuente y revisión |

Falta de cantidad/viento es resultado normal INDETERMINADO, no error 422 por sí misma. Reintento de acción ya aplicada se devuelve como éxito con mismos ids/revisión guardada, aunque la revisión global haya avanzado; se muestra además revisión actual para recarga. Nunca repetir efectos por un timeout de red. La autorización se revalida incluso para recuperar respuesta idempotente.

El sobre de error nuevo añade código de dominio, mensaje claro, requestId y detalles autorizados a las convenciones Nest existentes; no incluye stacks, rutas privadas ni información de otro Servicio. Logs operativos usan identificadores, versión/parser/página cuando proceda; no guardan fotografías, texto libre personal o consultas como contenido completo por defecto.

## 7. Validación antes de implementar

Verificar registro de permisos, rutas estáticas antes de parámetros, DTOs sin propiedades adicionales, matriz AND, revisiones obligatorias, idempotencia y fuentes de la misma versión. Casos negativos: usuario con C sin acceso al Servicio, participante sin mando, admin GRE sin D, referencia de otra versión, clave con payload distinto y revocación durante el guardado.

Los contratos de D y acciones sobre Servicio dependen del núcleo y de la revisión del Reglamento original indicada en [arquitectura](FASE_2_ARQUITECTURA.md). Eso no impide publicar la consulta documental en fases 4–5 cuando el catálogo esté validado.
