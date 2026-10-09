"""Reglas de uso de la GRE 2024 con su fuente literal (catálogo R01–R38 de la fase 1).

Cada regla se ubica en su página por un extracto literal; si el texto no aparece, es un
hallazgo crítico y la regla no se publica. Los parámetros (208 L, clases de viento) se
leen del propio extracto con una expresión que solo coincide si la fuente dice eso:
el motor nunca usa una cifra que no provenga del registro de esta versión.

Solo las reglas de SELECCION llevan interpretación ejecutable. Advertencias y
decisiones humanas se muestran con su fuente; no producen resultados automáticos.
"""
from __future__ import annotations

import re

from importar_gre import normalizar

VERSION_INTERPRETACION = "motor-1"


def _r16(m):
    return {"pequenoHastaLitros": m.group(1), "pequenoHastaGalonesEEUU": m.group(2), "limiteIncluido": True}


def _r23(m):
    return {"grandeMasDeLitros": m.group(1), "grandeMasDeGalonesEEUU": m.group(2)}


def _r24(m):
    return {"mph": {"leveMenorQue": m.group(1), "moderadoDesde": m.group(3), "moderadoHasta": m.group(4),
                    "fuerteMayorQue": m.group(7)},
            "kmh": {"leveMenorQue": m.group(2), "moderadoDesde": m.group(5), "moderadoHasta": m.group(6),
                    "fuerteMayorQue": m.group(8)}}


REGLAS = [
    {"codigo": "R01", "tipoUso": "ADVERTENCIA", "pagina": 344,
     "extractos": ["No reemplaza la capacitación en respuesta a emergencias"]},
    {"codigo": "R02", "tipoUso": "ADVERTENCIA", "pagina": 3,
     "extractos": ["NO UTILICE ESTE DIAGRAMA DE FLUJO si más de un material peligroso"]},
    {"codigo": "R06", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 9,
     "extractos": ["Use GUÍA 111 cuando vea un cartel de PELIGRO o PELIGROSO o cuando no conozca que "
                   "material se está derramando, fugando o incendiando."],
     "parametros": (r"Use GUÍA (\d{3}) cuando", lambda m: {"guiaMaterialDesconocido": m.group(1)})},
    {"codigo": "R06B", "tipoUso": "DECISION_HUMANA", "pagina": 9,
     "extractos": ["Si existen varios carteles que dirigen a más de una guía, inicialmente utilice la guía más "
                   "conservadora (es decir, la guía que requiere mayores acciones de protección)."]},
    {"codigo": "R08", "tipoUso": "ADVERTENCIA", "pagina": 345,
     "extractos": ["identifica aquellos materiales que presentan peligro de polimerización bajo ciertas condiciones"]},
    {"codigo": "R09", "tipoUso": "ADVERTENCIA", "pagina": 154,
     "extractos": ["El peligro potencial primario se enumera primero."]},
    {"codigo": "R12", "tipoUso": "ADVERTENCIA", "pagina": 392,
     "extractos": ["ESTE DOCUMENTO NO DEBERÁ SER USADO PARA DETERMINAR EL CUMPLIMIENTO CON"]},
    {"codigo": "R13", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 296,
     "extractos": ["Confirmado que el material está resaltado en verde en la sección amarilla o azul. "
                   "Si no, la Tabla 1 no aplica;"]},
    {"codigo": "R14", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 349,
     "extractos": ["Si no hay incendio: Diríjase directamente a la Tabla 1",
                   "Si hay incendio: Diríjase directamente a la guía asignada al material (sección naranja) y "
                   "aplique las distancias indicadas dentro de EVACUACIÓN – Incendio También, consulte las "
                   "distancias de la Tabla 1 por la liberación de material residual."]},
    {"codigo": "R15", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 349,
     "extractos": ["Esto es solo un recordatorio para materiales resaltados en verde únicamente."]},
    {"codigo": "R16", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 294,
     "extractos": ["Derrames pequeños implican 208 litros (55 galones EE.UU) o menos."],
     "parametros": (r"implican (\d+) litros \((\d+) galones EE\.UU\) o menos", _r16)},
    {"codigo": "R17", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 295,
     "extractos": ["Día refiere al período de tiempo después de la salida del sol y antes de la puesta del sol;",
                   "Noche incluye todas las horas entre la puesta del sol y la salida del sol."]},
    {"codigo": "R18", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 296,
     "extractos": ["Si no encuentra el nombre de embarque y en la Tabla 1 hay más de un nombre con el mismo "
                   "número de identificación, use el nombre con la mayor distancia protectora."]},
    {"codigo": "R19", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 287,
     "extractos": ["Elija la distancia de acción protectora más grande si: No está claro si el derrame es en "
                   "agua o tierra, El derrame ocurre tanto en agua como tierra."]},
    {"codigo": "R20", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 334,
     "extractos": ["Si un material reactivo con el agua solo tiene una entrada en la Tabla 1 indicando (cuando es "
                   "derramado en el agua) y el producto NO se derrama en el agua, NO se aplican las Tablas 1 y 2. "
                   "Consulte solo la guía naranja correspondiente."]},
    {"codigo": "R21", "tipoUso": "ADVERTENCIA", "pagina": 334,
     "extractos": ["Los gases PTI indicados en la Tabla 2 son solo para fines informativos."]},
    {"codigo": "R22", "tipoUso": "ADVERTENCIA", "pagina": 334,
     "extractos": ["un material clasificado en la División 4.3 no siempre será incluido en la Tabla 2."]},
    {"codigo": "R23", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 340,
     "extractos": ["PARA DERRAMES GRANDES (más de 208 litros o 55 galones de EE.UU.) involucrando diferentes "
                   "tipos de contenedores"],
     "parametros": (r"más de (\d+) litros o (\d+) galones", _r23)},
    {"codigo": "R24", "tipoUso": "SELECCION", "ejecutable": True, "pagina": 340,
     "patron": r"< (\d+) < (\d+) Viento Leve .*?(\d+) - (\d+) (\d+) - (\d+) Viento Moderado .*?"
               r"> (\d+) > (\d+) Viento Fuerte",
     "parametros": (r"< (\d+) < (\d+) Viento Leve .*?(\d+) - (\d+) (\d+) - (\d+) Viento Moderado .*?"
                    r"> (\d+) > (\d+) Viento Fuerte", _r24)},
    {"codigo": "R25", "tipoUso": "ADVERTENCIA", "pagina": 297,
     "extractos": ["El círculo grande representa la zona de aislamiento inicial alrededor del derrame. El cuadrado "
                   "(la zona de acción protectora) es el área en la cual se deberán tomar acciones de protección."]},
    {"codigo": "R26", "tipoUso": "ADVERTENCIA", "pagina": 297,
     "extractos": ["se derrama en un río o corriente de agua, la fuente de gas tóxico puede moverse en el sentido "
                   "de la corriente"]},
    {"codigo": "R27", "tipoUso": "ADVERTENCIA", "pagina": 287,
     "extractos": ["Si un material tiene una distancia de acción protectora de 11.0+ km (7.0+ millas), la "
                   "distancia real puede ser mayor en ciertas condiciones atmosféricas."]},
    {"codigo": "R28", "tipoUso": "DECISION_HUMANA", "pagina": 297,
     "extractos": ["Para la liberación instantánea de todo el contenido de un embalaje (por ejemplo, como "
                   "consecuencia de terrorismo, sabotaje o accidente catastrófico) las distancias deben duplicarse."]},
    {"codigo": "R29", "tipoUso": "ADVERTENCIA", "pagina": 287,
     "extractos": ["Otros factores que pueden incrementar las distancias de acción protectora:"]},
    {"codigo": "R30", "tipoUso": "DECISION_HUMANA", "pagina": 286,
     "extractos": ["Ajustar las distancias para un incidente específico comprende muchas variables "
                   "interdependientes y deberá llevarse a cabo solamente por personal técnicamente calificado"]},
    {"codigo": "R31", "tipoUso": "DECISION_HUMANA", "pagina": 289,
     "extractos": ["La población en esta área deberá ser evacuada y/o protegida dentro de recintos cerrados"]},
]


