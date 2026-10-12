"""Empaquetar anotaciones ya leídas; no leer visualmente ni implementar un motor.

Las conclusiones proceden de notas131-174.json, escritas al leer el PDF original.
Este script solo enlaza literales, registros y casos documentales propuestos.
"""
from datetime import datetime, timezone
import json
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'.context/gre2024'
GUIDES=BASE/'response-guides'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def write(path, data):
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')


def normalized(text):
    return ' '.join(text.split())


def cell(text):
    return normalized(str(text)).replace('|','\\|')


def main():
    readings=[(p,read(p)) for p in sorted(GUIDES.glob('lectura*.json'))]
    sample=readings[0][1]
    source_sha=sample['fuente']['sha256']
    artifact_sha=sample['catalogo']['sha256']
    catalog=read(ROOT/sample['catalogo']['path'])
    originals={g['numero']:g for g in catalog['guias']}
    notes=read(GUIDES/'notas131-174.json')
    annotations={str(n['guia']):n for n in notes['guias']}
    if set(annotations)!={str(n) for n in range(131,175)}:
        raise ValueError('Las anotaciones deben cubrir todos los números131–174.')
    rules=read(BASE/'reglas-operativas.json')
    proposed=[]
    new_rules=[]
    rows=[]
    remissions=[]
    for path,reading in readings:
        page_map={p['paginaPdf']:p for p in reading['paginas']}
        document=[]
        if reading['version']>=3:
            r=reading['resumen']
            document=[f'# GRE24 — lectura {path.stem.removeprefix("lectura")}',
                      '',f"{r['guiasConContenido']} guías con contenido, {r['guiasSinMateriales']} sin materiales; "
                      f"{r['paginas']} páginas / {r['bloques']} bloques / {r['clausulas']} cláusulas documentales.",
                      '', 'Cada página se leyó en texto nativo y se inspeccionó individualmente desde el PDF original. '
                      'La numeración PDF y la impresa se cotejaron separadamente. '
                      'Las conclusiones específicas proceden de [anotaciones del lector](notas131-174.json). '
                      'El [registro completo por cláusula]('+path.name+') conserva todos los literales, cajas, '
                      'referencias del candidato y líneas estructurales. Las tablas siguientes seleccionan '
                      'evacuación y condiciones particulares, sin reemplazar ese registro.',
                      '', 'Estado: lectura documental principal; revisión independiente, predicados de motor, '
                      'pruebas operativas e integración SCI pendientes. La lectura no activa un catálogo '
                      'ni autoriza intervenciones. Los auxilios específicos conservan su remisión a '
                      '[auxilios generales y demás dependencias](dependencias.md); ERAP pertenece a Canadá.', '']
        for guide in reading['guias']:
            number=guide['numero']
            content_state=guide.get('estadoContenido',originals[number]['estadoContenido'])
            row={'numero':number,'tituloOriginal':guide['tituloOriginal'],
                 'estadoContenido':content_state,'lectura':path.name,
                 'estudio':guide.get('notasInterpretativas',f'{path.stem}.md#guia-{number}'),'paginasPdf':guide['paginasPdf'],
                 'paginasImpresas':guide['paginasImpresas'],'clausulas':len(guide['clausulas']),
                 'estado':'LECTURA_DOCUMENTAL_SIN_MOTOR',
                 'revisionesVisuales':[page_map[n]['revisionVisual'].get('revisionId') for n in guide['paginasPdf']]}
            rows.append(row)
            for clause in guide['clausulas']:
                for target in clause['reglasRelacionadas']:
                    if target.startswith('GRE24-GUIA-'):
                        target_number=target.removeprefix('GRE24-GUIA-')
                        if target_number not in {g['numero'] for g in catalog['guias']}:
                            raise ValueError(f'Remisión desconocida: {target}')
                    remissions.append({'guiaOrigen':number,'clausula':clause['id'],
                                      'destino':target,'paginasPdf':clause['fuente']['paginasPdf'],
                                      'paginasImpresas':clause['fuente']['paginasImpresas'],
                                      'estado':'REFERENCIA_DOCUMENTAL_NO_EVALUACION_CONJUNTA'})
            if reading['version']<3:
                continue
            note=annotations[number]
            selected=[]
            for fragment in note['fragmentosClave']:
                matches=[c for c in guide['clausulas'] if normalized(fragment) in normalized(c['literalFuente'])]
                if not matches:
                    raise ValueError(f'Fragmento no encontrado: guía{number}: {fragment}')
                selected.extend(c for c in matches if c not in selected)
            title=guide['tituloOriginal'] or 'Sin materiales asociados'
            document.extend([f'<a id="guia-{number}"></a>',f'## Guía {number} — {title}', '',
                             f"PDF {', '.join(map(str,guide['paginasPdf']))}; impresas "
                             f"{', '.join(map(str,guide['paginasImpresas']))}. "
                             f"Orden de peligros: {', '.join(guide['ordenPeligros']) or 'no corresponde'}.", '',
                             'Originales renderizados: '+', '.join(
                             f"[PDF{n}](evidencia{path.stem.removeprefix('lectura')}/pdf-{n:03d}.png)"
                             for n in guide['paginasPdf'])+'.',''])
            for observation in note['observaciones']:
                document.extend([observation,''])
            document.extend(['Condición particular: '+note['condicionClave'], '',
                             'Límite de interpretación: '+note['limite'], ''])
            displayed=[c for c in guide['clausulas'] if c['seccion']=='EVACUACIÓN' or c in selected]
            if displayed:
                document.extend(['| Cláusula / sección / subapartado | Literal original | PDF / impresa |',
                                 '|---|---|---|'])
                for clause in displayed:
                    f=clause['fuente']
                    document.append(f"| {clause['id']} / {cell(clause['seccion'])} / "
                                    f"{cell(clause['subseccion'] or 'general')} | {cell(clause['literalFuente'])} | "
                                    f"{cell(f['paginasPdf'])} / {cell(f['paginasImpresas'])} |")
                document.append('')
            if guide['estadoContenido']=='INTENCIONALMENTE_VACIA':
                proposed.append({'id':f'GRE24-COMP-G{number}-VACIA','guia':number,
                                 'entradasDocumentales':['Solicitud de respuesta por guía167.'],
                                 'esperadoDocumental':'No hay materiales asociados ni cláusulas de respuesta; no rellenar con otra guía.',
                                 'paginasPdf':guide['paginasPdf'],'paginasImpresas':guide['paginasImpresas'],
                                 'resultadoObtenidoIndependiente':None,'revisionIndependiente':'PENDIENTE',
                                 'pruebaMotor':'PENDIENTE'})
                continue
            if not selected:
                raise ValueError(f'Guía{number} sin evidencia específica.')
            sources=[{'documentoSha256':source_sha,'paginaPdf':c['fuente']['paginasPdf'][0],
                      'paginaImpresa':str(c['fuente']['paginasImpresas'][0]),
                      'extractoLiteral':c['literalFuente'],'clausulaDocumental':c['id'],
                      'referenciasCatalogo':c['fuente']['referenciasCatalogo'],
                      'cajasPt':c['fuente']['cajasPt'],'seccion':c['seccion'],'subseccion':c['subseccion'],
                      'artefactoSha256':artifact_sha} for c in selected]
            rule_id=f'GRE24-G{number}-CONDICION-ESPECIFICA'
            case_ids=[f'GRE24-COMP-G{number}-CONDICION',f'GRE24-COMP-G{number}-INCOMPLETO']
            new_rules.append({'id':rule_id,'descripcion':f'Condición particular documentada de guía{number}: {title}.',
                              'condicionesActivacion':[note['condicionClave']],
                              'entradasNecesarias':['Identificación del material y guía, con fuente y grado de certeza.',
                                  'Escenario de cada cláusula: incendio, derrame, equipo o auxilio, según corresponda.',
                                  'Datos de la condición particular respaldados; incógnitas conservadas explícitamente.'],
                              'procedimientoInterpretacion':['Leer la guía completa, incluyendo peligros, protección y auxilios.',
                                  'Comprobar la condición particular y el subapartado de cada literal.',
                                  'Resolver las remisiones para el material y escenario antes de combinar conclusiones.',
                                  'Preservar negaciones, alternativas, modalidad y condiciones desconocidas.'],
                              'resultadoEsperado':note['limite'],
                              'excepcionesYAlteraciones':note['observaciones'],
                              'reglasRelacionadas':list(dict.fromkeys(t for c in selected for t in c['reglasRelacionadas'])),
                              'fuentes':sources,
                              'evidencia':[{'revisionId':page_map[n]['revisionVisual']['revisionId'],
                                           'archivo':'evidencia/revision-visual.json'}
                                          for n in dict.fromkeys(n for c in selected for n in c['fuente']['paginasPdf'])],
                              'pruebas':{'estado':'CASOS_DOCUMENTALES_PROPUESTOS_SIN_MOTOR','casos':case_ids,
                                         'archivo':'test-cases/casos-guias131-174.json'},
                              'validacion':{'documental':'LECTURA_VISUAL_Y_NATIVA_CONDICIONES_EXPLICITADAS',
                                            'operativa':'PENDIENTE','institucional':'PENDIENTE'},
                              'limites':[note['limite'],'Revisión independiente de interpretación pendiente.',
                                         'Sin evaluador determinista ni prueba operativa de motor/SCI.'],
                              'implementacion':{'estado':'NO_IMPLEMENTADA','archivos':[]},'hipotesis':[],
                              'formalizacion':{'tipo':'CONDICIONES_DOCUMENTALES_EXPLICITADAS_NO_EJECUTABLES',
                                               'datosDesconocidos':'INSUFICIENTE_PARA_CONCLUSION_NEGATIVA'}})
            for case_id,expected in zip(case_ids,[note['limite'],
                    'Información incompleta: no afirmar condición satisfecha, ausencia de peligro ni permiso para intervenir.']):
                proposed.append({'id':case_id,'reglaId':rule_id,
                                 'entradasDocumentales':[note['condicionClave'] if 'INCOMPLETO' not in case_id
                                                        else 'Material, escenario o recurso relevante desconocido.'],
                                 'esperadoDocumental':expected,'fuentes':sources,
                                 'resultadoObtenidoIndependiente':None,'revisionIndependiente':'PENDIENTE',
                                 'pruebaMotor':'PENDIENTE'})
        if document:
            path.with_suffix('.md').write_text('\n'.join(document)+'\n',encoding='utf-8')
    new_ids={r['id'] for r in new_rules}
    rules['reglas']=[r for r in rules['reglas'] if r['id'] not in new_ids]+new_rules
    write(BASE/'reglas-operativas.json',rules)
    write(BASE/'test-cases/casos-guias131-174.json',{
          'id':'GRE24-CASOS-GUIAS-131-174','tipo':'COMPRENSION_DOCUMENTAL_PROPUESTA_NO_PRUEBA_OPERATIVA',
          'fuenteSha256':source_sha,'casos':proposed})
    rows.sort(key=lambda r:int(r['numero']))
    inventory={'id':'GRE24-INVENTARIO-GUIAS-COMPLETO','fuenteSha256':source_sha,
               'artefactoSha256':artifact_sha,'fechaUtc':datetime.now(timezone.utc).isoformat(),
               'estado':'COBERTURA_DOCUMENTAL_GUIAS_COMPLETA_SIN_MOTOR',
               'resumen':{'numeros':len(rows),'conContenido':sum(r['estadoContenido']=='CON_CONTENIDO' for r in rows),
                          'sinMateriales':sum(r['estadoContenido']=='INTENCIONALMENTE_VACIA' for r in rows),
                          'paginas':sum(len(r['paginasPdf']) for r in rows),
                          'clausulas':sum(r['clausulas'] for r in rows)},
               'guias':rows,'remisiones':remissions,
               'limites':['Inventario de guías, no inventario exhaustivo de reglas GRE.',
                          'Condiciones expresadas documentalmente, sin predicados ejecutables.',
                          'Remisiones localizadas; interacción, precedencia y pruebas operativas pendientes.']}
    write(GUIDES/'inventario-guias.json',inventory)
    index=['# GRE24 — inventario completo de guías', '',
           '62 guías con contenido y dos números sin materiales; 128 páginas originales. '
           'La cobertura documental completa de este bloque no acredita dominio de las392 páginas '
           'ni habilita un motor. [Manifest verificable](inventario-guias.json). '
           '[Dependencias comunes](dependencias.md).', '',
           '| Guía | Título | PDF / impresa | Cláusulas | Lectura / estudio |', '|---|---|---|---|---|']
    for row in rows:
        index.append(f"| {row['numero']} | {cell(row['tituloOriginal'] or 'Sin materiales asociados')} | "
                     f"{cell(row['paginasPdf'])} / {cell(row['paginasImpresas'])} | {row['clausulas']} | "
                     f"[Registro]({row['lectura']}) / [estudio]({row['estudio']}) |")
    index.extend(['', 'Las remisiones por cláusula figuran en el manifest; su localización '
                  'no resuelve automáticamente interacción ni precedencia. El candidato original '
                  'conserva sus bytes y estado institucional. Las referencias `ref-*` se interpretan '
                  'dentro del artefacto identificado por SHA256, no como identificadores SQL.', ''])
    (GUIDES/'inventario-guias.md').write_text('\n'.join(index),encoding='utf-8')
    print(json.dumps({'inventario':inventory['resumen'],'reglasNuevas':len(new_rules),
                      'casosPropuestosNuevos':len(proposed),'remisiones':len(remissions)},ensure_ascii=False))


if __name__=='__main__':
    main()
