"""Integridad y descubrimiento del contexto GRE. No certifica dominio operativo."""
import hashlib
from collections import Counter
import json
from pathlib import Path
import re
from validar_paginas import validar_paginas, validar_hallazgos
from validar_recorte_motor import validar as validar_recorte_motor
from validar_cabeceras_tabla3 import validar as validar_cabeceras_tabla3

ROOT=Path(__file__).resolve().parents[2]
CONTEXT=ROOT/'.context/gre2024'


def validar_cantidades(rule, pdf, source_sha):
    """Cotejar números/unidades impresos; no convertir masa/volumen ni seleccionar filas."""
    errors=[]
    pattern=re.compile(r'(?P<tipo>[^:]+):\s*(?P<desde>\d[\d ]*)'
                       r'(?:\s*[-–]\s*(?P<hasta>\d[\d ]*))?\s+(?P<unidad>kg|L)\s*'
                       r'\((?P<impDesde>\d[\d ]*)(?:\s*[-–]\s*(?P<impHasta>\d[\d ]*))?'
                       r'\s+(?P<impUnidad>libras|galones)\)')
    printed_types=set()
    for line in pdf[339].get_text().splitlines():
        match=pattern.fullmatch(line.lstrip('•\t ').strip())
        if match:
            printed_types.add(match.group('tipo').strip())
    names=[p['tipoOriginal'] for p in rule['parametrosDocumentales']]
    if len(names)!=len(set(names)) or set(names)!=printed_types:
        errors.append('Inventario de cantidades contradice PDF 340.')
    for parameter in rule['parametrosDocumentales']:
        name=parameter['tipoOriginal']
        source=parameter.get('fuente',{})
        n=source.get('paginaPdf',0)
        literal=source.get('extractoLiteral','')
        if source.get('documentoSha256')!=source_sha or not 1<=n<=len(pdf):
            errors.append(f'Cantidad sin fuente válida: {name}')
            continue
        if not literal or ' '.join(literal.split()) not in ' '.join(pdf[n-1].get_text().split()):
            errors.append(f'Literal de cantidad contradice PDF: {name}')
        match=pattern.fullmatch(literal)
        if not match:
            errors.append(f'Cantidad no cotejable: {name}')
            continue
        values=match.groupdict()
        number=lambda key: values[key].replace(' ','').strip()
        expected={'tipoOriginal':values['tipo'].strip(),'valorDesde':number('desde'),
                  'valorHasta':number('hasta') if values['hasta'] else number('desde'),
                  'unidad':values['unidad'],
                  'imperialImpreso':{'valorDesde':number('impDesde'),
                  'valorHasta':number('impHasta') if values['impHasta'] else number('impDesde'),
                  'unidadOriginal':values['impUnidad']}}
        if any(parameter.get(key)!=value for key,value in expected.items()):
            errors.append(f'Cantidad/unidad/rango contradice literal: {name}')
    return errors


