export interface FojaServicioSnapshot {
  anio: number;
  generadoEn: string;
  datosGenerales: {
    fotoUrl: string | null;
    nombreCompleto: string;
    rango: string | null;
    cargo: string | null;
    categoria: string | null;
    codigo: string;
    cuadro: string | null;
    situacion: string;
    fechaNacimiento: string;
    documento: string;
    nacionalidad: string;
    estadoCivil: string | null;
    entidadIngreso: string | null;
    condicionIngreso: string | null;
    fechaJuramento: string | null;
    grupoSanguineo: string | null;
  };
  informacionPersonal: {
    direccion: string | null;
    localidad: string | null;
    paisResidencia: string | null;
    email: string | null;
    codigoPostal: string | null;
    telefono: string | null;
    pasaporte: string | null;
  };
  antecedentes: {
    cargosDesempenados: Array<{ cargo: string; periodo: string; institucion: string | null; resolucion: string | null }>;
    actividadesDestacadas: Array<{ fecha: string; descripcion: string }>;
  };
  especialidades: Array<{ especialidad: string; nivel: string | null; certificacion: string | null; vigencia: string | null }>;
  actividadProfesional: { profesion: string | null; empresa: string | null; experiencia: string | null } | null;
  formacion: Array<{ nombre: string; tipo: string; institucion: string | null; fecha: string; duracionHoras: number | null }>;
  idiomas: Array<{ idioma: string; nivel: string | null }>;
  otros: { reconocimientos: Array<{ fecha: string; descripcion: string }>; observaciones: string | null };
}
