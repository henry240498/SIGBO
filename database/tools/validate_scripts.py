#!/usr/bin/env python3
"""
Validador estatico de los scripts SQL de SIGBO-CBVC.

Verifica, SIN necesidad de un servidor SQL Server:
  1. Sintaxis T-SQL de cada lote (batch separado por GO), via sqlglot.
  2. Catalogo de tablas/columnas construido desde 04_create_tables.sql.
  3. Que toda FOREIGN KEY de 06 referencie tabla y columna existentes,
     en ambos extremos.
  4. Que todo indice de 07 referencie tabla y columnas existentes.
  5. Que todo INSERT/UPDATE de 12 y 13 referencie tabla y columnas existentes.
  6. Que todo esquema usado exista en 02_create_schemas.sql.
  7. Nombres de constraint duplicados (SQL Server los exige unicos por BD).
  8. Ciclos de FK que SQL Server rechazaria por multiples rutas de cascada.
"""
import re, sys, os, collections

try:
    import sqlglot
    from sqlglot.errors import ParseError
    HAVE_SQLGLOT = True
except ImportError:
    HAVE_SQLGLOT = False

SCRIPTS = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "scripts")

errors, warnings, info = [], [], []


def err(m):
    errors.append(m)


def warn(m):
    warnings.append(m)


def strip_comments(sql):
    sql = re.sub(r"/\*.*?\*/", " ", sql, flags=re.S)
    sql = re.sub(r"--[^\n]*", " ", sql)
    return sql


def read(name):
    with open(os.path.join(SCRIPTS, name), encoding="utf-8") as f:
        return f.read()


def batches(sql):
    """Divide en lotes por GO en linea propia."""
    out, cur = [], []
    for line in sql.splitlines():
        if re.match(r"^\s*GO\s*(--.*)?$", line, re.I):
            out.append("\n".join(cur))
            cur = []
        else:
            cur.append(line)
    out.append("\n".join(cur))
    return [b for b in out if b.strip()]


# ---------------------------------------------------------------- 1. catalogo
catalog = {}        # "schema.tabla" -> set(columnas)
col_order = {}      # "schema.tabla" -> [columnas]
pk_of = {}          # "schema.tabla" -> [columnas pk]
constraint_names = collections.Counter()

tables_sql = strip_comments(read("04_create_tables.sql"))

TYPE_WORDS = (
    "UNIQUEIDENTIFIER|NVARCHAR|VARCHAR|NCHAR|CHAR|BIGINT|INT|SMALLINT|TINYINT|BIT|"
    "DECIMAL|NUMERIC|FLOAT|REAL|MONEY|DATETIMEOFFSET|DATETIME2|DATETIME|DATE|TIME|"
    "VARBINARY|BINARY|XML|SQL_VARIANT|GEOGRAPHY|GEOMETRY"
)

for m in re.finditer(
    r"CREATE\s+TABLE\s+(\[?\w+\]?)\.(\[?\w+\]?)\s*\((.*?)\n\s*\)\s*;",
    tables_sql, re.S | re.I
):
    schema, table, body = m.group(1).strip("[]"), m.group(2).strip("[]"), m.group(3)
    key = f"{schema}.{table}"
    cols, pks = [], []

    # separa por comas de nivel superior
    depth, cur, parts = 0, [], []
    for ch in body:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append("".join(cur)); cur = []
        else:
            cur.append(ch)
    parts.append("".join(cur))

    for p in parts:
        p = p.strip()
        if not p:
            continue
        up = p.upper()
        if up.startswith(("CONSTRAINT", "PRIMARY KEY", "UNIQUE", "CHECK", "FOREIGN KEY")):
            cm = re.match(r"CONSTRAINT\s+(\w+)\s+(.*)", p, re.I | re.S)
            if cm:
                constraint_names[cm.group(1)] += 1
                if cm.group(2).upper().lstrip().startswith("PRIMARY KEY"):
                    inner = re.search(r"\((.*?)\)", cm.group(2), re.S)
                    if inner:
                        pks = [c.strip().strip("[]") for c in inner.group(1).split(",")]
            continue
        cm = re.match(r"(\[?\w+\]?)\s+(.*)", p, re.S)
        if not cm:
            continue
        colname = cm.group(1).strip("[]")
        rest = cm.group(2)
        # columna real (tipo) o columna calculada (AS ...)
        if re.match(r"(" + TYPE_WORDS + r")\b", rest, re.I) or re.match(r"AS\s", rest, re.I):
            cols.append(colname)
            if re.search(r"\bPRIMARY\s+KEY\b", rest, re.I):
                pks.append(colname)
        else:
            warn(f"04: columna no reconocida en {key}: {p[:60]!r}")
        for c in re.finditer(r"CONSTRAINT\s+(\w+)", p, re.I):
            constraint_names[c.group(1)] += 1

    catalog[key] = set(cols)
    col_order[key] = cols
    pk_of[key] = pks

