import copy
import json
import unittest
import pymupdf
from validar_recorte_motor import ROOT, cotejar as cotejar_recorte
from validar_cabeceras_tabla3 import cotejar as cotejar_cabeceras


class CotejoFuenteMotor(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.recorte = json.loads((ROOT / '.context/gre2024/test-cases/motor-fuente.json').read_bytes())
        cls.original = json.loads((ROOT / f'backend/private_uploads/gre/{cls.recorte["fuenteSha256"]}.catalogo-1-busqueda-1-pymupdf1.28.2.json').read_bytes())
        cls.tabla = next(t for t in cls.original['tablas'] if t['codigo'] == 'TABLA_3')
        cls.pdf = pymupdf.open(ROOT / 'docs/Manuales/GRE2024-Spa-Web-a.pdf')

    @classmethod
    def tearDownClass(cls):
        cls.pdf.close()

    def test_literal_sin_cambios(self):
        self.assertEqual(cotejar_recorte(self.recorte, self.original), [])
        self.assertEqual(cotejar_cabeceras(self.tabla, self.original['referencias'], self.pdf)['errores'], [])

    def test_celda_de_regresion_alterada(self):
        f = copy.deepcopy(self.recorte)
        f['artefactoRecortado']['tablas'][0]['filas'][0]['celdas'][0]['valorDecimal'] = '0'
        self.assertTrue(cotejar_recorte(f, self.original))

    def test_coincidencia_por_identificador_omitida(self):
        f = copy.deepcopy(self.recorte)
        f['artefactoRecortado']['entradas'].pop()
        self.assertIn('El recorte de identidades pierde coincidencias de los identificadores seleccionados.', cotejar_recorte(f, self.original))

    def test_cabecera_periodo_intercambiado(self):
        t = copy.deepcopy(self.tabla)
        t['estructura']['columnas'][2]['periodo'] = 'NOCHE'
        self.assertTrue(cotejar_cabeceras(t, self.original['referencias'], self.pdf)['errores'])

    def test_unidad_alterada_en_columna_y_todas_sus_celdas(self):
        t = copy.deepcopy(self.tabla)
        t['estructura']['columnas'][2]['unidad'] = 'm'
        for f in t['filas']:
            f['celdas'][2]['unidad'] = 'm'
        self.assertTrue(cotejar_cabeceras(t, self.original['referencias'], self.pdf)['errores'])

    def test_rango_viento_modificado(self):
        t = copy.deepcopy(self.tabla)
        t['estructura']['columnas'][4]['rangoViento']['kmh']['hasta'] = '21'
        self.assertTrue(cotejar_cabeceras(t, self.original['referencias'], self.pdf)['errores'])


if __name__ == '__main__':
    unittest.main()
