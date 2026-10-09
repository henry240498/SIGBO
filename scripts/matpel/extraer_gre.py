"""Fases 3B–3C: catálogo candidato (índices, guías, tablas y texto) desde la fuente real; sin DB ni activación.

Perfil comprobable GRE 2024 español. Una edición/maquetación desconocida falla
para revisión; no se extrapolan columnas ni valores operacionales.
"""
from __future__ import annotations

from collections import defaultdict
import hashlib
import json
from pathlib import Path
import re

import pymupdf

from importar_gre import (escribir_inmutable, identidad, manifiesto, normalizar,
                          seleccionar)
from extraer_tablas import Tablas, nombre_sin_condicion
from reglas_gre import extraer_reglas
from inspeccionar_gre import tratamiento

VERSION_PARSER = "catalogo-1"
VERSION_NORMALIZADOR = "busqueda-1"
SISTEMA = "PYMUPDF_SIN_ROTAR_PT"
# Estructura fija de cada guía naranja con contenido (comprobada en las 62 de 2024).
APARTADOS = {"PELIGROS POTENCIALES": {"INCENDIO O EXPLOSION", "A LA SALUD"},
             "SEGURIDAD PUBLICA": {"ROPA PROTECTORA", "EVACUACION"},
             "RESPUESTA DE EMERGENCIA": {"FUEGO", "DERRAME O FUGA", "PRIMEROS AUXILIOS"}}
SUBAPARTADOS = {s: apartado for apartado, subs in APARTADOS.items() for s in subs}


def caja(elementos) -> list[float]:
    rects = [pymupdf.Rect(e[:4]) for e in elementos]
    if not rects:
        raise ValueError("Referencia sin geometría.")
    return [min(r.x0 for r in rects), min(r.y0 for r in rects),
            max(r.x1 for r in rects), max(r.y1 for r in rects)]


def texto_palabras(palabras) -> str:
    # Orden de líneas conservado; no retirar guiones químicos o de fin de línea.
    lineas = []
    for w in sorted(palabras, key=lambda w: (round(w[1], 1), w[0])):
        if not lineas or abs(lineas[-1][0] - w[1]) > 1:
            lineas.append((w[1], [w]))
        else:
            lineas[-1][1].append(w)
    return "\n".join(" ".join(w[4] for w in sorted(ws, key=lambda w: w[0]))
                     for _, ws in lineas)


def normalizar_nombre(nombre: str) -> str:
    # Un guion pegado al fin de renglón continúa la palabra: el azul corta "(BAE-" /
    # "II)" donde el amarillo dice "(BAE-II)". El original conserva el salto.
    return normalizar(re.sub(r"(?<=\S)-\n", "-", nombre))


def secciones_documentales(doc) -> list[dict]:
    inicios = [(1, "PORTADA")]
    inicios += [(p, t.strip()) for nivel, t, p in doc.get_toc() if nivel == 1]
    if "NO PARA LA VENTA" in normalizar(doc[-1].get_text()):
        inicios.append((len(doc), "CONTRAPORTADA"))
    inicios.sort()
    if len({p for p, _ in inicios}) != len(inicios):
        raise ValueError("Marcadores de sección ambiguos.")
    resultado = []
    for i, (inicio, titulo) in enumerate(inicios):
        fin = inicios[i + 1][0] - 1 if i + 1 < len(inicios) else len(doc)
        if not 1 <= inicio <= fin <= len(doc):
            raise ValueError("Sección fuera del documento.")
        resultado.append({"id": f"seccion-{inicio:04d}", "tituloOriginal": titulo,
                          "pdfDesde": inicio, "pdfHasta": fin,
                          "tratamiento": tratamiento(titulo)})
    return resultado


