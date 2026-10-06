"""Detecta tildes y simbolos perdidos en los textos de la app (.movile/lib).

Una herramienta que guarda un archivo en una codificacion sin acentos convierte cada caracter no ASCII
en un signo de interrogacion: "Configuraci?n", "SIGBO ? CBVC", "Conectando?". Ya paso dos veces
(2026-10-06). No es un error de compilacion: analyze y los tests pasan, y el texto sale mal en pantalla.

Uso:   python scripts/verificar-textos-dart.py          (sale con 1 si encuentra algo)
Solo mira el TEXTO de las cadenas; los operadores (?., ??, ternarios) y las rutas con ?param= no cuentan.
"""
import glob
import re
import sys

LETRA = 'A-Za-zÁÉÍÓÚÜÑáéíóúüñ'
LIT = re.compile(r"'((?:[^'\\\n]|\\.)*)'|\"((?:[^\"\\\n]|\\.)*)\"")
INTERP = re.compile(r'\$\{[^}]*\}|\$[A-Za-z_]\w*')

SOSPECHAS = [
    (re.compile(rf'[{LETRA}]\?[{LETRA}]'), 'letra perdida dentro de una palabra'),
    (re.compile(rf'(^|\s)\?[{LETRA}]'), 'signo de apertura (¿) perdido'),
    (re.compile(r'\s\?\s'), 'separador (·, —) perdido'),
    (re.compile(rf'[{LETRA}]\?$'), 'palabra o puntos suspensivos terminados en ?'),
]


def quitar_interpolaciones(linea):
    """Reemplaza cada ${...} (con llaves y comillas anidadas) por una X."""
    salida, i = [], 0
    while i < len(linea):
        if linea.startswith('${', i):
            nivel, j = 1, i + 2
            while j < len(linea) and nivel:
                nivel += {'{': 1, '}': -1}.get(linea[j], 0)
                j += 1
            salida.append('X')
            i = j
        else:
            salida.append(linea[i])
            i += 1
    return ''.join(salida)


def revisar(ruta):
    hallazgos = []
    for n, linea in enumerate(open(ruta, encoding='utf-8').read().split('\n'), 1):
        if linea.lstrip().startswith('//'):
            continue
        # primero se quitan las interpolaciones: dentro de ${...} hay codigo (ternarios, comillas anidadas)
        linea = quitar_interpolaciones(linea)
        for m in LIT.finditer(linea):
            texto = m.group(1) if m.group(1) is not None else m.group(2)
            if re.search(r'\?\w+=', texto):  # ruta con query string
                continue
            limpio = INTERP.sub('X', texto)
            if '?' not in limpio:
                continue
            for patron, motivo in SOSPECHAS:
                if patron.search(limpio):
                    # una pregunta legitima ("¿Qué hacés?") termina en ? pero empieza con ¿
                    if motivo.startswith('palabra') and '¿' in limpio:
                        continue
                    hallazgos.append((n, texto, motivo))
                    break
    return hallazgos


def main():
    total = 0
    for ruta in sorted(glob.glob('.movile/lib/*.dart')):
        for n, texto, motivo in revisar(ruta):
            total += 1
            print(f'{ruta}:{n}: {motivo}: {texto[:90]!r}')
    print(f'\n{total} texto(s) sospechoso(s).' if total else 'Sin textos dañados.')
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())
