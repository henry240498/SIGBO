"""Fase 3C: tablas 1, 2 y 3 de la GRE 2024 según su estructura real; sin DB ni activación.

Las tablas 1 y 3 están giradas 90° dentro de páginas sin rotación declarada: se leen
con la dirección de cada renglón. Filas y columnas salen de los separadores dibujados
en cada página, nunca de coordenadas fijas. Un valor que no calza en su columna, una
columna que no coincide con su rótulo o un texto sin fila es hallazgo o error: no se
completa, no se copia el valor anterior y un vacío nunca es cero.
"""
from __future__ import annotations

from bisect import bisect_right
from collections import defaultdict
import re

from importar_gre import normalizar

COLUMNAS_T1 = ["ID", "GUIA", "NOMBRE",
               "PEQUENO_AISLAR_M", "PEQUENO_AISLAR_PIES", "PEQUENO_DIA_KM", "PEQUENO_DIA_MI",
               "PEQUENO_NOCHE_KM", "PEQUENO_NOCHE_MI",
               "GRANDE_AISLAR_M", "GRANDE_AISLAR_PIES", "GRANDE_DIA_KM", "GRANDE_DIA_MI",
               "GRANDE_NOCHE_KM", "GRANDE_NOCHE_MI"]
COLUMNAS_T3 = ["CONTENEDOR", "AISLAR_M", "AISLAR_PIES",
               "DIA_LEVE_KM", "DIA_LEVE_MI", "DIA_MODERADO_KM", "DIA_MODERADO_MI",
               "DIA_FUERTE_KM", "DIA_FUERTE_MI",
               "NOCHE_LEVE_KM", "NOCHE_LEVE_MI", "NOCHE_MODERADO_KM", "NOCHE_MODERADO_MI",
               "NOCHE_FUERTE_KM", "NOCHE_FUERTE_MI"]
# Rótulos que deben caer sobre sus columnas, en orden de lectura: comprueban el perfil.
ROTULOS_T1 = [("ID", 0, 0), ("GUIA", 1, 1), ("NOMBRE DEL MATERIAL", 2, 2),
              ("DERRAMES PEQUENOS", 3, 8), ("DERRAMES GRANDES", 9, 14),
              ("AISLAR", 3, 4), ("AISLAR", 9, 10), ("DIA", 5, 6), ("DIA", 11, 12),
              ("NOCHE", 7, 8), ("NOCHE", 13, 14)]
ROTULOS_T3 = [("CONTENEDOR DE", 0, 0), ("AISLAR", 1, 2), ("DIA", 3, 8), ("NOCHE", 9, 14),
              ("VIENTO LEVE", 3, 4), ("VIENTO MODERADO", 5, 6), ("VIENTO FUERTE", 7, 8),
              ("VIENTO LEVE", 9, 10), ("VIENTO MODERADO", 11, 12), ("VIENTO FUERTE", 13, 14)]
VALOR_METRICO = re.compile(r"(\d+(?:\.\d+)?)(\+)?(?:\s*(m|km))?")
VALOR_IMPERIAL = re.compile(r"\((\d+(?:\.\d+)?)(\+)?(?:\s*(pies|mi))?\)")
FORMULA = re.compile(r"[A-Z][a-z]?\d?(?:[A-Z][a-z]?\d?)*")
NOTAS_PERMITIDAS = ('"+" SIGNIFICA', "VEA LA SIGUIENTE PAGINA", "USE ESTA LISTA SOLAMENTE",
                    "MATERIALES QUE PRODUCEN", "TABLA 2 - MATERIALES REACTIVOS")


def caja_de(cajas) -> list[float]:
    return [min(c[0] for c in cajas), min(c[1] for c in cajas),
            max(c[2] for c in cajas), max(c[3] for c in cajas)]


def renglones(pagina) -> list[dict]:
    """Renglones con su dirección y sus palabras (caja de cada una), desde rawdict."""
    resultado = []
    for bloque in pagina.get_text("rawdict")["blocks"]:
        if bloque["type"] != 0:
            raise ValueError(f"PDF {pagina.number + 1}: imagen en página de tabla; requiere revisión de perfil.")
        for linea in bloque["lines"]:
            palabras, actual = [], []
            for span in linea["spans"]:
                for c in span["chars"]:
                    # \x07 aparece como separador en la clave de fórmulas de la Tabla 2.
                    if c["c"].isspace() or c["c"] == "\x07":
                        if actual:
                            palabras.append(actual)
                            actual = []
                    else:
                        actual.append((c, span))
            if actual:
                palabras.append(actual)
            dx, dy = linea["dir"]
            direccion = ("GIRADA" if abs(dx) < .01 and dy < -.99 else
                         "HORIZONTAL" if dx > .99 and abs(dy) < .01 else "OTRA")
            resultado.append({
                "direccion": direccion, "caja": list(linea["bbox"]),
                "texto": "".join(c["c"] for s in linea["spans"] for c in s["chars"]),
                "palabras": [{"texto": "".join(c["c"] for c, _ in p),
                              "caja": caja_de([c["bbox"] for c, _ in p]),
                              "negrita": all(s["flags"] & 16 for _, s in p),
                              "tamano": max(s["size"] for _, s in p),
                              "direccion": direccion} for p in palabras]})
    return resultado