class Extraccion:
    def __init__(self, sha256):
        self.sha256 = sha256
        self.referencias = []
        self.hallazgos = []

    # metodo sigue el CHECK de gre_referencias (094); tecnica conserva el detalle.
    def fuente(self, pagina, rect, texto, metodo="NATIVO", tecnica="TEXTO_NATIVO_CAJA", **extra):
        limites = pagina.rect * pagina.derotation_matrix
        r = pymupdf.Rect(rect)
        if r.is_empty or not limites.contains(r):
            raise ValueError(f"Caja fuera de página {pagina.number + 1}.")
        ref = {"id": f"ref-{len(self.referencias) + 1:06d}",
               "documentoSha256": self.sha256, "paginaPdf": pagina.number + 1,
               "etiquetaPdf": pagina.get_label(), "cajaPt": list(r),
               "textoOriginal": texto, "metodo": metodo, "tecnica": tecnica,
               "estadoRevision": "PENDIENTE", **extra}
        self.referencias.append(ref)
        return ref["id"]

    def hallazgo(self, codigo, **datos):
        self.hallazgos.append({"codigo": codigo, "severidad": "CRITICA", **datos})

    def indice(self, pagina, tipo):
        palabras = pagina.get_text("words")
        # Encabezados de la propia página, nunca coordenadas globales por paridad.
        cabeceras = {campo: sorted([w for w in palabras if w[1] < 36 and
                      normalizar(w[4]) == rotulo], key=lambda w: w[0])
                     for campo, rotulo in [("nombre", "NOMBRE"), ("guia", "GUIA"),
                                            ("identificador", "ID")]}
        if any(len(ws) != 2 for ws in cabeceras.values()):
            raise ValueError(f"PDF {pagina.number + 1}: columnas {tipo} desconocidas.")
        pie = [w for w in palabras if normalizar(w[4]) == "PAGINA" and w[1] > 500]
        if len(pie) != 1:
            raise ValueError(f"PDF {pagina.number + 1}: pie de índice ambiguo.")
        y_desde = max(w[3] for ws in cabeceras.values() for w in ws)
        y_hasta = pie[0][1]
        verdes, geometria_desconocida = [], False
        for dibujo in pagina.get_drawings():
            rgb = dibujo.get("fill")
            if not rgb or len(rgb) != 3 or not (rgb[1] > rgb[0] + .1 and rgb[1] > rgb[2] + .1):
                continue
            # Un path contiene muchos rectángulos disjuntos: su bbox NO es un resaltado.
            if dibujo.get("fill_opacity", 1) != 1 or any(i[0] != "re" for i in dibujo["items"]):
                geometria_desconocida = True
            verdes += [(pymupdf.Rect(item[1]), list(rgb)) for item in dibujo["items"] if item[0] == "re"]
        senal_dudosa = geometria_desconocida or bool(pagina.get_images())
        if senal_dudosa:
            self.hallazgo("SENAL_VISUAL_NO_INTERPRETADA", paginaPdf=pagina.number + 1)
        filas, usados, verdes_usados = [], set(), set()
        for columna in range(2):
            posiciones = {c: cabeceras[c][columna][0] for c in cabeceras}
            orden = sorted(posiciones, key=posiciones.get)
            if orden != (["identificador", "guia", "nombre"] if tipo == "AMARILLO"
                         else ["nombre", "guia", "identificador"]):
                raise ValueError("Orden de columnas no soportado.")
            derecha = min(cabeceras[c][1][0] for c in cabeceras) - 5 if columna == 0 else pagina.rect.width
            izquierda = min(posiciones.values()) - 3
            cuerpo = [(i, w) for i, w in enumerate(palabras)
                      if izquierda <= w[0] < derecha and y_desde < w[1] < y_hasta]
            # El nombre puede empezar 2 pt antes de su rótulo (columna derecha del amarillo);
            # guía e identificador empiezan después del suyo, y un nombre largo llega a
            # 3 pt del rótulo "Guía" (PDF 134). Guía e identificador se validan por patrón:
            # un límite equivocado falla en vez de mezclar campos.
            tolerancia = {"nombre": 4, "guia": 1, "identificador": 1}
            def campo(w):
                return next((c for c in reversed(orden) if w[0] >= posiciones[c] - tolerancia[c]), orden[0])
            anclas = sorted([(i, w) for i, w in cuerpo if campo(w) == "guia"], key=lambda iw: iw[1][1])
            if not anclas:
                if cuerpo:
                    raise ValueError(f"PDF {pagina.number + 1}: columna con texto y sin guías.")
                # Última página de un índice: la columna derecha puede no tener filas.
                continue
            for numero, (_, ancla) in enumerate(anclas):
                if not re.fullmatch(r"\d{3}P?", ancla[4]):
                    raise ValueError(f"Guía ilegible en PDF {pagina.number + 1}: {ancla[4]}")
                inicio = ancla[1] - 1
                fin = anclas[numero + 1][1][1] - 1 if numero + 1 < len(anclas) else y_hasta
                fila = [(i, w) for i, w in cuerpo if inicio <= w[1] < fin]
                campos = {c: [w for _, w in fila if campo(w) == c] for c in orden}
                nombre = texto_palabras(campos["nombre"])
                identificador_original = texto_palabras(campos["identificador"])
                if not nombre or len(nombre) > 1000 or len(normalizar_nombre(nombre)) > 400:
                    raise ValueError(f"PDF {pagina.number + 1}, columna {columna + 1}, fila {numero + 1}: "
                                     "nombre vacío o fuera de límites del modelo.")
                if not re.fullmatch(r"\d{4}|— —", identificador_original):
                    raise ValueError(f"Identificador desconocido PDF {pagina.number + 1}: {identificador_original}")
                guia = ancla[4][:3]
                id_fila = f"{tipo.lower()}-{pagina.number + 1:04d}-{columna + 1}-{numero + 1:03d}"
                fuentes = {c: [self.fuente(pagina, caja(ws), texto_palabras(ws))]
                           for c, ws in campos.items()}
                fuentes["polimerizable"] = fuentes["guia"][:]
                # Comprobar el fondo de cada palabra, incluyendo continuación de nombre.
                evidencias, banderas = {}, []
                for _, w in fila:
                    centro = pymupdf.Point((w[0] + w[2]) / 2, (w[1] + w[3]) / 2)
                    coincidentes = [(r, rgb) for r, rgb in verdes if r.contains(centro)]
                    banderas.append(bool(coincidentes))
                    for r, rgb in coincidentes:
                        evidencias[tuple(r)] = rgb
                verdes_usados.update(evidencias)
                verde = all(banderas) if len(set(banderas)) == 1 and not senal_dudosa else None
                if verde is None:
                    self.hallazgo("RESALTADO_PARCIAL_O_DESCONOCIDO", entradaId=id_fila)
                fuentes["resaltadoVerde"] = [self.fuente(pagina, list(r), "", "GEOMETRIA", "RELLENO_VECTORIAL_RECTANGULO", rgb=rgb)
                                              for r, rgb in sorted(evidencias.items())]
                if not evidencias:
                    fuentes["resaltadoVerde"] = [self.fuente(pagina, caja([w for _, w in fila]),
                                                            "", "GEOMETRIA", "INSPECCION_FONDO_VECTORIAL")]
                filas.append({"id": id_fila, "indice": tipo, "paginaPdf": pagina.number + 1,
                              "columna": columna + 1, "orden": numero + 1,
                              "identificador": identificador_original if identificador_original.isdigit() else None,
                              "identificadorOriginal": identificador_original,
                              "tipoIdentificador": "ID_GRE" if identificador_original.isdigit() else None,
                              "nombreOriginal": nombre, "nombreNormalizado": normalizar_nombre(nombre),
                              "guiaNumero": guia, "guiaOriginal": ancla[4],
                              "polimerizable": ancla[4].endswith("P"), "resaltadoVerde": verde,
                              "fuentes": fuentes})
                usados.update(i for i, _ in fila)
        # Toda palabra de la página es rótulo, pie o parte de una fila; también las que
        # caen en un margen o entre columnas, fuera del cuerpo de ambas.
        # El número impreso del pie no se compara con la etiqueta PDF: pueden diferir.
        def rotulo(w):
            return (normalizar(w[4]) in {"NRO.", "GUIA", "NOMBRE", "DEL", "MATERIAL", "ID"} if w[1] < y_desde
                    else normalizar(w[4]) == "PAGINA" or w[4].isdigit() if w[1] >= y_hasta else False)
        no_asignados = [w for i, w in enumerate(palabras) if i not in usados and not rotulo(w)]
        if no_asignados:
            self.hallazgo("PALABRAS_INDICE_SIN_FILA", paginaPdf=pagina.number + 1,
                          textoOriginal=texto_palabras(no_asignados))
        # Un verde del cuerpo que no cae bajo ninguna fila es una señal sin interpretar.
        huerfanos = [list(r) for r, _ in verdes if tuple(r) not in verdes_usados
                     and r.y1 > y_desde and r.y0 < y_hasta]
        if huerfanos:
            self.hallazgo("RESALTADO_SIN_FILA", paginaPdf=pagina.number + 1, cajasPt=huerfanos)
        return filas

    def guias(self, doc, seccion):
        resultado, por_numero = [], {}
        for n in range(seccion["pdfDesde"], seccion["pdfHasta"] + 1):
            pagina = doc[n - 1]
            lineas = []
            for bloque in pagina.get_text("dict")["blocks"]:
                if bloque["type"] != 0:
                    raise ValueError("Guía con imagen requiere revisión de perfil.")
                for linea in bloque["lines"]:
                    spans = linea["spans"]
                    texto = "".join(s["text"] for s in spans)
                    lineas.append({"textoOriginal": texto, "cajaPt": list(linea["bbox"]),
                                   "negrita": all(s["flags"] & 16 for s in spans if s["text"].strip()),
                                   "tamanoPt": max(s["size"] for s in spans)})
            lineas.sort(key=lambda l: (round(l["cajaPt"][1], 1), l["cajaPt"][0]))
            cabecera = [l for l in lineas if l["cajaPt"][1] < 54 and
                        re.fullmatch(r"\d{3}", l["textoOriginal"].strip()) and l["tamanoPt"] >= 15]
            if len(cabecera) != 1:
                raise ValueError(f"Guía sin cabecera única PDF {n}.")
            numero = cabecera[0]["textoOriginal"].strip()
            vacia = "NO HAY MATERIALES QUE HAGAN REFERENCIA A ESTA GUIA" in normalizar(pagina.get_text())
            titulos = [l for l in lineas if l["cajaPt"][1] < 54 and 10.5 <= l["tamanoPt"] < 15]
            titulo = "\n".join(l["textoOriginal"] for l in titulos) or None
            if numero not in por_numero:
                guia = {"numero": numero, "tituloOriginal": titulo,
                        "estadoContenido": "INTENCIONALMENTE_VACIA" if vacia else "CON_CONTENIDO",
                        "paginasPdf": [], "fuentes": {"numero": [], "titulo": [], "estadoContenido": []},
                        "paginas": [], "bloques": []}
                resultado.append(guia)
                por_numero[numero] = guia
            guia = por_numero[numero]
            # Las dos páginas difieren en espacios finales ("Materiales Inflamables \n").
            if (normalizar(guia["tituloOriginal"] or "") != normalizar(titulo or "")
                    or (guia["estadoContenido"] == "INTENCIONALMENTE_VACIA") != vacia):
                self.hallazgo("GUIA_PAGINAS_DISCREPANTES", guiaNumero=numero, paginaPdf=n)
            guia["paginasPdf"].append(n)
            guia["fuentes"]["numero"].append(self.fuente(pagina, cabecera[0]["cajaPt"], numero))
            guia["fuentes"]["titulo"] += [self.fuente(pagina, l["cajaPt"], l["textoOriginal"]) for l in titulos]
            if vacia:
                estado = [l for l in lineas if "NO HAY MATERIALES" in normalizar(l["textoOriginal"])]
                guia["fuentes"]["estadoContenido"] += [self.fuente(pagina, l["cajaPt"], l["textoOriginal"]) for l in estado]
            # Página íntegra y hash permiten comprobar que ningún renglón se omitió.
            guia["paginas"].append({"paginaPdf": n, "textoNativoOriginal": pagina.get_text(),
                                    "lineas": lineas})
            # La cabecera solo admite rótulo, número, título y, en la primera página, el
            # título de la sección; el pie, edición y página. Otro texto en el margen sería
            # un renglón de contenido que quedaría fuera de los bloques.
            rotulos = {"GUIA", numero} | ({normalizar(seccion["tituloOriginal"])}
                                          if n == seccion["pdfDesde"] else set())
            for l in lineas:
                clave = normalizar(l["textoOriginal"])
                if not clave:
                    l["rol"] = "VACIA"
                elif l["cajaPt"][1] < 54 or l["cajaPt"][1] >= 525:
                    l["rol"] = "CABECERA_PIE"
                    esperado = (clave in rotulos or l in titulos if l["cajaPt"][1] < 54
                                else clave == "GRE2024" or re.fullmatch(r"PAGINA \d+", clave))
                    if not esperado:
                        self.hallazgo("GUIA_TEXTO_EN_MARGEN", guiaNumero=numero, paginaPdf=n,
                                      textoOriginal=l["textoOriginal"])
                elif vacia:
                    l["rol"] = "ESTADO_SIN_MATERIALES"
            if vacia:
                continue
            # El estado sigue de una página a la otra: un apartado puede continuar.
            actual = guia["bloques"][-1] if guia["bloques"] else None
            padre = next((b for b in reversed(guia["bloques"]) if b["nivel"] == 1), None)
            for l in lineas:
                if "rol" in l:
                    continue
                # El cuerpo de letra varía entre guías (ROPA PROTECTORA a 8,2 pt en PDF 262,
                # "Incendio" a 9 pt dentro de EVACUACIÓN en PDF 200): el título se reconoce
                # por la estructura fija de la GRE y la negrita, no por el tamaño.
                clave = normalizar(l["textoOriginal"])
                nivel = (1 if l["negrita"] and clave in APARTADOS else
                         2 if l["negrita"] and clave in SUBAPARTADOS else None)
                l["rol"] = "ENCABEZADO" if nivel else "CONTENIDO"
                ref = self.fuente(pagina, l["cajaPt"], l["textoOriginal"])
                if nivel or actual is None:
                    if nivel == 2 and (padre is None or normalizar(padre["encabezadoOriginal"]) != SUBAPARTADOS[clave]):
                        self.hallazgo("GUIA_JERARQUIA_INESPERADA", guiaNumero=numero, paginaPdf=n,
                                      textoOriginal=l["textoOriginal"])
                    actual = {"id": f"guia-{numero}-bloque-{len(guia['bloques']) + 1:03d}",
                              "orden": len(guia["bloques"]) + 1, "nivel": nivel,
                              "padreId": padre["id"] if nivel == 2 and padre else None,
                              "encabezadoOriginal": l["textoOriginal"] if nivel else None,
                              "lineas": [], "fuentes": []}
                    guia["bloques"].append(actual)
                    if nivel == 1:
                        padre = actual
                actual["lineas"].append(l["textoOriginal"])
                actual["fuentes"].append(ref)
            for b in guia["bloques"]:
                b["textoOriginal"] = "\n".join(b["lineas"])
        for guia in resultado:
            paginas = guia["paginasPdf"]
            if len(paginas) != 2 or paginas[1] != paginas[0] + 1:
                self.hallazgo("GUIA_COBERTURA_INCOMPLETA", guiaNumero=guia["numero"], paginasPdf=paginas)
            if guia["estadoContenido"] == "CON_CONTENIDO":
                # Cada apartado y subapartado una vez; el orden de los peligros varía
                # (el primario va primero), así que se compara el conjunto, no el orden.
                titulos_guia = [normalizar(b["encabezadoOriginal"]) for b in guia["bloques"] if b["nivel"]]
                if (sorted(titulos_guia) != sorted([*APARTADOS, *SUBAPARTADOS])
                        or any(b["nivel"] is None for b in guia["bloques"])):
                    self.hallazgo("GUIA_APARTADOS_INCOMPLETOS", guiaNumero=guia["numero"], apartados=titulos_guia)
        return resultado


