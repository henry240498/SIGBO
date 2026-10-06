#!/usr/bin/env python3
"""
Corrige tildes y eñes en el TEXTO VISIBLE de los archivos Dart de la app movil.

Por que no es un simple "buscar y reemplazar": muchas palabras sin tilde son nombres de campos del
servidor (j['direccion'], 'estado') o valores que se envian (EN_CUARTEL). Cambiarlas romperia la app.
Por eso el script entiende la sintaxis de las cadenas de Dart:
  - solo toca el texto literal de una cadena, nunca lo que va dentro de ${...} o $variable;
  - ignora las cadenas de una sola palabra que parecen claves o valores (minusculas, MAYUSCULAS_CON_GUION,
    rutas, URL); una etiqueta de una palabra con inicial mayuscula ("Direccion") si se corrige;
  - usa un diccionario cerrado de palabras (no adivina).

Uso:
  python scripts/tildes-dart.py --palabras   # lista las palabras que encuentra y no estan en el diccionario
  python scripts/tildes-dart.py --revisar    # muestra los cambios que haria, sin escribir nada
  python scripts/tildes-dart.py --aplicar    # escribe los cambios
"""
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent / '.movile' / 'lib'

# Diccionario cerrado: forma sin tilde (minuscula) -> forma correcta (minuscula).
D = {
    # a / e / i / o / u
    'accion': 'acción', 'acciones': 'acciones', 'actualizacion': 'actualización', 'actualizaciones': 'actualizaciones',
    'ademas': 'además', 'aqui': 'aquí', 'alli': 'allí', 'asi': 'así', 'tambien': 'también', 'despues': 'después',
    'ultimo': 'último', 'ultima': 'última', 'ultimos': 'últimos', 'ultimas': 'últimas', 'proximo': 'próximo',
    'proximos': 'próximos', 'proxima': 'próxima', 'telefono': 'teléfono', 'camara': 'cámara', 'ubicacion': 'ubicación',
    'direccion': 'dirección', 'conexion': 'conexión', 'sesion': 'sesión', 'operacion': 'operación', 'operaciones': 'operaciones',
    'informacion': 'información', 'descripcion': 'descripción', 'notificacion': 'notificación', 'notificaciones': 'notificaciones',
    'convocatoria': 'convocatoria', 'posicion': 'posición', 'reposicion': 'reposición', 'dotacion': 'dotación',
    'inspeccion': 'inspección', 'inspecciones': 'inspecciones', 'prevencion': 'prevención', 'auditoria': 'auditoría',
    'configuracion': 'configuración', 'configurado': 'configurado', 'aplicacion': 'aplicación', 'descarga': 'descarga',
    'instalacion': 'instalación', 'instalaciones': 'instalaciones', 'autorizacion': 'autorización', 'decision': 'decisión',
    'solicitud': 'solicitud', 'cancelacion': 'cancelación', 'verificacion': 'verificación', 'comprobacion': 'comprobación',
    'sincronizacion': 'sincronización', 'situacion': 'situación', 'organizacion': 'organización', 'funcion': 'función',
    'funciones': 'funciones', 'version': 'versión', 'diagnostico': 'diagnóstico', 'categoria': 'categoría',
    'categorias': 'categorías', 'numero': 'número', 'numeros': 'números', 'codigo': 'código', 'kilometraje': 'kilometraje',
    'kilometros': 'kilómetros', 'movil': 'móvil', 'moviles': 'móviles', 'vehiculo': 'vehículo', 'vehiculos': 'vehículos',
    'dias': 'días', 'dia': 'día', 'horas': 'horas', 'minimo': 'mínimo', 'maximo': 'máximo', 'maxima': 'máxima',
    'minima': 'mínima', 'unico': 'único', 'unica': 'única', 'publico': 'público', 'publica': 'pública', 'basico': 'básico',
    'tecnico': 'técnico', 'tecnica': 'técnica', 'electronico': 'electrónico', 'automatico': 'automático',
    'automaticamente': 'automáticamente', 'automatica': 'automática', 'rapido': 'rápido', 'rapida': 'rápida',
    'util': 'útil', 'utiles': 'útiles', 'facil': 'fácil', 'dificil': 'difícil', 'valido': 'válido', 'valida': 'válida',
    'invalido': 'inválido', 'invalida': 'inválida', 'validos': 'válidos', 'validas': 'válidas', 'critico': 'crítico',
    'critica': 'crítica', 'medico': 'médico', 'medica': 'médica', 'medicos': 'médicos', 'medicas': 'médicas',
    'energia': 'energía', 'bateria': 'batería', 'señal': 'señal', 'rango': 'rango', 'estan': 'están', 'esta': 'esta',
    'sera': 'será', 'seran': 'serán', 'podra': 'podrá', 'podran': 'podrán', 'tendra': 'tendrá', 'habra': 'habrá',
    'hacia': 'hacia', 'mas': 'más', 'aun': 'aún', 'solo': 'solo', 'sólo': 'solo', 'que': 'que', 'quien': 'quién',
    'cuando': 'cuando', 'porque': 'porque', 'si': 'si', 'tu': 'tu', 'el': 'el', 'mi': 'mi',
    'envio': 'envío', 'envia': 'envía', 'envian': 'envían', 'registro': 'registro', 'registrado': 'registrado',
    'llego': 'llegó', 'salio': 'salió', 'respondio': 'respondió', 'quedo': 'quedó', 'guardo': 'guardó', 'pidio': 'pidió', 'vencio': 'venció',
    'atencion': 'atención', 'revisa': 'revisa', 'revisar': 'revisar', 'ningun': 'ningún', 'algun': 'algún',
    'esta?': 'está', 'peticion': 'petición', 'conexiones': 'conexiones', 'proteccion': 'protección',
    'comunicacion': 'comunicación', 'comunicaciones': 'comunicaciones', 'educacion': 'educación', 'generacion': 'generación',
    'ruta': 'ruta', 'ejecucion': 'ejecución', 'ocurrio': 'ocurrió', 'ocurrido': 'ocurrido', 'hora': 'hora',
    'tamano': 'tamaño', 'contrasena': 'contraseña', 'senal': 'señal', 'ano': 'año', 'anos': 'años', 'dueno': 'dueño',
    'pequeno': 'pequeño', 'espanol': 'español', 'montana': 'montaña', 'sueno': 'sueño', 'diseno': 'diseño',
    'companero': 'compañero', 'companeros': 'compañeros', 'campana': 'campaña', 'cuarteles': 'cuarteles',
    'telefonica': 'telefónica', 'telefonicas': 'telefónicas', 'telefonos': 'teléfonos', 'estado': 'estado',
    'sincronizacion': 'sincronización', 'coordenadas': 'coordenadas', 'ubicaciones': 'ubicaciones',
    'ahi': 'ahí', 'ahora': 'ahora', 'tambien': 'también', 'razon': 'razón', 'ademas': 'además', 'despacho': 'despacho',
    'traves': 'través', 'jamas': 'jamás', 'ademas.': 'además', 'adjunto': 'adjunto', 'camaras': 'cámaras',
    'basica': 'básica', 'practica': 'práctica', 'pagina': 'página', 'paginas': 'páginas', 'musica': 'música',
    'despues,': 'después', 'ambar': 'ámbar', 'cartografia': 'cartografía', 'cercania': 'cercanía', 'concedio': 'concedió',
    'devolvio': 'devolvió', 'duplico': 'duplicó', 'limite': 'límite', 'limites': 'límites', 'periodo': 'período',
    'salon': 'salón', 'tunel': 'túnel', 'todavia': 'todavía', 'tenes': 'tenés', 'vibracion': 'vibración', 'vacio': 'vacío',
    'observacion': 'observación', 'atras': 'atrás', 'demas': 'demás', 'reiniciara': 'reiniciará', 'enviara': 'enviará',
    'enviaran': 'enviarán', 'descargara': 'descargará', 'reintentara': 'reintentará', 'instalara': 'instalará',
    'pedira': 'pedirá', 'completaran': 'completarán', 'quedaran': 'quedarán', 'aparecera': 'aparecerá', 'aparecen': 'aparecen',
    'sonara': 'sonará', 'mostrara': 'mostrará', 'guardara': 'guardará', 'abrira': 'abrirá', 'cerrara': 'cerrará',
    'esperara': 'esperará', 'intentara': 'intentará', 'aplicara': 'aplicará', 'solicito': 'solicitó', 'inicio': 'inicio', 'metodo': 'método', 'ultimamente': 'últimamente', 'dato': 'dato', 'datos': 'datos',
}
# Palabras que SON correctas tal cual aunque coincidan con una clave del diccionario en otro contexto: no se tocan.
# (esta, que, como, cuando, si, tu, el, mi, solo, hacia, porque, cual...) aparecen en D mapeadas a si mismas
# o se resuelven aparte, porque su tilde depende del sentido (interrogativo/exclamativo). Ver INTERROGATIVAS.
SIN_CAMBIO = {k for k, v in D.items() if k == v}
D = {k: v for k, v in D.items() if k != v}

