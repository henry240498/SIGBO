"""Cotejo reproducible del lote 111–120; no acredita motor ni aprobación institucional."""
import hashlib
import json
from pathlib import Path
import re
import pymupdf

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
PDF = ROOT / 'docs/Manuales/GRE2024-Spa-Web-a.pdf'
ARTIFACT = next((ROOT / 'backend/private_uploads/gre').glob('*.catalogo-1-*.json'))


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def norm(value):
    return ' '.join(value.split())


def classify(section, literal):
    if 'Consulte' in literal or 'consulte' in literal or 'Vea la' in literal or 'vea la' in literal:
        return 'REMISION'
    if section in ('A LA SALUD', 'INCENDIO O EXPLOSIÓN'):
        return 'PELIGRO'
    if re.search(r'\b(NO|No|Nunca|NUNCA)\b', literal):
        return 'PROHIBICION_O_LIMITE_CONDICIONAL'
    if 'considere' in literal.lower():
        return 'CONSIDERACION'
    if 'PRECAUCIÓN' in literal:
        return 'ADVERTENCIA'
    return 'INDICACION_DOCUMENTAL'


def related(literal):
    result = []
    for guide in re.findall(r'GUÍA\s+(\d{3})', literal):
        result.append('GRE24-GUIA-' + guide)
    if 'Tabla 1' in literal or 'Tabla 1' in literal.title():
        result.append('GRE24-TABLA-1')
    if 'Primeros auxilios generales' in literal:
        result.append('GRE24-SECCION-PRIMEROS-AUXILIOS-GENERALES-PDF156')
    if 'BLEVE' in literal:
        result.append('GRE24-SECCION-BLEVE')
    if 'ERAP' in literal:
        result.append('GRE24-SECCION-ERAP-CANADA')
    if 'Glosario' in literal:
        result.append('GRE24-SECCION-GLOSARIO')
    return sorted(set(result))


def interpretation(section, subsection, literal):
    kind = classify(section, literal)
    if kind == 'PELIGRO':
        return 'Advertencia de peligro en la guía seleccionada; no implica que el fenómeno ocurra siempre ni que su ausencia pueda inferirse de datos incompletos.'
    if kind == 'REMISION':
        return 'La cláusula remite a otra fuente/sección: la guía naranja por sí sola no contiene toda la respuesta. Conservar y resolver la remisión antes de concluir.'
    if kind == 'CONSIDERACION':
        return 'La fuente pide considerar una acción; presentarla para evaluación del responsable, sin convertirla en decisión automática.'
    if kind == 'PROHIBICION_O_LIMITE_CONDICIONAL':
        return 'Conservar la prohibición o el límite con todas las condiciones de la cláusula; no generalizarlo fuera del escenario y material indicados.'
    if section == 'EVACUACIÓN':
        return 'Aplicar solamente a la categoría de escenario indicada, distinguiendo aislamiento de consideración de evacuación y todas las direcciones de dirección del viento.'
    if section == 'ROPA PROTECTORA':
        return 'Orientación de protección para el escenario; no certifica que el equipo disponible sea suficiente. Respetar límites térmicos/químicos y condiciones de incendio.'
    if section == 'PRIMEROS AUXILIOS':
        return 'Indicación específica complementaria a primeros auxilios generales; conservar reservas a personal médico y no sustituir capacitación.'
    return 'Indicación para la sección y subsección citadas, sujeta a las restricciones de seguridad del texto; no autoriza intervención automática.'


def clauses(block, refs):
    """Agrupar líneas continuadas manteniendo cajas y refs, sin derivar lógica ejecutable."""
    groups = []
    current = None
    subsection = None
    for text, refid in zip(block['lineas'][1:], block['fuentes'][1:]):
        ref = refs[refid]
        # La fuente puede contener dos viñetas en una línea: se conservan juntas.
        clean = text.strip()
        if not clean:
            continue
        is_heading = clean in ('Incendio', 'Derrame') or clean.startswith(('Incendio ', 'Derrame ', 'Acción inmediata', 'Primeros Auxilios Específicos:'))
        if is_heading and not clean.startswith('•'):
            if current:
                groups.append(current)
                current = None
            subsection = clean
            continue
        standalone = clean.startswith(('•', 'PRECAUCIÓN', 'Consulte ', 'En Canadá', '*'))
        if standalone or current is None:
            if current:
                groups.append(current)
            current = {'subseccion': subsection, 'lineas': [text], 'referencias': [refid], 'paginasPdf': [ref['paginaPdf']]}
        else:
            current['lineas'].append(text)
            current['referencias'].append(refid)
            if ref['paginaPdf'] not in current['paginasPdf']:
                current['paginasPdf'].append(ref['paginaPdf'])
    if current:
        groups.append(current)
    return groups


