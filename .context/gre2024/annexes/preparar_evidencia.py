"""Render reproducible de anexos; no extractor de reglas ni prueba operativa."""
from pathlib import Path
import hashlib
import json
import pymupdf

ROOT = Path(__file__).resolve().parents[3]
OUT = Path(__file__).resolve().parent
PDF = ROOT / 'docs/Manuales/GRE2024-Spa-Web-a.pdf'
sha = hashlib.sha256(PDF.read_bytes()).hexdigest()
assert sha == 'bfc8b663259528dadd81a499afac2d5fd417467786ac616fb31625680f4ea4af'
doc = pymupdf.open(PDF)
(OUT / 'renders').mkdir(parents=True, exist_ok=True)
pages = []
for n in range(350, 393):
    p = doc[n - 1]
    target = OUT / 'renders' / f'pdf-{n:04}.png'
    p.get_pixmap(matrix=pymupdf.Matrix(1.7, 1.7), alpha=False).save(target)
    text = p.get_text(sort=False)
    pages.append({'paginaPdf': n, 'paginaImpresa': str(n-2) if n < 390 else None,
                  'textoNativo': text, 'render': str(target.relative_to(OUT)).replace('\\', '/'),
                  'renderSha256': hashlib.sha256(target.read_bytes()).hexdigest(),
                  'textoNativoSha256': hashlib.sha256(text.encode('utf-8')).hexdigest(),
                  'dimensiones': list(p.rect), 'imagenesRaster': len(p.get_images()),
                  'elementosVectoriales': len(p.get_drawings())})
(OUT/'paginas-nativas.json').write_text(json.dumps({'fuenteSha256':sha,'paginas':pages},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(OUT/'manifest.json').write_text(json.dumps({'fuente':str(PDF.relative_to(ROOT)).replace('\\','/'),'fuenteSha256':sha,'pymupdf':pymupdf.VersionBind,'renderEscala':1.7,'paginaDesde':350,'paginaHasta':392,'paginas':[{k:v for k,v in p.items() if k!='textoNativo'} for p in pages]},ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'paginas':len(pages),'fuenteSha256':sha}))
