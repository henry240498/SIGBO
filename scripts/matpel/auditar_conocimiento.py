"""Auditoría documental independiente del extractor; nunca valida/activa una edición.

Lee PDF + artefacto existentes, sin SQL/red. Compara las 392 páginas y cada referencia
nativa contra caracteres/cajas del PDF; comprueba relaciones y valores por campo.
Es un cotejo automático de fidelidad textual, NO una revisión visual ni semántica.
No importa extraer_gre/extraer_tablas/reglas_gre para evitar repetir el algoritmo.
"""
from __future__ import annotations

import argparse
from collections import Counter, defaultdict
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import re
import subprocess
import time
import unicodedata

import pymupdf

ROOT = Path(__file__).resolve().parents[2]
PDF = ROOT / "docs/Manuales/GRE2024-Spa-Web-a.pdf"
OUTPUT = ROOT / ".context/gre2024/evidencia"
AUDITOR_SHA256 = hashlib.sha256(Path(__file__).read_bytes()).hexdigest()


def digest(data):
    return hashlib.sha256(data).hexdigest()


def compacto(text):
    # Se conserva cada letra, cifra, signo, acento y mayúscula. U+0007 es el
    # separador de maquetación de la leyenda química; se registra por separado.
    return "".join(c for c in text if not c.isspace() and c != "\x07")


def nombre_normalizado(text):
    """Contrato busqueda-1: conservar guiones, unir su salto editorial y quitar diacríticos.

    Es un campo de búsqueda, no una identidad química. Se coteja además del literal
    y sin llamar al normalizador del extractor, para detectar alteraciones coordinadas.
    """
    joined = re.sub(r"(?<=\S)-\n", "-", text)
    letters = (c for c in unicodedata.normalize("NFD", joined)
               if not unicodedata.combining(c))
    return " ".join("".join(letters).upper().split())


def lineas_nativas(page):
    return [line for block in page.get_text("rawdict")["blocks"] if block["type"] == 0
            for line in block["lines"]]


def caracteres_de(line):
    return [c for span in line["spans"] for c in span["chars"]]


def cotejar_texto(ref, lines):
    """Dos comprobaciones distintas: línea/caja exactas o caracteres en la caja.

    La primera desambigua rótulos superpuestos de dibujos (PDF10). La segunda
    reconstruye agrupaciones multilínea de índices/tablas sin usar el extractor.
    """
    box = ref["cajaPt"]
    expected = compacto(ref["textoOriginal"])
    for line in lines:
        if max(abs(a - b) for a, b in zip(box, line["bbox"])) <= .06:
            if compacto("".join(c["c"] for c in caracteres_de(line))) == expected:
                return "LINEA_Y_CAJA_NATIVAS", None
    x0, y0, x1, y1 = box
    parts = []
    for line in lines:
        lx0, ly0, lx1, ly1 = line["bbox"]
        if lx1 < x0 or lx0 > x1 or ly1 < y0 or ly0 > y1:
            continue
        selected = [c for c in caracteres_de(line)
                    if x0 - .05 <= (c["bbox"][0] + c["bbox"][2]) / 2 <= x1 + .05
                    and y0 - .05 <= (c["bbox"][1] + c["bbox"][3]) / 2 <= y1 + .05]
        if selected:
            parts.append((line["bbox"], line["dir"], "".join(c["c"] for c in selected)))
    rotated = any(abs(part[1][0]) < .1 for part in parts)
    parts.sort(key=lambda p: (round(p[0][0], 1), -p[0][3]) if rotated else
               (round(p[0][1], 1), p[0][0]))
    actual = "".join(p[2] for p in parts)
    if compacto(actual) == expected:
        return "CARACTERES_NATIVOS_EN_CAJA", None
    return "DIFERENCIA_NATIVA", {"esperado": ref["textoOriginal"], "obtenido": actual}


