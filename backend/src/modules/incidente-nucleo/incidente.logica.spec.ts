import { ConflictException, ForbiddenException } from '@nestjs/common';
import {
  condicionesActivas,
  emergenciaActiva,
  estadoDesdeFase,
  excluyentesDe,
  exigirPermisoResultado,
  faseAutomatica,
  faseTrasResultado,
  horasDeServicio,
  transicionManual,
  validarCierre,
  validarEstadoRecurso,
} from './incidente.logica';

describe('estado heredado derivado de la fase', () => {
  it.each([
    ['RECIBIDO', null, 'REGISTRADO'], ['EVALUACION', null, 'REGISTRADO'],
    ['DESPACHADO', null, 'DESPACHADO'], ['EN_CAMINO', null, 'DESPACHADO'],
    ['EN_LUGAR', null, 'EN_CURSO'], ['OPERANDO', null, 'EN_CURSO'],
    ['CONTROLADO', null, 'EN_CURSO'], ['RETORNO', 'FALSA_ALARMA', 'EN_CURSO'],
    ['DISPONIBLE', null, 'EN_CURSO'], ['CERRADO', 'CONTROLADO', 'FINALIZADO'],
    ['CERRADO', 'FALSA_ALARMA', 'FINALIZADO'], ['CERRADO', 'CANCELADO', 'CANCELADO'],
  ] as const)('%s con resultado %s → %s', (fase, resultado, estado) => {
    expect(estadoDesdeFase(fase, resultado)).toBe(estado);
  });
});

describe('fases automáticas', () => {
  it('avanzan con despacho, salida y llegada', () => {
    expect(faseAutomatica('RECIBIDO', 'DESPACHO_CREADO')).toBe('DESPACHADO');
    expect(faseAutomatica('DESPACHADO', 'SALIDA')).toBe('EN_CAMINO');
    expect(faseAutomatica('RECIBIDO', 'SALIDA')).toBe('EN_CAMINO');
    expect(faseAutomatica('EN_CAMINO', 'LLEGADA')).toBe('EN_LUGAR');
  });
  it('nunca retroceden y no altera una cerrada', () => {
    expect(faseAutomatica('OPERANDO', 'DESPACHO_CREADO')).toBeNull();
    expect(faseAutomatica('OPERANDO', 'LLEGADA')).toBeNull();
    expect(faseAutomatica('CONTROLADO', 'SALIDA')).toBeNull();
    expect(faseAutomatica('CERRADO', 'LLEGADA')).toBeNull();
  });
  it('la acción operativa solo inicia desde EN_LUGAR', () => {
    expect(faseAutomatica('EN_LUGAR', 'ACCION_OPERATIVA')).toBe('OPERANDO');
    expect(faseAutomatica('EN_CAMINO', 'ACCION_OPERATIVA')).toBeNull();
  });
  it('calcula retorno y disponibilidad según despachos activos', () => {
    expect(faseAutomatica('OPERANDO', 'DESPACHOS_CAMBIARON', [{ estado: 'REGRESANDO' }, { estado: 'CERRADO' }])).toBe('RETORNO');
    expect(faseAutomatica('OPERANDO', 'DESPACHOS_CAMBIARON', [{ estado: 'REGRESANDO' }, { estado: 'EN_SERVICIO' }])).toBeNull();
    expect(faseAutomatica('RETORNO', 'DESPACHOS_CAMBIARON', [{ estado: 'CERRADO' }, { estado: 'CANCELADO' }])).toBe('DISPONIBLE');
    expect(faseAutomatica('CONTROLADO', 'DESPACHOS_CAMBIARON', [{ estado: 'CERRADO' }])).toBe('DISPONIBLE');
    expect(faseAutomatica('EN_CAMINO', 'DESPACHOS_CAMBIARON', [{ estado: 'CANCELADO' }])).toBeNull();
  });
});

describe('transiciones manuales', () => {
  const comando = ['servicios:comandar'];
  it('EVALUACION solo desde RECIBIDO con permiso de despacho', () => {
    expect(transicionManual('RECIBIDO', 'EVALUACION', ['servicios:despachar'])).toBe('EVALUACION');
    expect(() => transicionManual('DESPACHADO', 'EVALUACION', ['servicios:despachar'])).toThrow(ConflictException);
    expect(() => transicionManual('RECIBIDO', 'EVALUACION', comando)).toThrow(ForbiddenException);
  });
  it('CONTROLADO y REACTIVADO requieren permiso de comando', () => {
    expect(transicionManual('OPERANDO', 'CONTROLADO', comando)).toBe('CONTROLADO');
    expect(transicionManual('EN_LUGAR', 'CONTROLADO', comando)).toBe('CONTROLADO');
    expect(transicionManual('CONTROLADO', 'REACTIVADO', comando)).toBe('OPERANDO');
    expect(() => transicionManual('EN_CAMINO', 'CONTROLADO', comando)).toThrow(ConflictException);
    expect(() => transicionManual('OPERANDO', 'CONTROLADO', ['servicios:operar'])).toThrow(ForbiddenException);
  });
});