def main():
    doc = pymupdf.open(PDF)
    data = json.loads(ARTIFACT.read_text(encoding='utf8'))
    refs = {r['id']: r for r in data['referencias']}
    guides = [g for g in data['guias'] if 111 <= int(g['numero']) <= 120]
    discrepancies = []
    result = []
    page_records = []
    for g in guides:
        items = []
        for page in g['paginas']:
            n = page['paginaPdf']
            native = doc[n - 1].get_text()
            equal = native == page['textoNativoOriginal']
            if not equal:
                discrepancies.append({'tipo': 'TEXTO_NATIVO_DISTINTO', 'paginaPdf': n})
            image = OUT / 'evidencia111-120' / f'pdf-{n:03}.png'
            page_records.append({'paginaPdf': n, 'paginaImpresa': n - 2, 'sha256TextoNativoUtf8': hashlib.sha256(native.encode('utf8')).hexdigest(), 'textoNativoIgualCatalogo': equal, 'imagenOriginalRenderizada': str(image.relative_to(OUT)).replace('\\', '/'), 'sha256Imagen': sha(image), 'revisionVisual': {'realizada': True, 'revisor': 'agente lectura_guias', 'metodo': 'Inspección visual individual de imagen completa original a escala 1.8 mediante view_image; lectura de todas las zonas, títulos, negritas, unidades, resaltados y notas.', 'noEquivaleA': ['segunda revisión independiente de esta interpretación', 'motor probado', 'aceptación institucional']}})
        for block in g['bloques']:
            if len(block['lineas']) != len(block['fuentes']):
                discrepancies.append({'tipo': 'LINEAS_REF_NO_1_A_1', 'bloque': block['id']})
                continue
            for i, item in enumerate(clauses(block, refs), start=1):
                literal = '\n'.join(item['lineas'])
                found = all(norm(refs[r]['textoOriginal']) in norm(doc[refs[r]['paginaPdf'] - 1].get_text()) for r in item['referencias'])
                if not found:
                    discrepancies.append({'tipo': 'LITERAL_REF_NO_LOCALIZADO_EN_PAGINA', 'referencias': item['referencias']})
                ruleid = f"GRE24-G{g['numero']}-B{block['orden']:02}-C{i:02}"
                items.append({'id': ruleid, 'seccion': block['encabezadoOriginal'], 'subseccion': item['subseccion'], 'tipo': classify(block['encabezadoOriginal'], literal), 'literalFuente': literal, 'literalBreve': norm(literal).removeprefix('•')[:160], 'interpretacion': interpretation(block['encabezadoOriginal'], item['subseccion'], literal), 'condicionesActivacion': {'guiaSeleccionada': g['numero'], 'seccion': block['encabezadoOriginal'], 'subseccion': item['subseccion'], 'condicionesYExcepcionesLiteral': literal, 'limite': 'No hay predicado ejecutable verificado para esta cláusula; leer escenario y condiciones del literal y notas de guía.'}, 'entradasNecesarias': ['identidad de material y certeza de selección de guía', 'escenario correspondiente a sección/subsección', 'condiciones explícitas del literal', 'capacitación, equipo y juicio del responsable cuando se exige'], 'procedimientoInterpretacion': ['Confirmar guía y material; revisar notas especiales de guía.', 'Leer cláusula completa con sección/subsección, no solo literalBreve.', 'Verificar condiciones y datos ausentes; conservar negaciones y modalidad considere/debe/puede.', 'Resolver referencias cruzadas; abstenerse de calcular datos no contenidos.', 'Presentar indicación y fuente para decisión competente, sin ejecutar intervenciones.'], 'resultadoEsperadoDocumental': literal, 'excepciones': 'Conservar condiciones completas del literal y notas especiales de la guía. No asumir ninguna excepción adicional.', 'reglasRelacionadas': related(literal), 'fuente': {'documentoSha256': sha(PDF), 'paginasPdf': item['paginasPdf'], 'paginasImpresas': [n - 2 for n in item['paginasPdf']], 'referenciasCatalogo': item['referencias'], 'bloqueCatalogo': block['id'], 'cajasPt': [refs[r]['cajaPt'] for r in item['referencias']]}, 'evidencia': {'lineasFuenteLocalizadasEnPdf': found, 'paginaVisualLeida': True, 'cotejoSemantico': 'lectura documental del lote; predicados aún no formalizados individualmente'}, 'implementacion': {'estado': 'NO_DEMOSTRADA', 'catalogoConservaLiteral': True, 'motorOperativo': 'pendiente'}, 'pruebas': {'cotejoDocumental': 'ejecución reproducible auditar111_120.py', 'unitariaMotor': 'PENDIENTE', 'integracionMotor': 'PENDIENTE', 'comprensionIndependiente': 'PENDIENTE'}, 'estadoValidacion': 'FUENTE_COTEJADA_LECTURA_SEMANTICA_DOCUMENTADA_NO_IMPLEMENTADA'})
        result.append({'id': 'GRE24-GUIA-' + g['numero'], 'numero': g['numero'], 'tituloOriginal': g['tituloOriginal'], 'paginasPdf': g['paginasPdf'], 'paginasImpresas': [n - 2 for n in g['paginasPdf']], 'ordenPeligros': [b['encabezadoOriginal'] for b in g['bloques'] if b['encabezadoOriginal'] in ('A LA SALUD', 'INCENDIO O EXPLOSIÓN')], 'notasInterpretativas': f'lectura111-120.md#guia-{g["numero"]}', 'clausulas': items, 'estado': 'LECTURA_DOCUMENTAL_POR_GUIA; IMPLEMENTACION_Y_AUDITORIA_INDEPENDIENTE_PENDIENTES'})
    output = {'id': 'GRE24-LECTURA-GUIAS-111-120', 'version': 1, 'fecha': '2026-10-09', 'fuente': {'path': str(PDF.relative_to(ROOT)).replace('\\', '/'), 'sha256': sha(PDF)}, 'catalogo': {'path': str(ARTIFACT.relative_to(ROOT)).replace('\\', '/'), 'sha256': sha(ARTIFACT)}, 'metodo': {'pdfDirecto': 'PyMuPDF ' + pymupdf.VersionBind, 'lecturaVisual': '20 originales individuales, inspeccionados por agente lectura_guias', 'alcance': '10 guías/20 páginas/100 bloques; reglas por cláusula con condiciones literales y lectura contextual, no motor ejecutable', 'reserva': 'Este lote no demuestra dominio integral de 62 guías/392 páginas; las cláusulas conservan texto original y límites. No hay segunda revisión independiente ni pruebas del motor.'}, 'resumen': {'guias': len(result), 'paginas': len(page_records), 'bloques': sum(len(g['bloques']) for g in guides), 'clausulas': sum(len(g['clausulas']) for g in result), 'diferenciasTextoNativo': sum(not p['textoNativoIgualCatalogo'] for p in page_records), 'discrepanciasDetectadas': len(discrepancies)}, 'paginas': page_records, 'guias': result, 'discrepancias': discrepancies, 'pendientes': ['Formalizar predicados específicos de cada cláusula sin depender de plantillas contextuales.', 'Revisión documental por otro auditor, casos de comprensión y resolución de remisiones.', 'Pruebas y correspondencia de motor/SCI; no implementados en esta subtarea.', 'Completar guías122–174 y estados de121/167, sin atribuir cobertura de este lote a ellas.']}
    (OUT / 'lectura111-120.json').write_text(json.dumps(output, ensure_ascii=False, indent=2) + '\n', encoding='utf8')
    print(json.dumps(output['resumen'], ensure_ascii=False))
    if discrepancies:
        raise SystemExit(1)


if __name__ == '__main__':
    main()