info.append(f"tablas parseadas en 04: {len(catalog)}")
info.append(f"columnas totales parseadas: {sum(len(v) for v in catalog.values())}")

# ---------------------------------------------------------------- 2. esquemas
schemas_declared = set(
    m.group(1) for m in re.finditer(
        r"SCHEMA_ID\(N'(\w+)'\)", strip_comments(read("02_create_schemas.sql")), re.I)
)
info.append(f"esquemas declarados en 02: {len(schemas_declared)}")

for key in catalog:
    s = key.split(".")[0]
    if s not in schemas_declared:
        err(f"04: tabla {key} usa un esquema no creado en 02_create_schemas.sql")

for key in catalog:
    if not pk_of[key]:
        err(f"04: tabla {key} sin PRIMARY KEY detectada")

# ---------------------------------------------------------------- 3. FK en 06
fk_sql = strip_comments(read("06_create_constraints.sql"))
fk_count = 0
fk_edges = []
for m in re.finditer(
    r"ALTER\s+TABLE\s+(\w+)\.(\w+)\s+ADD\s+CONSTRAINT\s+(\w+)\s+FOREIGN\s+KEY\s*\((.*?)\)\s*"
    r"REFERENCES\s+(\w+)\.(\w+)\s*\((.*?)\)([^;]*);",
    fk_sql, re.S | re.I
):
    fk_count += 1
    src = f"{m.group(1)}.{m.group(2)}"
    cname = m.group(3)
    scols = [c.strip().strip("[]") for c in m.group(4).split(",")]
    dst = f"{m.group(5)}.{m.group(6)}"
    dcols = [c.strip().strip("[]") for c in m.group(7).split(",")]
    tail = m.group(8).upper()
    constraint_names[cname] += 1

    if src not in catalog:
        err(f"06: FK {cname}: tabla origen inexistente {src}")
    else:
        for c in scols:
            if c not in catalog[src]:
                err(f"06: FK {cname}: columna origen inexistente {src}.{c}")
    if dst not in catalog:
        err(f"06: FK {cname}: tabla destino inexistente {dst}")
    else:
        for c in dcols:
            if c not in catalog[dst]:
                err(f"06: FK {cname}: columna destino inexistente {dst}.{c}")
            elif c not in pk_of.get(dst, []):
                warn(f"06: FK {cname} referencia {dst}.{c}, que no es PK "
                     f"(requiere indice UNIQUE en destino)")
    if len(scols) != len(dcols):
        err(f"06: FK {cname}: aridad distinta origen/destino")

    cascade = "CASCADE" in tail or "SET NULL" in tail or "SET DEFAULT" in tail
    fk_edges.append((src, dst, cname, cascade, scols))

info.append(f"FOREIGN KEY parseadas en 06: {fk_count}")

