package org.cbvc.sigbo

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebResourceRequest
import android.webkit.WebResourceResponse
import android.webkit.WebView
import android.webkit.WebViewClient
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import org.json.JSONObject
import org.json.JSONTokener
import java.io.ByteArrayInputStream
import java.security.MessageDigest

/** Solo ejecuta el motor empaquetado. No navegación, red, archivos ni almacenamiento web. */
class MotorGreLocal(private val context: Context) : MethodChannel.MethodCallHandler {
    private var view: WebView? = null
    private var session: String? = null
    private val handler = Handler(Looper.getMainLooper())
    private val pending = mutableSetOf<MethodChannel.Result>()
    @Volatile private var initial = ""

    private fun sha(bytes: ByteArray) = MessageDigest.getInstance("SHA-256")
        .digest(bytes).joinToString("") { "%02x".format(it) }

    private inner class HashBridge {
        @JavascriptInterface fun sha256(text: String): String {
            require(text.length <= 50_000_000) { "Texto demasiado grande." }
            return sha(text.toByteArray(Charsets.UTF_8))
        }
        @JavascriptInterface fun leer(): String = initial
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        try {
            val id = call.argument<String>("sesion") ?: error("Sesión local inválida.")
            when (call.method) {
                "inicializar" -> {
                    if (view != null) error("Otra consulta local sigue abierta.")
                    val payload = call.argument<String>("json") ?: error("Edición ausente.")
                    if (payload.toByteArray(Charsets.UTF_8).size > 50_000_000) error("Edición demasiado grande.")
                    val script = context.assets.open("flutter_assets/assets/gre/motor.js").use { it.readBytes() }
                    val manifest = JSONObject(context.assets.open("flutter_assets/assets/gre/motor.json")
                        .bufferedReader().use { it.readText() })
                    if (sha(script) != manifest.getString("bundleSha256")) error("El motor local perdió integridad.")
                    initial = payload
                    session = id
                    val local = WebView(context)
                    view = local
                    local.settings.apply {
                        javaScriptEnabled = true
                        blockNetworkLoads = true
                        allowFileAccess = false
                        allowContentAccess = false
                        domStorageEnabled = false
                        databaseEnabled = false
                        javaScriptCanOpenWindowsAutomatically = false
                        setSupportMultipleWindows(false)
                        cacheMode = android.webkit.WebSettings.LOAD_NO_CACHE
                        @Suppress("DEPRECATION")
                        allowFileAccessFromFileURLs = false
                        @Suppress("DEPRECATION")
                        allowUniversalAccessFromFileURLs = false
                    }
                    local.addJavascriptInterface(HashBridge(), "SigboCrypto")
                    local.webViewClient = object : WebViewClient() {
                        override fun shouldOverrideUrlLoading(v: WebView, r: WebResourceRequest) = true
                        override fun shouldInterceptRequest(v: WebView, r: WebResourceRequest) =
                            WebResourceResponse("text/plain", "UTF-8", ByteArrayInputStream(ByteArray(0)))
                        override fun onPageFinished(v: WebView, url: String) {
                            if (v !== view || !pending.contains(result)) return
                            run(v, "SigboMotor.dispatch(SigboCrypto.leer())", result) { initial = "" }
                        }
                    }
                    addPending(result)
                    val safeScript = script.toString(Charsets.UTF_8).replace("</script", "<\\/script")
                    local.loadDataWithBaseURL(null,
                        "<html><head><meta http-equiv=\"Content-Security-Policy\" content=\"default-src 'none'; script-src 'unsafe-inline'\"></head><body><script>$safeScript</script></body></html>",
                        "text/html", "UTF-8", null)
                }
                "consultar" -> {
                    if (id != session) error("La consulta local ya no está abierta.")
                    val local = view ?: error("Motor local no inicializado.")
                    val payload = call.argument<String>("json") ?: error("Consulta ausente.")
                    if (payload.length > 100_000) error("Consulta demasiado grande.")
                    addPending(result)
                    run(local, "SigboMotor.dispatch(${JSONObject.quote(payload)})", result)
                }
                "cerrar" -> {
                    if (id == session) close()
                    result.success(null)
                }
                else -> result.notImplemented()
            }
        } catch (e: Exception) {
            pending.remove(result)
            if (call.method == "inicializar") close()
            result.error("GRE_LOCAL", e.message ?: "Motor local no disponible.", null)
        }
    }

    private fun addPending(result: MethodChannel.Result) {
        pending.add(result)
        handler.postDelayed({
            if (pending.remove(result)) {
                result.error("GRE_LOCAL_TIMEOUT", "La consulta local no respondió. Volvé a abrirla.", null)
                close()
            }
        }, 45_000)
    }

    private fun run(local: WebView, script: String, result: MethodChannel.Result, after: () -> Unit = {}) {
        local.evaluateJavascript(script) { value ->
            if (!pending.remove(result)) return@evaluateJavascript
            after()
            try {
                val json = JSONTokener(value).nextValue() as? String ?: error("Motor local incompatible. Actualizá Android System WebView.")
                result.success(json)
            } catch (e: Exception) { result.error("GRE_LOCAL", e.message, null) }
        }
    }

    fun close() {
        for (p in pending.toList()) p.error("GRE_LOCAL_CERRADO", "La consulta local se cerró.", null)
        pending.clear()
        initial = ""
        session = null
        view?.apply { removeJavascriptInterface("SigboCrypto"); stopLoading(); destroy() }
        view = null
    }
}
