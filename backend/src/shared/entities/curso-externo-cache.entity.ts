import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Cache de solo lectura de cursos publicos listados en OBA/Thinkific
 * (seccion 19-24 del pedido). SIGBO nunca inicia sesion en el sitio
 * externo ni guarda datos de inscripcion/progreso/certificado individual --
 * solo lo que ya es publico en la pagina de coleccion de cursos. */
@Entity({ name: 'cursos_externos_cache', schema: 'academia' })
export class CursoExternoCache {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 300 })
  titulo: string;

  @Column({ type: 'nvarchar', length: 500 })
  url: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  imagenUrl: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  categoria: string | null;

  @Column({ type: 'nvarchar', length: 100, nullable: true })
  duracionTexto: string | null;

  @Column({ type: 'nvarchar', length: 100, default: 'OBA' })
  fuente: string;

  @Column({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;
}