def validar_lectura(reading, path, catalog, pdf, source_sha):
    """Comprobar la evidencia registrada sin crear una revisión visual nueva."""
    errors=[]
    prefix=path.name
    refs={r['id']:r for r in catalog['referencias']}
    guides={g['numero']:g for g in catalog['guias']}
    printed={p['paginaPdf']:[label['valor'] for label in p['etiquetasImpresas']] for p in catalog['paginas']}
    visual_reviews=[]
    if reading.get('version',1)>=2:
        visual_reviews=json.loads((CONTEXT/'evidencia/revision-visual.json').read_text(encoding='utf-8'))['revisiones']
        for key in ('generador','agrupador'):
            file=ROOT/reading['herramienta'][key]
            hash_key='sha256' if key=='generador' else 'agrupadorSha256'
            if not file.is_file() or hashlib.sha256(file.read_bytes()).hexdigest()!=reading['herramienta'][hash_key]:
                errors.append(f'Herramienta de lectura cambió: {prefix} {key}')
    pages=reading['paginas']
    page_numbers=[p['paginaPdf'] for p in pages]
    if len(page_numbers)!=len(set(page_numbers)):
        errors.append(f'Páginas duplicadas en lectura: {prefix}')
    clause_ids=set()
    block_count=0
    clause_count=0
    guide_pages=[]
    guide_numbers=[]
    for page in pages:
        n=page['paginaPdf']
        if not 1<=n<=len(pdf):
            errors.append(f'Página inexistente en lectura: {prefix} PDF{n}')
            continue
        native=pdf[n-1].get_text()
        if str(page['paginaImpresa']) not in printed.get(n,[]):
            errors.append(f'Página impresa de lectura contradice fuente: {prefix} PDF{n}')
        if page['sha256TextoNativoUtf8']!=hashlib.sha256(native.encode('utf-8')).hexdigest():
            errors.append(f'Texto de lectura cambió: {prefix} PDF{n}')
        image=path.parent/page['imagenOriginalRenderizada']
        if not image.is_file() or hashlib.sha256(image.read_bytes()).hexdigest()!=page['sha256Imagen']:
            errors.append(f'Imagen de lectura perdida/cambiada: {prefix} PDF{n}')
        visual=page['revisionVisual']
        if reading.get('version',1)>=2 and visual['realizada']:
            matches=[r for r in visual_reviews if r['id']==visual.get('revisionId') and
                     r['paginaPdf']==n and r['documentoSha256']==source_sha and
                     r['imagenSha256']==page['sha256Imagen']]
            if not matches:
                errors.append(f'Revisión visual de lectura sin registro coincidente: {prefix} PDF{n}')
    for guide in reading['guias']:
        number=guide['numero']
        guide_numbers.append(number)
        original=guides.get(number)
        if original is None:
            errors.append(f'Guía de lectura inexistente: {prefix} {number}')
            continue
        if guide['paginasPdf']!=original['paginasPdf'] or guide['tituloOriginal']!=original['tituloOriginal']:
            errors.append(f'Guía de lectura contradice catálogo: {prefix} {number}')
        guide_pages.extend(guide['paginasPdf'])
        blocks={b['id']:b for b in original['bloques']}
        block_count+=len(blocks)
        registered_refs=Counter()
        for clause in guide['clausulas']:
            clause_count+=1
            identifier=clause['id']
            if identifier in clause_ids:
                errors.append(f'Cláusula duplicada: {identifier}')
            clause_ids.add(identifier)
            source=clause['fuente']
            ids=source['referenciasCatalogo']
            registered_refs.update(ids)
            if not ids or any(refid not in refs for refid in ids):
                errors.append(f'Referencia de cláusula inexistente: {identifier}')
                continue
            selected=[refs[refid] for refid in ids]
            if source['documentoSha256']!=source_sha:
                errors.append(f'Fuente de cláusula ajena: {identifier}')
            if clause['literalFuente']!='\n'.join(r['textoOriginal'] for r in selected):
                errors.append(f'Literal de cláusula contradice fuente: {identifier}')
            if source['cajasPt']!=[r['cajaPt'] for r in selected]:
                errors.append(f'Cajas de cláusula contradicen fuente: {identifier}')
            expected_pages=list(dict.fromkeys(r['paginaPdf'] for r in selected))
            if source['paginasPdf']!=expected_pages or not set(expected_pages)<=set(guide['paginasPdf']):
                errors.append(f'Páginas de cláusula contradicen fuente: {identifier}')
            block=blocks.get(source['bloqueCatalogo'])
            if not block or not set(ids)<=set(block['fuentes']):
                errors.append(f'Bloque de cláusula contradice guía: {identifier}')
            elif reading.get('version',1)>=3:
                errors.extend(validar_subapartado(clause,block,original,refs))
            if any(clause['pruebas'].get(key)!='PENDIENTE' for key in
                   ('unitariaMotor','integracionMotor','comprensionIndependiente')):
                errors.append(f'Validación no acreditada por lectura documental: {identifier}')
        if reading.get('version',1)>=2:
            if guide.get('estadoContenido')!=original['estadoContenido']:
                errors.append(f'Estado de contenido contradice fuente: {prefix} {number}')
            for line in guide['lineasEstructurales']:
                refid=line['referenciaCatalogo']
                registered_refs.update([refid])
                ref=refs.get(refid)
                block=blocks.get(line['bloqueCatalogo'])
                if not ref or line['textoOriginal']!=ref['textoOriginal'] or not block or refid not in block['fuentes']:
                    errors.append(f'Línea estructural contradice fuente: {prefix} {number}')
            expected_refs=Counter(refid for block in original['bloques'] for refid in block['fuentes'])
            if registered_refs!=expected_refs:
                errors.append(f'Cobertura de líneas de guía incompleta/duplicada: {prefix} {number}')
    if len(guide_numbers)!=len(set(guide_numbers)):
        errors.append(f'Guías duplicadas en lectura: {prefix}')
    if sorted(guide_pages)!=sorted(page_numbers):
        errors.append(f'Cobertura de páginas de lectura contradictoria: {prefix}')
    counts={'guias':len(guide_numbers),'paginas':len(pages),'bloques':block_count,'clausulas':clause_count}
    if any(reading['resumen'].get(key)!=value for key,value in counts.items()):
        errors.append(f'Conteos de lectura contradictorios: {prefix}')
    if reading['discrepancias']:
        errors.append(f'Lectura con discrepancias pendientes: {prefix}')
    return errors


