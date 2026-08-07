import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import {
  Ascenso,
  Brigada,
  Cargo,
  Compania,
  Cuartel,
  Departamento,
  Designacion,
  Especialidad,
  Rango,
  TipoGuardia,
  Turno,
  Unidad,
} from '../../shared/entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Rango) private readonly rangoRepo: Repository<Rango>,
    @InjectRepository(Cargo) private readonly cargoRepo: Repository<Cargo>,
    @InjectRepository(Especialidad) private readonly especialidadRepo: Repository<Especialidad>,
    @InjectRepository(Compania) private readonly companiaRepo: Repository<Compania>,
    @InjectRepository(Cuartel) private readonly cuartelRepo: Repository<Cuartel>,
    @InjectRepository(Brigada) private readonly brigadaRepo: Repository<Brigada>,
    @InjectRepository(Departamento) private readonly departamentoRepo: Repository<Departamento>,
    @InjectRepository(Unidad) private readonly unidadRepo: Repository<Unidad>,
    @InjectRepository(Turno) private readonly turnoRepo: Repository<Turno>,
    @InjectRepository(TipoGuardia) private readonly tipoGuardiaRepo: Repository<TipoGuardia>,
    @InjectRepository(Designacion) private readonly designacionRepo: Repository<Designacion>,
    @InjectRepository(Ascenso) private readonly ascensoRepo: Repository<Ascenso>,
  ) {}

  private activos<T extends { eliminadoEn: Date | null }>(repo: Repository<T>) {
    return repo.count({ where: { eliminadoEn: IsNull() } as any });
  }

  async obtener() {
    const [
      rangos,
      cargos,
      especialidades,
      companias,
      cuarteles,
      brigadas,
      departamentos,
      unidades,
      turnos,
      tiposGuardia,
      designacionesActivas,
      ascensosRegistrados,
    ] = await Promise.all([
      this.activos(this.rangoRepo),
      this.activos(this.cargoRepo),
      this.activos(this.especialidadRepo),
      this.activos(this.companiaRepo),
      this.activos(this.cuartelRepo),
      this.activos(this.brigadaRepo),
      this.activos(this.departamentoRepo),
      this.activos(this.unidadRepo),
      this.activos(this.turnoRepo),
      this.activos(this.tipoGuardiaRepo),
      this.designacionRepo.count({ where: { estado: 'ACTIVA' } }),
      this.ascensoRepo.count({ where: { estado: 'REGISTRADO' } }),
    ]);

    return {
      rangos,
      cargos,
      especialidades,
      companias,
      cuarteles,
      brigadas,
      departamentos,
      unidades,
      turnos,
      tiposGuardia,
      designacionesActivas,
      ascensosRegistrados,
    };
  }
}