def conciliar(entradas, guias, extraccion):
    por_clave = defaultdict(lambda: {"AMARILLO": [], "AZUL": []})
    numeros = {g["numero"]: g for g in guias}
    for entrada in entradas:
        guia = numeros.get(entrada["guiaNumero"])
        if guia is None or guia["estadoContenido"] != "CON_CONTENIDO":
            extraccion.hallazgo("ENTRADA_GUIA_INEXISTENTE_O_VACIA", entradaId=entrada["id"])
        clave = (entrada["identificador"], entrada["nombreNormalizado"])
        por_clave[clave][entrada["indice"]].append(entrada)
    relaciones = []
    for (identificador, nombre), indices in sorted(por_clave.items(), key=lambda kv: (kv[0][0] or "", kv[0][1])):
        amarillo, azul = indices["AMARILLO"], indices["AZUL"]
        estado = "CONCILIADA"
        if len(amarillo) != 1 or len(azul) != 1:
            estado = "FALTA_O_MULTIPLICIDAD"
        elif any(amarillo[0][campo] != azul[0][campo] for campo in ["guiaNumero", "polimerizable", "resaltadoVerde"]):
            estado = "DISCREPANCIA"
        relacion = {"id": f"entrada-{len(relaciones) + 1:05d}",
                    "identificador": identificador, "nombreNormalizado": nombre,
                    "amarilloIds": [e["id"] for e in amarillo], "azulIds": [e["id"] for e in azul],
                    "estado": estado}
        if estado == "CONCILIADA":
            # Candidata a una GreEntrada: valores que ambos índices sostienen por igual.
            relacion.update({campo: amarillo[0][campo] for campo in
                             ["guiaNumero", "polimerizable", "resaltadoVerde"]})
        relaciones.append(relacion)
        if estado != "CONCILIADA":
            extraccion.hallazgo("INDICES_NO_CONCILIADOS", **relacion)
    return relaciones


