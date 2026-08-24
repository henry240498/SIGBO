import { obtenerSeguridadMssql } from './data-source-options';

describe('obtenerSeguridadMssql', () => {
  it('conserva la configuracion segura para desarrollo local controlado', () => {
    expect(obtenerSeguridadMssql({ NODE_ENV: 'development' })).toEqual({
      encrypt: false,
      trustServerCertificate: true,
    });
  });

  it('exige cifrado y certificado validado en produccion', () => {
    expect(() => obtenerSeguridadMssql({ NODE_ENV: 'production' }))
      .toThrow('DB_ENCRYPT=true');
    expect(() => obtenerSeguridadMssql({
      NODE_ENV: 'production',
      DB_ENCRYPT: 'true',
      DB_TRUST_SERVER_CERTIFICATE: 'true',
    })).toThrow('DB_ENCRYPT=true');
  });

  it('acepta solo la configuracion TLS explicita en produccion', () => {
    expect(obtenerSeguridadMssql({
      NODE_ENV: 'production',
      DB_ENCRYPT: 'true',
      DB_TRUST_SERVER_CERTIFICATE: 'false',
    })).toEqual({
      encrypt: true,
      trustServerCertificate: false,
    });
  });

  it('rechaza valores booleanos ambiguos', () => {
    expect(() => obtenerSeguridadMssql({ DB_ENCRYPT: 'yes' }))
      .toThrow('DB_ENCRYPT debe ser true o false.');
  });
});
