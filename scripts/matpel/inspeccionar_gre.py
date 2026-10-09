"""Inventario documental de fase 1. No importa datos ni toma decisiones MATPEL.

Dependencia: PyMuPDF. Ejemplo desde la raíz:
python scripts/matpel/inspeccionar_gre.py --salida docs/matpel/evidencia/fase1
La selección es explícita si hay varios archivos. No realiza OCR ni accede a red/DB.
"""

from __future__ import annotations

import argparse
from collections import Counter
import hashlib
import json
from pathlib import Path
import re
import unicodedata

import pymupdf


def normalizar(texto: str) -> str:
    return " ".join(
        "".join(c for c in unicodedata.normalize("NFD", texto) if not unicodedata.combining(c))
        .upper().split()
    )


def detectar(carpeta: Path, elegido: Path | None) -> Path:
    archivos = sorted(p.resolve() for p in carpeta.iterdir() if p.is_file())
    if elegido is not None:
        elegido = elegido.resolve()
        if elegido not in archivos:
            raise ValueError("El documento seleccionado debe estar dentro de la carpeta de manuales.")
        return elegido
    if len(archivos) != 1:
        raise ValueError(f"Hay {len(archivos)} archivos. Seleccione uno mediante --documento.")
    return archivos[0]


def tratamiento(titulo: str) -> str:
    t = normalizar(titulo)
    if t.startswith("INDICE DE"):
        return "indices_y_reglas_de_uso"
    if t.startswith("GUIAS (SECCION"):
        return "guias_estructuradas_completas"
    if "BLEVE - PRECAUCIONES" in t or "ARTEFACTOS EXPLOSIVOS IMPROVISADOS" in t or "USO CRIMINAL O TERRORISTA" in t:
        return "anexo_texto_tablas_especiales_y_advertencias"
    if "FACTORES A CONSIDERAR" in t or "IDENTIFICACION DE PELIGROS FIJADOS" in t:
        return "texto_y_tablas_cualitativas_con_fuente"
    if "TABLA" in t and any(n in t for n in ["TABLA 1", "TABLA 2", "TABLA 3"]):
        return "tablas_y_condiciones_con_fuente"
    if any(n in t for n in ["IDENTIFICACION PARA", "CARTELES/PLACAS", "GLOBALMENTE ARMONIZADO"]):
        return "figuras_y_texto_navegables_con_referencias"
    if any(n in t for n in ["COMO USAR", "PRECAUCIONES", "PROTECCION", "GUIA DEL USUARIO", "INTRODUCCION A LAS TABLAS"]):
        return "reglas_condiciones_y_advertencias_con_fuente"
    return "texto_integro_y_fuente_navegable"