# --- FK con accion referencial: SQL Server prohibe multiples rutas de cascada
casc = collections.defaultdict(list)
for src, dst, cname, cascade, scols in fk_edges:
    if cascade:
        casc[(src, dst)].append(cname)
for (src, dst), names in casc.items():
    if len(names) > 1:
        err(f"06: {len(names)} FK con accion referencial entre {src} y {dst} "
            f"({', '.join(names)}) — SQL Server rechaza multiples rutas de cascada")

# --- autorreferencias con CASCADE (SQL Server las prohibe)
for src, dst, cname, cascade, scols in fk_edges:
    if src == dst and cascade:
        err(f"06: FK {cname} es autorreferencial CON accion referencial en {src} "
            f"— SQL Server no lo permite")

# ---------------------------------------------------------------- 4. indices 07
idx_sql = strip_comments(read("07_create_indexes.sql"))
idx_count = 0
idx_names = collections.Counter()
for m in re.finditer(
    r"CREATE\s+(?:UNIQUE\s+)?(?:NONCLUSTERED\s+|CLUSTERED\s+)?INDEX\s+(\w+)\s+ON\s+"
    r"(\w+)\.(\w+)\s*\((.*?)\)([^;]*);",
    idx_sql, re.S | re.I
):
    idx_count += 1
    iname, tbl = m.group(1), f"{m.group(2)}.{m.group(3)}"
    idx_names[(tbl, iname)] += 1
    cols = [re.sub(r"\s+(ASC|DESC)$", "", c.strip(), flags=re.I).strip("[]")
            for c in m.group(4).split(",")]
    incl = m.group(5)
    if tbl not in catalog:
        err(f"07: indice {iname}: tabla inexistente {tbl}")
        continue
    for c in cols:
        if c not in catalog[tbl]:
            err(f"07: indice {iname}: columna inexistente {tbl}.{c}")
    im = re.search(r"INCLUDE\s*\((.*?)\)", incl, re.S | re.I)
    if im:
        for c in [x.strip().strip("[]") for x in im.group(1).split(",")]:
            if c not in catalog[tbl]:
                err(f"07: indice {iname} INCLUDE: columna inexistente {tbl}.{c}")
    # filtro WHERE
    wm = re.search(r"WHERE\s+(.*)$", incl, re.S | re.I)
    if wm:
        for c in set(re.findall(r"\b([a-z_][a-z0-9_]*)\b", wm.group(1), re.I)):
            if c.upper() in ("AND", "OR", "IS", "NOT", "NULL", "N", "IN", "WHERE"):
                continue
            if c in catalog[tbl]:
                continue
            if re.match(r"^\d", c):
                continue
            warn(f"07: indice {iname} filtro WHERE menciona {c!r}, "
                 f"que no es columna de {tbl} (puede ser literal)")

for (tbl, iname), n in idx_names.items():
    if n > 1:
        err(f"07: indice {iname} declarado {n} veces sobre {tbl}")
info.append(f"indices parseados en 07: {idx_count}")

# --------------------------------------------- 4b. valores CHECK IN (...) por columna
check_allowed = {}   # ("schema.tabla", "columna") -> set(valores permitidos)
for m in re.finditer(
    r"CREATE\s+TABLE\s+(\w+)\.(\w+)\s*\((.*?)\n\s*\)\s*;", tables_sql, re.S | re.I
):
    key = f"{m.group(1)}.{m.group(2)}"
    for cm in re.finditer(
        r"CHECK\s*\(\s*(\w+)\s+IN\s*\((.*?)\)\s*\)", m.group(3), re.S | re.I
    ):
        col = cm.group(1)
        vals = set(v.strip().strip("N").strip("'") for v in cm.group(2).split(","))
        check_allowed[(key, col)] = vals
info.append(f"columnas con CHECK IN(...) detectadas: {len(check_allowed)}")

