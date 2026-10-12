"""Cotejo del fixture de regresión contra bytes congelados; no valida uso operativo."""
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def cotejar(recorte, original):
    errors = []
    a = recorte['artefactoRecortado']
    if recorte.get('tipo') != 'RECORTE_LITERAL_PARA_REGRESION_NO_CATALOGO_PUBLICABLE':
        errors.append('El recorte no declara su finalidad exclusiva de regresión.')
    if a.get('aptoActivacion') is not False:
        errors.append('El recorte no puede ser publicable.')
    colecciones = {'entradas': 'id', 'relacionesIndices': 'id', 'referencias': 'id',
                   'textos': 'id', 'guias': 'numero', 'reglas': 'codigo'}
    for key, identity in colecciones.items():
        fuente = {x[identity]: x for x in original[key]}
        vistos = set()
        for item in a[key]:
            id_ = item[identity]
            if id_ in vistos or fuente.get(id_) != item:
                errors.append(f'Registro alterado, duplicado o ajeno: {key}/{id_}')
            vistos.add(id_)
    for key in set(original) - set(colecciones) - {'tablas'}:
        if a.get(key) != original[key]:
            errors.append(f'Metadatos alterados: {key}')
    tablas = {t['codigo']: t for t in original['tablas']}
    if [t['codigo'] for t in a['tablas']] != [t['codigo'] for t in original['tablas']]:
        errors.append('Tablas faltantes o reordenadas.')
    for t in a['tablas']:
        fuente = tablas.get(t['codigo'])
        if not fuente:
            errors.append(f'Tabla ajena: {t["codigo"]}')
            continue
        if {k: v for k, v in t.items() if k != 'filas'} != {k: v for k, v in fuente.items() if k != 'filas'}:
            errors.append(f'Cabeceras/notas alteradas: {t["codigo"]}')
        filas = {f['id']: f for f in fuente['filas']}
        vistos = set()
        for f in t['filas']:
            if f['id'] in vistos or filas.get(f['id']) != f:
                errors.append(f'Fila/celdas alteradas: {t["codigo"]}/{f["id"]}')
            vistos.add(f['id'])
    ids = set(recorte['identificadoresSeleccionados'])
    if a['entradas'] != [e for e in original['entradas'] if e['identificador'] in ids]:
        errors.append('El recorte de identidades pierde coincidencias de los identificadores seleccionados.')
    return errors


def validar():
    path = ROOT / '.context/gre2024/test-cases/motor-fuente.json'
    recorte = json.loads(path.read_bytes())
    source = ROOT / 'docs/Manuales/GRE2024-Spa-Web-a.pdf'
    catalogo = ROOT / f'backend/private_uploads/gre/{recorte["fuenteSha256"]}.catalogo-1-busqueda-1-pymupdf1.28.2.json'
    errors = []
    if hashlib.sha256(source.read_bytes()).hexdigest() != recorte['fuenteSha256']:
        errors.append('El PDF original cambió.')
    if hashlib.sha256(catalogo.read_bytes()).hexdigest() != recorte['catalogoOriginalSha256']:
        errors.append('El candidato original cambió.')
    errors.extend(cotejar(recorte, json.loads(catalogo.read_bytes())))
    return {'tipo': 'COTEJO_LITERAL_RECORTE_NO_ACEPTACION_INSTITUCIONAL', 'sha256Recorte': hashlib.sha256(path.read_bytes()).hexdigest(), 'errores': errors}


if __name__ == '__main__':
    result = validar()
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(bool(result['errores']))
