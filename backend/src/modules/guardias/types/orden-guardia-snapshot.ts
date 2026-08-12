/** Snapshot congelado de una Orden de Guardia: valores ya resueltos (sin
 * FKs crudas) para que el renderer PDF/DOCX y la vista previa del frontend
 * no tengan que resolver nada. Se arma desde la planificacion ya existente
 * (Guardia/AsignacionGuardia/GrupoGuardia/EsquemaHorarioGuardia) -- nunca es
 * una fuente de datos propia. Una vez que la Orden pasa a PUBLICADA, este
 * objeto queda congelado para siempre en `OrdenGuardia.contenidoJson`. */
export interface PersonaResumen {
  bomberoId: string;
  nombreCompleto: string;
  rango: string | null;
}

export interface OrdenGuardiaSnapshot {
  numero: number;
  anio: number;
  numeroFormateado: string;
  mes: number;
  nombreMes: string;
  periodoDesde: string;
  periodoHasta: string;
  fechaEmision: string;
  generadoEn: string;

  institucional: {
    textoHeader: string;
    logoIzquierdaUrl: string | null;
    logoDerechaUrl: string | null;
  };

  introduccion: {
    textoRenderizado: string;
    reglaOficialTexto: string;
    reglaChoferTexto: string;
  };

  gruposRotativos: Array<{
    grupoId: string;
    nombre: string;
    diaSemana: string | null;
    oficialACargo: PersonaResumen | null;
    chofer: PersonaResumen | null;
    integrantes: Array<PersonaResumen & { rolGrupo: string }>;
    fechasDelPeriodo: string[];
  }>;

  rostersIndividuales: Array<{
    esquemaId: string;
    esquemaNombre: string;
    horaInicio: string;
    horaFin: string;
    diasSemanaCsv: string | null;
    fechas: Array<{
      fecha: string;
      diaSemana: string;
      asignaciones: Array<PersonaResumen & { rol: string | null }>;
    }>;
  }>;

  guardiasEspeciales: Array<{
    esquemaId: string;
    modalidadTexto: string;
    ocurrencias: Array<{ fecha: string; asignaciones: PersonaResumen[] }>;
  }>;

  conductoresDisponibles: Array<PersonaResumen & { telefono: string | null }>;

  piePagina: { texto: string };

  firmantes: Array<{
    cargoId: string | null;
    etiquetaCargo: string;
    bomberoId: string | null;
    nombreCompleto: string | null;
    rango: string | null;
    selloUrl: string | null;
  }>;
}
