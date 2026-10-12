"""Inventariar las392 páginas sin atribuir revisión a una imagen renderizada."""
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

import pymupdf

ROOT=Path(__file__).resolve().parents[2]
BASE=ROOT/'.context/gre2024'
OUTPUT=BASE/'paginas'
PDF=ROOT/'docs/Manuales/GRE2024-Spa-Web-a.pdf'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def leer(path):
    return json.loads(path.read_text(encoding='utf-8'))


def antecedentes():
    """Conservar procedencia histórica: no convertirla en una lectura nueva."""
    previous={}
    for path in sorted((BASE/'response-guides').glob('lectura*.json')):
        reading=leer(path)
        for page in reading['paginas']:
            if page['revisionVisual']['realizada']:
                image=(path.parent/page['imagenOriginalRenderizada']).resolve()
                previous[page['paginaPdf']]={'archivo':path.relative_to(ROOT).as_posix(),
                    'imagen':image.relative_to(ROOT).as_posix(),'sha256Imagen':page['sha256Imagen'],
                    'registro':page['revisionVisual'],'tipo':'LECTURA_DOCUMENTAL_HISTORICA'}
    path=BASE/'evidencia/visual-independiente/manifest.json'
    for page in leer(path)['imagenes']:
        previous[page['paginaPdf']]={'archivo':path.relative_to(ROOT).as_posix(),
            'imagen':(path.parent/page['imagen']).resolve().relative_to(ROOT).as_posix(),
            'sha256Imagen':page['sha256'],'tipo':'REVISION_INDEPENDIENTE_LIMITADA'}
    path=BASE/'evidencia/revision-visual.json'
    for page in leer(path)['revisiones']:
        previous[page['paginaPdf']]={'archivo':path.relative_to(ROOT).as_posix(),
            'imagen':(path.parent/page['imagen']).resolve().relative_to(ROOT).as_posix(),
            'sha256Imagen':page['imagenSha256'],'registroId':page['id'],
            'tipo':'COTEJO_VISUAL_DOCUMENTAL_HISTORICO'}
    return previous


def construir():
    OUTPUT.mkdir(exist_ok=True)
    images=OUTPUT/'evidencia'
    images.mkdir(exist_ok=True)
    candidates=sorted((ROOT/'backend/private_uploads/gre').glob('*.catalogo-1-*.json'))
    if len(candidates)!=1:
        raise ValueError('Se requiere un único candidato identificado.')
    artifact=candidates[0]
    catalog=leer(artifact)
    source_sha=sha(PDF)
    if catalog['documento']['sha256']!=source_sha:
        raise ValueError('El candidato no corresponde a la fuente.')
    old_manifest=leer(OUTPUT/'inventario.json') if (OUTPUT/'inventario.json').is_file() else None
    # Una repetición conserva el corte histórico inicial; las nuevas lecturas no
    # deben reaparecer como antecedentes ni perder su estado de inspección.
    old=({p['paginaPdf']:p['antecedente'] for p in old_manifest['paginas']
          if p['antecedente'] is not None} if old_manifest else antecedentes())
    old_notes={p['paginaPdf']:p.get('lecturaNueva') for p in old_manifest['paginas']} if old_manifest else {}
    rows=[]
    with pymupdf.open(PDF) as pdf:
        for page in catalog['paginas']:
            n=page['paginaPdf']
            native=pdf[n-1].get_text()
            image=ROOT/old[n]['imagen'] if n in old else images/f'pdf-{n:03d}.png'
            if not image.exists():
                pdf[n-1].get_pixmap(matrix=pymupdf.Matrix(1.8,1.8)).save(image)
            rows.append({'paginaPdf':n,'paginasImpresas':[x['valor'] for x in page['etiquetasImpresas']],
                'secciones':[s['id'] for s in catalog['secciones'] if s['pdfDesde']<=n<=s['pdfHasta']],
                'sha256TextoNativoUtf8':hashlib.sha256(native.encode('utf-8')).hexdigest(),
                'imagen':image.relative_to(ROOT).as_posix(),'sha256Imagen':sha(image),
                'antecedente':old.get(n),'lecturaNueva':old_notes.get(n),
                'estado':('INSPECCION_VISUAL_DOCUMENTAL_REGISTRADA' if old_notes.get(n)
                          else 'EVIDENCIA_VISUAL_PREVIA' if n in old
                          else 'RENDER_PREPARADO_NO_LEIDO')})
    report={'id':'GRE24-INVENTARIO-PAGINAS-392','fechaUtc':datetime.now(timezone.utc).isoformat(),
        'fuente':{'path':PDF.relative_to(ROOT).as_posix(),'sha256':source_sha},
        'catalogo':{'path':artifact.relative_to(ROOT).as_posix(),'sha256':sha(artifact)},
        'herramienta':{'path':Path(__file__).relative_to(ROOT).as_posix(),'sha256':sha(Path(__file__))},
        'paginas':rows,'limites':['Preparar y renderizar no registra una inspección nueva.',
            'Las notas nuevas solo se escriben después de inspeccionar el PDF original.',
            'Cobertura visual no acredita dominio integral, revisión independiente, motor ni aceptación.']}
    (OUTPUT/'inventario.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps({'paginas':len(rows),'antecedentesVisuales':len(old),
                      'inspeccionesNuevas':sum(bool(r['lecturaNueva']) for r in rows),
                      'pendientesVisuales':sum(not r['antecedente'] and not r['lecturaNueva'] for r in rows)},ensure_ascii=False))


if __name__=='__main__':
    construir()
