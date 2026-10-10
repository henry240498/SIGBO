import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ESTADOS_BOMBERO } from '../../shared/entities/bombero.entity';
import { BadRequestException } from '@nestjs/common';
import { Bombero, HistorialCodigo, HistorialInstitucional } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { ESTADO_BOMBERO_SINONIMOS, PATRON_PERSONAL_POR_ESTADO, resolverSinonimo } from '../ia/tools/ia-nlu.util';
import { BomberosService, tipoMovimientoPorEstado } from './bomberos.service';
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

  it('Snoopy reconoce la intención de listar bomberos de baja o fallecidos', () => {
    for (const frase of ['bomberos de baja', 'bomberos dados de baja', 'bomberos fallecidos', 'bombero fallecido', 'bomberos activos', 'bomberos de licencia']) {
      expect(PATRON_PERSONAL_POR_ESTADO.test(frase)).toBe(true);
    }
    expect(PATRON_PERSONAL_POR_ESTADO.test('bomberos con guardia')).toBe(false);
  });

  it('dar de baja a quien ya está de baja o fallecido se rechaza sin tocar nada', async () => {
    const base = new BaseFalsa();
    const auditoria = { registrar: jest.fn() };
    const s = new BomberosService(base.getRepository(Bombero) as never, base.getRepository(HistorialCodigo) as never, base.getRepository(HistorialInstitucional) as never, auditoria as never);
    await base.getRepository(Bombero).save(Object.assign(new Bombero(), { id: 'b1', estado: 'BAJA' }) as never);
    await base.getRepository(Bombero).save(Object.assign(new Bombero(), { id: 'b2', estado: 'FALLECIDO' }) as never);
    await expect(s.darBaja('b1', 'motivo', 'u1')).rejects.toThrow('El bombero ya está dado de baja.');
    await expect(s.darBaja('b2', 'motivo', 'u1')).rejects.toBeInstanceOf(BadRequestException);
    const fallecido = await base.getRepository(Bombero).findOne({ where: { id: 'b2' } }) as { estado: string };
    expect(fallecido.estado).toBe('FALLECIDO');
    expect(base.tabla('HistorialInstitucional')).toHaveLength(0);
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });
});
