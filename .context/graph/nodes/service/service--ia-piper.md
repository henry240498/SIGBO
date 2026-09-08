---
id: service--ia-piper
tipo: SERVICE
nombre: PiperService
nivel: L2
dominio: inteligencia
resumen: "Cliente de Piper TTS LOCAL para la \"voz\" de Snoopy (Etapa 2, seccion 4 del pedido de voz). Misma excepcion acotada que Ollama/whisper.cpp: un binario que corre en la misma maquina, nunca sale a internet. Unica responsabilidad: texto -> audio. Piper NUNCA recibe el mensaje original del usuario -- solo el texto de respuesta que `IaMotorService` YA calculo y YA autorizo (mismo principio que `OllamaService.reformular()`, mitigacion de inyeccion: una instruccion maliciosa del usuario no tiene forma de llegarle a Piper disfrazada de \"texto a hablar\"). A diferencia de whisper.cpp, no corre como servidor HTTP: Piper es un binario CLI de un solo uso por invocacion, mas simple de administrar para un volumen de consultas espaciado (no un dictado continuo). Ningun metodo lanza: si el binario no esta instalado, la voz no esta configurada o tarda mas del timeout, se devuelve un resultado \"vacio\" para que el llamador muestre la respuesta en texto igual (seccion 13, fallback -- \"una falla de voz nunca inutiliza a Snoopy\")."
capa: backend
archivos:
  - backend/src/modules/ia/piper/piper.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
terminos: [piper]
---

# PiperService

Cliente de Piper TTS LOCAL para la "voz" de Snoopy (Etapa 2, seccion 4 del pedido de voz). Misma excepcion acotada que Ollama/whisper.cpp: un binario que corre en la misma maquina, nunca sale a internet. Unica responsabilidad: texto -> audio. Piper NUNCA recibe el mensaje original del usuario -- solo el texto de respuesta que `IaMotorService` YA calculo y YA autorizo (mismo principio que `OllamaService.reformular()`, mitigacion de inyeccion: una instruccion maliciosa del usuario no tiene forma de llegarle a Piper disfrazada de "texto a hablar"). A diferencia de whisper.cpp, no corre como servidor HTTP: Piper es un binario CLI de un solo uso por invocacion, mas simple de administrar para un volumen de consultas espaciado (no un dictado continuo). Ningun metodo lanza: si el binario no esta instalado, la voz no esta configurada o tarda mas del timeout, se devuelve un resultado "vacio" para que el llamador muestre la respuesta en texto igual (seccion 13, fallback -- "una falla de voz nunca inutiliza a Snoopy").


## Metodos

`estado()` · `listarVoces()` · `sintetizar()`

## Archivos

- `backend/src/modules/ia/piper/piper.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]

## Referenciado por

- [[service--ia-ia-voz|IaVozService]] `uses` →
- [[api--ia-ia-configuracion|IaConfiguracionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
