"""Pruebas 3B–3C con la GRE real: índices, guías, tablas y conciliación; sin DB ni activación.

Una extracción compartida y un reintento por CLI (~1-2 min). Los casos de falla se
prueban sobre páginas auténticas modificadas en memoria, nunca con datos inventados.
"""
import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import pymupdf
from extraer_gre import (APARTADOS, SUBAPARTADOS, Extraccion, conciliar, normalizar_nombre,
                         preparar_catalogo)
from extraer_tablas import Tablas
from importar_gre import normalizar

FUENTE = Path(__file__).resolve().parents[2] / "docs/Manuales/GRE2024-Spa-Web-a.pdf"
HASH = "bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af"
VERDE = (0.552, 0.778, 0.247)


def pagina_aislada(numero_pdf):
    """Documento de una página copiada de la fuente, para modificarla sin tocar el PDF."""
    with pymupdf.open(FUENTE) as original:
        fragmento = pymupdf.open()
        fragmento.insert_pdf(original, from_page=numero_pdf - 1, to_page=numero_pdf - 1)
    return fragmento


class IndicesGuiasGreTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporal = tempfile.TemporaryDirectory(prefix="sigbo-gre-3b-")
        raiz = Path(cls.temporal.name)
        cls.carpeta = raiz / "manuales"
        cls.carpeta.mkdir()
        shutil.copyfile(FUENTE, cls.carpeta / "manual-sin-extension")
        cls.almacen = raiz / "privado"
        cls.resultado = preparar_catalogo(cls.carpeta, None, cls.almacen)
        cls.serializado = (cls.almacen / cls.resultado["artefacto"]).read_bytes()
        cls.reporte = json.loads(cls.serializado)
        cls.guias = {g["numero"]: g for g in cls.reporte["guias"]}
        cls.tablas = {t["codigo"]: t for t in cls.reporte["tablas"]}

    @classmethod
    def tearDownClass(cls):
        cls.temporal.cleanup()

    def entradas(self, identificador, indice=None):
        return [e for e in self.reporte["entradas"] if e["identificador"] == identificador
                and (indice is None or e["indice"] == indice)]

    def test_cobertura_completa_sin_hallazgos_y_sin_activar(self):
        r = self.reporte
        self.assertEqual(r["estadoCatalogo"], "NO_IMPORTADA")
        self.assertFalse(r["aptoActivacion"])
        self.assertEqual(r["documento"]["sha256"], HASH)
        self.assertEqual(r["hallazgos"], [])
        resumen = r["resumen"]
        self.assertEqual((resumen["filasAmarillo"], resumen["filasAzul"]), (2665, 2665))
        self.assertEqual((resumen["relacionesConciliadas"], resumen["relacionesPendientes"]), (2665, 0))
        self.assertEqual((resumen["guias"], resumen["guiasConContenido"]), (64, 62))
        self.assertEqual(resumen["guiasIntencionalmenteVacias"], ["121", "167"])
        self.assertEqual(resumen["guiasSinEntradas"], ["111", "121", "167"])
        # Toda página de filas (no las de instrucciones, PDF 32 y 94) se recorrió.
        self.assertEqual([c["paginaPdf"] for c in r["coberturaIndices"]],
                         list(range(33, 94)) + list(range(95, 154)))
        self.assertTrue(all(c["filas"] > 0 for c in r["coberturaIndices"]))
        self.assertEqual(len(r["secciones"]), 42)

    def test_un_identificador_conserva_todas_sus_entradas(self):
        for indice in ("AMARILLO", "AZUL"):
            nombres = sorted(e["nombreNormalizado"] for e in self.entradas("1075", indice))
            self.assertEqual(len(nombres), 10)
            self.assertIn("GLP", nombres)
            self.assertIn("PROPANO", nombres)
        relaciones = [x for x in self.reporte["relacionesIndices"] if x["identificador"] == "1075"]
        self.assertEqual(len(relaciones), 10)
        self.assertTrue(all(x["estado"] == "CONCILIADA" for x in relaciones))

    def test_senales_p_y_verde_pertenecen_a_cada_fila(self):
        for e in self.entradas("1092"):
            self.assertEqual((e["guiaOriginal"], e["guiaNumero"]), ("131P", "131"))
            self.assertTrue(e["polimerizable"])
            self.assertTrue(e["resaltadoVerde"])
        for e in self.entradas("1089"):
            self.assertEqual(e["guiaOriginal"], "129P")
            self.assertFalse(e["resaltadoVerde"])
        self.assertTrue(all(e["resaltadoVerde"] for e in self.entradas("1689")))
        entradas = self.reporte["entradas"]
        for indice in ("AMARILLO", "AZUL"):
            propias = [e for e in entradas if e["indice"] == indice]
            self.assertEqual(sum(e["polimerizable"] for e in propias), 102)
            self.assertEqual(sum(e["resaltadoVerde"] is True for e in propias), 415)
            self.assertFalse(any(e["resaltadoVerde"] is None for e in propias))

    def test_verde_se_sostiene_con_los_rectangulos_de_la_fila(self):
        referencias = {x["id"]: x for x in self.reporte["referencias"]}
        entrada = self.entradas("1092", "AMARILLO")[0]
        nombre = pymupdf.Rect(referencias[entrada["fuentes"]["nombre"][0]]["cajaPt"])
        rellenos = [referencias[i] for i in entrada["fuentes"]["resaltadoVerde"]]
        # Celdas de identificador, guía y nombre: tres rectángulos, no el recuadro global.
        self.assertEqual(len(rellenos), 3)
        for x in rellenos:
            self.assertEqual((x["metodo"], x["tecnica"]), ("GEOMETRIA", "RELLENO_VECTORIAL_RECTANGULO"))
            self.assertTrue(pymupdf.Rect(x["cajaPt"]).y0 <= nombre.y0 <= pymupdf.Rect(x["cajaPt"]).y1)

    def test_corte_de_renglon_con_guion_concilia_sin_alterar_el_original(self):
        azul = self.entradas("3324", "AZUL")[0]
        amarillo = self.entradas("3324", "AMARILLO")[0]
        self.assertIn("(BAE-\nII)", azul["nombreOriginal"])
        self.assertIn("(BAE-II)", amarillo["nombreOriginal"])
        self.assertEqual(azul["nombreNormalizado"], amarillo["nombreNormalizado"])
        # Un guion separado por espacios no es continuación de palabra.
        self.assertEqual(normalizar_nombre("Gases -\nInflamables"), "GASES - INFLAMABLES")

    def test_entradas_sin_identificador_no_inventan_uno(self):
        sin_id = [e for e in self.reporte["entradas"] if e["identificador"] is None]
        self.assertEqual(len(sin_id), 8)
        for e in sin_id:
            self.assertEqual(e["identificadorOriginal"], "— —")
            self.assertIsNone(e["tipoIdentificador"])

    def test_guias_completas_vacias_explicitas_y_sin_ejemplo_duplicado(self):
        self.assertEqual(sorted(self.guias), [str(n) for n in range(111, 175)])
        for numero, guia in self.guias.items():
            desde, hasta = guia["paginasPdf"]
            self.assertEqual(hasta, desde + 1)
            self.assertTrue(158 <= desde and hasta <= 285, numero)
        self.assertEqual(self.guias["117"]["paginasPdf"], [170, 171])  # no el ejemplo de PDF 154
        for numero, paginas in (("121", [178, 179]), ("167", [270, 271])):
            self.assertEqual(self.guias[numero]["estadoContenido"], "INTENCIONALMENTE_VACIA")
            self.assertEqual(self.guias[numero]["paginasPdf"], paginas)
            self.assertEqual(self.guias[numero]["bloques"], [])
            self.assertTrue(self.guias[numero]["fuentes"]["estadoContenido"])

    def test_apartados_por_estructura_y_no_por_tamano_de_letra(self):
        esperados = sorted([*APARTADOS, *SUBAPARTADOS])
        for numero, guia in self.guias.items():
            if guia["estadoContenido"] != "CON_CONTENIDO":
                continue
            titulos = [normalizar(b["encabezadoOriginal"]) for b in guia["bloques"] if b["nivel"]]
            self.assertEqual(sorted(titulos), esperados, numero)
            por_id = {b["id"]: b for b in guia["bloques"]}
            for b in guia["bloques"]:
                if b["nivel"] == 2:
                    padre = normalizar(por_id[b["padreId"]]["encabezadoOriginal"])
                    self.assertEqual(padre, SUBAPARTADOS[normalizar(b["encabezadoOriginal"])])
        # PDF 262: ROPA PROTECTORA a 8,2 pt es subapartado de SEGURIDAD PÚBLICA.
        ropa = [b for b in self.guias["163"]["bloques"] if b["encabezadoOriginal"] == "ROPA PROTECTORA"]
        self.assertEqual(len(ropa), 1)
        # PDF 200: "Incendio" a 9 pt es contenido de EVACUACIÓN, como "Derrame".
        evacuacion = next(b for b in self.guias["132"]["bloques"] if b["encabezadoOriginal"] == "EVACUACIÓN")
        self.assertIn("\nDerrame\n", evacuacion["textoOriginal"])
        self.assertIn("\nIncendio\n", evacuacion["textoOriginal"])

    def test_cada_renglon_del_cuerpo_queda_en_un_bloque_en_orden(self):
        for numero, guia in self.guias.items():
            cuerpo = [l["textoOriginal"] for p in guia["paginas"] for l in p["lineas"]
                      if l["rol"] in ("CONTENIDO", "ENCABEZADO")]
            bloques = [linea for b in guia["bloques"] for linea in b["lineas"]]
            self.assertEqual(cuerpo, bloques, numero)
            roles = {l["rol"] for p in guia["paginas"] for l in p["lineas"]}
            self.assertLessEqual(roles, {"CONTENIDO", "ENCABEZADO", "CABECERA_PIE", "VACIA",
                                         "ESTADO_SIN_MATERIALES"})

    def test_referencias_existen_dentro_de_su_pagina_y_respetan_el_modelo(self):
        referencias = {x["id"]: x for x in self.reporte["referencias"]}
        self.assertEqual(len(referencias), len(self.reporte["referencias"]))
        dimensiones = {p["paginaPdf"]: (p["anchoPt"], p["altoPt"]) for p in self.reporte["paginas"]}
        for x in referencias.values():
            ancho, alto = dimensiones[x["paginaPdf"]]
            x0, y0, x1, y1 = x["cajaPt"]
            self.assertTrue(0 <= x0 < x1 <= ancho and 0 <= y0 < y1 <= alto, x["id"])
            self.assertIn(x["metodo"], ("NATIVO", "GEOMETRIA"))  # CHECK de gre_referencias
            self.assertEqual((x["documentoSha256"], x["estadoRevision"]), (HASH, "PENDIENTE"))
        usadas = [i for e in self.reporte["entradas"] for ids in e["fuentes"].values() for i in ids]
        for guia in self.guias.values():
            usadas += [i for ids in guia["fuentes"].values() for i in ids]
            usadas += [i for b in guia["bloques"] for i in b["fuentes"]]
        for tabla in self.tablas.values():
            usadas += tabla["fuentes"] + [i for n in tabla["notas"] for i in n["fuentes"]]
            for fila in tabla["filas"]:
                usadas += [i for ids in fila["fuentes"].values() for i in ids]
                usadas += [i for c in fila["celdas"] for i in c["fuentes"]]
                self.assertTrue(all(c["fuentes"] for c in fila["celdas"]), fila["id"])
        usadas += [i for b in self.reporte["textos"] for i in b["fuentes"]]
        self.assertTrue(usadas)
        self.assertFalse(set(usadas) - set(referencias))
        for e in self.reporte["entradas"]:
            self.assertTrue(all(e["fuentes"][c] for c in ("nombre", "guia", "identificador", "resaltadoVerde")))
            self.assertLessEqual(len(e["nombreOriginal"]), 1000)
            self.assertLessEqual(len(e["nombreNormalizado"]), 400)

    def test_toda_pagina_tiene_tratamiento(self):
        resumen = self.reporte["resumen"]
        self.assertEqual(resumen["paginasEstructuradas"] + resumen["paginasComoTexto"], 392)
        textos = {b["paginaPdf"] for b in self.reporte["textos"]}
        # Explicaciones de cada índice y tabla: texto con fuente, no filas.
        self.assertLessEqual({32, 94, 296, 297, 334, 340}, textos)
        self.assertTrue({154, 358, 359, 367, 368, 369}.issubset(textos))  # ejemplo y anexos

    def test_tabla1_cubre_los_verdes_y_conserva_celdas_combinadas(self):
        t1 = self.tablas["TABLA_1"]
        self.assertEqual(len(t1["estructura"]["paginasPdf"]), 36)
        self.assertEqual(len(t1["filas"]), 427)
        verdes = {r["identificador"] for r in self.reporte["relacionesIndices"] if r.get("resaltadoVerde")}
        self.assertEqual({f["identificador"] for f in t1["filas"]}, verdes)
        self.assertTrue(all(f["entradaId"] for f in t1["filas"]))
        # PDF 298: las dos entradas de 1008 comparten una sola franja de distancias.
        boro = [f for f in t1["filas"] if f["identificador"] == "1008"]
        self.assertEqual(len(boro), 2)
        self.assertEqual(boro[0]["grupo"], boro[1]["grupo"])
        self.assertEqual([c["textoOriginal"] for c in boro[0]["celdas"]], [c["textoOriginal"] for c in boro[1]["celdas"]])
        celdas = {c["columna"]: c for c in boro[0]["celdas"]}
        self.assertEqual((celdas["PEQUENO_AISLAR_M"]["valorDecimal"], celdas["PEQUENO_AISLAR_M"]["unidad"]), ("30", "m"))
        self.assertEqual(celdas["GRANDE_NOCHE_KM"]["valorDecimal"], "4.7")
        self.assertEqual(celdas["GRANDE_NOCHE_MI"]["textoOriginal"], "(2.9 mi)")

    def test_tabla1_casos_cotejados_con_la_imagen(self):
        t1 = self.tablas["TABLA_1"]
        # PDF 310: el ID 1955 va centrado sobre un nombre de tres renglones.
        zona_a = next(f for f in t1["filas"] if f["paginaPdf"] == 310 and "ZONA A" in f["nombreNormalizado"])
        self.assertEqual(zona_a["identificador"], "1955")
        self.assertEqual([c["valorDecimal"] for c in zona_a["celdas"]],
                         ["150", "500", "1.0", "0.6", "3.9", "2.4", "1000", "3000", "6.2", "3.9", "10.5", "6.5"])
        # PDF 321: «11.0+» conserva el modificador; la última fila no tiene separador de cierre.
        nep = [f for f in t1["filas"] if f["paginaPdf"] == 321 and f["identificador"] == "3306"]
        noche = {c["columna"]: c for c in nep[0]["celdas"]}
        self.assertEqual((noche["GRANDE_NOCHE_KM"]["valorDecimal"], noche["GRANDE_NOCHE_KM"]["modificador"]), ("11.0", "+"))
        self.assertTrue(nep[-1]["condiciones"].get("franjaAbierta"))
        self.assertEqual(sum(bool(f["condiciones"].get("franjaAbierta")) for f in t1["filas"]), 1)

    def test_tabla1_remite_a_tabla3_sin_inventar_distancias(self):
        t1, t3 = self.tablas["TABLA_1"], self.tablas["TABLA_3"]
        amoniaco = next(f for f in t1["filas"] if f["identificador"] == "1005")
        grandes = [c for c in amoniaco["celdas"] if c["columna"].startswith("GRANDE_")]
        self.assertEqual(len(grandes), 6)
        for c in grandes:
            self.assertEqual(c["estadoDato"], "REFERENCIA")
            self.assertIsNone(c["valorDecimal"])
            self.assertEqual(c["condiciones"], {"tablaReferida": "TABLA_3"})
        ids_t3 = {i for m in t3["estructura"]["materiales"] for i in m["identificadores"]}
        self.assertEqual(ids_t3, {"1005", "1017", "1040", "1050", "1052", "1079", "2186"})
        self.assertEqual(sorted(self.reporte["resumen"]["remisionesTabla3"]), sorted(ids_t3))

    def test_tabla1_conserva_condicion_tierra_agua(self):
        t1 = self.tablas["TABLA_1"]
        boro = [f for f in t1["filas"] if f["identificador"] == "1741"]
        self.assertEqual(sorted(f["condiciones"]["derrameEn"] for f in boro), ["AGUA", "TIERRA"])
        self.assertNotEqual([c["valorDecimal"] for c in boro[0]["celdas"]],
                            [c["valorDecimal"] for c in boro[1]["celdas"]])

    def test_tabla2_gases_informativos_con_leyenda(self):
        t2 = self.tablas["TABLA_2"]
        self.assertEqual(len(t2["filas"]), 101)
        self.assertEqual(len(t2["estructura"]["leyenda"]), 12)
        cianuro = next(f for f in t2["filas"] if f["identificador"] == "1689")
        self.assertEqual(cianuro["celdas"][0]["condiciones"]["gases"], ["HCN"])
        self.assertEqual(cianuro["condiciones"]["derrameEn"], "AGUA")
        # Toda fila de la Tabla 2 tiene su fila «cuando es derramado en el agua» en la Tabla 1.
        self.assertEqual(self.reporte["resumen"]["tabla2SinFilaAguaEnTabla1"], [])

    def test_tabla3_por_contenedor_periodo_y_viento(self):
        t3 = self.tablas["TABLA_3"]
        self.assertEqual(len(t3["estructura"]["materiales"]), 6)
        self.assertEqual(len(t3["filas"]), 22)
        cloro = [f for f in t3["filas"] if f["identificadores"] == ["1017"]]
        vagon = {c["columna"]: c for c in cloro[0]["celdas"]}
        self.assertEqual(cloro[0]["contenedorNormalizado"], "CARROTANQUE DE FERROCARRIL")
        self.assertEqual((vagon["AISLAR_M"]["valorDecimal"], vagon["AISLAR_M"]["unidad"]), ("1000", "m"))
        self.assertEqual((vagon["DIA_LEVE_KM"]["valorDecimal"], vagon["DIA_LEVE_KM"]["unidad"]), ("10.1", "km"))
        self.assertEqual((vagon["NOCHE_LEVE_KM"]["valorDecimal"], vagon["NOCHE_LEVE_KM"]["modificador"]), ("11.0", "+"))
        columnas = {c["codigo"]: c for c in t3["estructura"]["columnas"]}
        self.assertEqual(columnas["DIA_MODERADO_KM"]["rangoViento"]["kmh"], {"desde": "10", "hasta": "20"})

    def test_reglas_con_fuente_y_parametros_de_la_edicion(self):
        reglas = {r["codigo"]: r for r in self.reporte["reglas"]}
        self.assertEqual(len(reglas), 26)
        self.assertEqual(reglas["R16"]["parametros"]["pequenoHastaLitros"], "208")
        self.assertTrue(reglas["R16"]["parametros"]["limiteIncluido"])
        self.assertEqual(reglas["R24"]["parametros"]["kmh"],
                         {"leveMenorQue": "10", "moderadoDesde": "10", "moderadoHasta": "20", "fuerteMayorQue": "20"})
        # Advertencias y decisiones humanas nunca se ejecutan.
        for r in reglas.values():
            self.assertEqual(r["ejecutable"], r["tipoUso"] == "SELECCION", r["codigo"])
            self.assertTrue(r["fuentes"])
        self.assertEqual(reglas["R28"]["tipoUso"], "DECISION_HUMANA")
        self.assertIn("DUPLICARSE", reglas["R28"]["extractoNormalizado"])

    def test_reintento_por_cli_es_determinista_y_no_duplica(self):
        antes = {p.name: p.read_bytes() for p in self.almacen.iterdir()}
        ejecucion = subprocess.run([sys.executable, str(Path(__file__).with_name("importar_gre.py")),
                                    "--indices-guias", "--carpeta", str(self.carpeta),
                                    "--almacenamiento", str(self.almacen)], capture_output=True)
        self.assertEqual(ejecucion.returncode, 0, ejecucion.stderr.decode("utf-8"))
        salida = json.loads(ejecucion.stdout.decode("utf-8"))
        self.assertFalse(salida["artefactoNuevo"])
        self.assertEqual(salida["artefactoSha256"], self.resultado["artefactoSha256"])
        self.assertEqual({p.name: p.read_bytes() for p in self.almacen.iterdir()}, antes)
        self.assertEqual(sorted(antes), sorted([HASH + ".pdf", self.resultado["artefacto"]]))

    def test_modos_de_cli_excluyentes(self):
        ejecucion = subprocess.run([sys.executable, str(Path(__file__).with_name("importar_gre.py")),
                                    "--listar", "--indices-guias"], capture_output=True)
        self.assertEqual(ejecucion.returncode, 2)

    def test_no_sobrescribe_artefacto_alterado(self):
        with tempfile.TemporaryDirectory(prefix="sigbo-gre-3b-") as otro:
            almacen = Path(otro)
            (almacen / self.resultado["artefacto"]).write_bytes(b"artefacto alterado")
            with patch("extraer_gre.extraer", return_value=self.reporte):
                with self.assertRaisesRegex(ValueError, "difiere"):
                    preparar_catalogo(self.carpeta, None, almacen)
            self.assertEqual((almacen / self.resultado["artefacto"]).read_bytes(), b"artefacto alterado")