def validar_subapartado(clause, block, guide, refs):
    """Cotejar límites con títulos en negrita del PDF, sin usar el agrupador."""
    bold={(p['paginaPdf'],tuple(line['cajaPt']))
          for p in guide['paginas'] for line in p['lineas'] if line['negrita']}
    titles={}
    sources=block['fuentes']
    for i,refid in enumerate(sources[1:],1):
        ref=refs[refid]
        text=ref['textoOriginal'].strip()
        if ((ref['paginaPdf'],tuple(ref['cajaPt'])) not in bold or
                not re.match(r'^(Incendios?\b|Derrame\b|Acción inmediata\b|Primeros Auxilios Específicos:)',text)):
            continue
        pieces=[text]
        j=i+1
        while j<len(sources):
            following=refs[sources[j]]
            continuation=following['textoOriginal'].strip()
            if ((following['paginaPdf'],tuple(following['cajaPt'])) not in bold or
                    continuation.startswith(('•','PRECAUCIÓN','Consulte ','En Canadá','*')) or
                    re.match(r'^(Incendios?\b|Derrame\b|Acción inmediata\b|Primeros Auxilios Específicos:)',continuation)):
                break
            pieces.append(continuation)
            j+=1
        titles[i]=('\n'.join(pieces),set(sources[i:j]))
    ids=clause['fuente']['referenciasCatalogo']
    first=min(sources.index(refid) for refid in ids)
    prior=[i for i in titles if i<first]
    expected=titles[max(prior)][0] if prior else None
    header_refs=set().union(*(item[1] for item in titles.values())) if titles else set()
    if (clause['subseccion']!=expected or
            clause['condicionesActivacion'].get('subseccion')!=expected or set(ids)&header_refs):
        return [f'Subapartado de cláusula contradice títulos originales: {clause["id"]}']
    return []


def validar_inventario_guias(inventory, readings, catalog):
    """Exigir cobertura global sin aceptar conteos reducidos o lotes duplicados."""
    errors=[]
    originals={g['numero']:g for g in catalog['guias']}
    actual=[(path,g) for path,reading in readings for g in reading['guias']]
    if Counter(g['numero'] for _,g in actual)!=Counter(originals.keys()):
        errors.append('Inventario global de guías incompleto/duplicado frente a fuente.')
    rows=inventory['guias']
    if Counter(row['numero'] for row in rows)!=Counter(originals.keys()):
        errors.append('Manifest de guías incompleto/duplicado frente a fuente.')
    mapping={(g['numero'],path.name):g for path,g in actual}
    for row in rows:
        original=originals.get(row['numero'])
        guide=mapping.get((row['numero'],row['lectura']))
        if (not original or not guide or row['paginasPdf']!=original['paginasPdf'] or
                row['estadoContenido']!=original['estadoContenido'] or
                row['clausulas']!=len(guide['clausulas']) or
                row['paginasImpresas']!=guide['paginasImpresas']):
            errors.append(f'Fila de manifest contradice fuente/lectura: {row["numero"]}')
    pages=[p['paginaPdf'] for _,reading in readings for p in reading['paginas']]
    expected=[p for g in originals.values() for p in g['paginasPdf']]
    if Counter(pages)!=Counter(expected):
        errors.append('Inventario global de páginas incompleto/duplicado frente a fuente.')
    counts={'numeros':len(originals),'conContenido':sum(g['estadoContenido']=='CON_CONTENIDO' for g in originals.values()),
            'sinMateriales':sum(g['estadoContenido']=='INTENCIONALMENTE_VACIA' for g in originals.values()),
            'paginas':len(expected),'clausulas':sum(len(g['clausulas']) for _,g in actual)}
    if inventory['resumen']!=counts:
        errors.append('Resumen global de guías contradice inventario original/lecturas.')
    if inventory['fuenteSha256']!=catalog['documento']['sha256']:
        errors.append('Manifest de guías corresponde a otra fuente.')
    return errors


