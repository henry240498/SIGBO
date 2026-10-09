import { readFileSync } from 'fs';
import { resolve } from 'path';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import * as entidades from '../../shared/entities';

describe('Modelo GRE y DDL preparado, sin conexión a SQL Server', () => {
  let origen: DataSource;
  const sql = readFileSync(resolve(__dirname, '../../../../database/migrations/094_gre_base_documental.sql'), 'utf8');
  beforeAll(async () => {
    origen = new DataSource({ type: 'mssql', database: 'metadata_sin_conexion',
      entities: Object.values(entidades), namingStrategy: new SnakeNamingStrategy(), synchronize: false });
    // Construir metadata del driver instalado no inicializa conexiones ni aplica SQL.
    await (origen as any).buildMetadatas();
  });
  it('registra cada tabla GRE y conserva los tipos, longitudes y nulabilidad SQL', () => {
    const metadata = origen.entityMetadatas.filter(e => e.schema === 'matpel');
    const tablas = [...sql.matchAll(/CREATE TABLE matpel\.(\w+) \(([\s\S]*?)\n    \);/g)];
    expect(metadata.length).toBe(tablas.length);
    expect(metadata.length).toBeGreaterThan(0);
    for (const [, nombre, cuerpo] of tablas) {
      const entidad = metadata.find(e => e.tableName === nombre);
      expect(entidad).toBeDefined();
      const columnas = [...cuerpo.matchAll(/^\s+(\w+) (UNIQUEIDENTIFIER|CHAR|NVARCHAR|INT|FLOAT|BIT|DATETIMEOFFSET)(?:\((\w+)\))? (NOT NULL|NULL)/gm)];
      expect(entidad!.columns.length).toBe(columnas.length);
      for (const [, nombreColumna, tipo, longitud, nulabilidad] of columnas) {
        const columna = entidad!.columns.find(c => c.databaseName === nombreColumna);
        expect(columna).toBeDefined();
        // uuid es el tipo lógico del id generado; el driver MSSQL lo normaliza.
        expect(origen.driver.normalizeType(columna!)).toBe(tipo.toLowerCase());
        expect(columna!.isNullable).toBe(nulabilidad === 'NULL');
        if (tipo === 'NVARCHAR' || tipo === 'CHAR') expect(columna!.length.toUpperCase()).toBe(longitud);
        if (tipo === 'DATETIMEOFFSET') expect(columna!.precision).toBe(Number(longitud));
      }
    }
  });
  it('conserva números ONU como texto y admite entradas distintas por identificador', () => {
    const entrada = origen.getMetadata(entidades.GreEntrada);
    expect(entrada.findColumnWithPropertyName('identificador')!.type).toBe('char');
    expect(entrada.primaryColumns.map(c => c.propertyName)).toEqual(['id']);
    expect(sql).not.toMatch(/UNIQUE\s*\(\s*(?:version_id,\s*)?identificador\s*\)/i);
    expect(origen.getMetadata(entidades.GreCelda).findColumnWithPropertyName('valorDecimal')!.type).toBe('nvarchar');
  });
  it('no incorpora cascadas de borrado ni activa catálogos mediante datos sembrados', () => {
    expect(sql).not.toMatch(/ON DELETE CASCADE/i);
    expect(sql).not.toMatch(/INSERT\s+(?:INTO\s+)?matpel\./i);
    expect(sql).not.toMatch(/INSERT\s+(?:INTO\s+)?seguridad\./i);
    expect(sql).toContain('TR_gre_versiones_validada');
    expect(sql).toContain('TR_gre_documentos_inmutable');
  });
});
