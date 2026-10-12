"""Preparar lotes documentales GRE; nunca crear revisión visual ni reglas ejecutables.

Reutiliza la agrupación del lote inicial. El PDF y el candidato se cotejan por
texto y referencia; la interpretación específica se escribe en el documento de
estudio. Una imagen renderizada solo figura como leída si ya existe un registro
visual con el mismo SHA de PDF, página e imagen. Sin SQL, red o activación.
"""
from __future__ import annotations

import argparse
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path

import pymupdf

ROOT=Path(__file__).resolve().parents[2]
CONTEXT=ROOT/'.context/gre2024'
PDF=ROOT/'docs/Manuales/GRE2024-Spa-Web-a.pdf'
HELPER_PATH=CONTEXT/'response-guides/auditar111_120.py'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def helpers():
    spec=importlib.util.spec_from_file_location('gre_lote_inicial',HELPER_PATH)
    module=importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def revision_registrada(reviews, number, source_sha, image_sha):
    return next((r for r in reversed(reviews)
                 if r['paginaPdf']==number and r['documentoSha256']==source_sha
                 and r['imagenSha256']==image_sha),None)


def construir_lote(first, last, artifact, output):
    helper=helpers()
    source_sha=sha(PDF)
    data=json.loads(artifact.read_text(encoding='utf-8'))
    if data['documento']['sha256']!=source_sha:
        raise ValueError('El candidato no corresponde al PDF original.')
    original={g['numero']:g for g in data['guias']}
    if not 111<=first<=last<=174 or any(str(n) not in original for n in range(first,last+1)):
        raise ValueError('Seleccione un rango existente de guías 111–174.')
    printed={}
    needed={n for number in range(first,last+1) for n in original[str(number)]['paginasPdf']}
    for page in data['paginas']:
        if page['paginaPdf'] not in needed:
            continue
        labels=page['etiquetasImpresas']
        if len(labels)!=1 or not labels[0]['valor'].isdigit():
            raise ValueError(f'Numeración impresa ambigua en PDF{page["paginaPdf"]}; revisar original.')
        printed[page['paginaPdf']]=int(labels[0]['valor'])
    refs={r['id']:r for r in data['referencias']}
    reviews=json.loads((CONTEXT/'evidencia/revision-visual.json').read_text(encoding='utf-8'))['revisiones']
    output.mkdir(parents=True,exist_ok=True)
    images=output/f'evidencia{first}-{last}'
    images.mkdir(exist_ok=True)
    pages=[]
    guides=[]
    findings=[]
    with pymupdf.open(PDF) as pdf:
        for number in range(first,last+1):
            g=original[str(number)]
            items=[]
            structure=[]
            visual_by_page={}
            for page in g['paginas']:
                n=page['paginaPdf']
                native=pdf[n-1].get_text()
                equal=native==page['textoNativoOriginal']
                if not equal:
                    findings.append({'tipo':'TEXTO_NATIVO_DISTINTO','paginaPdf':n})
                image=images/f'pdf-{n:03d}.png'
                if not image.exists():
                    pdf[n-1].get_pixmap(matrix=pymupdf.Matrix(1.8,1.8)).save(image)
                image_sha=sha(image)
                review=revision_registrada(reviews,n,source_sha,image_sha)
                visual={'realizada':review is not None,'estado':'REGISTRO_PREVIO_COTEJADO' if review else 'PENDIENTE'}
                if review:
                    visual.update({'revisionId':review['id'],'revisor':review['revisor'],
                                   'fechaUtc':review['fechaUtc'],'metodo':review['metodo'],
                                   'registro':'../evidencia/revision-visual.json'})
                visual_by_page[n]=visual['realizada']
                pages.append({'paginaPdf':n,'paginaImpresa':printed[n],
                              'sha256TextoNativoUtf8':hashlib.sha256(native.encode('utf-8')).hexdigest(),
                              'textoNativoIgualCatalogo':equal,'imagenOriginalRenderizada':image.relative_to(output).as_posix(),
                              'sha256Imagen':image_sha,'revisionVisual':visual})
            for block in g['bloques']:
                if len(block['lineas'])!=len(block['fuentes']):
                    findings.append({'tipo':'LINEAS_REF_NO_1_A_1','bloque':block['id']})
                    continue
                used=set()
                for i,group in enumerate(helper.clauses(block,refs),1):
                    literal='\n'.join(group['lineas'])
                    ids=group['referencias']
                    used.update(ids)
                    found=all(helper.norm(refs[r]['textoOriginal']) in helper.norm(pdf[refs[r]['paginaPdf']-1].get_text()) for r in ids)
                    if not found:
                        findings.append({'tipo':'LITERAL_NO_LOCALIZADO','referencias':ids})
                    kind=helper.classify(block['encabezadoOriginal'],literal)
                    interpretation=helper.interpretation(block['encabezadoOriginal'],group['subseccion'],literal)
                    if literal.startswith('En Canadá'):
                        kind='NOTA_JURISDICCIONAL'
                        interpretation='Nota ERAP de Canadá exterior a los primeros auxilios; no convertirla en requisito paraguayo ni en indicación médica.'
                    items.append({'id':f'GRE24-G{number}-B{block["orden"]:02d}-C{i:02d}',
                                  'seccion':block['encabezadoOriginal'],'subseccion':group['subseccion'],
                                  'tipo':kind,'literalFuente':literal,'literalBreve':helper.norm(literal).removeprefix('•')[:160],
                                  'interpretacion':interpretation,
                                  'condicionesActivacion':{'guiaSeleccionada':str(number),
                                  'seccion':block['encabezadoOriginal'],'subseccion':group['subseccion'],
                                  'condicionesYExcepcionesLiteral':literal,
                                  'limite':'Clasificación y lectura contextual documental; no predicado de motor validado.'},
                                  'reglasRelacionadas':helper.related(literal),
                                  'fuente':{'documentoSha256':source_sha,'paginasPdf':group['paginasPdf'],
                                  'paginasImpresas':[printed[n] for n in group['paginasPdf']],
                                  'referenciasCatalogo':ids,'bloqueCatalogo':block['id'],
                                  'cajasPt':[refs[r]['cajaPt'] for r in ids]},
                                  'evidencia':{'lineasFuenteLocalizadasEnPdf':found,
                                  'paginaVisualLeida':all(visual_by_page[n] for n in group['paginasPdf'])},
                                  'implementacion':{'estado':'NO_IMPLEMENTADA','motorOperativo':'PENDIENTE'},
                                  'pruebas':{'unitariaMotor':'PENDIENTE','integracionMotor':'PENDIENTE',
                                  'comprensionIndependiente':'PENDIENTE'},
                                  'estadoValidacion':'DOCUMENTAL_SIN_VALIDACION_OPERATIVA'})
                structure.extend({'referenciaCatalogo':refid,'bloqueCatalogo':block['id'],
                                  'textoOriginal':refs[refid]['textoOriginal']}
                                 for refid in block['fuentes'] if refid not in used)
            guides.append({'id':f'GRE24-GUIA-{number}','numero':str(number),'tituloOriginal':g['tituloOriginal'],
                           'paginasPdf':g['paginasPdf'],'paginasImpresas':[printed[p['paginaPdf']] for p in g['paginas']],
                           'estadoContenido':g['estadoContenido'],'ordenPeligros':[b['encabezadoOriginal'] for b in g['bloques'] if b['encabezadoOriginal'] in ('A LA SALUD','INCENDIO O EXPLOSIÓN')],
                           'notasInterpretativas':f'lectura{first}-{last}.md#guia-{number}',
                           'clausulas':items,'lineasEstructurales':structure,
                           'estado':'LECTURA_DOCUMENTAL_SEPARADA_DE_IMPLEMENTACION'})
    return {'id':f'GRE24-LECTURA-GUIAS-{first}-{last}','version':2,'fechaUtc':datetime.now(timezone.utc).isoformat(),
            'fuente':{'path':PDF.relative_to(ROOT).as_posix(),'sha256':source_sha},
            'catalogo':{'path':artifact.relative_to(ROOT).as_posix(),'sha256':sha(artifact)},
            'herramienta':{'generador':Path(__file__).relative_to(ROOT).as_posix(),'sha256':sha(Path(__file__)),
                           'agrupador':HELPER_PATH.relative_to(ROOT).as_posix(),'agrupadorSha256':sha(HELPER_PATH)},
            'metodo':{'pdfDirecto':f'PyMuPDF {pymupdf.VersionBind}',
                      'lecturaVisual':'Solo registros persistentes con identidad e imagen coincidentes; renderizar no significa revisar.',
                      'reserva':'No acredita segunda revisión, predicados ejecutables, motor ni aceptación institucional.'},
            'resumen':{'guias':len(guides),'guiasConContenido':sum(g['estadoContenido']=='CON_CONTENIDO' for g in guides),
                       'guiasSinMateriales':sum(g['estadoContenido']=='INTENCIONALMENTE_VACIA' for g in guides),
                       'paginas':len(pages),'bloques':sum(len(original[g['numero']]['bloques']) for g in guides),
                       'clausulas':sum(len(g['clausulas']) for g in guides),
                       'diferenciasTextoNativo':sum(not p['textoNativoIgualCatalogo'] for p in pages),
                       'discrepanciasDetectadas':len(findings)},
            'paginas':pages,'guias':guides,'discrepancias':findings,
            'pendientes':['Formalización y resolución de condiciones de cada cláusula.',
                          'Revisión independiente y pruebas de motor/SCI; aceptación institucional.']}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--desde',type=int,required=True)
    parser.add_argument('--hasta',type=int,required=True)
    parser.add_argument('--artefacto',type=Path)
    parser.add_argument('--salida',type=Path,default=CONTEXT/'response-guides')
    args=parser.parse_args()
    candidates=sorted((ROOT/'backend/private_uploads/gre').glob('*.catalogo-1-*.json'))
    if args.artefacto is None and len(candidates)!=1:
        parser.error('Indique un único candidato existente con --artefacto.')
    report=construir_lote(args.desde,args.hasta,args.artefacto or candidates[0],args.salida)
    target=args.salida/f'lectura{args.desde}-{args.hasta}.json'
    target.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report['resumen'],ensure_ascii=False))
    return int(bool(report['discrepancias']))


if __name__=='__main__':
    raise SystemExit(main())