class FallaCerradaTest(unittest.TestCase):
    """Una señal o un texto que el parser no puede atribuir a una fila no se descarta."""

    def indice(self, documento, tipo="AMARILLO"):
        extraccion = Extraccion(HASH)
        return extraccion.indice(documento[0], tipo), extraccion.hallazgos

    def test_pagina_autentica_no_produce_hallazgos(self):
        with pagina_aislada(33) as doc:
            filas, hallazgos = self.indice(doc)
        self.assertEqual(hallazgos, [])
        self.assertEqual(len(filas), 55)

    def test_verde_parcial_queda_indeterminado(self):
        with pagina_aislada(33) as doc:
            pagina = doc[0]
            identificador = next(w for w in pagina.get_text("words") if w[4] == "1001")
            # Solo la celda del identificador: no prueba que la fila esté resaltada.
            pagina.draw_rect(pymupdf.Rect(identificador[:4]) + (-1, -1, 1, 1), color=None, fill=VERDE)
            filas, hallazgos = self.indice(doc)
        fila = next(f for f in filas if f["identificador"] == "1001")
        self.assertIsNone(fila["resaltadoVerde"])
        self.assertIn("RESALTADO_PARCIAL_O_DESCONOCIDO", [h["codigo"] for h in hallazgos])

    def test_verde_sin_fila_se_informa(self):
        with pagina_aislada(33) as doc:
            doc[0].draw_rect(pymupdf.Rect(194, 300, 199, 310), color=None, fill=VERDE)
            _, hallazgos = self.indice(doc)
        self.assertEqual([h["codigo"] for h in hallazgos], ["RESALTADO_SIN_FILA"])

    def test_texto_fuera_de_columnas_se_informa(self):
        with pagina_aislada(33) as doc:
            doc[0].insert_text((4, 300), "9999", fontsize=8)
            _, hallazgos = self.indice(doc)
        self.assertEqual([h["codigo"] for h in hallazgos], ["PALABRAS_INDICE_SIN_FILA"])
        self.assertEqual(hallazgos[0]["textoOriginal"], "9999")

    def test_maquetacion_desconocida_falla(self):
        with pagina_aislada(200) as doc:
            with self.assertRaisesRegex(ValueError, "columnas AMARILLO desconocidas"):
                self.indice(doc)

    def test_guia_sin_un_subapartado_no_pasa(self):
        with pymupdf.open(FUENTE) as original, pymupdf.open() as doc:
            doc.insert_pdf(original, from_page=199, to_page=200)  # guía 132, PDF 200–201
            pagina = doc[0]
            for rect in pagina.search_for("ROPA PROTECTORA"):
                pagina.add_redact_annot(rect)
            pagina.apply_redactions()
            extraccion = Extraccion(HASH)
            guias = extraccion.guias(doc, {"pdfDesde": 1, "pdfHasta": 2,
                                           "tituloOriginal": "GUÍAS (SECCIÓN NARANJA)"})
        self.assertEqual(guias[0]["numero"], "132")
        self.assertEqual([h["codigo"] for h in extraccion.hallazgos], ["GUIA_APARTADOS_INCOMPLETOS"])

    def test_celda_de_tabla1_ilegible_no_se_completa(self):
        with pymupdf.open(FUENTE) as original, pymupdf.open() as doc:
            doc.insert_pdf(original, from_page=297, to_page=298)  # PDF 298–299
            pagina = doc[0]
            objetivo = next(w for w in pagina.get_text("words") if w[4] == "(2.9")  # 1008, noche grande
            pagina.add_redact_annot(pymupdf.Rect(objetivo[:4]))
            pagina.apply_redactions()
            extraccion = Extraccion(HASH)
            tabla = Tablas(extraccion).tabla1(doc, {"id": "s", "pdfDesde": 1, "pdfHasta": 2,
                                                    "tituloOriginal": "TABLA 1"})
        self.assertIn("TABLA_CELDA_INVALIDA", [h["codigo"] for h in extraccion.hallazgos])
        celda = next(c for f in tabla["filas"] if f["identificador"] == "1008"
                     for c in f["celdas"] if c["columna"] == "GRANDE_NOCHE_MI")
        self.assertEqual(celda["estadoDato"], "NO_VALIDADO")
        self.assertIsNone(celda["valorDecimal"])

    def test_gas_fuera_de_la_leyenda_no_se_acepta(self):
        with pymupdf.open(FUENTE) as original, pymupdf.open() as doc:
            doc.insert_pdf(original, from_page=334, to_page=334)  # PDF 335
            pagina = doc[0]
            objetivo = next(w for w in pagina.get_text("words") if w[4] == "HCl")
            pagina.add_redact_annot(pymupdf.Rect(objetivo[:4]), text="XQ", fontsize=7)
            pagina.apply_redactions()
            extraccion = Extraccion(HASH)
            Tablas(extraccion).tabla2(doc, {"id": "s", "pdfDesde": 1, "pdfHasta": 1, "tituloOriginal": "TABLA 2"})
        self.assertIn("TABLA_FILA_INCOMPLETA", [h["codigo"] for h in extraccion.hallazgos])

    def test_indices_discrepantes_o_incompletos_no_concilian(self):
        guias = [{"numero": "131", "estadoContenido": "CON_CONTENIDO"},
                 {"numero": "121", "estadoContenido": "INTENCIONALMENTE_VACIA"}]
        base = {"identificador": "1092", "nombreNormalizado": "ACROLEINA, ESTABILIZADA",
                "guiaNumero": "131", "polimerizable": True, "resaltadoVerde": True}
        entradas = [{**base, "id": "a1", "indice": "AMARILLO"},
                    {**base, "id": "z1", "indice": "AZUL", "resaltadoVerde": False},
                    {**base, "id": "a2", "indice": "AMARILLO", "nombreNormalizado": "SOLO AMARILLO"},
                    {**base, "id": "a3", "indice": "AMARILLO", "nombreNormalizado": "GUIA VACIA",
                     "guiaNumero": "121"},
                    {**base, "id": "z3", "indice": "AZUL", "nombreNormalizado": "GUIA VACIA",
                     "guiaNumero": "121"}]
        extraccion = Extraccion(HASH)
        relaciones = {r["nombreNormalizado"]: r for r in conciliar(entradas, guias, extraccion)}
        self.assertEqual(relaciones["ACROLEINA, ESTABILIZADA"]["estado"], "DISCREPANCIA")
        self.assertNotIn("resaltadoVerde", relaciones["ACROLEINA, ESTABILIZADA"])
        self.assertEqual(relaciones["SOLO AMARILLO"]["estado"], "FALTA_O_MULTIPLICIDAD")
        codigos = [h["codigo"] for h in extraccion.hallazgos]
        self.assertEqual(codigos.count("ENTRADA_GUIA_INEXISTENTE_O_VACIA"), 2)
        self.assertEqual(codigos.count("INDICES_NO_CONCILIADOS"), 2)


if __name__ == "__main__":
    unittest.main()