def inspeccionar(archivo: Path) -> dict:
    with pymupdf.open(archivo) as doc:
        if not doc.is_pdf or doc.needs_pass or not len(doc):
            raise ValueError("Se requiere un PDF legible y no cifrado.")
        identidad = normalizar((doc.metadata.get("title") or "") + " " + doc[0].get_text())
        if "GUIA DE RESPUESTA" not in identidad or "EMERGENCIA" not in identidad:
            raise ValueError("El contenido de portada/metadatos no identifica una GRE.")
        ediciones = sorted(set(re.findall(r"\b20\d{2}\b", identidad)))
        marcadores = doc.get_toc()
        # Rangos documentales: marcadores reales; portada y contraportada separadas.
        inicios = [(1, "PORTADA")]
        inicios += [(pagina, titulo.strip()) for nivel, titulo, pagina in marcadores if nivel == 1]
        texto_final = normalizar(doc[-1].get_text())
        if "NO PARA LA VENTA" in texto_final:
            inicios.append((len(doc), "CONTRAPORTADA"))
        inicios = sorted(set(inicios))
        secciones = []
        for i, (inicio, titulo) in enumerate(inicios):
            fin = inicios[i + 1][0] - 1 if i + 1 < len(inicios) else len(doc)
            secciones.append({"titulo": titulo, "pdf_desde": inicio, "pdf_hasta": fin,
                              "tratamiento_previsto": tratamiento(titulo)})
        paginas = []
        guias: dict[str, list[int]] = {}
        guias_sin_materiales = set()
        for indice, pg in enumerate(doc):
            numero = indice + 1
            texto = pg.get_text()
            palabras = pg.get_text("words")
            dibujos = pg.get_drawings()
            seccion = next(s for s in secciones if s["pdf_desde"] <= numero <= s["pdf_hasta"])
            numeros_impresos = sorted(set(re.findall(r"P[aá]gina\s+(\d+)", texto)))
            colores = Counter(
                tuple(round(v, 3) for v in d["fill"])
                for d in dibujos if d.get("fill") is not None
            )
            verdes = [d for d in dibujos if d.get("fill") is not None
                      and len(d["fill"]) == 3 and d["fill"][1] > d["fill"][0] + .1
                      and d["fill"][1] > d["fill"][2] + .1]
            # Un candidato verde es geométrico. No se convierte en bandera de un material.
            es_guia = seccion["tratamiento_previsto"] == "guias_estructuradas_completas"
            numeros_guia = sorted(set(re.findall(r"GU[IÍ]A\s*\n\s*(\d{3})\b", texto))) if es_guia else []
            for g in numeros_guia:
                guias.setdefault(g, []).append(numero)
                if "NO HAY MATERIALES QUE HAGAN REFERENCIA A ESTA GUIA" in normalizar(texto):
                    guias_sin_materiales.add(g)
            controles = Counter(f"U+{ord(c):04X}" for c in texto if ord(c) < 32 and c not in "\t\r\n")
            alertas = []
            if not texto.strip():
                alertas.append("sin_texto_nativo")
            if "\ufffd" in texto:
                alertas.append("caracter_de_reemplazo")
            if len(numeros_impresos) > 1:
                alertas.append("numeracion_impresa_multiple")
            if es_guia and len(numeros_guia) != 1:
                alertas.append("cabecera_guia_no_univoca")
            nota = bool(re.fullmatch(r"(?:GRE\d{4} )?NOTAS PAGINA \d+", normalizar(texto)))
            if len(texto.strip()) < 80 and not nota:
                alertas.append("poco_texto_revisar_visualmente")
            paginas.append({
                "pagina_pdf": numero, "pagina_impresa": numeros_impresos,
                "seccion": seccion["titulo"], "tratamiento_previsto": seccion["tratamiento_previsto"],
                "ancho_pt": round(pg.rect.width, 2), "alto_pt": round(pg.rect.height, 2),
                "rotacion": pg.rotation, "caracteres_texto": len(texto), "palabras": len(palabras),
                "sha256_texto_nativo": hashlib.sha256(texto.encode("utf-8")).hexdigest(),
                "imagenes_referenciadas": len(pg.get_images()), "dibujos_vectoriales": len(dibujos),
                "rellenos": [{"rgb": list(k), "cantidad": v} for k, v in sorted(colores.items())],
                "regiones_verdes_candidatas": len(verdes),
                "candidatos_id_4_digitos": len(re.findall(r"(?m)^\s*\d{4}\s*$", texto)),
                "guias_en_cabecera": numeros_guia, "hoja_notas": nota,
                "caracteres_control": dict(controles), "alertas": alertas,
            })
        cubiertas = [n for s in secciones for n in range(s["pdf_desde"], s["pdf_hasta"] + 1)]
        if cubiertas != list(range(1, len(doc) + 1)):
            raise ValueError("La clasificación documental no cubre todas las páginas exactamente una vez.")
        return {
            "tipo_informe": "diagnostico_documental_no_importacion", "schema_version": 1,
            "archivo": archivo.name, "bytes": archivo.stat().st_size,
            "sha256": hashlib.sha256(archivo.read_bytes()).hexdigest(),
            "metadata": doc.metadata, "ediciones_en_portada_metadata": ediciones,
            "herramienta": {"nombre": "PyMuPDF", "version": pymupdf.VersionBind},
            "resumen": {
                "paginas": len(doc), "paginas_con_texto": sum(p["caracteres_texto"] > 0 for p in paginas),
                "paginas_notas": [p["pagina_pdf"] for p in paginas if p["hoja_notas"]],
                "paginas_con_alertas": [p["pagina_pdf"] for p in paginas if p["alertas"]],
                "paginas_con_imagenes": sum(p["imagenes_referenciadas"] > 0 for p in paginas),
                "paginas_con_dibujos": sum(p["dibujos_vectoriales"] > 0 for p in paginas),
                "paginas_con_regiones_verdes_candidatas": sum(p["regiones_verdes_candidatas"] > 0 for p in paginas),
                "caracteres_nativos": sum(p["caracteres_texto"] for p in paginas),
                "guias_con_cabecera_identificada": len(guias),
                "guias_sin_materiales_segun_texto": sorted(guias_sin_materiales),
                "guias_con_contenido": len(set(guias) - guias_sin_materiales),
                "cobertura_secciones": len(secciones), "ocr_ejecutado": False,
            },
            "guias_paginas": guias, "secciones": secciones, "paginas": paginas,
            "limites": [
                "No es un importador operacional ni valida valores de las tablas.",
                "La presencia de texto no acredita el orden de lectura ni integridad semántica.",
                "Los candidatos numéricos/verdes no equivalen a materiales o filas validadas.",
                "La numeración impresa se extrae del texto; no se presupone un desplazamiento global.",
                "La cobertura documental requiere revisión humana de reglas y muestras visuales.",
            ],
        }


