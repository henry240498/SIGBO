"""Prepara condiciones de la fuente estudiada; no modifica candidatos ni activa SQL."""
from pathlib import Path
import argparse
import hashlib
import json
import re
import unicodedata
import pymupdf

ROOT = Path(__file__).resolve().parents[2]
SHA = 'bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af'
DESTINO = ROOT / 'backend/src/modules/gre/fuentes/gre2024-definiciones.json'


def normalizar(s):
    return ' '.join(''.join(c for c in unicodedata.normalize('NFD', s.upper())
                           if not unicodedata.combining(c)).split())


def preparar():
    archivo = ROOT / 'docs/Manuales/GRE2024-Spa-Web-a.pdf'
    if hashlib.sha256(archivo.read_bytes()).hexdigest() != SHA:
        raise ValueError('La fuente no corresponde a la edición estudiada.')
    doc = pymupdf.open(archivo)
    texto = doc[339].get_text()
    patron = r'([^\n:]+):\s*(\d[\d ]*)(?:\s*[-–]\s*(\d[\d ]*))?\s+(kg|L)\s*\([^\n]+\)'
    cantidades = []
    for m in re.finditer(patron, texto):
        cantidades.append({'tipo': normalizar(m[1].replace('•', '').strip()),
                           'desde': m[2].replace(' ', ''),
                           'hasta': (m[3] or m[2]).replace(' ', ''),
                           'unidad': m[4], 'literal': m[0].strip(),
                           'paginaPdf': 340, 'paginaImpresa': '338'})
    if len(cantidades) != 5:
        raise ValueError('La estructura de cantidades de Tabla 3 cambió; requiere cotejo.')
    fuente_reglas = ROOT / '.context/gre2024/reglas-operativas.json'
    reglas = json.loads(fuente_reglas.read_text(encoding='utf-8'))
    if reglas['fuenteSha256'] != SHA:
        raise ValueError('El conocimiento corresponde a otra fuente.')
    documentales = []
    for r in reglas['reglas']:
        # Conservar interpretación y límites; no convertir lectura en acción automática.
        documentales.append({k: r[k] for k in ['id', 'descripcion', 'condicionesActivacion',
                                              'entradasNecesarias', 'excepcionesYAlteraciones',
                                              'reglasRelacionadas', 'limites']})
        documentales[-1]['tratamiento'] = 'LECTURA_DOCUMENTAL'
        documentales[-1]['fuentes'] = [{k: f[k] for k in ['paginaPdf', 'paginaImpresa', 'extractoLiteral']}
                                      for f in r['fuentes']]
    tipos = {
        'CARROTANQUE DE FERROCARRIL': [{'tipo': 'CARROTANQUE DE FERROCARRIL', 'minimo': 1, 'maximo': 1}],
        'AUTOTANQUE O REMOLQUE': [{'tipo': 'AUTOTANQUE O REMOLQUE', 'minimo': 1, 'maximo': 1}],
        'TANQUE DE AGRICULTURA': [{'tipo': 'TANQUE DE AGRICULTURA', 'minimo': 1, 'maximo': 1}],
        'MULTIPLES CILINDROS PEQUENOS': [{'tipo': 'CILINDRO PEQUENO', 'minimo': 2, 'maximo': None}],
        'MULTIPLES CILINDROS TONES': [{'tipo': 'CILINDRO TON', 'minimo': 2, 'maximo': None}],
        'MULTIPLES CILINDROS PEQUENOS O UN CILINDRO TON': [
            {'tipo': 'CILINDRO PEQUENO', 'minimo': 2, 'maximo': None},
            {'tipo': 'CILINDRO TON', 'minimo': 1, 'maximo': 1}],
    }
    # Las asociaciones/número son interpretación explícita de los rótulos de filas,
    # no cantidades inferidas de la introducción. Se cotejan con la tabla completa.
    return {'schemaVersion': 1, 'versionInterpretacion': 'gre2024-condiciones-2',
            'documentoSha256': SHA, 'validacionOperacional': 'PENDIENTE',
            'cantidadesTabla3': cantidades, 'tiposFilaTabla3': tipos,
            'reglasDocumentales': documentales}


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--verificar', action='store_true')
    args = p.parse_args()
    salida = json.dumps(preparar(), ensure_ascii=False, indent=2) + '\n'
    if args.verificar:
        if DESTINO.read_text(encoding='utf-8') != salida:
            raise ValueError('Definiciones desactualizadas respecto del PDF/conocimiento.')
    else:
        DESTINO.parent.mkdir(parents=True, exist_ok=True)
        DESTINO.write_text(salida, encoding='utf-8')
    print(json.dumps({'archivo': str(DESTINO.relative_to(ROOT)),
                      'sha256': hashlib.sha256(salida.encode()).hexdigest(),
                      'modo': 'verificacion' if args.verificar else 'preparacion'}, ensure_ascii=False))


if __name__ == '__main__':
    main()