# Interrogativas: solo se acentuan DENTRO de una pregunta (entre ¿ y ?). Fuera de ella no se tocan.
INTERROGATIVAS = {'que': 'qué', 'quienes': 'quiénes', 'donde': 'dónde', 'como': 'cómo',
                  'cual': 'cuál', 'cuales': 'cuáles', 'cuanto': 'cuánto', 'cuantos': 'cuántos', 'cuanta': 'cuánta',
                  'cuantas': 'cuántas', 'cuando': 'cuándo'}
# Palabras que se acentuan solo cuando el contexto lo exige y por eso se revisan a mano: esta/está, mas/más, si/sí, solo/sólo.
DUDOSAS = {'esta': 'está', 'mas': 'más', 'tu': 'tú', 'si': 'sí'}
# 'mas' se acentua siempre que sea adverbio de cantidad (en los textos de la app lo es).
D['mas'] = 'más'
D.pop('estan', None)
D['estan'] = 'están'

RE_PALABRA = re.compile(r"[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+")
RE_CLAVE = re.compile(r"^[A-Za-z0-9_./:\-?=&%#@!]+$")


def es_clave_o_valor(texto: str) -> bool:
    """Cadena de una sola 'palabra' que parece una clave, ruta o valor interno (no una etiqueta)."""
    if ' ' in texto or not RE_CLAVE.match(texto):
        return False
    if texto.isupper() or '_' in texto or '/' in texto or ':' in texto or '.' in texto:
        return True
    return texto[:1].islower()  # 'direccion' es una clave; 'Direccion' es una etiqueta


