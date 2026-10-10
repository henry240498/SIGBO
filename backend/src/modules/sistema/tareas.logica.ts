/**
 * Tareas programadas de Windows que mantienen SIGBO. Se consultan con un script FIJO de
 * PowerShell (sin ningun dato del cliente) y se ejecutan solo por nombre de una lista cerrada.
 */

export const TAREAS_WINDOWS = ['SIGBO-Respaldo-Diario', 'SIGBO-Arranque-Automatico'] as const;
export type NombreTarea = (typeof TAREAS_WINDOWS)[number];

export const SCRIPT_CONSULTA_TAREAS = [
  "$ErrorActionPreference = 'Stop'",
  '$salida = @()',
  `foreach ($n in @(${TAREAS_WINDOWS.map((t) => `'${t}'`).join(', ')})) {`,
  '  $t = Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue',
  '  if ($t) {',
  '    $i = $t | Get-ScheduledTaskInfo',
  '    $salida += [pscustomobject]@{ nombre = $n; existe = $true; estado = [string]$t.State; ultimaEjecucion = $i.LastRunTime; ultimoResultado = $i.LastTaskResult; proximaEjecucion = $i.NextRunTime }',
  '  } else {',
  '    $salida += [pscustomobject]@{ nombre = $n; existe = $false }',
  '  }',
  '}',
  'ConvertTo-Json -InputObject $salida -Compress -Depth 3',
].join('\n');

/** Lista blanca en runtime: el tipo TS no impide interpolar un texto cualquiera en PowerShell. */
export function esTareaWindows(x: unknown): x is NombreTarea {
  return typeof x === 'string' && (TAREAS_WINDOWS as readonly string[]).includes(x);
}

export function scriptIniciarTarea(nombre: NombreTarea): string {
  if (!esTareaWindows(nombre)) throw new Error('Tarea no permitida');
  return `Start-ScheduledTask -TaskName '${nombre}'`;
}

export interface TareaProgramada {
  nombre: string;
  existe: boolean;
  estado: 'LISTA' | 'EN_EJECUCION' | 'DESHABILITADA' | 'DESCONOCIDO' | null;
  ultimaEjecucion: string | null;
  ultimoResultado: number | null;
  descripcionResultado: string | null;
  proximaEjecucion: string | null;
}

const ESTADOS: Record<string, TareaProgramada['estado']> = { Ready: 'LISTA', Running: 'EN_EJECUCION', Queued: 'EN_EJECUCION', Disabled: 'DESHABILITADA' };

/** PowerShell 5.1 serializa las fechas como "/Date(ms)/"; antes de 2000 significa "nunca". */
function fechaPs(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = v.match(/\/Date\((-?\d+)\)\//);
  const d = m ? new Date(Number(m[1])) : new Date(v);
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000) return null;
  return d.toISOString();
}

export function describirResultado(codigo: number | null): string | null {
  if (codigo === null) return null;
  if (codigo === 0) return 'Correcto';
  if (codigo === 267009) return 'En ejecución';
  if (codigo === 267011) return 'Nunca se ejecutó';
  if (codigo === 267014) return 'Detenida por el usuario';
  return `Código ${codigo} (0x${(codigo >>> 0).toString(16).toUpperCase()})`;
}

export function parsearTareas(json: string): TareaProgramada[] {
  const datos: unknown = JSON.parse(json.trim() || '[]');
  const lista = (Array.isArray(datos) ? datos : [datos]) as Array<Record<string, unknown>>;
  return lista.map((t) => {
    const existe = t.existe === true;
    const resultado = typeof t.ultimoResultado === 'number' ? t.ultimoResultado : null;
    return {
      nombre: String(t.nombre),
      existe,
      estado: existe ? ESTADOS[String(t.estado)] ?? 'DESCONOCIDO' : null,
      ultimaEjecucion: existe ? fechaPs(t.ultimaEjecucion) : null,
      ultimoResultado: existe ? resultado : null,
      descripcionResultado: existe ? describirResultado(resultado) : null,
      proximaEjecucion: existe ? fechaPs(t.proximaEjecucion) : null,
    };
  });
}