def mapa_markdown(informe: dict) -> str:
    filas = ["# Mapa documental GRE — inventario de fase 1", "",
             f"Documento: `{informe['archivo']}`. SHA-256: `{informe['sha256']}`.", "",
             "Rangos del archivo PDF, contados desde 1. Se derivan de marcadores y portada/contraportada;",
             "pueden incluir instrucciones antes de las primeras filas. No son registros importados.", "",
             "| PDF desde | PDF hasta | Sección | Tratamiento previsto |", "|---:|---:|---|---|"]
    for s in informe["secciones"]:
        filas.append(f"| {s['pdf_desde']} | {s['pdf_hasta']} | {s['titulo'].replace('|', '/')} | {s['tratamiento_previsto']} |")
    filas += ["", "La evidencia por página y los indicadores de extracción se conservan en `inventario-gre.json`.", ""]
    return "\n".join(filas)


def renderizar(archivo: Path, salida: Path, seleccion: list[int]) -> None:
    # Solo representaciones del documento real para revisión visual.
    with pymupdf.open(archivo) as doc:
        for numero in seleccion:
            if not 1 <= numero <= len(doc):
                raise ValueError(f"Página fuera del documento: {numero}")
            doc[numero - 1].get_pixmap(matrix=pymupdf.Matrix(1.5, 1.5), alpha=False).save(
                salida / f"pagina-pdf-{numero:03d}.png")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manuales", type=Path, default=Path("docs/Manuales"))
    parser.add_argument("--documento", type=Path)
    parser.add_argument("--salida", type=Path, required=True)
    parser.add_argument("--renderizar", type=int, nargs="*", default=[])
    args = parser.parse_args()
    archivo = detectar(args.manuales, args.documento)
    informe = inspeccionar(archivo)
    args.salida.mkdir(parents=True, exist_ok=True)
    (args.salida / "inventario-gre.json").write_text(json.dumps(informe, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (args.salida / "mapa-documental.md").write_text(mapa_markdown(informe), encoding="utf-8")
    renderizar(archivo, args.salida, args.renderizar)
    print(json.dumps({"documento": informe["archivo"], "sha256": informe["sha256"], **informe["resumen"]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
