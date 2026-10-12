/** Archivos temporales reales; abrir desde disco con el navegador desconectado desde el inicio. */
async (page) => {
  const browser = page.context().browser();
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.setOffline(true);
  const p = await context.newPage();
  const resultados = [], errores = [], peticionesExternas = [];
  p.on('pageerror', e => errores.push(e.message));
  p.on('request', r => { if (/^https?:/.test(r.url())) peticionesExternas.push(r.url()); });
  const test = (nombre, cumple) => { resultados.push({ nombre, aprobado: !!cumple }); if (!cumple) throw new Error(nombre); };
  const base = 'file:///C:/Users/jemc2/AppData/Local/Temp/sigbo-matpel-motor-v2y7_3du/';
  try {
    await p.goto(base + 'prueba-gre-completa.html');
    await p.getByText(/^Integridad comprobada/).waitFor({ timeout: 30000 });
    test('Primera apertura desde disco sin red verifica hashes del catálogo completo y PDF original', await p.locator('#consulta').isVisible());
    const buscar = async q => { await p.getByLabel('Identificador ONU/NA, nombre o guía').fill(q); await p.getByRole('button', { name: 'Buscar', exact: true }).click(); };
    await buscar('3171');
    test('Varias identidades de ONU3171 exigen selección explícita', await p.locator('#resultados button').filter({ hasText: /^3171 ·/ }).count() > 1 && await p.locator('#ficha').isHidden());
    await buscar('1005'); await p.locator('#resultados button').filter({ hasText: /^1005 ·/ }).first().click();
    await p.getByRole('button', { name: 'Leer guía 125 completa' }).click();
    const conteo = await p.evaluate(() => { const paquete = JSON.parse(document.getElementById('datos').textContent); const c = JSON.parse(paquete.catalogoJson); return c.bloques.filter(b => b.guiaId === c.guias.find(g => g.numero === '125').id).length; });
    test('Guía125 conserva todos los bloques de la edición, sin conexión', await p.locator('#contenido article').count() === conteo && conteo > 0);
    test('Tabla documental conserva unidades originales y exige lectura manual', (await p.locator('#ficha').innerText()).includes('no hay selección automática de distancia') && await p.locator('#ficha details').count() > 0);
    await p.getByRole('button', { name: 'Ver fuente del nombre' }).click();
    test('PDF incluido se abre con etiquetas PDF e impresa separadas', await p.locator('#fuente').isVisible() && (await p.locator('#pagina').innerText()).includes('Página impresa:') && (await p.locator('#visor').getAttribute('src')).startsWith('blob:'));
    await p.getByRole('button', { name: 'Cerrar y volver' }).click();
    await p.getByRole('button', { name: 'Secciones', exact: true }).click();
    test('Todas las42 secciones están accesibles en la consulta local', await p.locator('#contenido li').count() === 42);
    test('Vista de390px sin desborde horizontal', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    test('No se solicitan recursos externos', peticionesExternas.length === 0);
    await p.goto(base + 'prueba-gre-catalogo-alterado.html');
    await p.getByText('El catálogo descargado perdió integridad.', { exact: true }).waitFor();
    test('Catálogo alterado queda bloqueado antes de consultar', await p.locator('#consulta').isHidden());
    await p.goto(base + 'prueba-gre-pdf-alterado.html');
    await p.getByText('El PDF descargado perdió integridad.', { exact: true }).waitFor();
    test('PDF alterado queda bloqueado antes de consultar', await p.locator('#consulta').isHidden());
    test('Sin errores JavaScript', errores.length === 0);
    return { alcance: 'NAVEGADOR_DESDE_DISCO_OFFLINE_DESDE_INICIO_CANDIDATO_REAL_COMPLETO_NO_ACTIVACION_INSTITUCIONAL', resultados, errores, peticionesExternas };
  } catch (error) { return { alcance: 'PRUEBA_OFFLINE_FALLIDA', resultados, error: error.message, errores, peticionesExternas, estado: await p.locator('#estado').innerText().catch(() => '') }; }
  finally { await context.close(); }
}