def u(w):  # eje de filas del texto girado (x de la página)
    return (w["caja"][0] + w["caja"][2]) / 2


def v(w):  # eje de columnas del texto girado (y de la página; se lee hacia y decreciente)
    return (w["caja"][1] + w["caja"][3]) / 2


def lineas_de(palabras, girado):
    eje, orden = (u, lambda w: -v(w)) if girado else (v, u)
    lineas = []
    for w in sorted(palabras, key=lambda w: (round(eje(w), 1), orden(w))):
        if lineas and abs(lineas[-1][0] - eje(w)) <= 1.5:
            lineas[-1][1].append(w)
        else:
            lineas.append((eje(w), [w]))
    return [sorted(ws, key=orden) for _, ws in lineas]


def texto_de(palabras) -> str:
    girado = palabras[0]["direccion"] == "GIRADA"
    return "\n".join(" ".join(w["texto"] for w in ws) for ws in lineas_de(palabras, girado))


def plano(texto: str) -> str:
    return " ".join(texto.split())


def agrupar(valores, tolerancia):
    grupos = []
    for x in sorted(valores):
        if grupos and x - grupos[-1][-1] <= tolerancia:
            grupos[-1].append(x)
        else:
            grupos.append([x])
    return [sum(g) / len(g) for g in grupos]


def grilla_girada(pagina, columnas: int):
    """Separadores de fila (x) y límites de columna (y) del texto girado.

    Cada separador está cortado en el borde de cada columna: esos cortes son los
    límites. Todos los separadores de la página deben cortarse en los mismos bordes."""
    por_x = defaultdict(list)
    for dibujo in pagina.get_drawings():
        ancho = dibujo.get("width")
        if not ancho or ancho > 2.1:  # bordes de página sin trazo propio
            continue
        for item in dibujo["items"]:
            if item[0] == "l" and abs(item[1].x - item[2].x) < .3:
                por_x[round((item[1].x + item[2].x) / 2, 1)].append(
                    (min(item[1].y, item[2].y), max(item[1].y, item[2].y)))
    separadores = {x: s for x, s in por_x.items() if len(s) >= columnas - 1}
    if len(separadores) < 2:
        return None
    cortes = [agrupar([e for seg in s for e in seg], .8) for s in separadores.values()]
    referencia = max(cortes, key=len)
    if len(referencia) != columnas + 1:
        raise ValueError(f"PDF {pagina.number + 1}: {len(referencia) - 1} columnas dibujadas; se esperaban {columnas}.")
    if any(min(abs(c - r) for r in referencia) > .8 for cs in cortes for c in cs):
        raise ValueError(f"PDF {pagina.number + 1}: separadores con columnas distintas.")
    xs = agrupar(separadores, 2.0)  # las líneas triples bajo un título cuentan como una
    limites = sorted(referencia, reverse=True)
    return xs, [(limites[i + 1], limites[i]) for i in range(columnas)]  # (desde, hasta) en y


def columna_de(intervalos, w):
    return next((i for i, (desde, hasta) in enumerate(intervalos) if desde <= v(w) < hasta), None)


def validar_rotulos(lineas, intervalos, esperados, pagina):
    """Cada rótulo esperado, en orden de lectura, debe caer sobre sus columnas."""
    usados = defaultdict(int)
    for texto, desde, hasta in esperados:
        candidatas = sorted([l for l in lineas if normalizar(l["texto"]).startswith(texto)], key=lambda l: -v(l))
        if usados[texto] >= len(candidatas):
            raise ValueError(f"PDF {pagina.number + 1}: falta el rótulo {texto}.")
        r = candidatas[usados[texto]]
        usados[texto] += 1
        if not (intervalos[hasta][0] - 1 <= r["caja"][1] and r["caja"][3] <= intervalos[desde][1] + 1):
            raise ValueError(f"PDF {pagina.number + 1}: el rótulo {texto} no coincide con su columna.")


def valor_celda(texto, codigo, unidad_obligatoria):
    unidad = codigo.rsplit("_", 1)[1].lower()
    m = (VALOR_IMPERIAL if unidad in ("pies", "mi") else VALOR_METRICO).fullmatch(texto)
    if not m or (m.group(3) is None and unidad_obligatoria) or m.group(3) not in (None, unidad):
        return None
    return {"valorDecimal": m.group(1), "modificador": m.group(2), "unidad": unidad}