def validar_condiciones_guias(notes, cases, rules, readings):
    """Conservar cobertura, fuentes y estados; no evaluar interpretaciones."""
    errors=[]
    guides={g['numero']:g for _,r in readings for g in r['guias'] if r.get('version',1)>=3}
    annotations={str(n['guia']):n for n in notes['guias']}
    if len(annotations)!=len(notes['guias']) or set(annotations)!=set(guides):
        errors.append('Anotaciones específicas incompletas/duplicadas frente a lecturas.')
    by_id={r['id']:r for r in rules['reglas']}
    actual_cases={c['id']:c for c in cases['casos']}
    expected_case_ids=set()
    for number,guide in guides.items():
        if guide['estadoContenido']=='INTENCIONALMENTE_VACIA':
            expected_case_ids.add(f'GRE24-COMP-G{number}-VACIA')
            continue
        note=annotations.get(number)
        rule=by_id.get(f'GRE24-G{number}-CONDICION-ESPECIFICA')
        if not rule or not note:
            errors.append(f'Condición específica sin regla/anotación: {number}')
            continue
        selected={c['id']:c for c in guide['clausulas'] if any(
            ' '.join(f.split()) in ' '.join(c['literalFuente'].split()) for f in note['fragmentosClave'])}
        for fragment in note['fragmentosClave']:
            if not any(' '.join(fragment.split()) in ' '.join(c['literalFuente'].split()) for c in selected.values()):
                errors.append(f'Fragmento anotado no localizado en fuente: {number}')
        if not selected or {s['clausulaDocumental'] for s in rule['fuentes']}!=set(selected):
            errors.append(f'Condición específica sin todas sus cláusulas fuente: {number}')
        for source in rule['fuentes']:
            clause=selected.get(source['clausulaDocumental'])
            if not clause:
                continue
            original=clause['fuente']
            expected={'extractoLiteral':clause['literalFuente'],'seccion':clause['seccion'],
                      'subseccion':clause['subseccion'],'documentoSha256':original['documentoSha256'],
                      'paginaPdf':original['paginasPdf'][0],'paginaImpresa':str(original['paginasImpresas'][0]),
                      'referenciasCatalogo':original['referenciasCatalogo'],'cajasPt':original['cajasPt']}
            if any(source.get(k)!=v for k,v in expected.items()):
                errors.append(f'Fuente de condición específica contradice lectura: {number}')
        for suffix in ('CONDICION','INCOMPLETO'):
            identifier=f'GRE24-COMP-G{number}-{suffix}'
            expected_case_ids.add(identifier)
            case=actual_cases.get(identifier)
            if not case or case.get('reglaId')!=rule['id'] or case.get('fuentes')!=rule['fuentes']:
                errors.append(f'Caso propuesto sin regla/fuente coincidente: {identifier}')
        if (rule['implementacion']['estado']!='NO_IMPLEMENTADA' or
                rule['validacion']['operativa']!='PENDIENTE' or
                rule['validacion']['institucional']!='PENDIENTE'):
            errors.append(f'Condición específica atribuye validación no acreditada: {number}')
    if set(actual_cases)!=expected_case_ids or len(actual_cases)!=len(cases['casos']):
        errors.append('Inventario de casos específicos incompleto/duplicado.')
    for case in cases['casos']:
        if (case['resultadoObtenidoIndependiente'] is not None or
                case['revisionIndependiente']!='PENDIENTE' or case['pruebaMotor']!='PENDIENTE'):
            errors.append(f'Caso propuesto atribuye resultado no acreditado: {case["id"]}')
    return errors