def lineas_de_pagina(pagina):
    lineas = []
    for bloque in pagina.get_text("dict", sort=True)["blocks"]:
        if bloque["type"] != 0:
            continue
        for linea in bloque["lines"]:
            texto = "".join(s["text"] for s in linea["spans"])
            plano = " ".join(texto.split())
            if plano and plano != "•":  # viñeta sola en su renglón
                lineas.append((texto, plano, list(linea["bbox"])))
    return lineas


def extraer_reglas(doc, extraccion) -> list[dict]:
    reglas = []
    for definicion in REGLAS:
        pagina = doc[definicion["pagina"] - 1]
        busqueda, tramos = "", []
        for texto, plano, caja in lineas_de_pagina(pagina):
            inicio = len(busqueda) + (1 if busqueda else 0)
            busqueda = f"{busqueda} {plano}" if busqueda else plano
            tramos.append((inicio, len(busqueda), texto, caja))
        patrones = ([definicion["patron"]] if "patron" in definicion else
                    [re.escape(" ".join(e.split())) for e in definicion["extractos"]])
        coincidencias = [re.search(p, busqueda, re.S) for p in patrones]
        if not all(coincidencias):
            extraccion.hallazgo("REGLA_SIN_FUENTE", regla=definicion["codigo"], paginaPdf=definicion["pagina"])
            continue
        usados = sorted({i for m in coincidencias for i, (a, b, _, _) in enumerate(tramos)
                         if a < m.end() and b > m.start()})
        fuentes = [extraccion.fuente(pagina, tramos[i][3], tramos[i][2]) for i in usados]
        parametros = None
        if "parametros" in definicion:
            patron, construir = definicion["parametros"]
            m = re.search(patron, " ".join(c.group(0) for c in coincidencias), re.S)
            if not m:
                extraccion.hallazgo("REGLA_PARAMETROS_ILEGIBLES", regla=definicion["codigo"])
                continue
            parametros = construir(m)
        ejecutable = bool(definicion.get("ejecutable"))
        reglas.append({"codigo": definicion["codigo"], "tipoUso": definicion["tipoUso"], "ejecutable": ejecutable,
                       "versionInterpretacion": VERSION_INTERPRETACION if ejecutable else None,
                       "paginaPdf": definicion["pagina"],
                       "textoOriginal": "\n".join(tramos[i][2] for i in usados),
                       "extractoNormalizado": normalizar(" ".join(c.group(0) for c in coincidencias)),
                       "parametros": parametros, "fuentes": fuentes})
    por_codigo = {r["codigo"]: r for r in reglas}
    # El umbral de la Tabla 3 (derrame grande) debe ser el mismo de la Tabla 1.
    if "R16" in por_codigo and "R23" in por_codigo and \
            por_codigo["R16"]["parametros"]["pequenoHastaLitros"] != por_codigo["R23"]["parametros"]["grandeMasDeLitros"]:
        extraccion.hallazgo("REGLAS_UMBRAL_INCONSISTENTE", reglas=["R16", "R23"])
    return reglas
