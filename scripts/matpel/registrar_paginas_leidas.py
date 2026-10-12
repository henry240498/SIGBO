"""Persistir notas humanas tras inspección; no realizar ni simular esa inspección.

Solo usar cuando el lector haya visto cada imagen y leído la página original.
Cada nota identifica una página y mantiene fuente, imagen, texto y límites.
"""
from datetime import datetime, timezone
import json

import pymupdf
from documentar_paginas import BASE, OUTPUT, PDF, ROOT, leer, sha


def registrar():
    manifest=leer(OUTPUT/'inventario.json')
    notes=leer(OUTPUT/'notas.json')
    visual_path=BASE/'evidencia/revision-visual.json'
    visual=leer(visual_path)
    source_sha=sha(PDF)
    if manifest['fuente']['sha256']!=source_sha or notes['fuenteSha256']!=source_sha:
        raise ValueError('Fuente ajena a inventario/anotaciones.')
    rows={p['paginaPdf']:p for p in manifest['paginas']}
    numbers=[p['paginaPdf'] for p in notes['paginas']]
    if len(numbers)!=len(set(numbers)):
        raise ValueError('Anotaciones de páginas duplicadas.')
    with pymupdf.open(PDF) as pdf:
        for note in notes['paginas']:
            number=note['paginaPdf']
            row=rows[number]
            main_label=note.get('paginaImpresaPrincipal')
            if main_label is not None and main_label not in row['paginasImpresas']:
                raise ValueError(f'Pie principal ajeno a etiquetas originales: PDF{number}.')
            image=ROOT/row['imagen']
            native=pdf[number-1].get_text()
            import hashlib
            if row['sha256Imagen']!=sha(image) or row['sha256TextoNativoUtf8']!=hashlib.sha256(native.encode('utf-8')).hexdigest():
                raise ValueError(f'Evidencia cambió en PDF{number}.')
            if not note['observaciones'] or not note['limite'] or not note['fragmentosFuente']:
                raise ValueError(f'Nota incompleta en PDF{number}.')
            for fragment in note['fragmentosFuente']:
                if ' '.join(fragment.split()) not in ' '.join(native.split()):
                    raise ValueError(f'Fragmento no localizado en PDF{number}: {fragment}')
            identifier=f'GRE24-VISUAL-{number:04d}-PAGINAS-RESTANTES'
            existing=next((r for r in visual['revisiones'] if r['id']==identifier),None)
            if existing is None:
                existing={'id':identifier,'paginaPdf':number,
                    'paginaImpresa':main_label or (row['paginasImpresas'][0] if len(row['paginasImpresas'])==1 else None),
                    'paginasImpresas':row['paginasImpresas'],'documentoSha256':source_sha,
                    'imagen':image.relative_to(BASE).as_posix().replace('paginas/','../paginas/',1),
                    'imagenSha256':sha(image),'sha256TextoNativo':row['sha256TextoNativoUtf8'],
                    'revisor':'agente principal /root','fechaUtc':datetime.now(timezone.utc).isoformat(),
                    'metodo':'LECTURA_NATIVA_E_INSPECCION_VISUAL_INDIVIDUAL_VIEW_IMAGE',
                    'estado':'INSPECCION_DOCUMENTAL_DE_PAGINA_NO_VALIDACION_OPERATIVA',
                    'conclusiones':note['observaciones'],'limites':[note['limite'],
                        'Sin cotejo independiente integral, prueba de motor ni aceptación institucional.']}
                visual['revisiones'].append(existing)
            row['lecturaNueva']={'revisionId':identifier,'notas':'notas.json',
                                 'fechaUtc':existing['fechaUtc'],'alcance':'INSPECCION_DOCUMENTAL_DE_PAGINA'}
            row['estado']='INSPECCION_VISUAL_DOCUMENTAL_REGISTRADA'
    visual['paginasRevisadas']=len({r['paginaPdf'] for r in visual['revisiones']})
    visual['ultimaActualizacionUtc']=datetime.now(timezone.utc).isoformat()
    for path,data in [(visual_path,visual),(OUTPUT/'inventario.json',manifest)]:
        path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    reviewed=sum(p['antecedente'] is not None or p['lecturaNueva'] is not None for p in manifest['paginas'])
    print(json.dumps({'paginas':392,'inspeccionRegistrada':reviewed,'pendientes':392-reviewed},ensure_ascii=False))


if __name__=='__main__':
    registrar()