def con_caso(original: str, nuevo: str) -> str:
    if original.isupper() and len(original) > 1:
        return nuevo.upper()
    if original[:1].isupper():
        return nuevo[:1].upper() + nuevo[1:]
    return nuevo


# Frases exactas: la tilde depende del sentido (esté/este, está/esta, qué/que, rechazó/rechazo...).
FRASES = [
    ('servidor este encendido', 'servidor esté encendido'), ('celular este en el mismo', 'celular esté en el mismo'),
    ('aplicacion esta al dia', 'aplicación está al día'), ('no esta disponible', 'no está disponible'),
    ('Para que', 'Para qué'), ('Quien hizo que y cuando', 'Quién hizo qué y cuándo'),
    ('a donde estas', 'a donde estás'), ('rechazo el archivo', 'rechazó el archivo'),
    ('rechazo la operacion', 'rechazó la operación'),
    ('Quien la pide', 'Quién la pide'), ('Quien llama', 'Quién llama'), ('ver quien responde', 'ver quién responde'),
]


def corregir_texto(texto: str, desconocidas: set | None = None) -> str:
    """Corrige un fragmento de texto literal (sin interpolaciones)."""
    for antes, despues in FRASES:
        texto = texto.replace(antes, despues)
    def en_pregunta(pos: int) -> bool:
        a = max(texto.rfind('¿', 0, pos), -1)
        return a >= 0 and texto.find('?', a, pos) == -1

    def cambia(m: re.Match) -> str:
        p = m.group(0)
        low = p.lower()
        if low in INTERROGATIVAS and en_pregunta(m.start()):
            return con_caso(p, INTERROGATIVAS[low])
        if low in D:
            return con_caso(p, D[low])
        return p

    return RE_PALABRA.sub(cambia, texto)


