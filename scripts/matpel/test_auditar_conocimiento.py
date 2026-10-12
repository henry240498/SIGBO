"""Regresión del auditor frente a corrupciones reales del catálogo, sin DB."""
import copy
import json
from pathlib import Path
import tempfile
import unittest

import pymupdf
from auditar_conocimiento import ROOT, PDF, auditar, cotejar_texto, lineas_nativas, nombre_normalizado


class AuditorConocimientoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.artifact=next((ROOT/'backend/private_uploads/gre').glob('*catalogo-1*.json'))
        cls.original=json.loads(cls.artifact.read_text(encoding='utf-8'))

    def test_linea_superpuesta_portada_cotejada_por_su_caja(self):
        # PDF1 tiene títulos solapados en cajas: no basta tomar todo el textbox.
        ref=next(r for r in self.original['referencias'] if r['paginaPdf']==1 and r['textoOriginal']=='2024')
        with pymupdf.open(PDF) as doc:
            method,detail=cotejar_texto(ref,lineas_nativas(doc[0]))
        self.assertEqual(method,'LINEA_Y_CAJA_NATIVAS')
        self.assertIsNone(detail)

    def test_cifra_inventada_no_pasa_por_compartir_caja(self):
        ref=copy.deepcopy(next(r for r in self.original['referencias'] if r['paginaPdf']==1 and r['textoOriginal']=='2024'))
        ref['textoOriginal']='2025'
        with pymupdf.open(PDF) as doc:
            method,detail=cotejar_texto(ref,lineas_nativas(doc[0]))
        self.assertEqual(method,'DIFERENCIA_NATIVA')
        self.assertIsNotNone(detail)

    def test_normalizacion_preserva_guiones_y_distingue_materiales(self):
        self.assertEqual(nombre_normalizado('3,5-Dicloro-2,4,6-\ntrifluoropiridina'),
                         '3,5-DICLORO-2,4,6-TRIFLUOROPIRIDINA')
        self.assertEqual(nombre_normalizado('  Óxido\n de etileno  '), 'OXIDO DE ETILENO')
        self.assertNotEqual(nombre_normalizado('Óxido de etileno'),
                            nombre_normalizado('Óxido de etileno con nitrógeno'))

    def test_alteraciones_de_fuente_valores_relaciones_y_verde_se_detectan(self):
        modified=copy.deepcopy(self.original)
        modified['documento']['sha256']='0'*64
        modified['paginas'][0]['sha256TextoNativo']='0'*64
        native=next(r for r in modified['referencias'] if r['paginaPdf']==1 and r['textoOriginal']=='2024')
        native['textoOriginal']='2025'
        green=next(r for r in modified['referencias'] if r['tecnica']=='RELLENO_VECTORIAL_RECTANGULO')
        green['rgb']=[0,0,0]
        modified['relacionesIndices'][0]['guiaNumero']='999'
        cell=modified['tablas'][0]['filas'][0]['celdas'][0]
        cell['valorDecimal']='99999'
        cell['fuentes'].append('ref-inexistente')
        # Ataque coordinado: valor/texto coinciden entre sí, pero contradicen PDF.
        second=modified['tablas'][0]['filas'][0]['celdas'][2]
        second['valorDecimal']='999'
        second['textoOriginal']='999 km'
        second['unidad']='kg'
        relation=modified['relacionesIndices'][1]
        relation['nombreNormalizado']='MATERIAL ALTERADO'
        relation['resaltadoVerde']=not relation['resaltadoVerde']
        for entry_id in relation['amarilloIds']+relation['azulIds']:
            entry=next(e for e in modified['entradas'] if e['id']==entry_id)
            entry['nombreOriginal']='Material alterado'
            entry['nombreNormalizado']=relation['nombreNormalizado']
            entry['resaltadoVerde']=relation['resaltadoVerde']
        # Conservar literal y refs; adulterar solo el nombre derivado en ambos índices
        # y en su relación pasaba el cotejo previo de igualdad entre estructuras.
        derived=modified['relacionesIndices'][2]
        derived['nombreNormalizado']='NOMBRE DERIVADO INVENTADO'
        for entry_id in derived['amarilloIds']+derived['azulIds']:
            next(e for e in modified['entradas'] if e['id']==entry_id)['nombreNormalizado']=derived['nombreNormalizado']
        row=modified['tablas'][0]['filas'][1]
        row['nombreNormalizado']='NOMBRE DERIVADO INVENTADO'
        row['guiaNumero']='999'
        row['polimerizable']=not row['polimerizable']
        container=modified['tablas'][2]['filas'][0]
        container['contenedorNormalizado']='CONTENEDOR INVENTADO'
        with tempfile.TemporaryDirectory(prefix='gre-auditor-corrupcion-') as temp_dir:
            artifact=Path(temp_dir)/'corrupto.json'
            artifact.write_text(json.dumps(modified,ensure_ascii=False),encoding='utf-8')
            report=auditar(PDF,artifact)
        codes={d['codigo'] for d in report['discrepancias']}
        self.assertTrue({'DOCUMENTO_SHA_DIFERENTE','PAGINA_TEXTO_DIFERENTE',
                         'REFERENCIA_TEXTO_DIFERENTE','RECTANGULO_NO_ENCONTRADO',
                         'INDICES_DISCREPANTES','GUIA_INEXISTENTE',
                         'CELDA_VALOR_DISCREPANTE','REFERENCIA_INEXISTENTE',
                         'CELDA_TEXTO_CONTRADICE_FUENTE','CELDA_UNIDAD_CONTRADICE_COLUMNA',
                         'INDICE_CAMPO_CONTRADICE_FUENTE','INDICE_VERDE_CONTRADICE_FONDO',
                         'INDICE_NOMBRE_NORMALIZADO_DISCREPANTE','FILA_NOMBRE_NORMALIZADO_DISCREPANTE',
                         'FILA_NUMERO_CONTRADICE_GUIA','FILA_P_CONTRADICE_GUIA',
                         'FILA_CONTENEDOR_NORMALIZADO_DISCREPANTE'}<=codes,codes)
        self.assertFalse(report['resumen']['dominioIntegralDemostrado'])
        self.assertFalse(report['artefacto']['aptoActivacion'])
        self.assertEqual(self.original['referencias'][0]['estadoRevision'],'PENDIENTE')


if __name__=='__main__':
    unittest.main()
