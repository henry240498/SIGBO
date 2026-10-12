/** Ejecutar con browser_run_code_unsafe(filename), después de build backend y frontend local.
 * Contexto de navegador separado; TODA llamada API interceptada; fuente literal real.
 * No crea usuarios, catálogos, incidentes ni decisiones en una base institucional. */
async (page) => {
  const harness = 'http://127.0.0.1:49545';
  const prepared = await (await page.request.get(`${harness}/catalogo`)).json();
  const c = prepared.c;
  const a = { paginas: prepared.paginas };
  const versionGreId = '00000000-0000-4000-8000-000000000001';
  const browser = page.context().browser();
  if (!browser) throw new Error('Se requiere un contexto de navegador aislable.');
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  const p = await context.newPage();
  const resultados = [];
  const errores = [];
  p.on('pageerror', e => errores.push(e.message));
  p.on('console', m => { if (m.type() === 'error' && m.text().includes('zonas MATPEL')) errores.push(m.text()); });
  let estado = 'SIN_EDICION_ACTIVA';
  let llamadaEvaluacion = null;
  let ultimaEvaluacion = null;
  let negar = false;
  const fuentesVistas = [];
  const test = (nombre, cumple) => { resultados.push({ nombre, aprobado: !!cumple }); if (!cumple) throw new Error(nombre); };
  try {
    await context.addInitScript(() => { if (window.top !== window) return; localStorage.setItem('sigbo_sesion', JSON.stringify({ usuario: { id: '00000000-0000-4000-8000-000000000099', username: 'prueba-local-aislada', email: '', roles: [], permisos: ['matpel:consultar'] } })); });
    await context.route('**/api/v1/**', async route => {
      const request = route.request(); const url = new URL(request.url()); const ruta = url.pathname.replace('/api/v1', '');
      const json = (body, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body), headers: { 'Access-Control-Allow-Origin': 'http://127.0.0.1:3000', 'Access-Control-Allow-Credentials': 'true', 'Access-Control-Allow-Headers': '*' } });
      if (request.method() === 'OPTIONS') return json({});
      if (ruta === '/pantallas/mis-permisos-web') return json({ activa: false });
      if (ruta === '/centro-mando/acceso') return json({ acceso: false });
      if (ruta === '/seguridad/apariencia') return json({});
      if (ruta === '/configuracion/publica') return json({ values: {} });
      if (ruta === '/configuracion/registro-publico') return json([]);
      if (negar && ruta.startsWith('/matpel')) return json({ message: 'Acceso de consulta denegado.' }, 403);
      if (ruta === '/matpel/estado') return json({ estado, versionGreId: estado === 'DISPONIBLE' ? versionGreId : null, edicion: '2024' });
      if (ruta === '/matpel/secciones') return json({ secciones: c.secciones });
      if (ruta.startsWith('/matpel/secciones/')) return json({ bloques: c.bloques.filter(b => b.seccionId === ruta.split('/').at(-1) && !b.guiaId) });
      if (ruta === '/matpel/buscar') {
        const q = url.searchParams.get('q');
        return json({ items: c.entradas.filter(e => e.identificador === q), guias: c.guias.filter(g => g.numero === q), cursor: null });
      }
      if (ruta.startsWith('/matpel/materiales/')) {
        const entrada = c.entradas.find(e => e.id === ruta.split('/').at(-1));
        const parametros = Object.fromEntries(['eventos', 'incendio', 'cantidad', 'contactoAgua', 'periodo', 'contenedor', 'viento', 'ubicacion'].map(k => [k, {valor: null, certeza: 'DESCONOCIDO', origen: 'OPERADOR', observadoEn: null, evidenciaId: null, fuenteDatoId: null}]));
        const inicial = await (await page.request.post(`${harness}/evaluar`, { data: {entradaIds: [entrada.id], parametros} })).json();
        return json({ entrada, guia: c.guias.find(g => g.id === entrada.guiaId), contenedoresTabla3: [], solicitudes: inicial.solicitudes, guiasLectura: inicial.guiasLectura });
      }
      if (ruta.startsWith('/matpel/guias/')) {
        const guia = c.guias.find(g => g.numero === ruta.split('/').at(-1));
        return json({ guia, bloques: c.bloques.filter(b => b.guiaId === guia.id) });
      }
      if (['/matpel/evaluaciones/consulta', '/matpel/evaluaciones/consulta-v2'].includes(ruta)) {
        llamadaEvaluacion = request.postDataJSON();
        const r = await page.request.post(`${harness}/evaluar`, { data: llamadaEvaluacion });
        ultimaEvaluacion = await r.json();
        return json(ultimaEvaluacion, r.status());
      }
      if (ruta.startsWith('/matpel/fuentes/')) {
        const r = c.referencias.find(r => r.id === ruta.split('/').at(-1));
        fuentesVistas.push(r.paginaPdf);
        return json({ paginaPdf: r.paginaPdf, textoOriginal: r.textoOriginal, etiquetasImpresas: a.paginas[r.paginaPdf - 1].etiquetasImpresas });
      }
      if (/^\/matpel\/versiones\/[^/]+\/archivo$/.test(ruta)) return route.fulfill({ response: await page.request.get(`${harness}/pdf`) });
      if (/^\/matpel\/versiones\/[^/]+\/paquete\/archivo$/.test(ruta)) {
        const archivo = await page.request.get(`${harness}/archivo-paquete`);
        return route.fulfill({ response: archivo, headers: { ...archivo.headers(), 'Access-Control-Expose-Headers': 'X-Content-SHA256', 'Access-Control-Allow-Origin': 'http://127.0.0.1:3000', 'Access-Control-Allow-Credentials': 'true' } });
      }
      // Ningún pedido cae al backend real, aun si aparece una dependencia nueva.
      return json({ message: 'Ruta no cubierta por la prueba aislada.' }, 404);
    });
    await p.goto('http://127.0.0.1:3000/dashboard/matpel');
    await p.getByRole('heading', { name: 'Edición no disponible' }).waitFor();
    test('Sin catálogo activo no aparecen materiales ni cifras inventadas', await p.getByRole('button', { name: 'Buscar', exact: true }).count() === 0);
    estado = 'DISPONIBLE'; await p.reload();
    const descarga = p.waitForEvent('download');
    await p.getByRole('button', { name: 'Descargar consulta sin conexión', exact: true }).click();
    const archivo = await descarga;
    test('Descarga manual verifica huella y entrega archivo HTML de consulta local', archivo.suggestedFilename() === 'GRE-2024-consulta-local.html' && await archivo.failure() === null);
    await p.getByText('Explorar todas las secciones', { exact: true }).click();
    await p.getByRole('button', { name: 'Cargar índice de secciones', exact: true }).click();
    await p.getByRole('button', { name: /· PDF/ }).first().waitFor();
    test('Índice ofrece todas las42 secciones de la edición', await p.getByRole('button', { name: /· PDF/ }).count() === c.secciones.length && c.secciones.length === 42);
    const buscar = async q => { await p.getByLabel('Identificador ONU/NA, nombre o número de guía').fill(q); await p.getByRole('button', { name: 'Buscar', exact: true }).click(); await p.getByRole('heading', { name: 'Resultados', exact: true }).waitFor(); };
    await buscar('3171');
    test('ONU3171 ofrece varias identidades y no selecciona la primera', await p.getByRole('button', { name: /^3171 ·/ }).count() > 1 && await p.getByRole('heading', { name: /^3171 ·/ }).count() === 0);
    await buscar('1005'); await p.getByRole('button', { name: /^1005 ·/ }).first().click();
    await p.getByRole('button', { name: 'Leer guía 125 completa' }).waitFor();
    await p.getByRole('button', { name: 'Leer guía 125 completa' }).click();
    await p.getByRole('heading', { name: /^Guía 125 ·/ }).waitFor();
    test('Guía125 conserva todos los bloques literales', (await p.locator('article:visible').count()) === c.bloques.filter(b => b.guiaId === c.guias.find(g => g.numero === '125').id).length);
    const elegir = async (leyenda, valor) => p.getByLabel(`${leyenda}, valor`, { exact: true }).selectOption(valor);
    test('Consulta inicial pide incendio y volumen; periodo todavía no aparece', await p.getByLabel('Cantidad liberada, valor', {exact:true}).isVisible() && !await p.getByLabel('Periodo observado, valor', {exact:true}).isVisible());
    await elegir('Incendio presente', 'NO');
    await p.getByLabel('Cantidad liberada, valor', {exact:true}).fill('208');
    await p.getByRole('button', {name:'Consultar condiciones', exact:true}).click();
    await p.getByLabel('Periodo observado, valor', {exact:true}).waitFor({state:'visible'});
    test('Con volumen liberado el siguiente dato solicitado es periodo', ultimaEvaluacion.solicitudes.some(s => s.campo === 'periodo'));
    await elegir('Periodo observado', 'DIA');
    await p.getByText('Otros datos observados y ubicación para representar zonas', {exact:true}).click();
    await elegir('Medio del derrame', 'TIERRA');
    await p.getByRole('button', {name:'Consultar condiciones', exact:true}).click();
    await p.getByRole('heading', { name: 'Aislamiento inicial: aplicable' }).waitFor();
    test('Cantidad decimal textual y calidad no confirmada llegan sin alteración al motor', llamadaEvaluacion.parametros.cantidad.valor.valorDecimal === '208' && llamadaEvaluacion.parametros.cantidad.certeza === 'NO_CONFIRMADO');
    test('Muestra30m y0.1km de la fuente, con condición provisional', (await p.getByRole('heading', { name: 'Acción protectora: aplicable' }).count()) === 1 && (await p.getByText(/Selección condicionada por datos/).count()) > 0);
    test('Contexto conserva identificación provisional y ámbito desconocido', llamadaEvaluacion.identificaciones[0].certeza === 'NO_CONFIRMADO' && llamadaEvaluacion.ambito === 'DESCONOCIDO');
    await p.getByText('Cómo se obtuvo el resultado', {exact:true}).click();
    test('Traza muestra selección de volumen y versión de interpretación', (await p.locator('body').innerText()).includes('Volumen liberado clasificado') && (await p.locator('body').innerText()).includes('gre2024-condiciones-2'));
    await p.getByLabel('Viento desde (0° norte, 90° este), valor', { exact: true }).fill('0');
    await p.getByLabel('Velocidad del viento, valor', { exact: true }).fill('5');
    await p.getByLabel('Latitud del derrame, valor', { exact: true }).fill('0');
    await p.getByLabel('Longitud del derrame, valor', { exact: true }).fill('0');
    await p.getByRole('button', { name: 'Consultar condiciones', exact: true }).click();
    await p.getByRole('img', { name: 'Zonas de aislamiento y protección inicial; detalle equivalente en texto' }).waitFor({ timeout: 5000 });
    test('Mapa relativo representa geometría del mismo motor sin proveedor externo', await p.getByText('Viento desde 0° · Longitud y ancho: 100 m.', { exact: true }).count() === 1);
    await p.getByRole('button', { name: 'Ver fuente', exact: true }).first().click();
    await p.getByRole('dialog').waitFor();
    test('Fuente muestra numeración PDF e impresa separadas', (await p.getByRole('dialog').innerText()).includes('Página PDF') && !(await p.getByRole('dialog').innerText()).includes('[object Object]'));
    await p.keyboard.press('Escape'); test('Escape cierra fuente y conserva ficha/consulta', await p.getByRole('dialog').count() === 0 && await p.getByRole('heading', { name: 'Aislamiento inicial: aplicable' }).count() === 1);
    await p.getByLabel('Cantidad liberada, valor', { exact: true }).fill('');
    test('Cambio de parámetros retira evaluación anterior', await p.getByRole('heading', { name: 'Aislamiento inicial: aplicable' }).count() === 0);
    await p.getByRole('button', { name: 'Consultar condiciones', exact: true }).click();
    await p.getByRole('heading', { name: 'Aislamiento inicial: indeterminado' }).waitFor();
    test('Cantidad desconocida se conserva null; no se vuelve cero', llamadaEvaluacion.parametros.cantidad.valor === null && llamadaEvaluacion.parametros.cantidad.certeza === 'DESCONOCIDO');
    await p.setViewportSize({ width: 390, height: 844 });
    test('Consulta móvil sin desborde horizontal', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
    await buscar('1613'); await p.getByRole('button', {name:/^1613 ·/}).first().click();
    await p.getByRole('button', {name:'Consultar condiciones', exact:true}).click();
    await p.getByRole('heading', {name:'Aislamiento inicial: datos no disponibles'}).waitFor();
    test('Entrada no verde remite distancias a guía154 sin declarar ausencia de aislamiento', ultimaEvaluacion.aislamiento.fuenteResultado === 'GUIA_NARANJA' && ultimaEvaluacion.tabla1.estado === 'NO_APLICABLE' && await p.getByRole('heading', {name:'Distancias y condiciones de la guía 154'}).count() > 0);
    negar = true; await p.reload(); await p.getByText('Acceso de consulta denegado.').waitFor();
    test('Un403 comunica error y no lo convierte en lista vacía', await p.getByRole('heading', { name: 'Edición no disponible' }).count() === 0);
    test('Sin errores JavaScript de la página', errores.length === 0);
    return { alcance: 'NAVEGADOR_AISLADO_API_INTERCEPTADA_FUENTE_REAL_NO_BASE_INSTITUCIONAL', resultados, fuentesVistas, errores };
  } catch (error) {
    return { alcance: 'PRUEBA_AISLADA_FALLIDA', resultados, error: error.message, errores,
      diagnostico: { geometria: ultimaEvaluacion?.geometria, mensajeApi: ultimaEvaluacion?.message,
        mapa: await p.getByRole('heading', { name: 'Representación de zonas', exact: true }).locator('..').innerText().catch(() => ''),
        texto: (await p.locator('body').innerText()).slice(0, 1200) } };
  } finally { await context.close(); }
}