def procesar(fuente: str, desconocidas: set | None = None):
    """Recorre el codigo Dart y corrige solo el texto de las cadenas. Devuelve (nuevo, [(antes, despues)])."""
    salida = []
    cambios = []
    i, n = 0, len(fuente)

    def leer_cadena(i):
        """Lee una cadena que empieza en fuente[i] (comilla). Devuelve (indice_final, partes) con
        partes = [('texto', s) | ('codigo', s)] y el cierre."""
        q = fuente[i]
        crudo = i > 0 and fuente[i - 1] == 'r' and (i < 2 or not fuente[i - 2].isalnum())
        j = i + 1
        partes = []
        buf = []
        while j < n:
            c = fuente[j]
            if c == '\\' and not crudo:
                buf.append(fuente[j:j + 2])
                j += 2
                continue
            if c == q:
                if buf:
                    partes.append(('texto', ''.join(buf)))
                return j + 1, partes, crudo
            if c == '$' and not crudo:
                if buf:
                    partes.append(('texto', ''.join(buf)))
                    buf = []
                if j + 1 < n and fuente[j + 1] == '{':
                    k, prof = j + 2, 1
                    while k < n and prof > 0:
                        ch = fuente[k]
                        if ch in '\'"':
                            k, _, _ = leer_cadena(k)
                            continue
                        if ch == '{':
                            prof += 1
                        elif ch == '}':
                            prof -= 1
                        k += 1
                    partes.append(('codigo', fuente[j:k]))
                    j = k
                    continue
                m = re.match(r'\$[A-Za-z_][A-Za-z0-9_]*', fuente[j:])
                if m:
                    partes.append(('codigo', m.group(0)))
                    j += len(m.group(0))
                    continue
            buf.append(c)
            j += 1
        return n, partes, crudo

    while i < n:
        c = fuente[i]
        if c == '/' and fuente.startswith('//', i):
            fin = fuente.find('\n', i)
            fin = n if fin < 0 else fin
            salida.append(fuente[i:fin])
            i = fin
            continue
        if c == '/' and fuente.startswith('/*', i):
            fin = fuente.find('*/', i)
            fin = n if fin < 0 else fin + 2
            salida.append(fuente[i:fin])
            i = fin
            continue
        if c in '\'"':
            if fuente.startswith(c * 3, i):  # cadena triple: no se usa; se deja intacta
                fin = fuente.find(c * 3, i + 3)
                fin = n if fin < 0 else fin + 3
                salida.append(fuente[i:fin])
                i = fin
                continue
            fin, partes, crudo = leer_cadena(i)
            # Se evalua la cadena COMPLETA, con cada ${...} reemplazado por un marcador: '/flota/moviles/$id/posicion'
            # es una ruta aunque sus trozos de texto, por separado, parezcan palabras.
            esquema = ''.join(s if t == 'texto' else 'X' for t, s in partes)
            tocar = not crudo and not es_clave_o_valor(esquema)
            # un 'import' o 'part' es una ruta, no texto visible
            previo = fuente[max(0, fuente.rfind('\n', 0, i)):i]
            if re.match(r"\s*(import|export|part)\b", previo):
                tocar = False
            nuevo = [fuente[i]]
            for t, s in partes:
                if t == 'texto' and tocar:
                    corregido = corregir_texto(s, desconocidas)
                    if corregido != s:
                        cambios.append((s, corregido))
                    nuevo.append(corregido)
                else:
                    nuevo.append(s)
            nuevo.append(fuente[fin - 1] if fin - 1 > i else '')
            salida.append(''.join(nuevo))
            if desconocidas is not None and tocar:
                for t, s in partes:
                    if t == 'texto':
                        for p in RE_PALABRA.findall(s):
                            desconocidas.add(p.lower())
            i = fin
            continue
        salida.append(c)
        i += 1
    return ''.join(salida), cambios


def archivos():
    return sorted(p for p in RAIZ.rglob('*.dart') if p.name not in {'clave_publica.dart'})


if __name__ == '__main__':
    modo = sys.argv[1] if len(sys.argv) > 1 else '--revisar'
    if modo == '--palabras':
        vistas: set = set()
        for p in archivos():
            procesar(p.read_text(encoding='utf-8'), vistas)
        sospechosas = sorted(w for w in vistas if w not in D and w not in SIN_CAMBIO and len(w) > 3 and not RE_CLAVE.fullmatch(w) is None)
        print(' '.join(sospechosas))
        sys.exit(0)
    total = 0
    for p in archivos():
        original = p.read_text(encoding='utf-8')
        nuevo, cambios = procesar(original)
        if cambios:
            total += len(cambios)
            if modo == '--revisar':
                print(f'\n== {p.name} ({len(cambios)})')
                for antes, despues in cambios:
                    print(f'  - {antes.strip()[:110]!r}\n  + {despues.strip()[:110]!r}')
            elif modo == '--aplicar':
                p.write_text(nuevo, encoding='utf-8', newline='')
    print(f'\n{total} textos {"corregidos" if modo == "--aplicar" else "a corregir"}.')
