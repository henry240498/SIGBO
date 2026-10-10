import type { NetworkInterfaceInfo } from 'os';

/** Adaptadores que no son la red del cuartel (Docker, WSL, VPN...). */
const VIRTUALES = /vethernet|wsl|vmware|virtualbox|hyper-v|docker|loopback|tailscale|zerotier|vpn|bluetooth/i;
const esPrivada = (ip: string) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
const PRIORIDAD = /wi-?fi|wlan|ethernet|eth|en\d/i;

export interface DireccionRed { nombre: string; ip: string; virtual: boolean }

/** Direcciones IPv4 privadas, reales primero (Wi-Fi/Ethernet); las virtuales solo si no hay otras. */
export function direccionesDeRed(interfaces: NodeJS.Dict<NetworkInterfaceInfo[]>): DireccionRed[] {
  const todas: DireccionRed[] = [];
  for (const [nombre, lista] of Object.entries(interfaces)) {
    for (const i of lista ?? []) {
      const ipv4 = i.family === 'IPv4' || (i.family as unknown) === 4;
      if (ipv4 && !i.internal && esPrivada(i.address)) todas.push({ nombre, ip: i.address, virtual: VIRTUALES.test(nombre) });
    }
  }
  const reales = todas.filter((d) => !d.virtual);
  return (reales.length ? reales : todas).sort((a, b) => Number(PRIORIDAD.test(b.nombre)) - Number(PRIORIDAD.test(a.nombre)));
}

/** El mismo formato que lee la app (lib/conexion.dart: contenidoQrServidor). */
export const contenidoQrConexion = (urlApi: string) => `sigbo://servidor?url=${encodeURIComponent(urlApi)}`;
