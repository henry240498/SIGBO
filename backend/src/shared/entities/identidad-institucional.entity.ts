import { Column, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

/** Identidad documental institucional (fila unica, patron ConfiguracionSistema/
 * AparienciaService/OrdenGuardiaConfiguracion): membrete, datos de contacto,
 * logos y pie de pagina reutilizables por CUALQUIER modulo que genere
 * documentos PDF/DOCX -- no un membrete por modulo. Primera pasada de una
 * sola institucion (SIGBO no tiene institucion_id en ninguna tabla todavia). */
@Entity({ name: 'identidad_institucional', schema: 'organizacion' })
export class IdentidadInstitucional {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 200 })
  nombreInstitucion: string;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  direccion: string | null;

  @Column({ type: 'bit', default: true })
  mostrarDireccion: boolean;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  telefono: string | null;

  @Column({ type: 'bit', default: true })
  mostrarTelefono: boolean;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  email: string | null;

  @Column({ type: 'bit', default: true })
  mostrarEmail: boolean;

  @Column({ type: 'nvarchar', length: 255, nullable: true })
  sitioWeb: string | null;

  @Column({ type: 'bit', default: false })
  mostrarSitioWeb: boolean;

  @Column({ type: 'nvarchar', length: 30, nullable: true })
  ruc: string | null;

  @Column({ type: 'nvarchar', length: 150, nullable: true })
  personeriaJuridica: string | null;

  @Column({ type: 'bit', default: true })
  mostrarPersoneria: boolean;

  @Column({ type: 'date', nullable: true })
  fechaFundacion: string | null;

  @Column({ type: 'bit', default: true })
  mostrarFechaFundacion: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  logoIzquierdaUrl: string | null;

  @Column({ type: 'bit', default: true })
  mostrarLogoIzquierda: boolean;

  @Column({ type: 'nvarchar', nullable: true })
  logoDerechaUrl: string | null;

  @Column({ type: 'bit', default: true })
  mostrarLogoDerecha: boolean;

  /** JSON string: Array<{ texto, tipo: 'SUBTITULO'|'DISTINCION'|'OTRO', visible, orden }>.
   * Mismo patron que Bombero.contactosEmergencia: lista chica de largo
   * variable, editada como conjunto. */
  @Column({ type: 'nvarchar', default: '[]' })
  lineasDestacadas: string;

  @Column({ type: 'nvarchar', length: 500, nullable: true })
  textoPiePagina: string | null;

  @Column({ type: 'bit', default: true })
  mostrarNumeroPagina: boolean;

  @Column({ type: 'bit', default: true })
  mostrarGeneradoSigbo: boolean;

  @UpdateDateColumn({ name: 'actualizado_en', type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;
}