def textos_de_secciones(doc, secciones, estructuradas, extraccion):
    """Toda página sin filas estructuradas se conserva como bloque de texto con fuente
    por renglón: instrucciones, explicaciones de tablas, anexos, glosario y contactos."""
    bloques = []
    for seccion in secciones:
        for n in range(seccion["pdfDesde"], seccion["pdfHasta"] + 1):
            if n in estructuradas:
                continue
            pagina = doc[n - 1]
            lineas, fuentes = [], []
            for bloque in pagina.get_text("dict", sort=True)["blocks"]:
                if bloque["type"] != 0:
                    continue  # figuras: se navegan en la fuente; el inventario 1B las registra
                for linea in bloque["lines"]:
                    texto = "".join(s["text"] for s in linea["spans"])
                    if not texto.strip():
                        continue
                    lineas.append(texto)
                    fuentes.append(extraccion.fuente(pagina, linea["bbox"], texto))
            if not lineas:
                continue
            bloques.append({"id": f"{seccion['id']}-pdf-{n:04d}", "seccionId": seccion["id"], "paginaPdf": n,
                            "orden": len([b for b in bloques if b["seccionId"] == seccion["id"]]) + 1,
                            "nivel": None, "padreId": None, "encabezadoOriginal": None,
                            "lineas": lineas, "fuentes": fuentes, "textoOriginal": "\n".join(lineas)})
    return bloques


