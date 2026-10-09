"""Pruebas documentales con la GRE real y copias temporales; sin datos operativos."""
import hashlib
import json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
from threading import Barrier
import unittest
from unittest.mock import patch

import pymupdf
from importar_gre import descubrir, preparar, seleccionar, manifiesto, identidad, escribir_inmutable

FUENTE = Path(__file__).resolve().parents[2] / "docs/Manuales/GRE2024-Spa-Web-a.pdf"
HASH = "bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af"


class DocumentoGreTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.contenido = FUENTE.read_bytes()
        cls.datos = identidad(cls.contenido)
        cls.reporte = manifiesto(cls.contenido, cls.datos)

    def setUp(self):
        self.temporal = tempfile.TemporaryDirectory(prefix="sigbo-gre-3a-")
        self.raiz = Path(self.temporal.name)
        self.carpeta = self.raiz / "manuales"
        self.carpeta.mkdir()
        self.almacen = self.raiz / "privado"
        shutil.copyfile(FUENTE, self.carpeta / "manual-sin-extension")

    def tearDown(self):
        self.temporal.cleanup()

    def test_identifica_por_contenido_sin_nombre_ni_extension(self):
        candidatos = descubrir(self.carpeta)["candidatos"]
        self.assertEqual(len(candidatos), 1)
        self.assertEqual(candidatos[0]["edicion"], "2024")
        self.assertEqual(candidatos[0]["sha256"], HASH)
        self.assertEqual(candidatos[0]["paginas"], 392)

    def test_contrato_cli_json_es_utf8_con_titulo_original(self):
        ejecucion = subprocess.run([sys.executable, str(Path(__file__).with_name("importar_gre.py")),
                                   "--carpeta", str(self.carpeta), "--listar"], capture_output=True)
        self.assertEqual(ejecucion.returncode, 0, ejecucion.stderr)
        datos = json.loads(ejecucion.stdout.decode("utf-8"))
        self.assertEqual(datos["candidatos"][0]["titulo"], self.datos["titulo"])
        self.assertNotIn("\ufffd", datos["candidatos"][0]["titulo"])

    def test_no_confunde_archivos_auxiliares_con_candidatos(self):
        (self.carpeta / "GRE2024-falso.pdf").write_bytes(b"contenido no PDF")
        informe = descubrir(self.carpeta)
        self.assertEqual(len(informe["candidatos"]), 1)
        self.assertEqual(len(informe["descartados"]), 1)

    def test_varios_archivos_exigen_seleccion_aun_con_hash_igual(self):
        shutil.copyfile(FUENTE, self.carpeta / "segunda-fuente.pdf")
        with self.assertRaisesRegex(ValueError, "Hay 2 fuentes"):
            seleccionar(self.carpeta, None)
        contenido, _ = seleccionar(self.carpeta, "segunda-fuente.pdf")
        self.assertEqual(hashlib.sha256(contenido).hexdigest(), HASH)

    def test_rechaza_seleccion_fuera_de_carpeta(self):
        with self.assertRaises(ValueError):
            seleccionar(self.carpeta, "../manual.pdf")

    def test_no_hay_candidato_si_portada_no_identifica_gre(self):
        # Una página de la fuente auténtica, que no es su portada.
        with pymupdf.open(FUENTE) as original, pymupdf.open() as fragmento:
            fragmento.insert_pdf(original, from_page=30, to_page=30)
            (self.carpeta / "manual-sin-extension").write_bytes(fragmento.tobytes())
        self.assertEqual(descubrir(self.carpeta)["candidatos"], [])

    def test_copia_privada_y_reintento_sin_duplicacion(self):
        primero = preparar(self.carpeta, None, self.almacen)
        antes = {p.name: p.read_bytes() for p in self.almacen.iterdir()}
        segundo = preparar(self.carpeta, None, self.almacen)
        despues = {p.name: p.read_bytes() for p in self.almacen.iterdir()}
        self.assertTrue(primero["copiaNueva"])
        self.assertFalse(segundo["copiaNueva"])
        self.assertEqual(antes, despues)
        self.assertEqual(len(despues), 2)
        self.assertEqual(hashlib.sha256(despues[HASH + ".pdf"]).hexdigest(), HASH)
        self.assertEqual(json.loads(despues[primero["manifiesto"]])["estadoCatalogo"], "NO_IMPORTADA")

    def test_no_sobrescribe_copia_corrupta(self):
        self.almacen.mkdir()
        destino = self.almacen / (HASH + ".pdf")
        destino.write_bytes(b"copia alterada")
        with self.assertRaisesRegex(ValueError, "difiere"):
            preparar(self.carpeta, None, self.almacen)
        self.assertEqual(destino.read_bytes(), b"copia alterada")

    def test_publicacion_exclusiva_no_deja_temporales(self):
        self.almacen.mkdir()
        destino = self.almacen / (HASH + ".pdf")
        self.assertTrue(escribir_inmutable(destino, self.contenido))
        self.assertFalse(escribir_inmutable(destino, self.contenido))
        self.assertEqual([p.name for p in self.almacen.iterdir()], [destino.name])

    def test_reintento_recupera_manifiesto_tras_interrupcion(self):
        self.almacen.mkdir()
        destino = self.almacen / (HASH + ".pdf")
        escribir_inmutable(destino, self.contenido)
        resultado = preparar(self.carpeta, None, self.almacen)
        self.assertFalse(resultado["copiaNueva"])
        self.assertEqual(destino.read_bytes(), self.contenido)
        reporte = json.loads((self.almacen / resultado["manifiesto"]).read_text(encoding="utf-8"))
        self.assertEqual(reporte, self.reporte)
        self.assertEqual(len(list(self.almacen.iterdir())), 2)

    def test_reintento_no_sobrescribe_manifiesto_corrupto(self):
        resultado = preparar(self.carpeta, None, self.almacen)
        destino = self.almacen / resultado["manifiesto"]
        destino.write_bytes(b"manifiesto alterado")
        with self.assertRaisesRegex(ValueError, "difiere"):
            preparar(self.carpeta, None, self.almacen)
        self.assertEqual(destino.read_bytes(), b"manifiesto alterado")
        self.assertEqual((self.almacen / (HASH + ".pdf")).read_bytes(), self.contenido)

    def test_fallo_de_publicacion_no_deja_archivo_final_parcial(self):
        self.almacen.mkdir()
        destino = self.almacen / (HASH + ".pdf")
        with patch("importar_gre.os.link", side_effect=OSError("enlace no disponible")):
            with self.assertRaisesRegex(OSError, "enlace no disponible"):
                escribir_inmutable(destino, self.contenido)
        self.assertEqual(list(self.almacen.iterdir()), [])

    def test_publicaciones_simultaneas_conservan_una_copia_integra(self):
        self.almacen.mkdir()
        destino = self.almacen / (HASH + ".pdf")
        barrera = Barrier(2)
        import os
        enlace_real = os.link

        def publicar_juntos(origen, final):
            # Ambos procesos han terminado su archivo temporal antes de competir.
            barrera.wait(timeout=30)
            return enlace_real(origen, final)

        with patch("importar_gre.os.link", side_effect=publicar_juntos):
            with ThreadPoolExecutor(max_workers=2) as ejecutor:
                resultados = list(ejecutor.map(lambda _: escribir_inmutable(destino, self.contenido), range(2)))
        self.assertEqual(sorted(resultados), [False, True])
        self.assertEqual(destino.read_bytes(), self.contenido)
        self.assertEqual([p.name for p in self.almacen.iterdir()], [destino.name])

    def test_cli_con_pdf_truncado_conserva_json_y_registra_descarte(self):
        (self.carpeta / "truncado.pdf").write_bytes(b"%PDF-1.7\ncontenido truncado")
        ejecucion = subprocess.run([sys.executable, str(Path(__file__).with_name("importar_gre.py")),
                                   "--carpeta", str(self.carpeta), "--listar"], capture_output=True)
        self.assertEqual(ejecucion.returncode, 0, ejecucion.stderr)
        datos = json.loads(ejecucion.stdout.decode("utf-8"))
        self.assertEqual(len(datos["candidatos"]), 1)
        self.assertEqual(datos["descartados"][0]["archivo"], "truncado.pdf")
        self.assertTrue(datos["descartados"][0]["motivo"])

    def test_numero_pdf_y_etiquetas_no_se_confunden(self):
        paginas = self.reporte["paginas"]
        self.assertEqual([p["paginaPdf"] for p in paginas], list(range(1, 393)))
        self.assertEqual(paginas[0]["etiquetaPdf"], "i")
        self.assertEqual(paginas[2]["etiquetaPdf"], "1")
        self.assertTrue(paginas[153]["requiereRevisionNumeracion"])
        self.assertGreater(len({e["valor"] for e in paginas[153]["etiquetasImpresas"]}), 1)

    def test_coordenadas_de_pagina_rotada_se_conservan_sin_rotar(self):
        with pymupdf.open(FUENTE) as original:
            original[0].set_rotation(90)
            contenido = original.tobytes()
        reporte = manifiesto(contenido, identidad(contenido))
        self.assertEqual(reporte["sistemaCoordenadas"], "PYMUPDF_SIN_ROTAR_PT")
        self.assertEqual(reporte["paginas"][0]["rotacion"], 90)
        self.assertEqual(reporte["paginas"][0]["anchoPt"], self.reporte["paginas"][0]["anchoPt"])
        self.assertEqual(reporte["paginas"][0]["altoPt"], self.reporte["paginas"][0]["altoPt"])


if __name__ == "__main__":
    unittest.main()
