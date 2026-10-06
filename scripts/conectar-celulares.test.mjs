import assert from 'node:assert/strict';
import { test } from 'node:test';
import { contenidoQr, direccionesDeLaPc } from './conectar-celulares.mjs';

const nic = (address, family = 'IPv4', internal = false) => ({ address, family, internal });

test('el contenido del QR tiene el formato exacto que lee la app (ver test/conexion_test.dart)', () => {
  assert.equal(contenidoQr('http://192.168.100.18:3001/api/v1'), 'sigbo://servidor?url=http%3A%2F%2F192.168.100.18%3A3001%2Fapi%2Fv1');
});

test('descarta redes virtuales, loopback, IPv6 y direcciones no privadas', () => {
  const r = direccionesDeLaPc({
    'vEthernet (WSL (Hyper-V firewall))': [nic('172.27.128.1')],
    'Loopback Pseudo-Interface 1': [nic('127.0.0.1', 'IPv4', true)],
    'Wi-Fi': [nic('192.168.100.18'), nic('fe80::1', 'IPv6')],
    'Ethernet 2': [nic('8.8.8.8')],
  });
  assert.deepEqual(r.map((d) => d.ip), ['192.168.100.18']);
});

test('prefiere el Wi-Fi o el cable sobre otras interfaces', () => {
  const r = direccionesDeLaPc({ 'Otra red': [nic('10.0.0.5')], 'Wi-Fi': [nic('192.168.1.20')] });
  assert.equal(r[0].ip, '192.168.1.20');
});

test('si solo hay interfaces virtuales las ofrece igual (mejor que nada)', () => {
  const r = direccionesDeLaPc({ 'vEthernet (Docker)': [nic('172.20.0.1')] });
  assert.deepEqual(r.map((d) => d.ip), ['172.20.0.1']);
});

test('sin red devuelve una lista vacia', () => {
  assert.deepEqual(direccionesDeLaPc({}), []);
});

test('reconoce los rangos privados 10.x, 192.168.x y 172.16-31.x', () => {
  const ips = ['10.1.2.3', '192.168.0.9', '172.16.0.1', '172.31.255.1', '172.32.0.1', '172.15.0.1', '100.64.0.1'];
  const r = direccionesDeLaPc({ 'Wi-Fi': ips.map((i) => nic(i)) });
  assert.deepEqual(r.map((d) => d.ip).sort(), ['10.1.2.3', '172.16.0.1', '172.31.255.1', '192.168.0.9']);
});
