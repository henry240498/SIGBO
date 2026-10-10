import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ESTADOS_BOMBERO } from '../../shared/entities/bombero.entity';
import { ESTADO_BOMBERO_SINONIMOS, resolverSinonimo } from '../ia/tools/ia-nlu.util';
import { tipoMovimientoPorEstado } from './bomberos.service';
import { CreateBomberoDto } from './dto/create-bombero.dto';

describe('estados del bombero', () => {
  it('son exactamente los cinco que usa el cuartel', () => {
    expect([...ESTADOS_BOMBERO]).toEqual(['ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'BAJA', 'FALLECIDO']);
  });

  it('el DTO rechaza los estados que ya no existen y acepta BAJA', async () => {
    // Solo interesa el error del campo estado; los demas obligatorios pueden faltar.
    for (const viejo of ['RETIRADO', 'ASPIRANTE', 'HONORARIO']) {
      const errores = await validate(plainToInstance(CreateBomberoDto, { estado: viejo }));
      expect(errores.some((e) => e.property === 'estado')).toBe(true);
    }
    const ok = await validate(plainToInstance(CreateBomberoDto, { estado: 'BAJA' }));
    expect(ok.some((e) => e.property === 'estado')).toBe(false);
  });

  it('una baja sigue registrando el movimiento RETIRO del historial (no se reescribe)', () => {
    expect(tipoMovimientoPorEstado('BAJA')).toBe('RETIRO');
    expect(tipoMovimientoPorEstado('LICENCIA')).toBe('LICENCIA');
    expect(tipoMovimientoPorEstado('SUSPENDIDO')).toBe('SUSPENSION');
  });

  it('Snoopy entiende "de baja" y ya no ofrece aspirantes', () => {
    // resolverSinonimo recibe el mensaje ya normalizado (minusculas, sin tildes).
    expect(resolverSinonimo('cuantos bomberos de baja hay', ESTADO_BOMBERO_SINONIMOS)).toBe('BAJA');
    expect(resolverSinonimo('listame los retirados', ESTADO_BOMBERO_SINONIMOS)).toBe('BAJA');
    expect(resolverSinonimo('los fallecidos', ESTADO_BOMBERO_SINONIMOS)).toBe('FALLECIDO');
    expect(Object.values(ESTADO_BOMBERO_SINONIMOS)).not.toContain('ASPIRANTE');
  });
});