def celda(codigo, orden, texto, fuentes, valor=None, estado=None, condiciones=None):
    return {"columna": codigo, "orden": orden, "textoOriginal": texto,
            "valorDecimal": valor and valor["valorDecimal"], "unidad": valor and valor["unidad"],
            "modificador": valor and valor["modificador"],
            "estadoDato": estado or ("DATO" if valor else "NO_VALIDADO"),
            "condiciones": condiciones, "fuentes": fuentes}


class Tablas:
    def __init__(self, extraccion):
        self.ex = extraccion

    def ref(self, pagina, palabras):
        return self.ex.fuente(pagina, caja_de([w["caja"] for w in palabras]), texto_de(palabras))

    # ---------------- Tabla 1 ----------------
    def tabla1(self, doc, seccion):
        filas, notas, paginas, encabezados, validados = [], [], [], None, None
        for n in range(seccion["pdfDesde"], seccion["pdfHasta"] + 1):
            pagina = doc[n - 1]
            lineas = renglones(pagina)
            con_rotulos = any(l["direccion"] == "GIRADA" and normalizar(l["texto"]).startswith("NOMBRE DEL MATERIAL")
                              for l in lineas)
            if not con_rotulos and validados is None:
                continue  # explicación previa: se conserva como texto de la sección
            grilla = grilla_girada(pagina, len(COLUMNAS_T1))
            if grilla is None:
                raise ValueError(f"PDF {n}: página de Tabla 1 sin separadores de fila.")
            xs, intervalos = grilla
            self.direcciones_admitidas(pagina, lineas)
            palabras = [w for l in lineas for w in l["palabras"]]
            girado = [w for w in palabras if w["direccion"] == "GIRADA"]
            if con_rotulos:
                rotulos = [l for l in lineas if l["direccion"] == "GIRADA" and u(l) < xs[0] and l["texto"].strip()]
                validar_rotulos(rotulos, intervalos, ROTULOS_T1, pagina)
                validados = intervalos
                if encabezados is None:
                    encabezados = [self.ex.fuente(pagina, l["caja"], l["texto"]) for l in rotulos]
            else:
                # La página impar continúa la doble página sin repetir rótulos: hereda las
                # columnas solo si su grilla dibujada coincide con la última validada.
                if any(abs(a - b) > 1 for i, j in zip(intervalos, validados) for a, b in zip(i, j)):
                    raise ValueError(f"PDF {n}: columnas distintas de la página con rótulos.")
                antes = []
                self.notas(pagina, [w for w in girado if u(w) < xs[0]], notas, "TABLA 1", antes)
                if antes:  # fila que empieza la página sin separador superior
                    xs = [min(u(w) for w in antes) - 1, *xs]
            paginas.append(n)
            self.pie(pagina, [w for w in palabras if w["direccion"] == "HORIZONTAL"])
            despues = []
            self.notas(pagina, [w for w in girado if u(w) > xs[-1]], notas, "TABLA 1", despues)
            abiertas = set()
            if despues:
                # La última fila puede continuar sin separador de cierre (PDF 321). Se acepta como
                # franja abierta si arma entradas completas; queda marcada para el revisor.
                xs = [*xs, max(u(w) for w in despues) + 1]
                abiertas.add(len(xs) - 2)
            filas += self.franjas_t1(pagina, [w for w in girado if xs[0] < u(w) < xs[-1]], xs, intervalos,
                                     len(filas), abiertas)
        if not filas:
            raise ValueError("Tabla 1 sin filas.")
        return {"codigo": "TABLA_1", "seccionId": seccion["id"], "tituloOriginal": seccion["tituloOriginal"],
                "estructura": {"orientacion": "GIRADA_90", "paginasPdf": paginas,
                               "columnas": [{"codigo": c, "orden": i - 3, **condiciones_columna_t1(c)}
                                            for i, c in enumerate(COLUMNAS_T1) if i >= 3]},
                "fuentes": encabezados, "notas": notas, "filas": filas}

    def franjas_t1(self, pagina, cuerpo, xs, intervalos, previas, abiertas=frozenset()):
        por_franja = defaultdict(lambda: defaultdict(list))
        for w in cuerpo:
            i = columna_de(intervalos, w)
            if i is None:
                self.ex.hallazgo("TABLA_PALABRA_SIN_COLUMNA", tabla="TABLA_1", paginaPdf=pagina.number + 1,
                                 textoOriginal=w["texto"])
                continue
            por_franja[bisect_right(xs, u(w)) - 1][i].append(w)
        filas = []
        for franja in sorted(por_franja):
            columnas = por_franja[franja]
            grupo = f"t1-{pagina.number + 1:04d}-{franja + 1:02d}"
            # Celdas combinadas: todas las entradas de la franja comparten estas distancias.
            ref_grupo = self.ex.fuente(pagina, [xs[franja], intervalos[-1][0], xs[franja + 1], intervalos[0][1]],
                                       "", "GEOMETRIA", "FRANJA_ENTRE_SEPARADORES")
            celdas = self.celdas_t1(pagina, columnas, grupo)
            for entrada in self.entradas_de_franja(pagina, columnas, grupo, "TABLA_1"):
                filas.append({"id": f"{grupo}-{len(filas) + 1:02d}", "orden": previas + len(filas) + 1,
                              "paginaPdf": pagina.number + 1, "grupo": grupo, **entrada,
                              "condiciones": condiciones_nombre(entrada["nombreOriginal"]) | {"grupoFilas": grupo}
                              | ({"franjaAbierta": True} if franja in abiertas else {}),
                              "celdas": celdas, "fuentes": entrada["fuentes"] | {"grupo": [ref_grupo]}})
        return filas

    def entradas_de_franja(self, pagina, columnas, grupo, tabla):
        # IDs y guías se emparejan por orden: un ID puede ir centrado sobre un nombre de
        # varios renglones mientras guía y nombre empiezan arriba (1955, PDF 310).
        ids = sorted(columnas.get(0, []), key=u)
        guias = sorted(columnas.get(1, []), key=u)
        if len(ids) != len(guias) or any(abs(u(a) - u(b)) > 8 for a, b in zip(ids, guias)):
            self.ex.hallazgo("TABLA_FILA_INCOMPLETA", tabla=tabla, grupo=grupo,
                             textoOriginal=" ".join(w["texto"] for w in ids + guias))
            return []
        inicios = [min(u(a), u(b)) - 2 for a, b in zip(ids, guias)]
        entradas, usadas = [], set()
        for k, (identificador, guia) in enumerate(zip(ids, guias)):
            hasta = inicios[k + 1] if k + 1 < len(inicios) else float("inf")
            nombre = [w for w in columnas.get(2, []) if inicios[k] <= u(w) < hasta]
            usadas |= {id(w) for w in [identificador, guia, *nombre]}
            if (not re.fullmatch(r"\d{4}", identificador["texto"]) or not re.fullmatch(r"\d{3}P?", guia["texto"])
                    or not nombre):
                self.ex.hallazgo("TABLA_FILA_INCOMPLETA", tabla=tabla, grupo=grupo,
                                 identificador=identificador["texto"])
                continue
            texto = texto_de(nombre)
            entradas.append({"identificador": identificador["texto"], "guiaOriginal": guia["texto"],
                             "guiaNumero": guia["texto"][:3], "polimerizable": guia["texto"].endswith("P"),
                             "nombreOriginal": texto, "nombreNormalizado": nombre_tabla(texto),
                             "fuentes": {"identificador": [self.ref(pagina, [identificador])],
                                         "guia": [self.ref(pagina, [guia])], "nombre": [self.ref(pagina, nombre)]}})
        sueltas = [w for c in (0, 1, 2) for w in columnas.get(c, []) if id(w) not in usadas]
        if sueltas or not ids:
            self.ex.hallazgo("TABLA_TEXTO_SIN_FILA", tabla=tabla, grupo=grupo,
                             textoOriginal=texto_de(sueltas) if sueltas else "")
        return entradas

    def celdas_t1(self, pagina, columnas, grupo):
        grandes = [w for i in range(9, 15) for w in columnas.get(i, [])]
        # «Consulte la Tabla 3» ocupa las tres columnas de derrame grande (celda combinada).
        if grandes and normalizar(plano(texto_de(grandes))) == "CONSULTE LA TABLA 3":
            texto, fuentes = texto_de(grandes), [self.ref(pagina, grandes)]
            remision = [celda(COLUMNAS_T1[i], i - 3, texto, fuentes, estado="REFERENCIA",
                              condiciones={"tablaReferida": "TABLA_3"}) for i in range(9, 15)]
            ultima = 9
        else:
            remision, ultima = [], 15
        celdas = []
        for i in range(3, ultima):
            codigo, palabras = COLUMNAS_T1[i], columnas.get(i, [])
            texto = texto_de(palabras) if palabras else ""
            # Tabla 1 rotula la unidad en cada celda; sin ella el valor no se acepta.
            valor = valor_celda(plano(texto), codigo, True) if palabras else None
            if valor is None:
                self.ex.hallazgo("TABLA_CELDA_INVALIDA", tabla="TABLA_1", grupo=grupo, columna=codigo,
                                 textoOriginal=texto)
            celdas.append(celda(codigo, i - 3, texto, [self.ref(pagina, palabras)] if palabras else [], valor))
        return celdas + remision

    # ---------------- Tabla 2 ----------------
    def tabla2(self, doc, seccion):
        filas, notas, paginas, leyenda, encabezados = [], [], [], {}, None
        for n in range(seccion["pdfDesde"], seccion["pdfHasta"] + 1):
            pagina = doc[n - 1]
            lineas = renglones(pagina)
            horizontales = [l for l in lineas if l["direccion"] == "HORIZONTAL" and l["texto"].strip()]
            rotulos = {normalizar(l["texto"]): l for l in horizontales}
            if "NOMBRE DEL MATERIAL" not in rotulos:
                continue
            self.direcciones_admitidas(pagina, lineas)
            identificador = next((l for k, l in rotulos.items() if k.startswith("NRO. ID")), None)
            guia, nombre = rotulos.get("GUIA"), rotulos["NOMBRE DEL MATERIAL"]
            gas = next((l for k, l in rotulos.items() if k.startswith("GAS TOXICO (PTI)")), None)
            producido = rotulos.get("PRODUCIDO")
            clave = next((l for k, l in rotulos.items() if k.startswith("CLAVE PARA LAS FORMULAS PTI")), None)
            if not (identificador and guia and gas and producido and clave):
                raise ValueError(f"PDF {n}: columnas de Tabla 2 desconocidas.")
            columnas_rotulo = [identificador, guia, nombre, gas, producido]
            y_cuerpo = max(l["caja"][3] for l in columnas_rotulo)
            y_leyenda, y_pie = clave["caja"][1], 525
            paginas.append(n)
            if encabezados is None:
                encabezados = [self.ex.fuente(pagina, l["caja"], l["texto"]) for l in columnas_rotulo]
            for formula, datos in self.leyenda_t2(pagina, [l for l in horizontales
                                                           if y_leyenda < l["caja"][1] < y_pie]).items():
                if formula in leyenda and normalizar(leyenda[formula]["nombreOriginal"]) != normalizar(datos["nombreOriginal"]):
                    self.ex.hallazgo("TABLA2_LEYENDA_DISCREPANTE", formula=formula, paginaPdf=n)
                leyenda.setdefault(formula, datos)
            for l in horizontales:
                if l["caja"][3] <= y_cuerpo and l not in columnas_rotulo:
                    self.nota(pagina, l, notas, "TABLA 2")
                elif l["caja"][1] >= y_pie:
                    if not re.fullmatch(r"PAGINA \d+", normalizar(l["texto"])):
                        self.nota(pagina, l, notas, "TABLA 2")
            for l in lineas:
                if l["direccion"] == "GIRADA" and l["texto"].strip():
                    self.nota(pagina, l, notas, "TABLA 2")
            limites = (guia["caja"][0] - 1, guia["caja"][2] + 8, gas["caja"][0] - 5)
            cuerpo = [w for l in horizontales for w in l["palabras"] if y_cuerpo < v(w) < y_leyenda]
            filas += self.filas_t2(pagina, cuerpo, limites, leyenda, len(filas))
        if not filas:
            raise ValueError("Tabla 2 sin filas.")
        return {"codigo": "TABLA_2", "seccionId": seccion["id"], "tituloOriginal": seccion["tituloOriginal"],
                "estructura": {"orientacion": "HORIZONTAL", "paginasPdf": paginas,
                               "columnas": [{"codigo": "GASES_PTI", "orden": 0, "condicion": {"derrameEn": "AGUA"}}],
                               "leyenda": [{"formula": f, **d} for f, d in sorted(leyenda.items())]},
                "fuentes": encabezados, "notas": notas, "filas": filas}

    def leyenda_t2(self, pagina, lineas):
        """Clave de fórmulas: en cada renglón, una palabra con forma de fórmula química
        abre un grupo y las siguientes son su nombre. La distancia entre columnas no
        sirve: «hidrógeno» queda a 19,5 pt de «HI» (PDF 335)."""
        leyenda = {}
        palabras = [w for l in lineas for w in l["palabras"]]
        for ws in lineas_de(palabras, False):
            grupos = []
            for w in ws:
                if FORMULA.fullmatch(w["texto"]) or not grupos:
                    grupos.append([w])
                else:
                    grupos[-1].append(w)
            for g in grupos:
                if len(g) < 2 or not FORMULA.fullmatch(g[0]["texto"]):
                    self.ex.hallazgo("TABLA2_LEYENDA_ILEGIBLE", paginaPdf=pagina.number + 1, textoOriginal=texto_de(g))
                    continue
                leyenda[g[0]["texto"]] = {"nombreOriginal": " ".join(w["texto"] for w in g[1:]),
                                          "fuentes": [self.ref(pagina, g)]}
        return leyenda

    def filas_t2(self, pagina, cuerpo, limites, leyenda, previas):
        x_guia, x_nombre, x_gas = limites
        columnas = defaultdict(list)
        for w in cuerpo:
            x0 = w["caja"][0]
            columnas[0 if x0 < x_guia else 1 if x0 < x_nombre else 2 if x0 < x_gas else 3].append(w)
        anclas = sorted(columnas[0], key=v)
        filas, usadas = [], {id(a) for a in anclas}
        for k, ancla in enumerate(anclas):
            desde = v(ancla) - 3
            hasta = v(anclas[k + 1]) - 3 if k + 1 < len(anclas) else float("inf")
            propias = {c: [w for w in columnas[c] if desde <= v(w) < hasta] for c in (1, 2, 3)}
            usadas |= {id(w) for ws in propias.values() for w in ws}
            grupo = f"t2-{pagina.number + 1:04d}-{k + 1:02d}"
            guia, nombre, gases = propias[1], propias[2], propias[3]
            tokens = [w["texto"] for ws in lineas_de(gases, False) for w in ws]
            if (not re.fullmatch(r"\d{4}", ancla["texto"]) or len(guia) != 1
                    or not re.fullmatch(r"\d{3}P?", guia[0]["texto"]) or not nombre or not tokens
                    or any(t not in leyenda and t != "—" for t in tokens)):
                self.ex.hallazgo("TABLA_FILA_INCOMPLETA", tabla="TABLA_2", grupo=grupo,
                                 identificador=ancla["texto"], textoOriginal=" ".join(tokens))
                continue
            producidos = [t for t in tokens if t != "—"]
            texto_nombre = texto_de(nombre)
            filas.append({"id": grupo, "orden": previas + len(filas) + 1, "paginaPdf": pagina.number + 1,
                          "grupo": grupo, "identificador": ancla["texto"], "guiaOriginal": guia[0]["texto"],
                          "guiaNumero": guia[0]["texto"][:3], "polimerizable": guia[0]["texto"].endswith("P"),
                          "nombreOriginal": texto_nombre, "nombreNormalizado": nombre_tabla(texto_nombre),
                          "condiciones": {"derrameEn": "AGUA", "grupoFilas": grupo},
                          "celdas": [celda("GASES_PTI", 0, texto_de(gases), [self.ref(pagina, gases)],
                                           estado="DATO" if producidos else "VACIO_EXPLICITO",
                                           condiciones={"gases": producidos})],
                          "fuentes": {"identificador": [self.ref(pagina, [ancla])], "guia": [self.ref(pagina, guia)],
                                      "nombre": [self.ref(pagina, nombre)]}})
        sueltas = [w for c in (1, 2, 3) for w in columnas[c] if id(w) not in usadas]
        if sueltas:
            self.ex.hallazgo("TABLA_TEXTO_SIN_FILA", tabla="TABLA_2", paginaPdf=pagina.number + 1,
                             textoOriginal=texto_de(sueltas))
        return filas

    # ---------------- Tabla 3 ----------------
    def tabla3(self, doc, seccion):
        materiales, filas, notas, paginas, encabezados = [], [], [], [], None
        for n in range(seccion["pdfDesde"], seccion["pdfHasta"] + 1):
            pagina = doc[n - 1]
            lineas = renglones(pagina)
            titulos = [l for l in lineas if l["direccion"] == "GIRADA" and re.match(r"UN\d{4}", l["texto"].strip())]
            if not titulos:
                continue
            grilla = grilla_girada(pagina, len(COLUMNAS_T3))
            if grilla is None:
                raise ValueError(f"PDF {n}: página de Tabla 3 sin separadores.")
            xs, intervalos = grilla
            self.direcciones_admitidas(pagina, lineas)
            primer = min(u(t) for t in titulos)
            rotulos = [l for l in lineas if l["direccion"] == "GIRADA" and l["texto"].strip()
                       and (u(l) < primer or normalizar(l["texto"]).startswith("CONTENEDOR DE"))]
            validar_rotulos(rotulos, intervalos, ROTULOS_T3, pagina)
            paginas.append(n)
            if encabezados is None:
                encabezados = [self.ex.fuente(pagina, l["caja"], l["texto"]) for l in rotulos if u(l) < primer]
            palabras = [w for l in lineas for w in l["palabras"]]
            girado = [w for w in palabras if w["direccion"] == "GIRADA"]
            self.pie(pagina, [w for w in palabras if w["direccion"] == "HORIZONTAL"])
            self.notas(pagina, [w for w in girado if u(w) > xs[-1]], notas, "TABLA 3")
            nuevos, nuevas = self.franjas_t3(pagina, [w for w in girado if primer - 2 < u(w) < xs[-1]],
                                             xs, intervalos, titulos, len(materiales), len(filas))
            materiales += nuevos
            filas += nuevas
        if not filas:
            raise ValueError("Tabla 3 sin filas.")
        return {"codigo": "TABLA_3", "seccionId": seccion["id"], "tituloOriginal": seccion["tituloOriginal"],
                "estructura": {"orientacion": "GIRADA_90", "paginasPdf": paginas, "materiales": materiales,
                               "columnas": [{"codigo": c, "orden": i - 1, **condiciones_columna_t3(c)}
                                            for i, c in enumerate(COLUMNAS_T3) if i >= 1]},
                "fuentes": encabezados, "notas": notas, "filas": filas}

    def franjas_t3(self, pagina, cuerpo, xs, intervalos, titulos, previos, previas):
        por_franja = defaultdict(list)
        for w in cuerpo:
            por_franja[bisect_right(xs, u(w)) - 1].append(w)
        materiales, filas, actual = [], [], None
        for franja in sorted(por_franja):
            palabras = por_franja[franja]
            propios = [t for t in titulos if xs[franja] < u(t) < xs[franja + 1]]
            grupo = f"t3-{pagina.number + 1:04d}-{franja + 1:02d}"
            if propios:
                # Un grupo puede tener varios títulos (1040 y 1040 con nitrógeno; 1050 y 2186):
                # siete identificadores en seis grupos que comparten las mismas filas.
                propios.sort(key=u)
                textos = [plano(t["texto"]) for t in propios]
                ids = list(dict.fromkeys(i for t in textos for i in re.findall(r"UN(\d{4})", t)))
                # Además de los títulos, la franja solo lleva «CONTENEDOR DE TRANSPORTE» en su columna.
                propias = {id(w) for t in propios for w in t["palabras"]}
                resto = [w for w in palabras if id(w) not in propias]
                if not ids or not all(re.fullmatch(r"UN\d{4} .+:\s*Derrames Grandes", t) for t in textos) \
                        or any(normalizar(w["texto"]) not in ("CONTENEDOR", "DE", "TRANSPORTE")
                               or columna_de(intervalos, w) != 0 for w in resto):
                    self.ex.hallazgo("TABLA3_TITULO_DESCONOCIDO", paginaPdf=pagina.number + 1,
                                     textoOriginal="\n".join(textos))
                    actual = None
                    continue
                actual = {"id": f"t3-material-{previos + len(materiales) + 1}", "identificadores": ids,
                          "tituloOriginal": "\n".join(textos), "tamanoDerrame": "GRANDE",
                          "nombres": [{"identificador": re.match(r"UN(\d{4})", t).group(1),
                                       "nombreOriginal": re.fullmatch(r"UN\d{4} (.+?):\s*Derrames Grandes", t).group(1)}
                                      for t in textos],
                          "fuentes": [self.ex.fuente(pagina, t["caja"], t["texto"]) for t in propios]}
                materiales.append(actual)
                continue
            if actual is None:
                self.ex.hallazgo("TABLA_TEXTO_SIN_FILA", tabla="TABLA_3", grupo=grupo, textoOriginal=texto_de(palabras))
                continue
            columnas = defaultdict(list)
            sin_columna = []
            for w in palabras:
                i = columna_de(intervalos, w)
                (sin_columna if i is None else columnas[i]).append(w)
            if sin_columna or not columnas.get(0):
                self.ex.hallazgo("TABLA_FILA_INCOMPLETA", tabla="TABLA_3", grupo=grupo, textoOriginal=texto_de(palabras))
                continue
            celdas = []
            for i in range(1, 15):
                codigo, ps = COLUMNAS_T3[i], columnas.get(i, [])
                texto = texto_de(ps) if ps else ""
                # La unidad la fija el rótulo de la columna (Metros/Pies, Kilómetros/Millas).
                valor = valor_celda(plano(texto), codigo, False) if ps else None
                if valor is None:
                    self.ex.hallazgo("TABLA_CELDA_INVALIDA", tabla="TABLA_3", grupo=grupo, columna=codigo,
                                     textoOriginal=texto)
                celdas.append(celda(codigo, i - 1, texto, [self.ref(pagina, ps)] if ps else [], valor))
            contenedor = texto_de(columnas[0])
            clave = normalizar(plano(contenedor))
            filas.append({"id": grupo, "orden": previas + len(filas) + 1, "paginaPdf": pagina.number + 1,
                          "grupo": grupo, "materialId": actual["id"], "identificadores": actual["identificadores"],
                          "contenedorOriginal": contenedor, "contenedorNormalizado": clave,
                          "condiciones": {"contenedor": clave, "tamanoDerrame": "GRANDE",
                                          "identificadores": actual["identificadores"], "grupoFilas": grupo},
                          "celdas": celdas,
                          "fuentes": {"contenedor": [self.ref(pagina, columnas[0])], "titulo": actual["fuentes"]}})
        return materiales, filas

    # ---------------- comunes ----------------
    def direcciones_admitidas(self, pagina, lineas):
        if any(l["direccion"] == "OTRA" and l["texto"].strip() for l in lineas):
            raise ValueError(f"PDF {pagina.number + 1}: texto con dirección no soportada.")

    def pie(self, pagina, palabras):
        """En páginas giradas, lo horizontal solo puede ser el pie «Página N»."""
        texto = " ".join(w["texto"] for w in palabras)
        if palabras and not re.fullmatch(r"PAGINA \d+", normalizar(texto)):
            self.ex.hallazgo("TABLA_TEXTO_FUERA_DE_CUERPO", paginaPdf=pagina.number + 1, textoOriginal=texto)

    def notas(self, pagina, palabras, notas, tabla, resto=None):
        """Registra las notas conocidas; con `resto`, devuelve allí el texto que no lo es
        en lugar de informarlo (puede ser una fila sin separador de cierre)."""
        for ws in lineas_de(palabras, True):
            linea = {"texto": " ".join(w["texto"] for w in ws), "caja": caja_de([w["caja"] for w in ws])}
            if not self.nota(pagina, linea, notas, tabla, informar=resto is None):
                resto.extend(ws)

    def nota(self, pagina, linea, notas, tabla, informar=True):
        """Fuera del cuerpo solo se admiten la pestaña de la tabla y sus notas conocidas."""
        texto = plano(linea["texto"])
        clave = normalizar(texto)
        if clave == tabla:
            return True
        if clave.startswith(NOTAS_PERMITIDAS):
            if clave not in {normalizar(nota["textoOriginal"]) for nota in notas}:
                notas.append({"textoOriginal": texto, "fuentes": [self.ex.fuente(pagina, linea["caja"], linea["texto"])]})
            return True
        if informar:
            self.ex.hallazgo("TABLA_TEXTO_FUERA_DE_CUERPO", tabla=tabla, paginaPdf=pagina.number + 1,
                             textoOriginal=texto)
        return False