def fuentes_de(value):
    if isinstance(value, dict):
        for key, content in value.items():
            if key == "fuentes":
                if isinstance(content, list):
                    yield from content
                elif isinstance(content, dict):
                    for ids in content.values():
                        yield from ids
            else:
                yield from fuentes_de(content)
    elif isinstance(value, list):
        for item in value:
            yield from fuentes_de(item)


def auditar(pdf_path, artifact_path):
    started=time.perf_counter()
    pdf_bytes, artifact_bytes = pdf_path.read_bytes(), artifact_path.read_bytes()
    catalog = json.loads(artifact_bytes)
    sha = digest(pdf_bytes)
    findings, refs_result, pages_result, coverage = [], [], [], []
    page_layout = {}
    def issue(code, **detail):
        findings.append({"codigo": code, **detail})
    if catalog["documento"]["sha256"] != sha:
        issue("DOCUMENTO_SHA_DIFERENTE")
    refs = {r["id"]: r for r in catalog["referencias"]}
    if len(refs) != len(catalog["referencias"]):
        issue("REFERENCIAS_ID_DUPLICADO")
    for ref_id in set(fuentes_de(catalog)) - refs.keys():
        issue("REFERENCIA_INEXISTENTE", referenciaId=ref_id)
    by_page = defaultdict(list)
    for ref in catalog["referencias"]:
        by_page[ref["paginaPdf"]].append(ref)
    pages = {p["paginaPdf"]: p for p in catalog["paginas"]}
    with pymupdf.open(stream=pdf_bytes, filetype="pdf") as document:
        if len(document) != catalog["documento"]["paginas"] or len(pages) != len(document):
            issue("PAGINAS_DIFERENTES")
        for number in set(by_page) - set(range(1, len(document) + 1)):
            issue("REFERENCIA_PAGINA_INEXISTENTE", paginaPdf=number)
        for page in document:
            number = page.number + 1
            text = page.get_text()
            source = pages.get(number, {})
            equal_hash = source.get("sha256TextoNativo") == digest(text.encode("utf-8"))
            if not equal_hash:
                issue("PAGINA_TEXTO_DIFERENTE", paginaPdf=number)
            sections = [s for s in catalog["secciones"] if s["pdfDesde"] <= number <= s["pdfHasta"]]
            if len(sections) != 1:
                issue("PAGINA_SECCION_NO_UNICA", paginaPdf=number)
            lines = lineas_nativas(page)
            drawings = page.get_drawings()
            green = [(list(item[1]), list(path["fill"])) for path in drawings
                     if path.get("fill") and len(path["fill"]) == 3
                     and path["fill"][1] > path["fill"][0] + .1
                     and path["fill"][1] > path["fill"][2] + .1
                     for item in path["items"] if item[0] == "re"]
            page_layout[number] = {
                "centers":[pymupdf.Point((w[0]+w[2])/2,(w[1]+w[3])/2) for w in page.get_text("words")],
                "greenRects":[pymupdf.Rect(rect) for rect,_ in green]}
            for ref in by_page[number]:
                result = {"id": ref["id"], "paginaPdf": number,
                          "interpretacionOperativa": "PENDIENTE",
                          "estadoRevisionCatalogo": ref["estadoRevision"]}
                box = pymupdf.Rect(ref["cajaPt"])
                if ref["documentoSha256"] != sha or not page.rect.contains(box) or box.is_empty:
                    result["cotejo"] = "IDENTIDAD_O_CAJA_INVALIDA"
                    issue("REFERENCIA_IDENTIDAD_O_CAJA", referenciaId=ref["id"])
                elif ref["metodo"] == "NATIVO":
                    method, detail = cotejar_texto(ref, lines)
                    result["cotejo"] = method
                    if detail:
                        issue("REFERENCIA_TEXTO_DIFERENTE", referenciaId=ref["id"], paginaPdf=number, **detail)
                elif ref["tecnica"] == "RELLENO_VECTORIAL_RECTANGULO":
                    match = any(max(abs(a-b) for a,b in zip(ref["cajaPt"], rect)) <= .06
                                and max(abs(a-b) for a,b in zip(ref["rgb"], rgb)) <= .00001
                                for rect,rgb in green)
                    result["cotejo"] = "RECTANGULO_RGB_COTEJADO" if match else "RECTANGULO_NO_ENCONTRADO"
                    if not match:
                        issue("RECTANGULO_NO_ENCONTRADO", referenciaId=ref["id"])
                else:
                    # Ausencia de verde y separadores requieren comprobaciones semánticas
                    # adicionales; una caja válida no prueba esos significados.
                    result["cotejo"] = "CAJA_VALIDA_SIGNIFICADO_GEOMETRICO_PENDIENTE"
                refs_result.append(result)
            pages_result.append({"id": f"GRE24-PDF-{number:04d}", "paginaPdf": number,
                                 "etiquetaPdf": page.get_label(),
                                 "etiquetasImpresas": source.get("etiquetasImpresas", []),
                                 "seccionId": sections[0]["id"] if len(sections)==1 else None,
                                 "sha256TextoNativo": digest(text.encode("utf-8")),
                                 "textoCatalogoCoincide": equal_hash,
                                 "imagenesRaster": len(page.get_images()), "trazosVectoriales": len(drawings),
                                 "cotejoVisual": "PENDIENTE", "estudioOperativo": "PENDIENTE"})
    entries = {e["id"]: e for e in catalog["entradas"]}
    relations = {e["id"]: e for e in catalog["relacionesIndices"]}
    guides = {g["numero"]: g for g in catalog["guias"]}
    def source_text(ids):
        return "".join(compacto(refs[r]["textoOriginal"]) for r in ids if r in refs)
    for entry in entries.values():
        if entry["nombreNormalizado"] != nombre_normalizado(entry["nombreOriginal"]):
            issue("INDICE_NOMBRE_NORMALIZADO_DISCREPANTE", entradaId=entry["id"])
        for field,original in (("identificador","identificadorOriginal"),
                               ("guia","guiaOriginal"),("nombre","nombreOriginal")):
            if compacto(entry[original]) != source_text(entry["fuentes"][field]):
                issue("INDICE_CAMPO_CONTRADICE_FUENTE",entradaId=entry["id"],campo=field)
        if entry["polimerizable"] != entry["guiaOriginal"].endswith("P"):
            issue("INDICE_P_CONTRADICE_GUIA",entradaId=entry["id"])
        if entry["guiaNumero"] != entry["guiaOriginal"][:3]:
            issue("INDICE_NUMERO_CONTRADICE_GUIA",entradaId=entry["id"])
        expected_id=entry["identificadorOriginal"] if entry["identificadorOriginal"].isdigit() else None
        if entry["identificador"] != expected_id:
            issue("INDICE_ID_CONTRADICE_ORIGINAL",entradaId=entry["id"])
        layout=page_layout.get(entry["paginaPdf"])
        if layout:
            boxes=[pymupdf.Rect(refs[r]["cajaPt"]) for field in ("identificador","guia","nombre")
                   for r in entry["fuentes"][field] if r in refs]
            selected=[p for p in layout["centers"] if any(box.contains(p) for box in boxes)]
            flags=[any(rect.contains(p) for rect in layout["greenRects"]) for p in selected]
            expected_green=all(flags) if flags and len(set(flags))==1 else None
            if entry["resaltadoVerde"] != expected_green:
                issue("INDICE_VERDE_CONTRADICE_FONDO",entradaId=entry["id"])
    for rel in relations.values():
        for side in ("amarilloIds", "azulIds"):
            if not rel[side]:
                issue("RELACION_SIN_INDICE", entradaId=rel["id"], lado=side)
            for entry_id in rel[side]:
                if entry_id not in entries:
                    issue("ENTRADA_INEXISTENTE", entradaId=entry_id)
                    continue
                for field in ("identificador", "nombreNormalizado", "guiaNumero", "polimerizable", "resaltadoVerde"):
                    if entries[entry_id][field] != rel[field]:
                        issue("INDICES_DISCREPANTES", entradaId=entry_id, campo=field)
        if rel["guiaNumero"] not in guides:
            issue("GUIA_INEXISTENTE", entradaId=rel["id"])
        elif guides[rel["guiaNumero"]]["estadoContenido"] == "INTENCIONALMENTE_VACIA":
            issue("ENTRADA_A_GUIA_VACIA", entradaId=rel["id"])
    refs_index = {r["id"]:r for r in refs_result}
    def item(kind, identifier, source_ids, **extra):
        selected = [refs_index.get(r,{"cotejo":"INEXISTENTE"})["cotejo"] for r in source_ids]
        coverage.append({"tipo":kind,"id":identifier,"fuentes":sorted(set(source_ids)),
                         "cotejos":dict(Counter(selected)),"validacionOperativa":"PENDIENTE",**extra})
    for section in catalog["secciones"]:
        item("SECCION",section["id"], [], titulo=section["tituloOriginal"],
             pdfDesde=section["pdfDesde"],pdfHasta=section["pdfHasta"],estadoExtraccion=section["estadoExtraccion"])
    for rel in relations.values():
        item("ENTRADA_CONCILIADA",rel["id"],list(fuentes_de([entries[x] for x in rel["amarilloIds"]+rel["azulIds"]])),
             identificador=rel["identificador"],guiaNumero=rel["guiaNumero"])
    for guide in guides.values():
        item("GUIA",f"GRE24-GUIA-{guide['numero']}",list(fuentes_de(guide)),paginasPdf=guide["paginasPdf"],
             numero=guide["numero"],estadoContenido=guide["estadoContenido"])
        for block in guide["bloques"]:
            item("BLOQUE_GUIA",block["id"],block["fuentes"],guiaNumero=guide["numero"],
                 encabezado=block["encabezadoOriginal"])
    for table in catalog["tablas"]:
        columns={column["codigo"]:column for column in table["estructura"]["columnas"]}
        item("TABLA",table["codigo"],list(fuentes_de(table)),filas=len(table["filas"]))
        for n,note in enumerate(table["notas"],1):
            item("NOTA_TABLA",f"GRE24-{table['codigo']}-NOTA-{n:03d}",note["fuentes"])
        for row in table["filas"]:
            item("FILA_TABLA",row["id"],list(fuentes_de(row)),tabla=table["codigo"],paginaPdf=row["paginaPdf"])
            if "nombreOriginal" in row and row.get("nombreNormalizado") != nombre_normalizado(row["nombreOriginal"]):
                issue("FILA_NOMBRE_NORMALIZADO_DISCREPANTE", filaId=row["id"])
            if "guiaOriginal" in row:
                if row.get("guiaNumero") != row["guiaOriginal"][:3]:
                    issue("FILA_NUMERO_CONTRADICE_GUIA", filaId=row["id"])
                if row.get("polimerizable") != row["guiaOriginal"].endswith("P"):
                    issue("FILA_P_CONTRADICE_GUIA", filaId=row["id"])
            if "contenedorOriginal" in row and row.get("contenedorNormalizado") != nombre_normalizado(row["contenedorOriginal"]):
                issue("FILA_CONTENEDOR_NORMALIZADO_DISCREPANTE", filaId=row["id"])
            for field,original in (("identificador","identificador"),("guia","guiaOriginal"),
                                   ("nombre","nombreOriginal"),("contenedor","contenedorOriginal")):
                if field in row["fuentes"] and compacto(row[original]) != source_text(row["fuentes"][field]):
                    issue("FILA_CAMPO_CONTRADICE_FUENTE",filaId=row["id"],campo=field)
            if row.get("entradaId") and row["entradaId"] not in relations:
                issue("FILA_ENTRADA_INEXISTENTE",filaId=row["id"])
            for cell in row["celdas"]:
                item("CELDA_TABLA",f"{row['id']}:{cell['columna']}",cell["fuentes"],estadoDato=cell["estadoDato"],
                     unidad=cell["unidad"],modificador=cell["modificador"])
                if compacto(cell["textoOriginal"]) != source_text(cell["fuentes"]):
                    issue("CELDA_TEXTO_CONTRADICE_FUENTE",filaId=row["id"],columna=cell["columna"])
                if cell["estadoDato"]=="DATO" and cell["unidad"] != columns.get(cell["columna"],{}).get("unidad"):
                    issue("CELDA_UNIDAD_CONTRADICE_COLUMNA",filaId=row["id"],columna=cell["columna"])
                if cell["estadoDato"]=="DATO" and cell["valorDecimal"] is not None:
                    # Valores impresos métricos/imperiales redondeados se conservan:
                    # no se pretende equivalencia exacta entre ambos sistemas.
                    match=re.fullmatch(r"\(?\s*(\d+(?:\.\d+)?)(\+)?\s*(m|km|pies|mi)?\s*\)?",cell["textoOriginal"])
                    if not match or match.group(1)!=cell["valorDecimal"] or (match.group(2) or None)!=cell["modificador"]:
                        issue("CELDA_VALOR_DISCREPANTE",filaId=row["id"],columna=cell["columna"])
                    if match and match.group(3) and match.group(3)!=cell["unidad"]:
                        issue("CELDA_UNIDAD_CONTRADICE_TEXTO",filaId=row["id"],columna=cell["columna"])
    for rule in catalog["reglas"]:
        item("REGLA_EXTRAIDA",rule["codigo"],rule["fuentes"],paginaPdf=rule["paginaPdf"],
             tipoUso=rule["tipoUso"],marcadaEjecutable=rule["ejecutable"],motorOperativoImplementado=False)
    return {"schemaVersion":1,"fechaUtc":datetime.now(timezone.utc).isoformat(),
            "tipo":"AUDITORIA_DOCUMENTAL_AUTOMATICA_NO_ACTIVADORA","fuente":{"ruta":pdf_path.relative_to(ROOT).as_posix(),
            "sha256":sha,"bytes":len(pdf_bytes)},"artefacto":{"nombre":artifact_path.name,"sha256":digest(artifact_bytes),
            "bytes":len(artifact_bytes),"aptoActivacion":catalog["aptoActivacion"]},
            "herramienta":{"auditorSha256":AUDITOR_SHA256,"pymupdf":pymupdf.VersionBind},
            "duracionSegundos":round(time.perf_counter()-started,3),
            "resumen":{"paginas":len(pages_result),"referencias":len(refs_result),
            "cotejos":dict(Counter(r["cotejo"] for r in refs_result)),"inventario":dict(Counter(r["tipo"] for r in coverage)),
            "discrepancias":len(findings),"dominioIntegralDemostrado":False},
            "paginas":pages_result,"referencias":refs_result,"cobertura":coverage,"discrepancias":findings,
            "limites":["No coteja visualmente las 392 páginas ni certifica toda la semántica.",
            "No inventaría automáticamente cada regla implícita en texto/figuras.",
            "No cambia estados de revisión en el artefacto ni en SQL.",
            "Comparar texto nativo/maquetación usa PyMuPDF; no es OCR independiente.",
            "No acredita autoridad institucional ni valida el motor/SCI."]}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--artefacto",type=Path)
    parser.add_argument("--salida",type=Path,default=OUTPUT)
    args=parser.parse_args()
    artifacts=sorted((ROOT/"backend/private_uploads/gre").glob("*catalogo-1*.json"))
    if args.artefacto is None and len(artifacts)!=1:
        parser.error("Seleccione un único artefacto existente mediante --artefacto.")
    artifact=args.artefacto or artifacts[0]
    report=auditar(PDF,artifact)
    report["revisionGit"]=subprocess.check_output(["git","rev-parse","HEAD"],cwd=ROOT,text=True).strip()
    args.salida.mkdir(parents=True,exist_ok=True)
    (args.salida/"auditoria-documental.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print(json.dumps(report["resumen"],ensure_ascii=False))
    return int(bool(report["discrepancias"]))


if __name__=="__main__":
    raise SystemExit(main())
