/* =============================================================
   SIGBO-CBVC | Migracion 042 - Deposito: proveedores y entradas
   =============================================================
   Etapa 3. deposito.entradas.tipo_entrada_id reutiliza el mismo
   catalogo TIPO_MOVIMIENTO_DEPOSITO (sembrado en 041) en vez de crear
   un catalogo paralelo -- Compra/Donacion/Transferencia/Devolucion/
   Recuperacion/Otro ya existen ahi con el mismo significado.
   ============================================================= */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF OBJECT_ID(N'deposito.proveedores', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.proveedores (
        id               UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_prov_id DEFAULT NEWSEQUENTIALID(),
        razon_social     NVARCHAR(200) NOT NULL,
        nombre_comercial NVARCHAR(200) NULL,
        ruc              NVARCHAR(30)  NULL,
        direccion        NVARCHAR(300) NULL,
        telefono         NVARCHAR(50)  NULL,
        email            NVARCHAR(255) NULL,
        contacto         NVARCHAR(150) NULL,
        estado           NVARCHAR(20)  NOT NULL CONSTRAINT DF_prov_estado DEFAULT N'ACTIVO',
        observaciones    NVARCHAR(MAX) NULL,
        institucion_id   UNIQUEIDENTIFIER NULL,
        creado_en        DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_prov_creado DEFAULT SYSDATETIMEOFFSET(),
        actualizado_en   DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_prov_act DEFAULT SYSDATETIMEOFFSET(),
        creado_por       UNIQUEIDENTIFIER NULL,
        actualizado_por  UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_proveedores PRIMARY KEY CLUSTERED (id),
        CONSTRAINT CK_prov_estado CHECK (estado IN (N'ACTIVO', N'INACTIVO'))
    );
END
GO

IF OBJECT_ID(N'deposito.entradas', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.entradas (
        id                   UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_entr_id DEFAULT NEWSEQUENTIALID(),
        tipo_entrada_id      UNIQUEIDENTIFIER NOT NULL,
        fecha                DATE          NOT NULL,
        proveedor_id         UNIQUEIDENTIFIER NULL,
        donante_nombre       NVARCHAR(200) NULL,
        donante_documento    NVARCHAR(30)  NULL,
        numero_documento     NVARCHAR(100) NULL,
        valor_total          DECIMAL(15,2) NULL,
        ubicacion_destino_id UNIQUEIDENTIFIER NOT NULL,
        observacion          NVARCHAR(MAX) NULL,
        institucion_id       UNIQUEIDENTIFIER NULL,
        creado_en            DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_entr_creado DEFAULT SYSDATETIMEOFFSET(),
        creado_por           UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_entradas PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_entr_tipo FOREIGN KEY (tipo_entrada_id) REFERENCES organizacion.parametros(id),
        CONSTRAINT FK_entr_proveedor FOREIGN KEY (proveedor_id) REFERENCES deposito.proveedores(id),
        CONSTRAINT FK_entr_ubicaciondestino FOREIGN KEY (ubicacion_destino_id) REFERENCES deposito.ubicaciones(id),
        CONSTRAINT FK_entr_creadopor FOREIGN KEY (creado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO

IF OBJECT_ID(N'deposito.entrada_items', N'U') IS NULL
BEGIN
    CREATE TABLE deposito.entrada_items (
        id              UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_entri_id DEFAULT NEWSEQUENTIALID(),
        entrada_id      UNIQUEIDENTIFIER NOT NULL,
        tipo_elemento   NVARCHAR(10)  NOT NULL,
        articulo_id     UNIQUEIDENTIFIER NULL,
        equipo_id       UNIQUEIDENTIFIER NULL,
        cantidad        DECIMAL(15,2) NOT NULL,
        precio_unitario DECIMAL(15,2) NULL,
        subtotal        DECIMAL(15,2) NULL,
        movimiento_id   UNIQUEIDENTIFIER NULL,
        CONSTRAINT PK_entrada_items PRIMARY KEY CLUSTERED (id),
        CONSTRAINT FK_entri_entrada FOREIGN KEY (entrada_id) REFERENCES deposito.entradas(id) ON DELETE CASCADE,
        CONSTRAINT FK_entri_articulo FOREIGN KEY (articulo_id) REFERENCES deposito.articulos(id),
        CONSTRAINT FK_entri_equipo FOREIGN KEY (equipo_id) REFERENCES equipos.equipos(id),
        CONSTRAINT FK_entri_movimiento FOREIGN KEY (movimiento_id) REFERENCES deposito.movimientos(id),
        CONSTRAINT CK_entri_tipoelemento CHECK (tipo_elemento IN (N'EQUIPO', N'ARTICULO'))
    );
END
GO