# ---------------------------------------------------------------- 5. INSERTs 12/13
for fname in ("12_insert_master_data.sql", "13_insert_initial_data.sql",
              "15_bootstrap_local.sql", "16_insert_test_data.sql",
              "17_rollback_local_data.sql"):
    if not os.path.exists(os.path.join(SCRIPTS, fname)):
        continue
    s = strip_comments(read(fname))
    n = 0
    for m in re.finditer(r"INSERT\s+INTO\s+(\w+)\.(\w+)\s*\((.*?)\)", s, re.S | re.I):
        n += 1
        tbl = f"{m.group(1)}.{m.group(2)}"
        cols = [c.strip().strip("[]") for c in m.group(3).split(",")]
        if tbl not in catalog:
            err(f"{fname[:2]}: INSERT sobre tabla inexistente {tbl}")
            continue
        for c in cols:
            if c not in catalog[tbl]:
                err(f"{fname[:2]}: INSERT en {tbl}: columna inexistente {c!r}")
    for m in re.finditer(r"UPDATE\s+(\w+)\.(\w+)\s+SET\s+(.*?)(?:WHERE|;)", s, re.S | re.I):
        tbl = f"{m.group(1)}.{m.group(2)}"
        if tbl not in catalog:
            err(f"{fname[:2]}: UPDATE sobre tabla inexistente {tbl}")
            continue
        for c in re.findall(r"(\w+)\s*=", m.group(3)):
            if c not in catalog[tbl] and c not in ("N",):
                warn(f"{fname[:2]}: UPDATE en {tbl}: columna {c!r} no encontrada")
    info.append(f"INSERT parseados en {fname[:2]}: {n}")

    # literales de estado/enumerados vs CHECK IN (...)
    for (tbl, col), allowed in check_allowed.items():
        short = tbl.split(".")[1]
        for lm in re.finditer(
            r"\b" + re.escape(col) + r"\s*(?:=|IN)\s*N?'([^']+)'", s, re.I
        ):
            v = lm.group(1)
            # solo alertar si el valor parece un enumerado del mismo dominio
            if v.isupper() and v not in allowed and any(
                a[0] == v[0] for a in allowed
            ):
                warn(f"{fname[:2]}: valor {v!r} asignado a una columna {col!r}; "
                     f"CHECK de {tbl} permite {sorted(allowed)}")

# ---------------------------------------------------------------- 6. constraints unicos
for name, n in constraint_names.items():
    if n > 1:
        err(f"nombre de constraint duplicado en la BD: {name} ({n} veces)")

# ---------------------------------------------------------------- 7. sintaxis
if HAVE_SQLGLOT:
    parse_errors = 0
    for fname in sorted(os.listdir(SCRIPTS)):
        if not fname.endswith(".sql"):
            continue
        raw = read(fname)
        for i, b in enumerate(batches(raw), 1):
            body = strip_comments(b).strip()
            if not body:
                continue
            try:
                sqlglot.parse(b, read="tsql")
            except ParseError as e:
                parse_errors += 1
                first = str(e).split("\n")[0][:200]
                err(f"SINTAXIS {fname} lote #{i}: {first}")
    info.append(f"lotes analizados con sqlglot (dialecto tsql): errores={parse_errors}")
else:
    warn("sqlglot no instalado: se omitio la validacion de sintaxis")

# ---------------------------------------------------------------- salida
print("=" * 68)
print(" VALIDACION ESTATICA DE SCRIPTS — SIGBO-CBVC")
print("=" * 68)
for i in info:
    print("  ·", i)
print("-" * 68)
if warnings:
    print(f" ADVERTENCIAS ({len(warnings)}):")
    for w in warnings:
        print("   ⚠", w)
    print("-" * 68)
if errors:
    print(f" ERRORES ({len(errors)}):")
    for e in errors:
        print("   ✘", e)
    print("=" * 68)
    sys.exit(1)
print(" ✔ Sin errores bloqueantes.")
print("=" * 68)
