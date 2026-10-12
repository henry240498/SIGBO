"""Regresiones ante pérdida de lectura, atribución falsa y fuentes equivocadas."""
import copy
import unittest
import pymupdf
from validar_paginas import BASE, ROOT, leer, huella, validar_paginas, validar_hallazgos


class PaginasTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.manifest = leer(BASE / 'paginas/inventario.json')
        cls.notes = leer(BASE / 'paginas/notas.json')
        cls.visual = leer(BASE / 'evidencia/revision-visual.json')
        cls.catalog = leer(ROOT / cls.manifest['catalogo']['path'])
        cls.pdf = pymupdf.open(ROOT / cls.manifest['fuente']['path'])
        cls.sha = huella(ROOT / cls.manifest['fuente']['path'])

    @classmethod
    def tearDownClass(cls):
        cls.pdf.close()

    def check(self, manifest=None, notes=None, visual=None):
        return validar_paginas(manifest or self.manifest, notes or self.notes,
                               visual or self.visual, self.catalog, self.pdf, self.sha)

    def test_cobertura_real_392_con_246_nuevas(self):
        self.assertEqual(len(self.notes['paginas']), 246)
        self.assertEqual(sum(bool(r['antecedente']) for r in self.manifest['paginas']), 146)
        self.assertEqual(self.check(), [])

    def test_omision_aun_con_392_filas_se_detecta(self):
        data = copy.deepcopy(self.manifest)
        data['paginas'][-1] = copy.deepcopy(data['paginas'][-2])
        self.assertIn('Inventario de páginas incompleto o duplicado.', self.check(manifest=data))

    def test_render_solo_no_acredita_lectura(self):
        data = copy.deepcopy(self.manifest)
        row = next(r for r in data['paginas'] if not r['antecedente'])
        row['lecturaNueva'] = None
        row['estado'] = 'RENDER_PREPARADO_NO_LEIDO'
        self.assertTrue(any('render no acredita lectura' in e for e in self.check(manifest=data)))

    def test_lectura_sin_anotacion_se_detecta(self):
        data = copy.deepcopy(self.notes)
        data['paginas'].pop()
        self.assertTrue(any('sin anotación/registro visual' in e for e in self.check(notes=data)))

    def test_imagen_y_texto_cambiados_se_detectan(self):
        data = copy.deepcopy(self.manifest)
        data['paginas'][0]['sha256Imagen'] = '0' * 64
        data['paginas'][0]['sha256TextoNativoUtf8'] = '0' * 64
        errors = self.check(manifest=data)
        self.assertTrue(any('Imagen de página' in e for e in errors))
        self.assertTrue(any('Texto nativo de página' in e for e in errors))

    def test_miniatura_154_no_sustituye_pie_principal(self):
        data = copy.deepcopy(self.visual)
        r = next(r for r in data['revisiones'] if r['id'] == 'GRE24-VISUAL-0154-PAGINAS-RESTANTES')
        r['paginaImpresa'] = '168'
        self.assertTrue(any('Pie principal' in e for e in self.check(visual=data)))

    def test_registro_de_otra_pagina_y_alcance_operativo_se_detectan(self):
        data = copy.deepcopy(self.visual)
        r = next(r for r in data['revisiones'] if r['id'] == 'GRE24-VISUAL-0360-PAGINAS-RESTANTES')
        r['paginaPdf'] = 361
        r['estado'] = 'VALIDACION_OPERATIVA'
        errors = self.check(visual=data)
        self.assertTrue(any('contradice procedencia' in e for e in errors))
        self.assertTrue(any('alcance no acreditado' in e for e in errors))

    def test_nota_cambiada_y_fragmento_ajeno_se_detectan(self):
        data = copy.deepcopy(self.notes)
        data['paginas'][0]['observaciones'] = ['Observación alterada']
        data['paginas'][0]['fragmentosFuente'] = ['Texto ajeno a esta página']
        errors = self.check(notes=data)
        self.assertTrue(any('desincronizada' in e for e in errors))
        self.assertTrue(any('Fragmento de anotación' in e for e in errors))

    def test_hallazgos_conservan_fuente_y_no_atribuyen_prueba(self):
        data = leer(BASE / 'paginas/hallazgos.json')
        self.assertEqual(validar_hallazgos(data, self.pdf, self.sha), [])
        data['hallazgos'][0]['fuentes'][0]['literal'] = 'Viento en dirección inventada'
        data['hallazgos'][0]['pruebaMotor'] = 'APROBADA'
        errors = validar_hallazgos(data, self.pdf, self.sha)
        self.assertTrue(any('fuente ajena' in e for e in errors))
        self.assertTrue(any('prueba no realizada' in e for e in errors))


if __name__ == '__main__':
    unittest.main()
