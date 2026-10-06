import 'api.dart';
import 'models.dart';
import 'notifier.dart';
import 'store.dart';

/// Convocatorias del cuartel: se consultan junto con las alertas (primer plano,
/// monitoreo y sondeo de respaldo) y se avisa UNA sola vez por cada una.
class Convocatorias {
  /// Devuelve las abiertas y notifica las que este celular todavia no conocia.
  /// Sin permiso (403) o sin red devuelve lista vacia: nunca interrumpe el sondeo.
  static Future<List<ConvocatoriaApp>> revisarYAvisar() async {
    try {
      if (!await TokenStore.haySesion()) return [];
      final abiertas = await SigboApi().convocatoriasAbiertas();
      final vistas = await Prefs.convocatoriasVistas();
      final nuevas = abiertas
          .where((c) => !vistas.contains(c.id) && c.miRespuesta == null)
          .toList();
      for (final c in nuevas) {
        await AlertaNotifier.notificarConvocatoria(c);
      }
      if (nuevas.isNotEmpty) {
        await Prefs.setConvocatoriasVistas(
            [...vistas, ...nuevas.map((c) => c.id)]);
      }
      return abiertas;
    } catch (_) {
      return [];
    }
  }
}
