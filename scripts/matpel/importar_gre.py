"""Preparación GRE: documento (3A) y catálogo candidato (3B–3C), sin DB, red ni activación.

El manifiesto es documental; no acredita importación o revisión de materiales.
La carpeta privada contiene una copia inmutable del PDF identificada por hash.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import sys
import tempfile
import unicodedata

import pymupdf

MAX_BYTES = 64 * 1024 * 1024
MAX_PAGINAS = 3000
VERSION_DOCUMENTAL = "documento-1"


def normalizar(texto: str) -> str:
    return " ".join("".join(c for c in unicodedata.normalize("NFD", texto)
                            if not unicodedata.combining(c)).upper().split())


def leer_acotado(archivo: Path) -> bytes:
    with archivo.open("rb") as fuente:
        contenido = fuente.read(MAX_BYTES + 1)
    if len(contenido) > MAX_BYTES:
        raise ValueError("El archivo excede el límite documental de 64 MiB.")
    if not contenido.startswith(b"%PDF-"):
        raise ValueError("El contenido no comienza con una cabecera PDF.")
    return contenido


def identidad(contenido: bytes) -> dict:
    with pymupdf.open(stream=contenido, filetype="pdf") as doc:
        if not doc.is_pdf or doc.needs_pass or not 0 < len(doc) <= MAX_PAGINAS:
            raise ValueError("Se requiere un PDF legible, sin contraseña y de hasta 3000 páginas.")
        portada = doc[0].get_text()
        texto = normalizar(portada)
        if "GUIA DE RESPUESTA" not in texto or "EMERGENCIA" not in texto:
            raise ValueError("La portada no identifica una GRE en español.")
        ediciones = sorted(set(re.findall(r"\b20\d{2}\b", texto)))
        if len(ediciones) != 1:
            raise ValueError("La edición de portada no es unívoca; requiere revisión documental.")
        return {"sha256": hashlib.sha256(contenido).hexdigest(), "bytes": len(contenido),
                "paginas": len(doc), "edicion": ediciones[0], "idioma": "es",
                "titulo": doc.metadata.get("title") or "GUÍA DE RESPUESTA EN CASO DE EMERGENCIA",
                "identificacion": {"metodo": "PORTADA_TEXTO_NATIVO", "paginaPdf": 1,
                                   "textoOriginal": portada}}


def descubrir(carpeta: Path) -> dict:
    carpeta = carpeta.resolve(strict=True)
    if not carpeta.is_dir():
        raise ValueError("La carpeta de manuales no es un directorio.")
    candidatos, descartados = [], []
    for archivo in sorted(carpeta.iterdir(), key=lambda p: p.name.casefold()):
        if not archivo.is_file():
            continue
        try:
            if archivo.is_symlink() or archivo.resolve().parent != carpeta:
                raise ValueError("No se admiten enlaces a archivos fuera de la carpeta.")
            datos = identidad(leer_acotado(archivo))
            candidatos.append({"archivo": archivo.name, **datos})
        except (ValueError, RuntimeError, OSError) as error:
            descartados.append({"archivo": archivo.name, "motivo": str(error)})
    return {"candidatos": candidatos, "descartados": descartados}


def seleccionar(carpeta: Path, nombre: str | None) -> tuple[bytes, dict]:
    informe = descubrir(carpeta)
    candidatos = informe["candidatos"]
    if nombre is None:
        if len(candidatos) != 1:
            raise ValueError(f"Hay {len(candidatos)} fuentes GRE; use --listar y seleccione --documento.")
        nombre = candidatos[0]["archivo"]
    if nombre not in [c["archivo"] for c in candidatos]:
        raise ValueError("Seleccione el nombre exacto de un candidato de la carpeta.")
    contenido = leer_acotado(carpeta.resolve(strict=True) / nombre)
    datos = identidad(contenido)
    # Leer una sola instantánea evita que el hash y las páginas procedan de archivos distintos.
    return contenido, datos


def manifiesto(contenido: bytes, datos: dict) -> dict:
    paginas = []
    with pymupdf.open(stream=contenido, filetype="pdf") as doc:
        for indice, pagina in enumerate(doc):
            texto = pagina.get_text()
            etiquetas = []
            # Conservar todos los rótulos: una página de ejemplo puede contener varios.
            for bloque in pagina.get_text("blocks"):
                for coincidencia in re.finditer(r"P[aá]gina\s+(\d+)", bloque[4]):
                    etiquetas.append({"valor": coincidencia.group(1),
                                      "textoOriginal": coincidencia.group(0),
                                      "cajaPt": list(bloque[:4])})
            rect_sin_rotar = pagina.rect * pagina.derotation_matrix
            paginas.append({"paginaPdf": indice + 1, "etiquetaPdf": pagina.get_label(),
                            "etiquetasImpresas": etiquetas, "anchoPt": rect_sin_rotar.width,
                            "altoPt": rect_sin_rotar.height, "rotacion": pagina.rotation,
                            "sha256TextoNativo": hashlib.sha256(texto.encode("utf-8")).hexdigest(),
                            "caracteresTexto": len(texto),
                            "requiereRevisionNumeracion": len({e["valor"] for e in etiquetas}) > 1})
        marcadores = [{"nivel": nivel, "tituloOriginal": titulo, "paginaPdf": pagina}
                      for nivel, titulo, pagina in doc.get_toc()]
    return {"tipo": "gre_documento_candidato", "schemaVersion": 1,
            "versionDocumental": VERSION_DOCUMENTAL, "sistemaCoordenadas": "PYMUPDF_SIN_ROTAR_PT",
            "herramienta": {"nombre": "PyMuPDF", "version": pymupdf.VersionBind},
            "estadoCatalogo": "NO_IMPORTADA", "documento": datos,
            "referenciaPrivada": f"privado:gre:{datos['sha256']}.pdf",
            "paginas": paginas, "marcadores": marcadores}


def escribir_inmutable(destino: Path, contenido: bytes) -> bool:
    """Publicación exclusiva; un reintento nunca sobrescribe una fuente anterior."""
    if destino.exists():
        if destino.is_symlink() or destino.read_bytes() != contenido:
            raise ValueError(f"El archivo privado {destino.name} difiere del contenido esperado.")
        return False
    # Publicar un enlace de una copia terminada evita archivos finales parciales.
    temporal = None
    try:
        with tempfile.NamedTemporaryFile(dir=destino.parent, prefix=".gre-", delete=False) as salida:
            temporal = Path(salida.name)
            salida.write(contenido)
            salida.flush()
            os.fsync(salida.fileno())
        os.link(temporal, destino)
    except FileExistsError:
        if destino.is_symlink() or destino.read_bytes() != contenido:
            raise ValueError("Otro proceso publicó contenido diferente con la misma identidad.")
        return False
    finally:
        if temporal is not None:
            temporal.unlink(missing_ok=True)
    return True


def preparar(carpeta: Path, nombre: str | None, almacenamiento: Path) -> dict:
    contenido, datos = seleccionar(carpeta, nombre)
    almacenamiento.mkdir(parents=True, exist_ok=True)
    if almacenamiento.is_symlink():
        raise ValueError("La carpeta privada no puede ser un enlace simbólico.")
    almacenamiento = almacenamiento.resolve(strict=True)
    reporte = manifiesto(contenido, datos)
    serializado = (json.dumps(reporte, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")
    nuevo = escribir_inmutable(almacenamiento / f"{datos['sha256']}.pdf", contenido)
    nombre_manifiesto = f"{datos['sha256']}.{VERSION_DOCUMENTAL}-pymupdf{pymupdf.VersionBind}.json"
    escribir_inmutable(almacenamiento / nombre_manifiesto, serializado)
    return {"documento": datos, "referenciaPrivada": reporte["referenciaPrivada"],
            "manifiesto": nombre_manifiesto, "copiaNueva": nuevo,
            "estadoCatalogo": "NO_IMPORTADA"}


def main() -> int:
    # Contrato JSON UTF-8 también al redirigir salida desde Windows.
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
    raiz = Path(__file__).resolve().parents[2]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--carpeta", type=Path, default=raiz / "docs/Manuales")
    parser.add_argument("--documento", help="Nombre exacto del candidato, sin ruta.")
    parser.add_argument("--listar", action="store_true", help="Descubrir sin copiar archivos.")
    parser.add_argument("--catalogo", "--indices-guias", dest="catalogo", action="store_true",
                        help="Extraer el catálogo candidato (índices, guías, tablas y texto), sin importar ni activar.")
    parser.add_argument("--almacenamiento", type=Path, default=raiz / "backend/private_uploads/gre")
    parser.add_argument("--versiones", action="store_true",
                        help="Informa versión de parser, normalizador y PyMuPDF del catálogo, sin leer archivos.")
    args = parser.parse_args()
    if sum([args.listar, args.catalogo, args.versiones]) > 1:
        parser.error("--listar, --catalogo y --versiones son modos excluyentes.")
    try:
        if args.versiones:
            from extraer_gre import VERSION_NORMALIZADOR, VERSION_PARSER
            resultado = {"versionParser": VERSION_PARSER, "versionNormalizador": VERSION_NORMALIZADOR,
                         "pymupdf": pymupdf.VersionBind}
        elif args.catalogo:
            from extraer_gre import preparar_catalogo
            resultado = preparar_catalogo(args.carpeta, args.documento, args.almacenamiento)
        else:
            resultado = descubrir(args.carpeta) if args.listar else preparar(
                args.carpeta, args.documento, args.almacenamiento)
        print(json.dumps(resultado, ensure_ascii=False, indent=2))
        return 0
    except (ValueError, OSError, RuntimeError) as error:
        print(json.dumps({"error": str(error)}, ensure_ascii=False), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
