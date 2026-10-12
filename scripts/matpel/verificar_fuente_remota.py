"""Descarga pública en memoria para cotejo SHA; no sustituye el PDF ni activa catálogo."""
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

ROOT = Path(__file__).resolve().parents[2]
URL = 'https://www.phmsa.dot.gov/sites/phmsa.dot.gov/files/2024-04/GRE2024-Spa-Web-a.pdf'


def verificar():
    local = ROOT / 'docs/Manuales/GRE2024-Spa-Web-a.pdf'
    result = {'fechaUtc': datetime.now(timezone.utc).isoformat(), 'url': URL,
              'sha256Local': hashlib.sha256(local.read_bytes()).hexdigest(),
              'sha256Remoto': None, 'coincide': None, 'bytesRemotos': None,
              'limite': 'El cotejo de bytes no acredita vigencia universal, erratas ni aceptación institucional.'}
    try:
        with urlopen(URL, timeout=20) as response:
            result['httpStatus'] = response.status
            data = response.read(10_000_001)
        if len(data) > 10_000_000 or not data.startswith(b'%PDF-'):
            result['error'] = 'Respuesta no cotejable como PDF dentro del límite técnico de descarga.'
        else:
            result['sha256Remoto'] = hashlib.sha256(data).hexdigest()
            result['bytesRemotos'] = len(data)
            result['coincide'] = result['sha256Remoto'] == result['sha256Local']
    except HTTPError as error:
        result['httpStatus'] = error.code
        result['error'] = 'La fuente remota no entregó bytes para cotejo.'
    except (URLError, TimeoutError) as error:
        result['error'] = type(error).__name__
    return result


if __name__ == '__main__':
    result = verificar()
    print(json.dumps(result, ensure_ascii=False))