def nombre_tabla(texto: str) -> str:
    return normalizar(re.sub(r"(?<=\S)-\n", "-", texto))


def condiciones_nombre(nombre: str) -> dict:
    clave = nombre_tabla(nombre)
    agua = re.search(r"\(CUANDO ES DERRAMADO EN (EL )?AGUA\)", clave)
    tierra = re.search(r"\(CUANDO ES DERRAMADO SOBRE LA TIERRA\)", clave)
    if agua and tierra:
        raise ValueError(f"Nombre con condiciones contradictorias: {nombre}")
    return {"derrameEn": "AGUA" if agua else "TIERRA" if tierra else None}


def nombre_sin_condicion(nombre_normalizado: str) -> str:
    return re.sub(r"\s*\(CUANDO ES DERRAMADO (EN (EL )?AGUA|SOBRE LA TIERRA)\)", "", nombre_normalizado).strip()


def condiciones_columna_t1(codigo: str) -> dict:
    tamano, finalidad, unidad = codigo.split("_")
    return {"tamanoDerrame": tamano, "finalidad": "AISLAMIENTO" if finalidad == "AISLAR" else "PROTECCION",
            "periodo": None if finalidad == "AISLAR" else finalidad, "unidad": unidad.lower(),
            "sistema": "IMPERIAL" if unidad in ("PIES", "MI") else "METRICO"}


def condiciones_columna_t3(codigo: str) -> dict:
    partes = codigo.split("_")
    unidad = partes[-1]
    sistema = "IMPERIAL" if unidad in ("PIES", "MI") else "METRICO"
    if partes[0] == "AISLAR":
        return {"tamanoDerrame": "GRANDE", "finalidad": "AISLAMIENTO", "periodo": None, "viento": None,
                "unidad": unidad.lower(), "sistema": sistema}
    # Clases de viento tal como las publica el rótulo (R24): leve < 10, moderado 10–20, fuerte > 20 km/h.
    rango = {"LEVE": {"kmh": {"menorQue": "10"}, "mph": {"menorQue": "6"}},
             "MODERADO": {"kmh": {"desde": "10", "hasta": "20"}, "mph": {"desde": "6", "hasta": "12"}},
             "FUERTE": {"kmh": {"mayorQue": "20"}, "mph": {"mayorQue": "12"}}}[partes[1]]
    return {"tamanoDerrame": "GRANDE", "finalidad": "PROTECCION", "periodo": partes[0], "viento": partes[1],
            "rangoViento": rango, "unidad": unidad.lower(), "sistema": sistema}