def conciliar_tablas(tablas, relaciones, extraccion):
    """Cruza tablas e índices. Vincula una fila a una entrada solo si coinciden
    identificador y nombre; si no, la fila queda sin vínculo y la regla R18 decide."""
    verdes = defaultdict(list)
    por_id = defaultdict(list)
    for r in relaciones:
        if r["estado"] == "CONCILIADA":
            por_id[r["identificador"]].append(r)
            if r["resaltadoVerde"]:
                verdes[r["identificador"]].append(r)
    t1, t2, t3 = (tablas.get(c) for c in ("TABLA_1", "TABLA_2", "TABLA_3"))
    vinculadas = {"TABLA_1": 0, "TABLA_2": 0}
    for codigo, tabla, candidatas in (("TABLA_1", t1, verdes), ("TABLA_2", t2, por_id)):
        for fila in tabla["filas"]:
            nombre = nombre_sin_condicion(fila["nombreNormalizado"])
            exactas = [r for r in candidatas.get(fila["identificador"], []) if r["nombreNormalizado"] == nombre]
            fila["entradaId"] = exactas[0]["id"] if len(exactas) == 1 else None
            if not candidatas.get(fila["identificador"]):
                extraccion.hallazgo("TABLA_SIN_ENTRADA_EN_INDICES", tabla=codigo, filaId=fila["id"],
                                    identificador=fila["identificador"])
            if fila["entradaId"]:
                vinculadas[codigo] += 1
                entrada = exactas[0]
                if (entrada["guiaNumero"], entrada["polimerizable"]) != (fila["guiaNumero"], fila["polimerizable"]):
                    extraccion.hallazgo("TABLA_GUIA_DISCREPANTE", tabla=codigo, filaId=fila["id"],
                                        entradaId=entrada["id"])
    # R13: un material resaltado en verde tiene filas en la Tabla 1, y solo esos.
    ids_t1 = {f["identificador"] for f in t1["filas"]}
    for identificador in sorted(set(verdes) - ids_t1):
        extraccion.hallazgo("VERDE_SIN_TABLA_1", identificador=identificador)
    remisiones = {f["identificador"] for f in t1["filas"]
                  if any(c["estadoDato"] == "REFERENCIA" for c in f["celdas"])}
    ids_t3 = {i for m in t3["estructura"]["materiales"] for i in m["identificadores"]}
    if remisiones != ids_t3:
        extraccion.hallazgo("REMISION_TABLA_3_INCONSISTENTE", soloTabla1=sorted(remisiones - ids_t3),
                            soloTabla3=sorted(ids_t3 - remisiones))
    agua_t1 = {f["identificador"] for f in t1["filas"] if f["condiciones"]["derrameEn"] == "AGUA"}
    sin_agua = sorted({f["identificador"] for f in t2["filas"]} - agua_t1)
    return {"filasVinculadas": vinculadas, "remisionesTabla3": sorted(remisiones),
            "tabla2SinFilaAguaEnTabla1": sin_agua}


