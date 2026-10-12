package org.cbvc.sigbo

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.Matrix
import android.os.Handler
import android.os.Looper
import androidx.exifinterface.media.ExifInterface
import com.googlecode.tesseract.android.TessBaseAPI
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import java.io.File
import java.security.MessageDigest
import java.util.concurrent.Executors
import java.util.concurrent.atomic.AtomicBoolean

/** Reconocimiento local transitorio. No sube fotos, crea adjuntos ni identifica una sustancia. */
class OcrGreLocal(private val context: Context) : MethodChannel.MethodCallHandler {
    private val worker = Executors.newSingleThreadExecutor()
    private val main = Handler(Looper.getMainLooper())
    private val busy = AtomicBoolean(false)

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        if (call.method != "reconocer") { result.notImplemented(); return }
        val path = call.argument<String>("ruta")
        if (path == null) { result.error("OCR_GRE", "Foto ausente.", null); return }
        if (!busy.compareAndSet(false, true)) { result.error("OCR_GRE", "Ya hay una foto en reconocimiento.", null); return }
        worker.execute {
            var bitmap: Bitmap? = null
            var tess: TessBaseAPI? = null
            try {
                val file = File(path).canonicalFile
                val parents = listOf(context.cacheDir.canonicalFile, context.filesDir.canonicalFile)
                if (parents.none { file.path.startsWith(it.path + File.separator) } || !file.isFile || file.length() > 15_000_000)
                    error("Foto inválida o demasiado grande.")
                val base = File(context.filesDir, "gre-ocr")
                val data = File(base, "tessdata").apply { mkdirs() }
                for (language in listOf("eng", "spa")) {
                    val name = "$language.traineddata"
                    val source = context.assets.open("ocr/$name").use { it.readBytes() }
                    val target = File(data, name)
                    val hash = { bytes: ByteArray -> MessageDigest.getInstance("SHA-256").digest(bytes).toList() }
                    if (!target.exists() || hash(target.readBytes()) != hash(source)) target.writeBytes(source)
                }
                val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
                BitmapFactory.decodeFile(file.path, bounds)
                if (bounds.outWidth <= 0 || bounds.outHeight <= 0) error("No se pudo leer la foto.")
                var sample = 1
                while (bounds.outWidth / sample > 2400 || bounds.outHeight / sample > 2400) sample *= 2
                bitmap = BitmapFactory.decodeFile(file.path, BitmapFactory.Options().apply { inSampleSize = sample })
                    ?: error("Foto no admitida.")
                val exif = ExifInterface(file.path)
                val matrix = Matrix().apply {
                    when (exif.getAttributeInt(ExifInterface.TAG_ORIENTATION, ExifInterface.ORIENTATION_NORMAL)) {
                        ExifInterface.ORIENTATION_ROTATE_90 -> postRotate(90f)
                        ExifInterface.ORIENTATION_ROTATE_180 -> postRotate(180f)
                        ExifInterface.ORIENTATION_ROTATE_270 -> postRotate(270f)
                        ExifInterface.ORIENTATION_FLIP_HORIZONTAL -> postScale(-1f, 1f)
                        ExifInterface.ORIENTATION_FLIP_VERTICAL -> postScale(1f, -1f)
                        ExifInterface.ORIENTATION_TRANSPOSE -> { postRotate(90f); postScale(-1f, 1f) }
                        ExifInterface.ORIENTATION_TRANSVERSE -> { postRotate(270f); postScale(-1f, 1f) }
                    }
                }
                if (!matrix.isIdentity) {
                    val rotated = Bitmap.createBitmap(bitmap!!, 0, 0, bitmap!!.width, bitmap!!.height, matrix, true)
                    if (rotated !== bitmap) bitmap!!.recycle()
                    bitmap = rotated
                }
                tess = TessBaseAPI()
                if (!tess!!.init(base.path, "eng+spa", TessBaseAPI.OEM_LSTM_ONLY)) error("No se pudo iniciar el reconocimiento local.")
                tess!!.setPageSegMode(TessBaseAPI.PageSegMode.PSM_SPARSE_TEXT)
                tess!!.setImage(bitmap!!)
                val text = tess!!.getUTF8Text() ?: ""
                if (text.length > 32000) error("Demasiado texto. Acercá la cámara a la placa.")
                val confidence = tess!!.meanConfidence()
                main.post { result.success(mapOf("textoOriginal" to text, "confianzaMotor" to confidence,
                    "certeza" to "NO_CONFIRMADO", "motor" to "TESSERACT_5_LOCAL", "subido" to false)) }
            } catch (e: Throwable) {
                main.post { result.error("OCR_GRE", "No se pudo leer el texto de la foto. Probá una imagen nítida o ingresá el identificador manualmente.", null) }
            } finally {
                tess?.recycle()
                bitmap?.recycle()
                busy.set(false)
            }
        }
    }

    fun close() { worker.shutdown() }
}
