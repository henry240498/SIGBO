import { FindOperator } from 'typeorm';

/**
 * Base de datos en memoria para pruebas unitarias: imita la parte de la API de
 * TypeORM (DataSource.getRepository / EntityManager) que usan los servicios,
 * sin necesitar SQL Server. Igual que el resto de las pruebas del backend.
 */
type Clase = { new (): object; name: string };
export type Fila = Record<string, unknown>;

export class BaseFalsa {
  tablas = new Map<string, Fila[]>();
  /**
   * Con `copias`, lo que se lee es una copia: igual que una base real, quien leyo no ve los
   * cambios que otro hizo despues. Hace falta para probar concurrencia optimista.
   * Por defecto se devuelve la propia fila (lo que esperan las pruebas que ya existian).
   */
  constructor(private readonly opciones: { copias?: boolean } = {}) {}

  private secuencia = 0;
  /** Reloj de prueba: cada insercion avanza un segundo (orden estable por creadoEn). */
  private reloj = Date.parse('2026-01-01T00:00:00Z');

  tabla(nombre: string) {
    if (!this.tablas.has(nombre)) this.tablas.set(nombre, []);
    return this.tablas.get(nombre)!;
  }

  private coincide(fila: Fila, where: Fila | Fila[] = {}) {
    const condiciones = Array.isArray(where) ? where : [where];
    return condiciones.some((c) => Object.entries(c).every(([k, v]) => this.cumple(fila[k], v)));
  }

  /** Igualdad, o los operadores de TypeORM mas usados (Between, In, comparaciones). */
  private cumple(actual: unknown, esperado: unknown): boolean {
    if (!(esperado instanceof FindOperator)) return actual === esperado;
    const a = this.valor(actual) as number | string;
    const v = esperado.value as unknown;
    switch (esperado.type) {
      case 'between': {
        const [min, max] = v as [unknown, unknown];
        return a >= (this.valor(min) as number | string) && a <= (this.valor(max) as number | string);
      }
      case 'in':
        return (v as unknown[]).includes(actual);
      case 'lessThan':
        return a < (this.valor(v) as number | string);
      case 'lessThanOrEqual':
        return a <= (this.valor(v) as number | string);
      case 'moreThan':
        return a > (this.valor(v) as number | string);
      case 'moreThanOrEqual':
        return a >= (this.valor(v) as number | string);
      case 'isNull':
        return actual === null || actual === undefined;
      default:
        throw new Error(`Operador no soportado por BaseFalsa: ${esperado.type}`);
    }
  }

  private valor(v: unknown) {
    return v instanceof Date ? v.getTime() : v;
  }

  /** Misma interfaz que DataSource.transaction: aqui todo es secuencial, asi que el "manager" es la propia base. */
  transaction = async <T>(cb: (m: BaseFalsa) => Promise<T>): Promise<T> => cb(this);

  get manager() {
    return this;
  }

  private leida(clase: Clase, f: Fila) {
    return this.opciones.copias ? Object.assign(new clase(), f) : f;
  }

  getRepository = (clase: Clase) => ({
    create: (d: Fila) => Object.assign(new clase(), d),
    findOne: async ({ where }: { where: Fila | Fila[] }) => {
      const f = this.tabla(clase.name).find((x) => this.coincide(x, where));
      return f ? this.leida(clase, f) : null;
    },
    find: async (o: { where?: Fila | Fila[]; order?: Record<string, 'ASC' | 'DESC'>; take?: number } = {}) => {
      let filas = this.tabla(clase.name).filter((f) => this.coincide(f, o.where));
      const [campo, sentido] = Object.entries(o.order ?? {})[0] ?? [];
      if (campo) {
        const signo = sentido === 'DESC' ? -1 : 1;
        filas = [...filas].sort((a, b) => {
          const x = this.valor(a[campo]) as number | string;
          const y = this.valor(b[campo]) as number | string;
          return (x < y ? -1 : x > y ? 1 : 0) * signo;
        });
      }
      return (o.take ? filas.slice(0, o.take) : [...filas]).map((f) => this.leida(clase, f));
    },
    save: async (e: Fila) => {
      const tabla = this.tabla(clase.name);
      if (!e.id) e.id = `id-${++this.secuencia}`;
      if (e.creadoEn === undefined) e.creadoEn = new Date((this.reloj += 1000));
      if (this.opciones.copias) {
        const i = tabla.findIndex((f) => f.id === e.id);
        const guardada = Object.assign(new clase(), e);
        if (i >= 0) tabla[i] = guardada;
        else tabla.push(guardada);
        return e;
      }
      if (!tabla.includes(e)) tabla.push(e);
      return e;
    },
    findOneByOrFail: async (where: Fila) => {
      const f = this.tabla(clase.name).find((x) => this.coincide(x, where));
      if (!f) throw new Error(`No se encontro ${clase.name}`);
      return this.leida(clase, f);
    },
    /** Como Repository.update: aplica `cambios` a las filas que cumplen `where` y dice cuantas fueron. */
    update: async (where: Fila, cambios: Fila) => {
      const filas = this.tabla(clase.name).filter((f) => this.coincide(f, where));
      for (const f of filas) Object.assign(f, cambios);
      return { affected: filas.length };
    },
    delete: async (where: Fila) => {
      const tabla = this.tabla(clase.name);
      const quedan = tabla.filter((f) => !this.coincide(f, where));
      const affected = tabla.length - quedan.length;
      tabla.splice(0, tabla.length, ...quedan);
      return { affected };
    },
  });
}