describe('resultados alternativos', () => {
  it('cierra en cualquier fase abierta cuando no quedan despachos afuera', () => {
    for (const fase of ['RECIBIDO', 'EVALUACION', 'DESPACHADO', 'EN_CAMINO', 'EN_LUGAR', 'OPERANDO', 'CONTROLADO', 'RETORNO', 'DISPONIBLE'] as const) {
      expect(faseTrasResultado(fase, 0)).toBe('CERRADO');
    }
  });
  it('sin móviles afuera cierra al declarar resultado y con móviles afuera pasa a RETORNO', () => {
    expect(faseTrasResultado('EN_CAMINO', 2)).toBe('RETORNO');
    expect(faseTrasResultado('OPERANDO', 1)).toBe('RETORNO');
    expect(faseTrasResultado('DISPONIBLE', 0)).toBe('CERRADO');
    expect(faseTrasResultado('RETORNO', 0)).toBe('CERRADO');
    expect(() => faseTrasResultado('CERRADO', 0)).toThrow(ConflictException);
  });
  it('el permiso depende de si el incidente ya fue despachado', () => {
    expect(() => exigirPermisoResultado('RECIBIDO', ['servicios:despachar'])).not.toThrow();
    expect(() => exigirPermisoResultado('OPERANDO', ['servicios:despachar'])).toThrow(ForbiddenException);
    expect(() => exigirPermisoResultado('OPERANDO', ['servicios:comandar'])).not.toThrow();
  });
});

describe('cierre', () => {
  it('se rechaza con un móvil afuera o si ya estaba cerrado', () => {
    expect(() => validarCierre('RETORNO', 1)).toThrow(/móvil/);
    expect(() => validarCierre('CERRADO', 0)).toThrow(ConflictException);
  });
  it('se acepta sin móviles afuera', () => expect(() => validarCierre('DISPONIBLE', 0)).not.toThrow());
});

describe('condiciones de situación', () => {
  const catalogo = [
    { codigo: 'INCENDIO_ACTIVO', grupoExcluyente: 'INCENDIO' },
    { codigo: 'INCENDIO_CONTROLADO', grupoExcluyente: 'INCENDIO' },
    { codigo: 'VICTIMA', grupoExcluyente: null },
  ];
  it('pliega marcas y resoluciones', () => {
    const activas = condicionesActivas([
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'VICTIMA' }) },
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_ACTIVO' }) },
      { tipo: 'SITUACION_RESUELTA', datos: JSON.stringify({ codigo: 'VICTIMA' }) },
    ]);
    expect([...activas]).toEqual(['INCENDIO_ACTIVO']);
  });
  it('resuelve excluyentes en el mismo evento', () => {
    const antes = new Set(['INCENDIO_ACTIVO', 'VICTIMA']);
    expect(excluyentesDe('INCENDIO_CONTROLADO', catalogo, antes)).toEqual(['INCENDIO_ACTIVO']);
    expect(excluyentesDe('VICTIMA', catalogo, antes)).toEqual([]);
    const despues = condicionesActivas([
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_ACTIVO' }) },
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_CONTROLADO', resueltas: ['INCENDIO_ACTIVO'] }) },
    ]);
    expect([...despues]).toEqual(['INCENDIO_CONTROLADO']);
  });
  it('ignora otros eventos y datos dañados', () => {
    expect(condicionesActivas([{ tipo: 'MOVIL_LLEGO', datos: null }, { tipo: 'SITUACION_MARCADA', datos: 'no-json' }]).size).toBe(0);
  });
  it('omite códigos inválidos y filtra resueltas con forma incorrecta sin interrumpir el pliegue', () => {
    const activas = condicionesActivas([
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 42 }) },
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_ACTIVO' }) },
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_CONTROLADO', resueltas: 123 }) },
    ]);
    expect([...activas]).toEqual(['INCENDIO_ACTIVO', 'INCENDIO_CONTROLADO']);
    const saneadas = condicionesActivas([
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_ACTIVO' }) },
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_CONTROLADO', resueltas: ['INCENDIO_ACTIVO', 7] }) },
    ]);
    expect([...saneadas]).toEqual(['INCENDIO_CONTROLADO']);
  });
});

describe('pedidos de recurso', () => {
  it('avanza y permite saltar pasos, pero no retroceder', () => {
    expect(() => validarEstadoRecurso('SOLICITADO', 'APROBADO')).not.toThrow();
    expect(() => validarEstadoRecurso('APROBADO', 'EN_USO')).not.toThrow();
    expect(() => validarEstadoRecurso('EN_USO', 'APROBADO')).toThrow(ConflictException);
  });
  it('rechaza o cancela desde cualquier estado no final', () => {
    expect(() => validarEstadoRecurso('SOLICITADO', 'RECHAZADO')).not.toThrow();
    expect(() => validarEstadoRecurso('EN_CAMINO', 'CANCELADO')).not.toThrow();
    expect(() => validarEstadoRecurso('LIBERADO', 'CANCELADO')).toThrow(ConflictException);
  });
});

describe('emergencia', () => {
  it('permanece activa hasta su atención, y una nueva la reactiva', () => {
    expect(emergenciaActiva([{ tipo: 'EMERGENCIA' }])).toBe(true);
    expect(emergenciaActiva([{ tipo: 'EMERGENCIA' }, { tipo: 'EMERGENCIA_ATENDIDA' }])).toBe(false);
    expect(emergenciaActiva([{ tipo: 'EMERGENCIA' }, { tipo: 'EMERGENCIA_ATENDIDA' }, { tipo: 'EMERGENCIA' }])).toBe(true);
    expect(emergenciaActiva([])).toBe(false);
  });
});

describe('horas de servicio (política DEC-4)', () => {
  it('aplica las tres políticas y nunca devuelve valores negativos', () => {
    expect(horasDeServicio(120)).toBe(2);
    expect(horasDeServicio(89)).toBe(1);
    expect(horasDeServicio(90)).toBe(2);
    expect(horasDeServicio(-5)).toBe(0);
    expect(horasDeServicio(61, 'HORA_INICIADA')).toBe(2);
    expect(horasDeServicio(120, 'HORA_INICIADA')).toBe(2);
    expect(horasDeServicio(119, 'HORAS_COMPLETAS')).toBe(1);
    expect(horasDeServicio(120, 'HORAS_COMPLETAS')).toBe(2);
  });
});
