"""Comprobar procedencia y cobertura; ningún control sustituye la lectura humana."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BASE = ROOT / '.context/gre2024'


def leer(path):
    return json.loads(path.read_text(encoding='utf-8'))


def huella(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def validar_paginas(manifest, notes, visual, catalog, pdf, source_sha):
    errors = []
    rows = manifest['paginas']
    numbers = [r['paginaPdf'] for r in rows]
    if len(numbers) != len(set(numbers)) or set(numbers) != set(range(1, len(pdf) + 1)):
        errors.append('Inventario de páginas incompleto o duplicado.')
    if manifest['fuente']['sha256'] != source_sha or notes['fuenteSha256'] != source_sha:
        errors.append('Fuente de páginas/anotaciones ajena al PDF.')
    artifact = ROOT / manifest['catalogo']['path']
    if not artifact.is_file() or huella(artifact) != manifest['catalogo']['sha256']:
        errors.append('Catálogo del inventario de páginas cambió.')
    tool = ROOT / manifest['herramienta']['path']
    if not tool.is_file() or huella(tool) != manifest['herramienta']['sha256']:
        errors.append('Preparador de páginas cambió sin actualizar procedencia.')
    note_numbers = [r['paginaPdf'] for r in notes['paginas']]
    if len(note_numbers) != len(set(note_numbers)) or not set(note_numbers) <= set(numbers):
        errors.append('Anotaciones de páginas duplicadas o ajenas al inventario.')
    note_map = {r['paginaPdf']: r for r in notes['paginas']}
    reviews = {r['id']: r for r in visual['revisiones']}
    if len(reviews) != len(visual['revisiones']):
        errors.append('Identificadores visuales duplicados.')
    labels = {r['paginaPdf']: [x['valor'] for x in r['etiquetasImpresas']]
              for r in catalog['paginas']}
    historical_files = {}
    for row in rows:
        n = row['paginaPdf']
        if not 1 <= n <= len(pdf):
            errors.append(f'Página fuera del PDF: {n}')
            continue
        native = pdf[n - 1].get_text()
        native_sha = hashlib.sha256(native.encode('utf-8')).hexdigest()
        image = ROOT / row['imagen']
        if not image.is_file() or huella(image) != row['sha256Imagen']:
            errors.append(f'Imagen de página perdida/cambiada: PDF{n}')
        if row['sha256TextoNativoUtf8'] != native_sha:
            errors.append(f'Texto nativo de página cambió: PDF{n}')
        if row['paginasImpresas'] != labels.get(n):
            errors.append(f'Etiquetas impresas de página alteradas: PDF{n}')
        previous = row['antecedente']
        new = row['lecturaNueva']
        if previous:
            path = ROOT / previous['archivo']
            if path not in historical_files:
                historical_files[path] = leer(path) if path.is_file() else {}
            historical = historical_files[path]
            candidates = (historical.get('revisiones', []) if previous.get('registroId')
                          else historical.get('imagenes', []) if previous['tipo'] == 'REVISION_INDEPENDIENTE_LIMITADA'
                          else historical.get('paginas', []))
            old = next((r for r in candidates if r['paginaPdf'] == n and
                        (not previous.get('registroId') or r.get('id') == previous['registroId'])), None)
            old_sha = (old or {}).get('imagenSha256', (old or {}).get('sha256Imagen', (old or {}).get('sha256')))
            if old is None or old_sha != row['sha256Imagen'] or previous['sha256Imagen'] != old_sha:
                errors.append(f'Antecedente visual no respalda página: PDF{n}')
        if new:
            note = note_map.get(n)
            review = reviews.get(new['revisionId'])
            if not note or not review:
                errors.append(f'Inspección de página sin anotación/registro visual: PDF{n}')
                continue
            if (new['alcance'] != 'INSPECCION_DOCUMENTAL_DE_PAGINA' or
                    row['estado'] != 'INSPECCION_VISUAL_DOCUMENTAL_REGISTRADA' or
                    review.get('estado') != 'INSPECCION_DOCUMENTAL_DE_PAGINA_NO_VALIDACION_OPERATIVA'):
                errors.append(f'Inspección de página atribuye alcance no acreditado: PDF{n}')
            if (review['paginaPdf'] != n or review['documentoSha256'] != source_sha or
                    review.get('sha256TextoNativo') != native_sha or
                    review['imagenSha256'] != row['sha256Imagen'] or
                    (BASE / 'evidencia' / review['imagen']).resolve() != image.resolve()):
                errors.append(f'Registro visual de página contradice procedencia: PDF{n}')
            principal = note.get('paginaImpresaPrincipal')
            expected = principal or (row['paginasImpresas'][0] if len(row['paginasImpresas']) == 1 else None)
            if (principal is not None and principal not in row['paginasImpresas'] or
                    review.get('paginaImpresa') != expected or
                    review.get('paginasImpresas') != row['paginasImpresas']):
                errors.append(f'Pie principal de página confundido: PDF{n}')
            if (not note['observaciones'] or not note['limite'] or not note['fragmentosFuente'] or
                    review['conclusiones'] != note['observaciones'] or note['limite'] not in review['limites']):
                errors.append(f'Anotación de página incompleta o desincronizada: PDF{n}')
            for fragment in note['fragmentosFuente']:
                if ' '.join(fragment.split()) not in ' '.join(native.split()):
                    errors.append(f'Fragmento de anotación ajeno a página: PDF{n}')
        elif n in note_map:
            errors.append(f'Anotación de página sin inspección registrada: PDF{n}')
        if not previous and not new:
            errors.append(f'Página pendiente de inspección; render no acredita lectura: PDF{n}')
    return errors


def validar_hallazgos(report, pdf, source_sha):
    errors = []
    for entry in report['hallazgos']:
        for ref in entry['fuentes']:
            n = ref['paginaPdf']
            native = ' '.join(pdf[n - 1].get_text().split())
            if ref['documentoSha256'] != source_sha or ' '.join(ref['literal'].split()) not in native:
                errors.append(f'Hallazgo con fuente ajena: {entry["id"]}')
            image = ROOT / ref['imagen']
            if not image.is_file() or huella(image) != ref['imagenSha256']:
                errors.append(f'Hallazgo sin evidencia visual: {entry["id"]}')
        if entry['pruebaMotor'] != 'PENDIENTE' or entry['resultadoIndependiente'] is not None:
            errors.append(f'Hallazgo atribuye prueba no realizada: {entry["id"]}')
    return errors
