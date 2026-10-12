"""Pruebas de conservación del lote real y límites de procedencia; sin motor/SQL."""
import json
import unittest
from unittest.mock import patch

from documentar_guias import CONTEXT, ROOT, construir_lote, revision_registrada


class DocumentarGuiasTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.artifact=next((ROOT/'backend/private_uploads/gre').glob('*.catalogo-1-*.json'))
        cls.output=CONTEXT/'response-guides'
        cls.reading=json.loads((cls.output/'lectura121-130.json').read_text(encoding='utf-8'))

    def test_render_y_texto_no_crean_revision_visual(self):
        with patch('documentar_guias.revision_registrada',return_value=None):
            reading=construir_lote(121,130,self.artifact,self.output)
        self.assertTrue(all(not p['revisionVisual']['realizada'] for p in reading['paginas']))
        self.assertTrue(all(not c['evidencia']['paginaVisualLeida'] for g in reading['guias'] for c in g['clausulas']))

    def test_registro_exige_misma_pagina_fuente_e_imagen(self):
        record={'paginaPdf':180,'documentoSha256':'fuente','imagenSha256':'imagen'}
        self.assertIs(revision_registrada([record],180,'fuente','imagen'),record)
        self.assertIsNone(revision_registrada([record],181,'fuente','imagen'))
        self.assertIsNone(revision_registrada([record],180,'otra-fuente','imagen'))
        self.assertIsNone(revision_registrada([record],180,'fuente','otra-imagen'))

    def test_guia_vacia_excepciones_y_remisiones_del_pdf_se_conservan(self):
        guides={g['numero']:g for g in self.reading['guias']}
        empty=guides['121']
        self.assertEqual(empty['estadoContenido'],'INTENCIONALMENTE_VACIA')
        self.assertEqual(empty['clausulas'],[])
        self.assertIsNone(empty['tituloOriginal'])
        refs={r for c in guides['128']['clausulas'] for r in c['reglasRelacionadas']}
        self.assertTrue({'GRE24-GUIA-138','GRE24-GUIA-147','GRE24-GUIA-169'}<=refs)
        nitro=next(c for c in guides['129']['clausulas'] if c['id']=='GRE24-G129-B08-C03')
        self.assertIn('No usar extintores',nitro['literalFuente'])
        self.assertIn('UN1261',nitro['literalFuente'])
        self.assertIn('UN2842',nitro['literalFuente'])
        self.assertEqual(nitro['subseccion'],'Incendio Pequeño')

    def test_erap_es_nota_jurisdiccional_sin_copiarlo_a_guias_que_no_lo_tienen(self):
        for guide in self.reading['guias']:
            notes=[c for c in guide['clausulas'] if 'ERAP' in c['literalFuente']]
            for note in notes:
                self.assertEqual(note['tipo'],'NOTA_JURISDICCIONAL')
            if guide['numero'] in ('121','126','130'):
                self.assertEqual(notes,[])

    def test_titulos_plurales_de_metales_no_heredan_incendio_grande(self):
        reading=construir_lote(131,140,self.artifact,self.output)
        guides={g['numero']:g for g in reading['guias']}
        aluminum=next(c for c in guides['133']['clausulas']
                      if 'Los incendios de Pasta de Aluminio deben tratarse' in c['literalFuente'])
        self.assertEqual(aluminum['subseccion'],
                         'Incendios Involucrando Pigmentos o Pastas Metálicas (ej. “Pasta de Aluminio”)')
        metals=next(c for c in guides['138']['clausulas'] if 'Lith-X' in c['literalFuente'])
        self.assertEqual(metals['subseccion'],
                         'Incendios Involucrando Metales o Polvos  (Aluminio, Litio, Magnesio, etc.)')
        for number in ('133','138'):
            self.assertFalse(any('Incendios Involucrando' in c['literalFuente'] for c in guides[number]['clausulas']))

    def test_titulo_partido_de_bateria_no_crea_indicacion_y_separa_tamanos(self):
        reading=construir_lote(141,150,self.artifact,self.output)
        clauses=next(g['clausulas'] for g in reading['guias'] if g['numero']=='147')
        small=next(c for c in clauses if 'Sólo rocíe agua' in c['literalFuente'])
        large=next(c for c in clauses if 'Permita que el fuego' in c['literalFuente'])
        self.assertEqual(small['subseccion'],
                         'Incendio pequeño o Incendio con una batería pequeña (p. ej., dispositivos electrónicos personales,\n'
                         'bicicletas eléctricas, etc.)')
        self.assertIn('Baterías Grandes',large['subseccion'])
        self.assertFalse(any(c['literalFuente'].strip()=='bicicletas eléctricas, etc.)' for c in clauses))


if __name__=='__main__':
    unittest.main()
