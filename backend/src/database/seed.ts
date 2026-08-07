import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { dataSourceOptions } from '../core/database/data-source-options';
import { AsignacionPermisoRol, AsignacionRol, Permiso, Rol, Usuario } from '../shared/entities';
import { PERMISOS, ROLES } from './seed-data';

async function seed() {
  const dataSource = new DataSource(dataSourceOptions);
  await dataSource.initialize();
  console.log('Conectado a la base de datos. Iniciando seed...\n');

  const permisoRepo = dataSource.getRepository(Permiso);
  const rolRepo = dataSource.getRepository(Rol);
  const asignacionPermisoRolRepo = dataSource.getRepository(AsignacionPermisoRol);
  const usuarioRepo = dataSource.getRepository(Usuario);
  const asignacionRolRepo = dataSource.getRepository(AsignacionRol);

  // 1. Permisos
  const permisoMap = new Map<string, Permiso>();
  for (const p of PERMISOS) {
    let permiso = await permisoRepo.findOne({ where: { nombre: p.nombre } });
    if (!permiso) {
      permiso = await permisoRepo.save(
        permisoRepo.create({ ...p, esSistema: true }),
      );
    }
    permisoMap.set(p.nombre, permiso);
  }
  console.log(`Permisos: ${permisoMap.size} disponibles en base de datos.`);

  // 2. Roles + asignacion de permisos
  const rolMap = new Map<string, Rol>();
  for (const r of ROLES) {
    let rol = await rolRepo.findOne({ where: { nombre: r.nombre } });
    if (!rol) {
      rol = await rolRepo.save(
        rolRepo.create({
          nombre: r.nombre,
          descripcion: r.descripcion,
          color: r.color,
          prioridad: r.prioridad,
          esAdministrativo: r.esAdministrativo,
          esOperativo: !r.esAdministrativo,
          esSistema: true,
        }),
      );
    }
    rolMap.set(r.slug, rol);

    const permisosDelRol = r.permisos === 'all' ? PERMISOS.map((p) => p.nombre) : r.permisos;
    const existentes = await asignacionPermisoRolRepo.find({ where: { rolId: rol.id } });
    const existentesIds = new Set(existentes.map((e) => e.permisoId));

    for (const nombrePermiso of permisosDelRol) {
      const permiso = permisoMap.get(nombrePermiso);
      if (!permiso) {
        console.warn(`  Permiso no encontrado: ${nombrePermiso} (rol ${r.nombre})`);
        continue;
      }
      if (!existentesIds.has(permiso.id)) {
        await asignacionPermisoRolRepo.save(
          asignacionPermisoRolRepo.create({ rolId: rol.id, permisoId: permiso.id }),
        );
      }
    }
    console.log(`Rol "${r.nombre}": ${permisosDelRol.length} permisos asignados.`);
  }

  // 3. Usuarios (uno por rol) + asignacion de rol
  console.log('\nCreando usuarios de prueba...');
  for (const r of ROLES) {
    const rol = rolMap.get(r.slug)!;
    let usuario = await usuarioRepo.findOne({ where: { username: r.username } });

    if (!usuario) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(r.password, salt);
      usuario = await usuarioRepo.save(
        usuarioRepo.create({
          username: r.username,
          email: `${r.username}@sigbo-cbvc.local`,
          passwordHash,
          salt,
          estado: 'ACTIVO',
        }),
      );
      console.log(`  Usuario creado: ${r.username}`);
    } else {
      console.log(`  Usuario ya existia: ${r.username}`);
    }

    const asignacionExistente = await asignacionRolRepo.findOne({
      where: { usuarioId: usuario.id, rolId: rol.id },
    });
    if (!asignacionExistente) {
      await asignacionRolRepo.save(
        asignacionRolRepo.create({ usuarioId: usuario.id, rolId: rol.id }),
      );
    }
  }

  console.log('\nSeed completado correctamente.');
  await dataSource.destroy();
}

seed().catch((err) => {
  console.error('Error ejecutando el seed:', err);
  process.exit(1);
});
