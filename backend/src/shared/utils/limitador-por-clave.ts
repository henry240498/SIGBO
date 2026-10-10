/**
 * "Una vez cada N minutos por clave": para anotar en auditoría algo que se repite en
 * ciclo (pantallas que se actualizan solas) sin llenar la tabla. Se pregunta con
 * debeRegistrar() y se marca con marcar() DESPUÉS de que la escritura salió bien: si falla,
 * el próximo intento vuelve a anotar. Vive en memoria y se reinicia con el proceso.
 */
export class LimitadorPorClave {
  private readonly ultimas = new Map<string, number>();

  constructor(private readonly ventanaMs: number) {}

  debeRegistrar(clave: string, ahora: Date | number = Date.now()): boolean {
    const previa = this.ultimas.get(clave);
    return previa === undefined || instante(ahora) - previa >= this.ventanaMs;
  }

  marcar(clave: string, ahora: Date | number = Date.now()): void {
    this.ultimas.set(clave, instante(ahora));
  }
}

const instante = (t: Date | number) => (t instanceof Date ? t.getTime() : t);
