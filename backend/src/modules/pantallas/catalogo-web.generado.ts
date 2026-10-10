// GENERADO por frontend/scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: cd frontend; npm run generar:pantallas

import type { AccionForzada, PantallaCatalogo } from './matriz-web.logica';

export const PANTALLAS_WEB: PantallaCatalogo[] = [
  {
    "codigo": "0xB001",
    "ruta": "/dashboard/academia",
    "nombre": "Actividades",
    "modulo": "academia",
    "prefijo": "academia:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/academia/actividades/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/evaluaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/instructores"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/actividades/*/instructores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/academia/actividades/*/participantes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.docx"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/sesiones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/certificaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/cursos-externos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/cursos-externos/refrescar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/evaluaciones/*/notas"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/academia/evaluaciones/*/notas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/instructores-externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/instructores-externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/certificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/certificaciones"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/certificaciones/*"
      }
    ]
  },
  {
    "codigo": "0xB002",
    "ruta": "/dashboard/academia/[id]",
    "nombre": "Detalle de curso",
    "modulo": "academia",
    "prefijo": "academia:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/academia/actividades/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/evaluaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/instructores"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/actividades/*/instructores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/academia/actividades/*/participantes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.docx"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/sesiones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/certificaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/cursos-externos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/cursos-externos/refrescar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/evaluaciones/*/notas"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/academia/evaluaciones/*/notas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/instructores-externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/instructores-externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/certificaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/certificaciones"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/certificaciones/*"
      }
    ]
  },
  {
    "codigo": "0xB003",
    "ruta": "/dashboard/academia/cursos-externos",
    "nombre": "Cursos externos (OBA)",
    "modulo": "academia",
    "prefijo": "academia:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/academia/actividades/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/evaluaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/instructores"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/actividades/*/instructores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/academia/actividades/*/participantes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.docx"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/sesiones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/certificaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/cursos-externos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/cursos-externos/refrescar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/evaluaciones/*/notas"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/academia/evaluaciones/*/notas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/instructores-externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/instructores-externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/certificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/certificaciones"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/certificaciones/*"
      }
    ]
  },
  {
    "codigo": "0xB004",
    "ruta": "/dashboard/academia/instructores-externos",
    "nombre": "Instructores externos",
    "modulo": "academia",
    "prefijo": "academia:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/academia/actividades/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/evaluaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/instructores"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/actividades/*/instructores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/academia/actividades/*/participantes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.docx"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/sesiones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/certificaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/cursos-externos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/cursos-externos/refrescar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/evaluaciones/*/notas"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/academia/evaluaciones/*/notas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/instructores-externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/instructores-externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/certificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/certificaciones"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/certificaciones/*"
      }
    ]
  },
  {
    "codigo": "0xB005",
    "ruta": "/dashboard/asistencia",
    "nombre": "Resumen",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB006",
    "ruta": "/dashboard/asistencia/auditoria",
    "nombre": "Auditoría",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/auditoria"
      }
    ]
  },
  {
    "codigo": "0xB007",
    "ruta": "/dashboard/asistencia/ausencias",
    "nombre": "Ausencias",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/adjuntos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/adjuntos/*/archivo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ausencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ausencias/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ausencias/*/decision"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      }
    ]
  },
  {
    "codigo": "0xB008",
    "ruta": "/dashboard/asistencia/eventos",
    "nombre": "Eventos",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB009",
    "ruta": "/dashboard/asistencia/eventos/[id]",
    "nombre": "Detalle de evento de asistencia",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB00A",
    "ruta": "/dashboard/asistencia/externos",
    "nombre": "Personas externas",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB00B",
    "ruta": "/dashboard/asistencia/registro",
    "nombre": "Registro",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB00C",
    "ruta": "/dashboard/asistencia/tolerancias",
    "nombre": "Tolerancias",
    "modulo": "asistencia",
    "prefijo": "asistencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB00D",
    "ruta": "/dashboard/denuncias",
    "nombre": "Denuncias",
    "modulo": "denuncias",
    "prefijo": "denuncias:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/denuncias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/denuncias/publicas/categorias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/denuncias/publicas/servicios"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/denuncias/resumen"
      }
    ]
  },
  {
    "codigo": "0xB00E",
    "ruta": "/dashboard/denuncias/[id]",
    "nombre": "Detalle de denuncia",
    "modulo": "denuncias",
    "prefijo": "denuncias:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/denuncias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/denuncias/*/archivos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/denuncias/*/asignar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/denuncias/*/estado"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/denuncias/asignables"
      }
    ]
  },
  {
    "codigo": "0xB00F",
    "ruta": "/dashboard/deposito",
    "nombre": "Resumen",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB010",
    "ruta": "/dashboard/deposito/articulos",
    "nombre": "Artículos",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB011",
    "ruta": "/dashboard/deposito/articulos/[id]",
    "nombre": "Ficha de artículo",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB012",
    "ruta": "/dashboard/deposito/bajas",
    "nombre": "Bajas",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB013",
    "ruta": "/dashboard/deposito/categorias",
    "nombre": "Categorías",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB014",
    "ruta": "/dashboard/deposito/entradas",
    "nombre": "Entradas",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      }
    ]
  },
  {
    "codigo": "0xB015",
    "ruta": "/dashboard/deposito/incidencias",
    "nombre": "Incidencias",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB016",
    "ruta": "/dashboard/deposito/inventarios-fisicos",
    "nombre": "Inventarios físicos",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB017",
    "ruta": "/dashboard/deposito/inventarios-fisicos/[id]",
    "nombre": "Detalle de inventario físico",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      }
    ]
  },
  {
    "codigo": "0xB018",
    "ruta": "/dashboard/deposito/mantenimientos",
    "nombre": "Mantenimientos",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB019",
    "ruta": "/dashboard/deposito/movimientos",
    "nombre": "Movimientos",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB01A",
    "ruta": "/dashboard/deposito/prestamos",
    "nombre": "Préstamos",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB01B",
    "ruta": "/dashboard/deposito/proveedores",
    "nombre": "Proveedores",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB01C",
    "ruta": "/dashboard/deposito/ubicaciones",
    "nombre": "Ubicaciones",
    "modulo": "deposito",
    "prefijo": "deposito:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cuarteles"
      }
    ]
  },
  {
    "codigo": "0xB01D",
    "ruta": "/dashboard/documentos",
    "nombre": "Resumen",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB01E",
    "ruta": "/dashboard/documentos/[id]",
    "nombre": "Detalle de documento",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos"
      }
    ]
  },
  {
    "codigo": "0xB01F",
    "ruta": "/dashboard/documentos/auditoria",
    "nombre": "Auditoría",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB020",
    "ruta": "/dashboard/documentos/expedientes",
    "nombre": "Expedientes",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB021",
    "ruta": "/dashboard/documentos/expedientes/[id]",
    "nombre": "Detalle de expediente",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB022",
    "ruta": "/dashboard/documentos/listado",
    "nombre": "Documentos",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB023",
    "ruta": "/dashboard/documentos/plantillas",
    "nombre": "Plantillas",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos"
      }
    ]
  },
  {
    "codigo": "0xB024",
    "ruta": "/dashboard/documentos/vencimientos",
    "nombre": "Vencimientos",
    "modulo": "documentos",
    "prefijo": "documentos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB025",
    "ruta": "/dashboard/equipos",
    "nombre": "Equipos",
    "modulo": "equipos",
    "prefijo": "equipos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      }
    ]
  },
  {
    "codigo": "0xB026",
    "ruta": "/dashboard/equipos/[id]",
    "nombre": "Ficha de equipo",
    "modulo": "equipos",
    "prefijo": "equipos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB027",
    "ruta": "/dashboard/equipos/categorias",
    "nombre": "Categorías",
    "modulo": "equipos",
    "prefijo": "equipos:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/equipos/categorias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/equipos/equipos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/equipos/equipos/*/asignar-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/equipos/equipos/*/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      }
    ]
  },
  {
    "codigo": "0xB028",
    "ruta": "/dashboard/finanzas",
    "nombre": "Resumen",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB029",
    "ruta": "/dashboard/finanzas/beneficios",
    "nombre": "Beneficios",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/academia/actividades/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/evaluaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/instructores"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/actividades/*/instructores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/academia/actividades/*/participantes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.docx"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/sesiones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/certificaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/cursos-externos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/cursos-externos/refrescar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/evaluaciones/*/notas"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/academia/evaluaciones/*/notas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/instructores-externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/instructores-externos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/acuerdos-aporte"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/acuerdos-aporte/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/aportes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/comprobante"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/beneficios"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/beneficios/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/beneficios/simular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/facturas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/archivo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/notas-credito"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/numeraciones-comprobantes"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/socios-protectores"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/finanzas/socios-protectores/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/estado-de-cuenta"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/historial-codigo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/certificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/certificaciones"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/certificaciones/*"
      }
    ]
  },
  {
    "codigo": "0xB02A",
    "ruta": "/dashboard/finanzas/cajas",
    "nombre": "Cajas",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB02B",
    "ruta": "/dashboard/finanzas/cuentas-bancarias",
    "nombre": "Cuentas bancarias",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB02C",
    "ruta": "/dashboard/finanzas/cuotas",
    "nombre": "Cuotas",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB02D",
    "ruta": "/dashboard/finanzas/ejercicios-fiscales",
    "nombre": "Ejercicios fiscales",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB02E",
    "ruta": "/dashboard/finanzas/facturacion",
    "nombre": "Facturación",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/acuerdos-aporte"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/acuerdos-aporte/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/aportes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/comprobante"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/beneficios"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/beneficios/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/beneficios/simular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/facturas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/archivo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/notas-credito"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/numeraciones-comprobantes"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/socios-protectores"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/finanzas/socios-protectores/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/estado-de-cuenta"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/historial-codigo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB02F",
    "ruta": "/dashboard/finanzas/movimientos",
    "nombre": "Movimientos",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB030",
    "ruta": "/dashboard/finanzas/movimientos-bancarios",
    "nombre": "Conciliación",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB031",
    "ruta": "/dashboard/finanzas/ordenes-pago",
    "nombre": "Órdenes de pago",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB032",
    "ruta": "/dashboard/finanzas/presupuesto",
    "nombre": "Presupuesto",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB033",
    "ruta": "/dashboard/finanzas/socios-protectores",
    "nombre": "Socios protectores",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/acuerdos-aporte"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/acuerdos-aporte/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/aportes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/comprobante"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/beneficios"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/beneficios/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/beneficios/simular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/facturas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/archivo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/notas-credito"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/numeraciones-comprobantes"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/socios-protectores"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/finanzas/socios-protectores/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/estado-de-cuenta"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/historial-codigo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB034",
    "ruta": "/dashboard/finanzas/socios-protectores/[id]",
    "nombre": "Ficha de socio protector",
    "modulo": "finanzas",
    "prefijo": "finanzas:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/acuerdos-aporte"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/acuerdos-aporte/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/aportes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/aportes/comprobante"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/beneficios"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/finanzas/beneficios/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/beneficios/simular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cajas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cajas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/abrir"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cajas/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turno-abierto"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/cajas/*/turnos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuentas-bancarias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/cuentas-bancarias/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/cuotas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/exonerar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/cuotas/*/pagar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/deposito/entradas-sin-registrar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/deposito/entradas/*/registrar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ejercicios-fiscales"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/cerrar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/ejercicios-fiscales/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/facturas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/facturas/archivo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos-bancarios/*/conciliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/movimientos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/movimientos/*/documento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/notas-credito"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/numeraciones-comprobantes"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/finanzas/ordenes-pago/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/presupuestos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/finanzas/presupuestos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/reportes/movimientos/*/comprobante.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/finanzas/socios-protectores"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/finanzas/socios-protectores/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/estado-de-cuenta"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/finanzas/socios-protectores/*/historial-codigo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB035",
    "ruta": "/dashboard/guardias",
    "nombre": "Guardias",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB036",
    "ruta": "/dashboard/guardias/[id]",
    "nombre": "Detalle de guardia",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB037",
    "ruta": "/dashboard/guardias/auditoria",
    "nombre": "Auditoría",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/auditoria"
      }
    ]
  },
  {
    "codigo": "0xB038",
    "ruta": "/dashboard/guardias/esquemas-horario",
    "nombre": "Esquemas de horario",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB039",
    "ruta": "/dashboard/guardias/generar",
    "nombre": "Generar",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*/archivos/pdf"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB03A",
    "ruta": "/dashboard/guardias/grupos",
    "nombre": "Grupos",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB03B",
    "ruta": "/dashboard/guardias/grupos/[id]",
    "nombre": "Detalle de grupo de guardia",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB03C",
    "ruta": "/dashboard/guardias/ordenes",
    "nombre": "Órdenes de guardia",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB03D",
    "ruta": "/dashboard/guardias/ordenes/[id]",
    "nombre": "Detalle de orden de guardia",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*/archivos/docx"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*/archivos/pdf"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB03E",
    "ruta": "/dashboard/guardias/ordenes/configuracion",
    "nombre": "Configuración de órdenes",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos"
      }
    ]
  },
  {
    "codigo": "0xB03F",
    "ruta": "/dashboard/guardias/ordenes/nueva",
    "nombre": "Nueva orden de guardia",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB040",
    "ruta": "/dashboard/guardias/pernoctes",
    "nombre": "Pernoctes",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB041",
    "ruta": "/dashboard/guardias/planificacion",
    "nombre": "Planificación",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB042",
    "ruta": "/dashboard/guardias/requisitos",
    "nombre": "Requisitos de rol",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/rangos"
      }
    ]
  },
  {
    "codigo": "0xB043",
    "ruta": "/dashboard/guardias/sorteos",
    "nombre": "Sorteos",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB044",
    "ruta": "/dashboard/guardias/sorteos/[id]",
    "nombre": "Detalle de sorteo",
    "modulo": "guardias",
    "prefijo": "guardias:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB045",
    "ruta": "/dashboard/inteligencia",
    "nombre": "Inteligencia artificial",
    "modulo": "inteligencia",
    "prefijo": "inteligencia:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/auditoria"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/ia/admin/config"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar-predefinido"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/eliminar-definitivamente"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/historial"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/ollama/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-conexion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-generacion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/piper/probar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/voces"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/whisper/estado"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/ia/admin/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones/*/ejecuciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard/uso-por-herramienta"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ia/admin/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ia/admin/propuestas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/enviar-revision"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/rechazar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/chat"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/perfil"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/hablar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/transcribir"
      }
    ]
  },
  {
    "codigo": "0xB046",
    "ruta": "/dashboard/organizacion",
    "nombre": "Resumen",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/dashboard"
      }
    ]
  },
  {
    "codigo": "0xB047",
    "ruta": "/dashboard/organizacion/ascensos",
    "nombre": "Ascensos",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/ascensos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/ascensos/*/anular"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/ascensos/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/ascensos/exportar/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/rangos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      }
    ]
  },
  {
    "codigo": "0xB048",
    "ruta": "/dashboard/organizacion/brigadas",
    "nombre": "Brigadas",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/brigadas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/brigadas/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/brigadas/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/brigadas/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/brigadas/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/brigadas/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB049",
    "ruta": "/dashboard/organizacion/cargos",
    "nombre": "Cargos",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/cargos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/cargos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/cargos/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/cargos/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB04A",
    "ruta": "/dashboard/organizacion/companias",
    "nombre": "Compañías",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/companias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/companias/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/companias/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/companias/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/companias/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/companias/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB04B",
    "ruta": "/dashboard/organizacion/cuarteles",
    "nombre": "Cuarteles",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/companias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/cuarteles"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/cuarteles/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/cuarteles/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/cuarteles/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cuarteles/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cuarteles/exportar/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      }
    ]
  },
  {
    "codigo": "0xB04C",
    "ruta": "/dashboard/organizacion/departamentos",
    "nombre": "Departamentos",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/departamentos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/departamentos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/departamentos/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/departamentos/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/departamentos/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/departamentos/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB04D",
    "ruta": "/dashboard/organizacion/designaciones",
    "nombre": "Designaciones",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/companias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cuarteles"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/designaciones"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/designaciones/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/designaciones/*/finalizar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/designaciones/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/designaciones/exportar/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      }
    ]
  },
  {
    "codigo": "0xB04E",
    "ruta": "/dashboard/organizacion/documentos",
    "nombre": "Configuración de documentos",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/organizacion/identidad-institucional"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/organizacion/identidad-institucional/logo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      }
    ]
  },
  {
    "codigo": "0xB04F",
    "ruta": "/dashboard/organizacion/especialidades",
    "nombre": "Especialidades",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/especialidades"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/especialidades/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/especialidades/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/especialidades/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/especialidades/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/especialidades/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB050",
    "ruta": "/dashboard/organizacion/feriados",
    "nombre": "Feriados",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      }
    ]
  },
  {
    "codigo": "0xB051",
    "ruta": "/dashboard/organizacion/parametros",
    "nombre": "Parámetros",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/parametros/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/parametros/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB052",
    "ruta": "/dashboard/organizacion/rangos",
    "nombre": "Rangos",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/rangos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/rangos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/rangos/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/rangos/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/rangos/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/rangos/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB053",
    "ruta": "/dashboard/organizacion/reportes",
    "nombre": "Reportes",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/*/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/*/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB054",
    "ruta": "/dashboard/organizacion/tipos-bombero",
    "nombre": "Tipos de bombero",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/tipos-bombero/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/tipos-bombero/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/tipos-bombero/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB055",
    "ruta": "/dashboard/organizacion/tipos-guardia",
    "nombre": "Tipos de guardia",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/tipos-guardia"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/tipos-guardia/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/tipos-guardia/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/tipos-guardia/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/tipos-guardia/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/tipos-guardia/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB056",
    "ruta": "/dashboard/organizacion/turnos",
    "nombre": "Turnos",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/turnos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/turnos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/turnos/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/turnos/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/turnos/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/turnos/exportar/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      }
    ]
  },
  {
    "codigo": "0xB057",
    "ruta": "/dashboard/organizacion/unidades",
    "nombre": "Unidades",
    "modulo": "organizacion",
    "prefijo": "organizacion:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/brigadas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/unidades"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/unidades/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/unidades/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/organizacion/unidades/*/reactivar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/unidades/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/unidades/exportar/pdf"
      }
    ]
  },
  {
    "codigo": "0xB058",
    "ruta": "/dashboard/personal",
    "nombre": "Personal",
    "modulo": "personal",
    "prefijo": "personal:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/baja"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/exportar/excel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/exportar/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/rangos"
      }
    ]
  },
  {
    "codigo": "0xB059",
    "ruta": "/dashboard/personal/[id]",
    "nombre": "Legajo del bombero",
    "modulo": "personal",
    "prefijo": "personal:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/academia/actividades/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/evaluaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/instructores"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/actividades/*/instructores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/academia/actividades/*/participantes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.docx"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/actividades/*/reporte.pdf"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/academia/actividades/*/sesiones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/academia/certificaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/cursos-externos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/cursos-externos/refrescar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/evaluaciones/*/notas"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/academia/evaluaciones/*/notas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/academia/instructores-externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/instructores-externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/alertas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/articulos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/deposito/articulos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/articulos/*/tenencias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/bajas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/categorias"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/categorias/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/entradas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/entradas/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/equipos/*/ubicacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/incidencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/incidencias/*/resolver"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/inventarios-fisicos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/inventarios-fisicos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/inventarios-fisicos/*/items"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/lotes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/lotes/proximos-a-vencer"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/mantenimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/mantenimientos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/mantenimientos/*/finalizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/movimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/movimientos/tenencia-equipo/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/personal/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/prestamos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/deposito/prestamos/*/devolver"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/*/items"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/prestamos/vencidos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/proveedores"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/deposito/proveedores/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/deposito/ubicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/deposito/ubicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/deposito/vehiculos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/archivar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/archivo"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/auditoria"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/documentos/*/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/firmas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/*/relaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/*/vista-previa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/consultas/buscar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/expedientes"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/expedientes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/expedientes/*/documentos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/confirmar-manual"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/firmas/*/firmar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/documentos/numeraciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/numeraciones/*/siguiente"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/documentos/plantillas"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/documentos/plantillas/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/documentos/plantillas/*/generar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/documentos/relacionados/*/*/*"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/documentos/relaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/equipos/equipos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/anular"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/asignaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/*/asignaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/horario"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/presencia"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/asignaciones/*/reemplazar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/bitacora"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/cumplimiento/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-estacion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/inspecciones-movil"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/*/inspecciones-movil/a-revisar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/*/novedades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/*/reabrir"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/esquemas-horario"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/guardias/esquemas-horario/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/generar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/guardias/grupos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/grupos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/grupos/*/miembros"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/grupos/*/miembros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/ordenes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/anular"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/generar-documentos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/ordenes/*/modificaciones"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/regenerar-preview"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/revisar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/ordenes/*/volver-borrador"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/guardias/ordenes/configuracion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/pernoctes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/pernoctes/*/salida"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/personal/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/planificacion/manual"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/requisitos-rol"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/guardias/requisitos-rol/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/guardias/requisitos-rol/*/activo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/guardias/sorteos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/guardias/sorteos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/guardias/sorteos/*/crear-guardia"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/dashboard"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/operaciones/eventos/*/participantes/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/eventos/*/participantes/*/calcular-desde-marcaciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/externos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/operaciones/externos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/cancelar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/*/confirmar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/importaciones/*/filas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/operaciones/importaciones/analizar"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/marcaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/bombero/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/dia/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/operaciones/marcaciones/solapamiento/*/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/operaciones/tolerancias"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/organizacion/feriados"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/organizacion/feriados/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/organizacion/feriados/*/mover"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "DELETE",
          "GET",
          "PATCH"
        ],
        "patron": "/personal/bomberos/*"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/actividad-profesional"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/certificaciones"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/condicion"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/equipamiento"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/especialidades"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/foja-servicio"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/foja-servicio/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/foja-servicio/*/archivos/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/formacion-academia"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/idiomas"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos/*/seguros"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/seguros/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/seguros/*/baja"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/servicios"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/equipamiento/*/devolucion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/auditoria"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/especialidades"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/companias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cuarteles"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/turnos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/tipos-guardia"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/brigadas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/departamentos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/unidades"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/academia/certificaciones"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/academia/certificaciones/*"
      }
    ]
  },
  {
    "codigo": "0xB05A",
    "ruta": "/dashboard/personal/control",
    "nombre": "Control: vencimientos, horas y fichaje",
    "modulo": "personal",
    "prefijo": "personal:",
    "llamadas": [
      {
        "metodos": [
          "POST"
        ],
        "patron": "/aptitudes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/aptitudes/vencimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/fichaje"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/fichaje/escanear"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/fichaje/puntos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/fichaje/puntos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/fichaje/puntos/*/regenerar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/horas-servicio"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/horas-servicio/limites"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      }
    ]
  },
  {
    "codigo": "0xB05B",
    "ruta": "/dashboard/personal/nuevo",
    "nombre": "Nuevo bombero",
    "modulo": "personal",
    "prefijo": "personal:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/parametros/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/personal/bomberos/*/autorizacion-firma"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/personal/bomberos/*/firma-digital"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/tipos-bombero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/rangos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cargos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/companias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/cuarteles"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/turnos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/tipos-guardia"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/brigadas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/departamentos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/organizacion/unidades"
      }
    ]
  },
  {
    "codigo": "0xB05C",
    "ruta": "/dashboard/publicaciones",
    "nombre": "Publicaciones",
    "modulo": "publicaciones",
    "prefijo": "publicaciones:",
    "llamadas": [
      {
        "metodos": [
          "POST"
        ],
        "patron": "/publicaciones"
      },
      {
        "metodos": [
          "DELETE",
          "PUT"
        ],
        "patron": "/publicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/publicaciones/estadisticas"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/publicaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/publicaciones/publicas"
      }
    ]
  },
  {
    "codigo": "0xB05D",
    "ruta": "/dashboard/reservas",
    "nombre": "Reservas",
    "modulo": "reservas",
    "prefijo": "reservas:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/prevencion/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/prevencion/inspecciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/reservas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/reservas/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/reservas/*/decision"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/reservas/instalaciones"
      }
    ]
  },
  {
    "codigo": "0xB05E",
    "ruta": "/dashboard/seguridad",
    "nombre": "Resumen",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/dashboard"
      }
    ]
  },
  {
    "codigo": "0xB05F",
    "ruta": "/dashboard/seguridad/apariencia",
    "nombre": "Apariencia",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/seguridad/apariencia"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/seguridad/apariencia/imagen/*"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/seguridad/apariencia/politica-perfil"
      }
    ]
  },
  {
    "codigo": "0xB060",
    "ruta": "/dashboard/seguridad/auditoria",
    "nombre": "Auditoría",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/auditoria"
      }
    ]
  },
  {
    "codigo": "0xB061",
    "ruta": "/dashboard/seguridad/configuracion",
    "nombre": "Configuración global",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/configuracion/publica"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/configuracion/registro-publico"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/configuracion/admin/registro"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/configuracion/publica"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/configuracion/admin/versiones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/configuracion/admin/exportar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/configuracion/admin/borradores"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/configuracion/admin/borradores/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/configuracion/admin/borradores/*/validar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/configuracion/admin/borradores/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/configuracion/admin/versiones/*/restaurar"
      }
    ]
  },
  {
    "codigo": "0xB062",
    "ruta": "/dashboard/seguridad/inteligencia-artificial",
    "nombre": "Inteligencia artificial",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/auditoria"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/ia/admin/config"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar-predefinido"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/eliminar-definitivamente"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/historial"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/ollama/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-conexion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-generacion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/piper/probar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/voces"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/whisper/estado"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/ia/admin/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones/*/ejecuciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard/uso-por-herramienta"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ia/admin/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ia/admin/propuestas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/enviar-revision"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/rechazar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/chat"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/perfil"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/hablar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/transcribir"
      }
    ]
  },
  {
    "codigo": "0xB063",
    "ruta": "/dashboard/seguridad/inteligencia-artificial/auditoria",
    "nombre": "Auditoría de IA",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/auditoria"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/ia/admin/config"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar-predefinido"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/eliminar-definitivamente"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/historial"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/ollama/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-conexion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-generacion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/piper/probar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/voces"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/whisper/estado"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/ia/admin/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones/*/ejecuciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard/uso-por-herramienta"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ia/admin/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ia/admin/propuestas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/enviar-revision"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/rechazar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/chat"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/perfil"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/hablar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/transcribir"
      }
    ]
  },
  {
    "codigo": "0xB064",
    "ruta": "/dashboard/seguridad/inteligencia-artificial/configuracion",
    "nombre": "Configuración de IA",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/auditoria"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/ia/admin/config"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar-predefinido"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/eliminar-definitivamente"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/historial"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/ollama/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-conexion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-generacion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/piper/probar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/voces"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/whisper/estado"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/ia/admin/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones/*/ejecuciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard/uso-por-herramienta"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ia/admin/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ia/admin/propuestas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/enviar-revision"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/rechazar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/chat"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/perfil"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/hablar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/transcribir"
      }
    ]
  },
  {
    "codigo": "0xB065",
    "ruta": "/dashboard/seguridad/inteligencia-artificial/conversaciones",
    "nombre": "Conversaciones",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/auditoria"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/ia/admin/config"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar-predefinido"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/eliminar-definitivamente"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/historial"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/ollama/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-conexion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-generacion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/piper/probar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/voces"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/whisper/estado"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/ia/admin/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones/*/ejecuciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard/uso-por-herramienta"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ia/admin/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ia/admin/propuestas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/enviar-revision"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/rechazar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/chat"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/perfil"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/hablar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/transcribir"
      }
    ]
  },
  {
    "codigo": "0xB066",
    "ruta": "/dashboard/seguridad/inteligencia-artificial/propuestas",
    "nombre": "Propuestas de mejora",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/auditoria"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/ia/admin/config"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/avatar-predefinido"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/eliminar-definitivamente"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/historial"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/ollama/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-conexion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/ollama/probar-generacion"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/config/piper/probar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/piper/voces"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/config/whisper/estado"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/ia/admin/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/conversaciones/*/ejecuciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/admin/dashboard/uso-por-herramienta"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ia/admin/estado"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ia/admin/propuestas"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/aprobar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/enviar-revision"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/publicar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/admin/propuestas/*/rechazar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/chat"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/conversaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/ia/perfil"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/hablar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/ia/voz/transcribir"
      }
    ]
  },
  {
    "codigo": "0xB067",
    "ruta": "/dashboard/seguridad/navegacion",
    "nombre": "Navegación",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/navegacion/linea"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/usuarios"
      }
    ]
  },
  {
    "codigo": "0xB069",
    "ruta": "/dashboard/seguridad/permisos",
    "nombre": "Permisos",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/seguridad/permisos"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/seguridad/permisos/*"
      }
    ]
  },
  {
    "codigo": "0xB06A",
    "ruta": "/dashboard/seguridad/roles",
    "nombre": "Roles",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/permisos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/seguridad/roles"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/seguridad/roles/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/seguridad/roles/*/activo"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/seguridad/roles/*/copiar-permisos"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/seguridad/roles/*/duplicar"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/seguridad/roles/*/permisos"
      }
    ]
  },
  {
    "codigo": "0xB06B",
    "ruta": "/dashboard/seguridad/sesiones",
    "nombre": "Sesiones",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/sesiones"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/seguridad/sesiones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/seguridad/usuarios/*/cerrar-sesiones"
      }
    ]
  },
  {
    "codigo": "0xB06C",
    "ruta": "/dashboard/seguridad/usuarios",
    "nombre": "Usuarios",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/roles"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/seguridad/usuarios"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/seguridad/usuarios/*/baja"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/seguridad/usuarios/*/bloqueo"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/seguridad/usuarios/*/password"
      }
    ]
  },
  {
    "codigo": "0xB06D",
    "ruta": "/dashboard/seguridad/usuarios/[id]",
    "nombre": "Ficha de usuario",
    "modulo": "seguridad",
    "prefijo": "seguridad:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/permisos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/roles"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/seguridad/sesiones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/seguridad/usuarios/*/detalle"
      },
      {
        "metodos": [
          "GET",
          "PUT"
        ],
        "patron": "/seguridad/usuarios/*/perfil"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/seguridad/usuarios/*/perfil/foto"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/seguridad/usuarios/*/permisos"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/seguridad/usuarios/*/permisos/*"
      },
      {
        "metodos": [
          "PUT"
        ],
        "patron": "/seguridad/usuarios/*/roles"
      }
    ]
  },
  {
    "codigo": "0xB06E",
    "ruta": "/dashboard/servicios",
    "nombre": "Comunicaciones",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/servicios/comunicaciones"
      }
    ]
  },
  {
    "codigo": "0xB06F",
    "ruta": "/dashboard/servicios/cartografia",
    "nombre": "Hidrantes y riesgos",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/cartografia/hidrantes"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/cartografia/hidrantes/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/cartografia/puntos-riesgo"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/cartografia/puntos-riesgo/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/cartografia/puntos-riesgo/*/preplan"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/cartografia/puntos-riesgo/*/preplan/historial"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      }
    ]
  },
  {
    "codigo": "0xB070",
    "ruta": "/dashboard/servicios/convocatorias",
    "nombre": "Convocatorias",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/convocatorias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/convocatorias/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/convocatorias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/llamados"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/llamados/*/estado"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/llamados/*/servicio"
      }
    ]
  },
  {
    "codigo": "0xB071",
    "ruta": "/dashboard/servicios/despacho",
    "nombre": "Despacho operativo",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/despacho/solicitudes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/despacho/solicitudes/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/despacho/solicitudes/*/linea"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/despacho/servicios/*/mapa"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/despacho/solicitudes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/despacho/solicitudes/*/ampliar"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/despacho/solicitudes/*/cerrar"
      }
    ]
  },
  {
    "codigo": "0xB072",
    "ruta": "/dashboard/servicios/indicadores",
    "nombre": "Indicadores",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/indicadores/calor"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/indicadores/operativos"
      }
    ]
  },
  {
    "codigo": "0xB073",
    "ruta": "/dashboard/servicios/llamados",
    "nombre": "Llamados",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/convocatorias"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/convocatorias/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/convocatorias/*/cerrar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/llamados"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/llamados/*/estado"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/llamados/*/servicio"
      }
    ]
  },
  {
    "codigo": "0xB074",
    "ruta": "/dashboard/servicios/nuevo",
    "nombre": "Nuevo servicio",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/servicios/comunicaciones/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/servicios/comunicaciones/*/exportar/pdf"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/servicios/comunicaciones/*/finalizar"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/servicios/comunicaciones/catalogos"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/servicios/comunicaciones/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/servicios/comunicaciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/servicios/*/seguimiento"
      },
      {
        "metodos": [
          "DELETE",
          "POST"
        ],
        "patron": "/servicios/*/seguimiento/ruta-planificada"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/servicios/*/seguimiento/eventos"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/servicios/*/seguimiento/eventos/*"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/servicios/*/seguimiento/pruebas-comunicacion"
      },
      {
        "metodos": [
          "DELETE"
        ],
        "patron": "/servicios/*/seguimiento/pruebas-comunicacion/*"
      }
    ]
  },
  {
    "codigo": "0xB075",
    "ruta": "/dashboard/servicios/prevencion",
    "nombre": "Prevención",
    "modulo": "servicios",
    "prefijo": "servicios:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/prevencion/estado"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/prevencion/inspecciones"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/reservas"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/reservas/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/reservas/*/decision"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/reservas/instalaciones"
      }
    ]
  },
  {
    "codigo": "0xB076",
    "ruta": "/dashboard/vehiculos",
    "nombre": "Vehículos",
    "modulo": "vehiculos",
    "prefijo": "vehiculos:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB077",
    "ruta": "/dashboard/vehiculos/[id]",
    "nombre": "Ficha de vehículo",
    "modulo": "vehiculos",
    "prefijo": "vehiculos:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB078",
    "ruta": "/dashboard/vehiculos/checklist-items",
    "nombre": "Catálogo de checklist",
    "modulo": "vehiculos",
    "prefijo": "vehiculos:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/personal/bomberos/*/vehiculos-autorizados"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/checklist-items"
      },
      {
        "metodos": [
          "DELETE",
          "PATCH"
        ],
        "patron": "/vehiculos/checklist-items/*"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos"
      },
      {
        "metodos": [
          "GET",
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/vehiculos/vehiculos/*/baja"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/combustible"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/vehiculos/vehiculos/*/historial"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/vehiculos/vehiculos/*/mantenimientos"
      }
    ]
  },
  {
    "codigo": "0xB079",
    "ruta": "/dashboard/vehiculos/dotacion",
    "nombre": "Dotación y bitácora",
    "modulo": "vehiculos",
    "prefijo": "vehiculos:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/adjuntos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/adjuntos/*/archivo"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/ausencias"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ausencias/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/ausencias/*/decision"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      }
    ]
  },
  {
    "codigo": "0xB07A",
    "ruta": "/dashboard/vehiculos/flota",
    "nombre": "Flota en vivo",
    "modulo": "vehiculos",
    "prefijo": "vehiculos:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      }
    ]
  },
  {
    "codigo": "0xB07B",
    "ruta": "/dashboard/vehiculos/mapa",
    "nombre": "Mapa de flota",
    "modulo": "vehiculos",
    "prefijo": "vehiculos:",
    "llamadas": [
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/datos-pendientes"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/despachos"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/cancelar"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/fin"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/llegada"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/despachos/*/regreso"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/disponibilidad"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/dotacion/*"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/faltantes"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/informe/*/pdf"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/moviles/*/bitacora"
      },
      {
        "metodos": [
          "GET",
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion"
      },
      {
        "metodos": [
          "POST"
        ],
        "patron": "/flota/moviles/*/dotacion/control"
      },
      {
        "metodos": [
          "PATCH"
        ],
        "patron": "/flota/moviles/*/reponer-en-cuartel"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/posiciones"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/servicios-abiertos"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/tablero"
      },
      {
        "metodos": [
          "GET"
        ],
        "patron": "/flota/vencimientos"
      }
    ]
  }
];

export const ACCIONES_FORZADAS: AccionForzada[] = [
  {
    "metodo": "POST",
    "patron": "/finanzas/beneficios/simular",
    "accion": "ver"
  },
  {
    "metodo": "POST",
    "patron": "/configuracion/admin/borradores/:id/validar",
    "accion": "editar"
  }
];

/** Llamadas que el generador no pudo convertir en ruta (se ven en Sistema › Estado). */
export const LLAMADAS_SIN_RESOLVER: Array<{ codigo: string; ruta: string; texto: string }> = [];
