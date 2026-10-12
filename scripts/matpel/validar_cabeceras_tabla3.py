"""Cotejo adicional de 308 celdas con cabeceras nativas, sin importar el parser de tablas."""
import hashlib
import json
from pathlib import Path
import re
import unicodedata
import pymupdf

ROOT = Path(__file__).resolve().parents[2]


def normalizar(s):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFD', s.upper()) if not unicodedata.combining(c)).split())


def cotejar(tabla, referencias, pdf):
    errors = []
    fuentes = {r['id']: r for r in referencias}
    columnas = {c['codigo']: c for c in tabla['estructura']['columnas']}
    cabeceras = {}
    for numero in tabla['estructura']['paginasPdf']:
        pagina = pdf[numero - 1]
        palabras = [(w, normalizar(w[4])) for w in pagina.get_text('words')]
        unidades = [(w, {'METROS': 'm', '(PIES)': 'pies', 'KILOMETROS': 'km', '(MILLAS)': 'mi'}[s]) for w, s in palabras if s in ['METROS', '(PIES)', 'KILOMETROS', '(MILLAS)']]
        periodos = [(w, s) for w, s in palabras if s in ['DIA', 'NOCHE']]
        vientos = [(w, s.upper()) for w, s in palabras if s in ['LEVE', 'MODERADO', 'FUERTE']]
        texto = normalizar(pagina.get_text())
        leves = re.findall(r'VIENTO LEVE\s*\(\s*<\s*(\d+)\s+MPH\s*=\s*<\s*(\d+)\s+KM/H\s*\)', texto)
        moderados = re.findall(r'VIENTO MODERADO\s*\(\s*(\d+)\s*-\s*(\d+)\s+MPH\s*=\s*(\d+)\s*-\s*(\d+)\s+KM/H\s*\)', texto)
        fuertes = re.findall(r'VIENTO FUERTE\s*\(\s*>\s*(\d+)\s+MPH\s*=\s*>\s*(\d+)\s+KM/H\s*\)', texto)
        if len(unidades) != 14 or len(periodos) != 2 or len(vientos) != 6 or any(len(xs) != 2 or xs[0] != xs[1] for xs in [leves, moderados, fuertes]):
            errors.append(f'Cabeceras no inequívocas: PDF{numero}')
            continue
        rangos = {
            'LEVE': {'mph': {'menorQue': leves[0][0]}, 'kmh': {'menorQue': leves[0][1]}},
            'MODERADO': {'mph': {'desde': moderados[0][0], 'hasta': moderados[0][1]}, 'kmh': {'desde': moderados[0][2], 'hasta': moderados[0][3]}},
            'FUERTE': {'mph': {'mayorQue': fuertes[0][0]}, 'kmh': {'mayorQue': fuertes[0][1]}}
        }
        cabeceras[numero] = (unidades, periodos, vientos, rangos)
    centro = lambda caja: (caja[1] + caja[3]) / 2
    total = 0
    for fila in tabla['filas']:
        for celda in fila['celdas']:
            total += 1
            r = fuentes[celda['fuentes'][0]]
            if r['paginaPdf'] not in cabeceras:
                continue
            unidades, periodos, vientos, rangos = cabeceras[r['paginaPdf']]
            y = centro(r['cajaPt'])
            cerca = lambda xs: min(xs, key=lambda v: abs(centro(v[0]) - y))[1]
            unidad = cerca(unidades)
            col = columnas[celda['columna']]
            if celda['unidad'] != unidad or col['unidad'] != unidad:
                errors.append(f'Unidad contradice cabecera: {fila["id"]}/{celda["columna"]}')
            if unidad in ['km', 'mi']:
                periodo, viento = cerca(periodos), cerca(vientos)
                if col['periodo'] != periodo or col['viento'] != viento or col['rangoViento'] != rangos[viento] or col['finalidad'] != 'PROTECCION':
                    errors.append(f'Condición contradice cabecera: {fila["id"]}/{celda["columna"]}')
            elif col['finalidad'] != 'AISLAMIENTO' or col['periodo'] is not None or col['viento'] is not None:
                errors.append(f'Finalidad contradice cabecera: {fila["id"]}/{celda["columna"]}')
    return {'celdasCotejadas': total, 'paginasCabeceras': sorted(cabeceras), 'errores': errors}


def validar():
    source = ROOT / 'docs/Manuales/GRE2024-Spa-Web-a.pdf'
    sha = hashlib.sha256(source.read_bytes()).hexdigest()
    path = ROOT / f'backend/private_uploads/gre/{sha}.catalogo-1-busqueda-1-pymupdf1.28.2.json'
    a = json.loads(path.read_bytes())
    with pymupdf.open(source) as pdf:
        result = cotejar(next(t for t in a['tablas'] if t['codigo'] == 'TABLA_3'), a['referencias'], pdf)
    return {'tipo': 'COTEJO_TECNICO_CABECERAS_NO_COMPRENSION_INDEPENDIENTE', 'fuenteSha256': sha, 'catalogoSha256': hashlib.sha256(path.read_bytes()).hexdigest(), **result}


if __name__ == '__main__':
    result = validar()
    print(json.dumps(result, ensure_ascii=False))
    raise SystemExit(bool(result['errores']))
