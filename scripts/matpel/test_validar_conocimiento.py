"""Integridad de la lectura GRE existente frente a alteraciones, sin SQL ni motor."""
import copy
import hashlib
import json
import unittest

import pymupdf
from validar_conocimiento import (CONTEXT, ROOT, validar_lectura, validar_cantidades,
                                 validar_inventario_guias, validar_condiciones_guias)


class LecturaConocimientoTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.path=CONTEXT/'response-guides/lectura111-120.json'
        cls.reading=json.loads(cls.path.read_text(encoding='utf-8'))
        cls.catalog=json.loads((ROOT/cls.reading['catalogo']['path']).read_text(encoding='utf-8'))
        cls.source=ROOT/'docs/Manuales/GRE2024-Spa-Web-a.pdf'
        cls.sha=hashlib.sha256(cls.source.read_bytes()).hexdigest()

    def check_reading(self, reading):
        with pymupdf.open(self.source) as pdf:
            return validar_lectura(reading,self.path,self.catalog,pdf,self.sha)

    def test_evidencia_existente_coincide_con_pdf_catalogo_e_imagenes(self):
        self.assertEqual(self.check_reading(self.reading),[])

    def test_literal_caja_y_bloque_alterados_se_detectan(self):
        reading=copy.deepcopy(self.reading)
        clause=reading['guias'][0]['clausulas'][0]
        clause['literalFuente']='Texto ajeno al original'
        clause['fuente']['cajasPt'][0][0]+=10
        clause['fuente']['bloqueCatalogo']=self.catalog['guias'][1]['bloques'][0]['id']
        errors=self.check_reading(reading)
        self.assertTrue(any('Literal de cláusula' in e for e in errors),errors)
        self.assertTrue(any('Cajas de cláusula' in e for e in errors),errors)
        self.assertTrue(any('Bloque de cláusula' in e for e in errors),errors)

    def test_cobertura_duplicada_y_huellas_falsas_se_detectan(self):
        reading=copy.deepcopy(self.reading)
        reading['paginas'].append(copy.deepcopy(reading['paginas'][0]))
        reading['paginas'][0]['sha256Imagen']='0'*64
        reading['paginas'][0]['sha256TextoNativoUtf8']='0'*64
        errors=self.check_reading(reading)
        for detail in ('Páginas duplicadas','Imagen de lectura','Texto de lectura',
                       'Cobertura de páginas','Conteos de lectura'):
            self.assertTrue(any(detail in e for e in errors),errors)

    def test_fuente_inexistente_y_validacion_operativa_no_acreditada_se_detectan(self):
        reading=copy.deepcopy(self.reading)
        reading['guias'][0]['clausulas'][0]['fuente']['referenciasCatalogo']=['ref-inexistente']
        reading['guias'][0]['clausulas'][1]['pruebas']['unitariaMotor']='APROBADA'
        errors=self.check_reading(reading)
        self.assertTrue(any('Referencia de cláusula inexistente' in e for e in errors),errors)
        self.assertTrue(any('Validación no acreditada' in e for e in errors),errors)

    def test_cantidades_metricas_imperiales_y_rangos_contra_pdf(self):
        rules=json.loads((CONTEXT/'reglas-operativas.json').read_text(encoding='utf-8'))
        rule=next(r for r in rules['reglas'] if r['id']=='GRE24-T3-CONTENEDORES-CANTIDADES')
        with pymupdf.open(self.source) as pdf:
            self.assertEqual(validar_cantidades(rule,pdf,self.sha),[])
            modified=copy.deepcopy(rule)
            modified['parametrosDocumentales'][0]['unidad']='L'
            modified['parametrosDocumentales'][1]['valorHasta']='20000'
            modified['parametrosDocumentales'][2]['imperialImpreso']['valorDesde']='999'
            errors=validar_cantidades(modified,pdf,self.sha)
            self.assertEqual(len(errors),3,errors)

    def test_cantidad_y_literal_alterados_juntos_no_superan_pdf(self):
        rules=json.loads((CONTEXT/'reglas-operativas.json').read_text(encoding='utf-8'))
        rule=copy.deepcopy(next(r for r in rules['reglas'] if r['id']=='GRE24-T3-CONTENEDORES-CANTIDADES'))
        parameter=rule['parametrosDocumentales'][3]
        parameter['valorDesde']=parameter['valorHasta']='99'
        parameter['fuente']['extractoLiteral']='Cilindro pequeño: 99 L (19 galones)'
        with pymupdf.open(self.source) as pdf:
            errors=validar_cantidades(rule,pdf,self.sha)
        self.assertTrue(any('Literal de cantidad contradice PDF' in e for e in errors),errors)

    def test_cantidad_eliminada_o_duplicada_no_reduce_inventario_silenciosamente(self):
        rules=json.loads((CONTEXT/'reglas-operativas.json').read_text(encoding='utf-8'))
        original=next(r for r in rules['reglas'] if r['id']=='GRE24-T3-CONTENEDORES-CANTIDADES')
        with pymupdf.open(self.source) as pdf:
            for replacement in ([],[original['parametrosDocumentales'][0]]*5):
                rule=copy.deepcopy(original)
                rule['parametrosDocumentales']=replacement
                self.assertIn('Inventario de cantidades contradice PDF 340.',
                              validar_cantidades(rule,pdf,self.sha))

    def test_lote_nuevo_con_lineas_completas_y_revisiones_registradas(self):
        path=CONTEXT/'response-guides/lectura121-130.json'
        reading=json.loads(path.read_text(encoding='utf-8'))
        with pymupdf.open(self.source) as pdf:
            self.assertEqual(validar_lectura(reading,path,self.catalog,pdf,self.sha),[])

    def test_clausula_eliminada_y_conteo_corregido_no_ocultan_perdida(self):
        path=CONTEXT/'response-guides/lectura121-130.json'
        reading=json.loads(path.read_text(encoding='utf-8'))
        guide=next(g for g in reading['guias'] if g['numero']=='129')
        guide['clausulas'].pop()
        reading['resumen']['clausulas']-=1
        with pymupdf.open(self.source) as pdf:
            errors=validar_lectura(reading,path,self.catalog,pdf,self.sha)
        self.assertTrue(any('Cobertura de líneas de guía incompleta/duplicada' in e for e in errors),errors)

    def test_revision_visual_inventada_y_pagina_impresa_falsa_se_detectan(self):
        path=CONTEXT/'response-guides/lectura121-130.json'
        reading=json.loads(path.read_text(encoding='utf-8'))
        reading['paginas'][0]['revisionVisual']['revisionId']='revision-inexistente'
        reading['paginas'][0]['paginaImpresa']=999
        with pymupdf.open(self.source) as pdf:
            errors=validar_lectura(reading,path,self.catalog,pdf,self.sha)
        self.assertTrue(any('Revisión visual de lectura sin registro' in e for e in errors),errors)
        self.assertTrue(any('Página impresa de lectura contradice fuente' in e for e in errors),errors)

    def test_todos_los_lotes_cubren_inventario_original_y_guias_vacias(self):
        readings=[(p,json.loads(p.read_text(encoding='utf-8')))
                  for p in sorted((CONTEXT/'response-guides').glob('lectura*.json'))]
        inventory=json.loads((CONTEXT/'response-guides/inventario-guias.json').read_text(encoding='utf-8'))
        self.assertEqual(validar_inventario_guias(inventory,readings,self.catalog),[])
        self.assertEqual([r['numero'] for r in inventory['guias']
                          if r['estadoContenido']=='INTENCIONALMENTE_VACIA'],['121','167'])
        with pymupdf.open(self.source) as pdf:
            for path,reading in readings[2:]:
                self.assertEqual(validar_lectura(reading,path,self.catalog,pdf,self.sha),[])

    def test_lote_entero_omitido_y_manifest_reducido_no_ocultan_perdida(self):
        readings=[(p,json.loads(p.read_text(encoding='utf-8')))
                  for p in sorted((CONTEXT/'response-guides').glob('lectura*.json'))]
        inventory=json.loads((CONTEXT/'response-guides/inventario-guias.json').read_text(encoding='utf-8'))
        removed={g['numero'] for g in readings[-1][1]['guias']}
        readings.pop()
        inventory['guias']=[r for r in inventory['guias'] if r['numero'] not in removed]
        inventory['resumen']['numeros']=len(inventory['guias'])
        errors=validar_inventario_guias(inventory,readings,self.catalog)
        self.assertTrue(any('Inventario global de guías incompleto/duplicado' in e for e in errors),errors)
        self.assertTrue(any('Manifest de guías incompleto/duplicado' in e for e in errors),errors)
        self.assertTrue(any('Inventario global de páginas incompleto/duplicado' in e for e in errors),errors)

    def test_lotes_duplicados_y_estado_vacio_falso_se_detectan(self):
        readings=[(p,json.loads(p.read_text(encoding='utf-8')))
                  for p in sorted((CONTEXT/'response-guides').glob('lectura*.json'))]
        inventory=json.loads((CONTEXT/'response-guides/inventario-guias.json').read_text(encoding='utf-8'))
        inventory['guias'][0]['estadoContenido']='INTENCIONALMENTE_VACIA'
        readings.append(readings[0])
        errors=validar_inventario_guias(inventory,readings,self.catalog)
        self.assertTrue(any('Inventario global de guías incompleto/duplicado' in e for e in errors),errors)
        self.assertTrue(any('Fila de manifest contradice fuente/lectura: 111' in e for e in errors),errors)

    def test_subapartado_falso_con_literal_y_referencias_intactos_se_detecta(self):
        path=CONTEXT/'response-guides/lectura141-150.json'
        reading=json.loads(path.read_text(encoding='utf-8'))
        guide=next(g for g in reading['guias'] if g['numero']=='147')
        clause=next(c for c in guide['clausulas'] if 'Sólo rocíe agua' in c['literalFuente'])
        clause['subseccion']=clause['condicionesActivacion']['subseccion']='Incendio Grande'
        with pymupdf.open(self.source) as pdf:
            errors=validar_lectura(reading,path,self.catalog,pdf,self.sha)
        self.assertTrue(any('Subapartado de cláusula contradice títulos originales' in e for e in errors),errors)

    def conditions_fixture(self):
        readings=[(p,json.loads(p.read_text(encoding='utf-8')))
                  for p in sorted((CONTEXT/'response-guides').glob('lectura*.json'))]
        return (json.loads((CONTEXT/'response-guides/notas131-174.json').read_text(encoding='utf-8')),
                json.loads((CONTEXT/'test-cases/casos-guias131-174.json').read_text(encoding='utf-8')),
                json.loads((CONTEXT/'reglas-operativas.json').read_text(encoding='utf-8')),readings)

    def test_condiciones_especificas_conservan_cobertura_fuente_y_casos_sin_motor(self):
        self.assertEqual(validar_condiciones_guias(*self.conditions_fixture()),[])

    def test_fuente_de_condicion_cambiada_y_resultado_inventado_se_detectan(self):
        notes,cases,rules,readings=self.conditions_fixture()
        rule=next(r for r in rules['reglas'] if r['id']=='GRE24-G147-CONDICION-ESPECIFICA')
        rule['fuentes'][0]['subseccion']='Incendio Grande'
        cases['casos'][0]['pruebaMotor']='APROBADA'
        errors=validar_condiciones_guias(notes,cases,rules,readings)
        self.assertTrue(any('Fuente de condición específica contradice lectura: 147' in e for e in errors),errors)
        self.assertTrue(any('Caso propuesto atribuye resultado no acreditado' in e for e in errors),errors)

    def test_anotacion_o_caso_omitidos_no_cierran_inventario(self):
        notes,cases,rules,readings=self.conditions_fixture()
        notes['guias'].pop()
        cases['casos'].pop()
        errors=validar_condiciones_guias(notes,cases,rules,readings)
        self.assertTrue(any('Anotaciones específicas incompletas/duplicadas' in e for e in errors),errors)
        self.assertTrue(any('Inventario de casos específicos incompleto/duplicado' in e for e in errors),errors)


if __name__=='__main__':
    unittest.main()
