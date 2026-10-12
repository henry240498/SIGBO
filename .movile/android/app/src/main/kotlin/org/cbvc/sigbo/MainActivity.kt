package org.cbvc.sigbo

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    private var motorGre: MotorGreLocal? = null
    private var ocrGre: OcrGreLocal? = null

    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        motorGre = MotorGreLocal(this)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "org.cbvc.sigbo/gre-local")
            .setMethodCallHandler(motorGre)
        ocrGre = OcrGreLocal(this)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "org.cbvc.sigbo/gre-ocr")
            .setMethodCallHandler(ocrGre)
    }

    override fun onDestroy() {
        motorGre?.close()
        ocrGre?.close()
        super.onDestroy()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // La pantalla de alerta debe verse sobre el bloqueo y encender la
        // pantalla (aviso de emergencia). Se aplica a la actividad unica.
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            setShowWhenLocked(true)
            setTurnScreenOn(true)
        } else {
            @Suppress("DEPRECATION")
            window.addFlags(
                WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED or
                    WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
            )
        }
    }
}
