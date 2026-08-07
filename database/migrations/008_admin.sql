/* =============================================================
   SIGBO-CBVC | Migracion 008 - Esquemas administrativos
   finanzas, deposito, documentos
   ============================================================= */

/* --- FINANZAS --- */

CREATE TABLE finanzas.cuentas_contables (
    id          UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_cta_id DEFAULT NEWSEQUENTIALID(),
    codigo      NVARCHAR(20)  NOT NULL,
    nombre      NVARCHAR(200) NOT NULL,
    tipo        NVARCHAR(20)  NOT NULL,
    descripcion NVARCHAR(MAX) NULL,
    activa      BIT           NOT NULL CONSTRAINT DF_cta_activa DEFAULT 1,
    creado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_cta_creado DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_cuentas_contables PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_cuentas_contables_codigo UNIQUE (codigo),
    CONSTRAINT CK_cta_tipo CHECK (tipo IN ('INGRESO','GASTO','ACTIVO','PASIVO'))
);
GO

CREATE TABLE finanzas.movimientos (
    id             UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_mov_id DEFAULT NEWSEQUENTIALID(),
    cuenta_id      UNIQUEIDENTIFIER NOT NULL,
    tipo           NVARCHAR(10)  NOT NULL,
    fecha          DATE          NOT NULL,
    descripcion    NVARCHAR(MAX) NOT NULL,
    monto          DECIMAL(15,2) NOT NULL,
    categoria      NVARCHAR(50)  NULL,
    forma_pago     NVARCHAR(30)  NULL,
    referencia     NVARCHAR(100) NULL,
    comprobante_url NVARCHAR(MAX) NULL,
    proyecto       NVARCHAR(100) NULL,
    donante_id     UNIQUEIDENTIFIER NULL,
    proveedor      NVARCHAR(200) NULL,
    creado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_mov_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por     UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_movimientos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_mov_tipo CHECK (tipo IN ('INGRESO','EGRESO'))
);
GO

/* --- DEPOSITO --- */

CREATE TABLE deposito.items_deposito (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_item_id DEFAULT NEWSEQUENTIALID(),
    codigo              NVARCHAR(50)  NOT NULL,
    nombre              NVARCHAR(200) NOT NULL,
    descripcion         NVARCHAR(MAX) NULL,
    categoria           NVARCHAR(50)  NOT NULL,
    unidad_medida       NVARCHAR(20)  NOT NULL,
    stock_actual        DECIMAL(15,2) NOT NULL CONSTRAINT DF_item_stockact DEFAULT 0,
    stock_minimo        DECIMAL(15,2) NOT NULL CONSTRAINT DF_item_stockmin DEFAULT 0,
    stock_maximo        DECIMAL(15,2) NULL,
    ubicacion           NVARCHAR(100) NULL,
    proveedor           NVARCHAR(200) NULL,
    fecha_vencimiento   DATE          NULL,
    lote                NVARCHAR(50)  NULL,
    precio_unitario     DECIMAL(15,2) NULL,
    alerta_stock_bajo   BIT           NOT NULL CONSTRAINT DF_item_alertastock DEFAULT 0,
    alerta_vencimiento  BIT           NOT NULL CONSTRAINT DF_item_alertavenc DEFAULT 0,
    qr_code             NVARCHAR(200) NULL,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_item_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_item_act DEFAULT SYSDATETIMEOFFSET(),
    CONSTRAINT PK_items_deposito PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_items_deposito_codigo UNIQUE (codigo),
    CONSTRAINT CK_item_categoria CHECK (categoria IN ('ESPUMA','COMBUSTIBLE','GUANTES','GASAS','MEDICAMENTOS','PAPELERIA','LIMPIEZA','OTROS'))
);
GO

CREATE TABLE deposito.movimientos_deposito (
    id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_movdep_id DEFAULT NEWSEQUENTIALID(),
    item_id         UNIQUEIDENTIFIER NOT NULL,
    tipo            NVARCHAR(10)  NOT NULL,
    fecha           DATE          NOT NULL,
    cantidad        DECIMAL(15,2) NOT NULL,
    motivo          NVARCHAR(100) NOT NULL,
    servicio_id     UNIQUEIDENTIFIER NULL,
    bombero_id      UNIQUEIDENTIFIER NULL,
    comprobante_url NVARCHAR(MAX) NULL,
    observaciones   NVARCHAR(MAX) NULL,
    creado_en       DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_movdep_creado DEFAULT SYSDATETIMEOFFSET(),
    creado_por      UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_movimientos_deposito PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_movdep_tipo CHECK (tipo IN ('ENTRADA','SALIDA'))
);
GO

/* --- DOCUMENTOS --- */

CREATE TABLE documentos.documentos (
    id                  UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_doc_id DEFAULT NEWSEQUENTIALID(),
    tipo                NVARCHAR(50)  NOT NULL,
    titulo              NVARCHAR(200) NOT NULL,
    contenido           NVARCHAR(MAX) NULL,
    fecha_emision       DATE          NOT NULL,
    fecha_vencimiento   DATE          NULL,
    numero_oficial      NVARCHAR(100) NULL,
    bombero_id          UNIQUEIDENTIFIER NULL,
    servicio_id         UNIQUEIDENTIFIER NULL,
    estado              NVARCHAR(20)  NOT NULL CONSTRAINT DF_doc_estado DEFAULT 'ACTIVO',
    archivo_url         NVARCHAR(MAX) NULL,
    archivo_firmado_url NVARCHAR(MAX) NULL,
    firma_digital       BIT           NOT NULL CONSTRAINT DF_doc_firma DEFAULT 0,
    metadata            NVARCHAR(MAX) NULL,
    creado_en           DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_doc_creado DEFAULT SYSDATETIMEOFFSET(),
    actualizado_en      DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_doc_act DEFAULT SYSDATETIMEOFFSET(),
    creado_por          UNIQUEIDENTIFIER NULL,
    CONSTRAINT PK_documentos PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CK_doc_tipo CHECK (tipo IN ('RESOLUCION','CIRCULAR','CITACION','NOTA','PERMISO','JUSTIFICACION','ACTA','INFORME')),
    CONSTRAINT CK_doc_estado CHECK (estado IN ('ACTIVO','ARCHIVADO','VENCIDO')),
    CONSTRAINT CK_doc_meta CHECK (metadata IS NULL OR ISJSON(metadata) = 1)
);
GO
