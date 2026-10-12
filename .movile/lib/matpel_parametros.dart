/// Captura del operador para el motor único del servidor. No calcula distancias.
class CapturaMatpel {
  static const nombres = {
    'evento': 'Evento',
    'incendio': 'Incendio presente',
    'cantidad': 'Cantidad liberada',
    'agua': 'Medio del derrame',
    'periodo': 'Periodo observado',
    'contenedor': 'Tipo de recipiente publicado',
    'capacidad': 'Cantidad de referencia por recipiente',
    'numero': 'Número de recipientes',
    'viento': 'Velocidad del viento',
    'direccion': 'Viento desde (0° norte, 90° este)',
    'latitud': 'Latitud del derrame',
    'longitud': 'Longitud del derrame',
    'precision': 'Precisión de ubicación (m)',
  };
  final valores = {for (final k in nombres.keys) k: ''};
  final certezas = {for (final k in nombres.keys) k: 'NO_CONFIRMADO'};
  final unidades = {'cantidad': 'L', 'capacidad': 'L', 'viento': 'km/h'};
  String ambito = 'DESCONOCIDO';
  String observacion = '';
  String certezaIdentificacion = 'NO_CONFIRMADO';
  String metodoIdentificacion = 'MANUAL';

  Map<String, dynamic> _dato(Object? valor, String certeza) => {
        'valor': valor,
        'certeza': valor == null ? 'DESCONOCIDO' : certeza,
        'origen': 'OPERADOR',
        'observadoEn': null,
        'evidenciaId': null,
        'fuenteDatoId': null,
      };
  String? _texto(String k) {
    final v = valores[k]!.trim();
    return v.isEmpty ? null : v;
  }

  num? _numero(String k, {bool entero = false, num? min, num? max}) {
    final t = _texto(k);
    if (t == null) return null;
    final n = num.tryParse(t);
    if (!RegExp(entero ? r'^\d+$' : r'^-?\d+(\.\d+)?$').hasMatch(t) ||
        n == null ||
        !n.isFinite ||
        (min != null && n < min) ||
        (max != null && n > max)) {
      throw FormatException(
          'Valor inválido: ${nombres[k]}. Usar punto decimal y comprobar el rango.');
    }
    return entero ? n.toInt() : n;
  }

  String? _decimal(String k) {
    final t = _texto(k);
    if (t != null && (t.length > 80 || !RegExp(r'^\d+(\.\d+)?$').hasMatch(t))) {
      throw FormatException(
          'Valor inválido: ${nombres[k]}. Usar punto decimal y un valor no negativo.');
    }
    return t;
  }

  String _menorCerteza(List<String> campos) {
    const orden = ['NO_CONFIRMADO', 'ESTIMADO', 'CONFIRMADO'];
    final cs = campos
        .where((k) => _texto(k) != null)
        .map((k) => certezas[k]!)
        .toList()
      ..sort((a, b) => orden.indexOf(a).compareTo(orden.indexOf(b)));
    return cs.isEmpty ? 'NO_CONFIRMADO' : cs.first;
  }

  Map<String, dynamic> consulta(String version, String? entradaId) {
    if ((_texto('latitud') == null) != (_texto('longitud') == null)) {
      throw const FormatException(
          'Completar latitud y longitud del derrame, o dejar ambas desconocidas.');
    }
    if (_texto('precision') != null && _texto('latitud') == null) {
      throw const FormatException(
          'La precisión requiere una ubicación del derrame.');
    }
    if (_texto('evento') == 'INCENDIO' && _texto('incendio') == 'NO') {
      throw const FormatException(
          'El evento y la presencia de incendio son contradictorios.');
    }
    Object? cantidad(String k) => _decimal(k) == null
        ? null
        : {
            'valorDecimal': _decimal(k),
            'unidad': unidades[k],
          };
    final velocidad = _decimal('viento');
    final direccion = _numero('direccion', min: 0);
    if (direccion != null && direccion >= 360) {
      throw const FormatException(
          'La dirección del viento debe ser menor que 360° y no negativa.');
    }
    final lat = _numero('latitud', min: -90, max: 90);
    final lon = _numero('longitud', min: -180, max: 180);
    final precision = _numero('precision', min: 0);
    return {
      'versionGreId': version,
      'entradaIds': [if (entradaId != null) entradaId],
      'ambito': ambito,
      'identificaciones': [
        if (entradaId != null)
          {
            'entradaId': entradaId,
            'observacionOriginal':
                observacion.trim().isEmpty ? null : observacion.trim(),
            'certeza': certezaIdentificacion,
            'metodo': metodoIdentificacion,
            'observadoEn': null,
            'evidenciaId': null,
          }
      ],
      'parametros': {
        'eventos': _dato(_texto('evento') == null ? null : [_texto('evento')],
            certezas['evento']!),
        'incendio': _dato(
            _texto('incendio') == null ? null : _texto('incendio') == 'SI',
            certezas['incendio']!),
        'cantidad': _dato(cantidad('cantidad'), certezas['cantidad']!),
        'contactoAgua': _dato(_texto('agua'), certezas['agua']!),
        'periodo': _dato(_texto('periodo'), certezas['periodo']!),
        'contenedor': _dato(_texto('contenedor'), certezas['contenedor']!),
        'cantidadContenedor':
            _dato(cantidad('capacidad'), certezas['capacidad']!),
        'numeroContenedores': _dato(
            _numero('numero', entero: true, min: 1, max: 100000),
            certezas['numero']!),
        'viento': _dato(
            velocidad == null && direccion == null
                ? null
                : {
                    'velocidadDecimal': velocidad,
                    'unidad': velocidad == null ? null : unidades['viento'],
                    'direccionDesdeGrados': direccion,
                    'proveedorId': null,
                  },
            _menorCerteza(['viento', 'direccion'])),
        'ubicacion': _dato(
            lat == null
                ? null
                : {
                    'latitud': lat,
                    'longitud': lon,
                    'precisionM': precision,
                  },
            _menorCerteza(['latitud', 'longitud', 'precision'])),
      },
    };
  }
}