def validar():
    errors=[]
    documents=sorted(CONTEXT.rglob('*.md'))
    discovered=set()
    pending=[CONTEXT/'index.md']
    while pending:
        path=pending.pop().resolve()
        if path in discovered or not path.is_file():
            continue
        discovered.add(path)
        for link in re.findall(r'\]\(([^)]+)\)',path.read_text(encoding='utf-8')):
            if re.match(r'https?://',link):
                continue
            target=(path.parent/link.strip('<>').split('#')[0]).resolve()
            if target.suffix=='.md' and target.is_relative_to(CONTEXT.resolve()):
                pending.append(target)
    for path in documents:
        text=path.read_text(encoding='utf-8')
        if path.resolve() not in discovered:
            errors.append(f'Documento no descubierto desde índice: {path.relative_to(CONTEXT)}')
        for link in re.findall(r'\]\(([^)]+)\)',text):
            if re.match(r'https?://',link):
                continue
            relative=link.strip('<>').split('#')[0]
            if relative and not (path.parent/relative).resolve().exists():
                errors.append(f'Enlace inexistente: {path.name} -> {link}')
        if re.search('[\u0400-\u04ff\ufffd]',text):
            errors.append(f'Caracteres inesperados: {path.name}')
    required_fields={'id','descripcion','condicionesActivacion','entradasNecesarias',
                     'procedimientoInterpretacion','resultadoEsperado','excepcionesYAlteraciones',
                     'reglasRelacionadas','fuentes','evidencia','pruebas','validacion','limites','implementacion'}
    rules=json.loads((CONTEXT/'reglas-operativas.json').read_text(encoding='utf-8'))
    seen=set()
    source=ROOT/'docs/Manuales/GRE2024-Spa-Web-a.pdf'
    sha=hashlib.sha256(source.read_bytes()).hexdigest()
    readings=sorted((CONTEXT/'response-guides').glob('lectura*.json'))
    read_pages=set()
    read_clauses=0
    loaded_readings=[]
    import pymupdf
    with pymupdf.open(source) as pdf:
        for rule in rules['reglas']:
            if rule['id'] in seen:
                errors.append(f'Regla duplicada: {rule["id"]}')
            seen.add(rule['id'])
            missing=required_fields-rule.keys()
            if missing:
                errors.append(f'Regla incompleta: {rule["id"]} {missing}')
            if not rule['fuentes']:
                errors.append(f'Regla sin fuente: {rule["id"]}')
            for ref in rule['fuentes']:
                if ref['documentoSha256']!=sha or not 1<=ref['paginaPdf']<=len(pdf):
                    errors.append(f'Fuente ajena: {rule["id"]}')
                elif ref.get('extractoLiteral'):
                    normalized=' '.join(pdf[ref['paginaPdf']-1].get_text().split())
                    if ' '.join(ref['extractoLiteral'].split()) not in normalized:
                        errors.append(f'Literal no coincide con fuente: {rule["id"]}')
            if rule['validacion']['operativa']=='VALIDADA' and not rule['pruebas']['casos']:
                errors.append(f'Validación operativa sin casos: {rule["id"]}')
            if '?' in json.dumps(rule,ensure_ascii=False):
                errors.append(f'Revisar codificación/signos en regla: {rule["id"]}')
            if rule['id']=='GRE24-T3-CONTENEDORES-CANTIDADES':
                errors.extend(validar_cantidades(rule,pdf,sha))
        for path in readings:
            reading=json.loads(path.read_text(encoding='utf-8'))
            artifact=ROOT/reading['catalogo']['path']
            if reading['fuente']['sha256']!=sha or not artifact.is_file():
                errors.append(f'Fuente/catálogo de lectura inexistente o ajeno: {path.name}')
                continue
            artifact_bytes=artifact.read_bytes()
            if hashlib.sha256(artifact_bytes).hexdigest()!=reading['catalogo']['sha256']:
                errors.append(f'Catálogo de lectura cambió: {path.name}')
            errors.extend(validar_lectura(reading,path,json.loads(artifact_bytes),pdf,sha))
            loaded_readings.append((path,reading))
            read_pages.update(p['paginaPdf'] for p in reading['paginas'] if p['revisionVisual']['realizada'])
            read_clauses+=sum(len(g['clausulas']) for g in reading['guias'])
        manifest=CONTEXT/'response-guides/inventario-guias.json'
        if manifest.is_file() and loaded_readings:
            inventory=json.loads(manifest.read_text(encoding='utf-8'))
            catalog=json.loads((ROOT/loaded_readings[0][1]['catalogo']['path']).read_bytes())
            errors.extend(validar_inventario_guias(inventory,loaded_readings,catalog))
            notes=json.loads((CONTEXT/'response-guides/notas131-174.json').read_text(encoding='utf-8'))
            cases=json.loads((CONTEXT/'test-cases/casos-guias131-174.json').read_text(encoding='utf-8'))
            errors.extend(validar_condiciones_guias(notes,cases,rules,loaded_readings))
        page_manifest=json.loads((CONTEXT/'paginas/inventario.json').read_text(encoding='utf-8'))
        page_notes=json.loads((CONTEXT/'paginas/notas.json').read_text(encoding='utf-8'))
        page_visual=json.loads((CONTEXT/'evidencia/revision-visual.json').read_text(encoding='utf-8'))
        page_catalog=json.loads((ROOT/page_manifest['catalogo']['path']).read_bytes())
        errors.extend(validar_paginas(page_manifest,page_notes,page_visual,page_catalog,pdf,sha))
        findings=json.loads((CONTEXT/'paginas/hallazgos.json').read_text(encoding='utf-8'))
        errors.extend(validar_hallazgos(findings,pdf,sha))
    visual=json.loads((CONTEXT/'evidencia/revision-visual.json').read_text(encoding='utf-8'))
    for review in visual['revisiones']:
        image=CONTEXT/'evidencia'/review['imagen']
        if not image.exists() or hashlib.sha256(image.read_bytes()).hexdigest()!=review['imagenSha256']:
            errors.append(f'Imagen de evidencia perdida/cambiada: {review["id"]}')
    independent_path=CONTEXT/'evidencia/visual-independiente/manifest.json'
    independent=json.loads(independent_path.read_text(encoding='utf-8'))
    independent_pages=set()
    if independent['fuenteSha256']!=sha:
        errors.append('Manifest visual independiente corresponde a otra fuente.')
    for review in independent['imagenes']:
        n=review['paginaPdf']
        image=independent_path.parent/review['imagen']
        if not 1<=n<=392 or n in independent_pages:
            errors.append(f'Página inválida/duplicada en revisión independiente: PDF{n}')
        independent_pages.add(n)
        if not image.is_file() or hashlib.sha256(image.read_bytes()).hexdigest()!=review['sha256']:
            errors.append(f'Imagen independiente perdida/cambiada: PDF{n}')
    audit=json.loads((CONTEXT/'evidencia/auditoria-documental.json').read_text(encoding='utf-8'))
    auditor=ROOT/'scripts/matpel/auditar_conocimiento.py'
    if audit['herramienta']['auditorSha256']!=hashlib.sha256(auditor.read_bytes()).hexdigest():
        errors.append('Auditoría no corresponde al código actual: repetirla.')
    if audit['fuente']['sha256']!=sha or audit['resumen']['paginas']!=392:
        errors.append('Auditoría no cubre la fuente original identificada.')
    if audit['discrepancias']:
        errors.append('Auditoría documental contiene discrepancias sin resolver.')
    for path in readings:
        reading=json.loads(path.read_text(encoding='utf-8'))
        if reading['catalogo']['sha256']!=audit['artefacto']['sha256']:
            errors.append(f'Lectura y auditoría no cotejan el mismo artefacto: {path.name}')
    for entry in ('AGENTS.md','CLAUDE.md','.context/contexto.md','.context/INDEX.md','.context/MATPEL.md'):
        if 'gre2024/index.md' not in (ROOT/entry).read_text(encoding='utf-8'):
            errors.append(f'Entrada no remite a conocimientoGRE: {entry}')
    recorte_motor = validar_recorte_motor()
    cabeceras_t3 = validar_cabeceras_tabla3()
    errors.extend(recorte_motor['errores'])
    errors.extend(cabeceras_t3['errores'])
    return {'tipo':'INTEGRIDAD_CONTEXTO_NO_VALIDACION_OPERATIVA','documentos':len(documents),
            'sha256RecorteMotor':recorte_motor['sha256Recorte'],
            'celdasTabla3CotejadasConCabeceras':cabeceras_t3['celdasCotejadas'],
            'reglasDocumentadas':len(seen),'imagenesRevisadas':len(visual['revisiones']),
            'lotesGuias':len(readings),'clausulasDocumentadas':read_clauses,
            'paginasRevisionIndependienteRegistradas':len(independent_pages),
            'paginasVisualesRegistradas':len(read_pages|independent_pages|{r['paginaPdf'] for r in visual['revisiones']}),
            'paginasInventariadas':len(page_manifest['paginas']),
            'paginasConInspeccionNueva':len(page_notes['paginas']),
            'paginasPendientesInspeccion':sum(not p['antecedente'] and not p['lecturaNueva'] for p in page_manifest['paginas']),
            'errores':errors,'dominioIntegralDemostrado':False}


if __name__=='__main__':
    report=validar()
    (CONTEXT/'evidencia/integridad-contexto.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False))
    raise SystemExit(int(bool(report['errores'])))