def extraer(contenido: bytes) -> dict:
    datos = identidad(contenido)
    if datos["edicion"] != "2024":
        raise ValueError("Edición sin perfil de extracción comprobado; requiere revisión.")
    documental = manifiesto(contenido, datos)
    ex = Extraccion(datos["sha256"])
    lector = Tablas(ex)
    with pymupdf.open(stream=contenido, filetype="pdf") as doc:
        secciones = secciones_documentales(doc)
        entradas, guias, cobertura, tablas, estructuradas = [], [], [], {}, set()
        encontrados = set()
        for seccion in secciones:
            titulo = normalizar(seccion["tituloOriginal"])
            tipo = ("AMARILLO" if titulo.startswith("INDICE DE NUMEROS DE IDENTIFICACION") else
                    "AZUL" if titulo.startswith("INDICE DE NOMBRES DE MATERIALES") else
                    "GUIAS" if titulo.startswith("GUIAS (SECCION") else
                    "TABLA_1" if titulo.startswith("TABLA 1 -") else
                    "TABLA_2" if titulo.startswith("TABLA 2 -") else
                    "TABLA_3" if titulo.startswith("COMO USAR LA TABLA 3") else None)
            if tipo:
                if tipo in encontrados:
                    raise ValueError("Sección de catálogo duplicada.")
                encontrados.add(tipo)
            if tipo in ("AMARILLO", "AZUL"):
                # La primera página explica las reglas: se conserva como texto, no como filas.
                for n in range(seccion["pdfDesde"] + 1, seccion["pdfHasta"] + 1):
                    filas = ex.indice(doc[n - 1], tipo)
                    entradas += filas
                    cobertura.append({"paginaPdf": n, "tipo": tipo, "filas": len(filas)})
                    estructuradas.add(n)
            elif tipo == "GUIAS":
                guias = ex.guias(doc, seccion)
                estructuradas |= {n for g in guias for n in g["paginasPdf"]}
            elif tipo:
                tabla = {"TABLA_1": lector.tabla1, "TABLA_2": lector.tabla2, "TABLA_3": lector.tabla3}[tipo](doc, seccion)
                tablas[tipo] = tabla
                estructuradas |= set(tabla["estructura"]["paginasPdf"])
            seccion["estadoExtraccion"] = "ESTRUCTURADA_CANDIDATA" if tipo else "TEXTO_CANDIDATO"
        if encontrados != {"AMARILLO", "AZUL", "GUIAS", "TABLA_1", "TABLA_2", "TABLA_3"}:
            raise ValueError("Faltan secciones de catálogo requeridas.")
        textos = textos_de_secciones(doc, secciones, estructuradas, ex)
        reglas = extraer_reglas(doc, ex)
    relaciones = conciliar(entradas, guias, ex)
    cruce = conciliar_tablas(tablas, relaciones, ex)
    paginas_con_texto = {b["paginaPdf"] for b in textos}
    sin_tratamiento = [p["paginaPdf"] for p in documental["paginas"]
                       if p["paginaPdf"] not in estructuradas | paginas_con_texto]
    if sin_tratamiento:
        ex.hallazgo("PAGINA_SIN_TRATAMIENTO", paginasPdf=sin_tratamiento)
    resumen = {"paginasDocumentales": len(documental["paginas"]), "secciones": len(secciones),
               "paginasEstructuradas": len(estructuradas), "paginasComoTexto": len(paginas_con_texto),
               "filasAmarillo": sum(e["indice"] == "AMARILLO" for e in entradas),
               "filasAzul": sum(e["indice"] == "AZUL" for e in entradas),
               "guias": len(guias), "guiasConContenido": sum(g["estadoContenido"] == "CON_CONTENIDO" for g in guias),
               "guiasIntencionalmenteVacias": [g["numero"] for g in guias if g["estadoContenido"] == "INTENCIONALMENTE_VACIA"],
               # 111 (carga mixta/no identificada) se usa sin pasar por los índices.
               "guiasSinEntradas": sorted({g["numero"] for g in guias} - {e["guiaNumero"] for e in entradas}),
               "relacionesConciliadas": sum(r["estado"] == "CONCILIADA" for r in relaciones),
               "relacionesPendientes": sum(r["estado"] != "CONCILIADA" for r in relaciones),
               "filasTabla1": len(tablas["TABLA_1"]["filas"]), "filasTabla2": len(tablas["TABLA_2"]["filas"]),
               "filasTabla3": len(tablas["TABLA_3"]["filas"]),
               "materialesTabla3": len(tablas["TABLA_3"]["estructura"]["materiales"]),
               "celdas": sum(len(f["celdas"]) for t in tablas.values() for f in t["filas"]),
               "bloquesDeTexto": len(textos), "reglas": len(reglas),
               "reglasEjecutables": sorted(r["codigo"] for r in reglas if r["ejecutable"]), **cruce,
               "referencias": len(ex.referencias), "hallazgosCriticos": len(ex.hallazgos)}
    return {"tipo": "gre_catalogo_candidato", "schemaVersion": 1,
            "versionParser": VERSION_PARSER, "versionNormalizador": VERSION_NORMALIZADOR,
            "herramienta": documental["herramienta"], "sistemaCoordenadas": SISTEMA,
            "estadoCatalogo": "NO_IMPORTADA", "aptoActivacion": False,
            "documento": datos, "paginas": documental["paginas"], "secciones": secciones,
            "coberturaIndices": cobertura, "entradas": entradas, "guias": guias,
            "relacionesIndices": relaciones, "tablas": [tablas[c] for c in sorted(tablas)],
            "textos": textos, "reglas": reglas, "referencias": ex.referencias,
            "hallazgos": ex.hallazgos, "resumen": resumen,
            "pendientes": ["REVISION_HUMANA_3D", "PERSISTENCIA_ACTIVACION_3D"]}


def preparar_catalogo(carpeta: Path, nombre: str | None, almacenamiento: Path) -> dict:
    contenido, datos = seleccionar(carpeta, nombre)
    reporte = extraer(contenido)
    almacenamiento.mkdir(parents=True, exist_ok=True)
    if almacenamiento.is_symlink():
        raise ValueError("La carpeta privada no puede ser un enlace simbólico.")
    almacenamiento = almacenamiento.resolve(strict=True)
    serializado = (json.dumps(reporte, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + "\n").encode("utf-8")
    nombre_artefacto = f"{datos['sha256']}.{VERSION_PARSER}-{VERSION_NORMALIZADOR}-pymupdf{pymupdf.VersionBind}.json"
    escribir_inmutable(almacenamiento / f"{datos['sha256']}.pdf", contenido)
    nuevo = escribir_inmutable(almacenamiento / nombre_artefacto, serializado)
    return {"artefacto": nombre_artefacto, "artefactoSha256": hashlib.sha256(serializado).hexdigest(),
            "artefactoBytes": len(serializado), "artefactoNuevo": nuevo,
            "documentoSha256": datos["sha256"], "resumen": reporte["resumen"],
            "estadoCatalogo": "NO_IMPORTADA", "aptoActivacion": False}
