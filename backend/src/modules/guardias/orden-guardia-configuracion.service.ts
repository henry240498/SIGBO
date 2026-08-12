import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrdenGuardiaConfiguracion } from '../../shared/entities';
import { ActualizarConfiguracionOrdenDto } from './dto/actualizar-configuracion-orden.dto';

/** Configuracion institucional de la Orden de Guardia: fila unica, mismo
 * patron que AparienciaService (find({take:1}), si no existe se crea con
 * los defaults de la entidad). Se sembra con el texto real del documento de
 * referencia via migracion; esto solo cubre el caso de una BD nueva sin esa
 * fila. */
@Injectable()
export class OrdenGuardiaConfiguracionService {
  constructor(
    @InjectRepository(OrdenGuardiaConfiguracion) private readonly repo: Repository<OrdenGuardiaConfiguracion>,
  ) {}

  async obtener(): Promise<OrdenGuardiaConfiguracion> {
    const [fila] = await this.repo.find({ take: 1 });
    if (fila) return fila;
    return this.repo.save(this.repo.create({}));
  }

  async actualizar(dto: ActualizarConfiguracionOrdenDto, actorId: string): Promise<OrdenGuardiaConfiguracion> {
    const actual = await this.obtener();
    await this.repo.update(actual.id, { ...dto, actualizadoPor: actorId });
    return this.obtener();
  }

  async actualizarLogo(lado: 'izquierda' | 'derecha', url: string, actorId: string): Promise<OrdenGuardiaConfiguracion> {
    const actual = await this.obtener();
    const campo = lado === 'izquierda' ? 'logoIzquierdaUrl' : 'logoDerechaUrl';
    await this.repo.update(actual.id, { [campo]: url, actualizadoPor: actorId });
    return this.obtener();
  }
}
