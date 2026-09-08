---
id: service--ia-whisper
tipo: SERVICE
nombre: WhisperService
nivel: L2
dominio: inteligencia
resumen: "Cliente de whisper.cpp LOCAL para el \"oido\" de Snoopy (Etapa 2, seccion 3 del pedido de voz). Misma excepcion acotada que Ollama/Piper: corre en la misma maquina/red local via `whisper-server.exe`, sin llamadas salientes. Unica responsabilidad: audio -> texto. No decide nada, no toca la base, no autoriza nada -- el texto resultante entra al MISMO flujo de `IaMotorService.procesar()` que un mensaje escrito, con las mismas verificaciones (seccion 10 del pedido: \"no crear una via alternativa que saltee autenticacion/autorizacion\"). Ningun metodo lanza: si whisper-server no responde, esta apagado o tarda mas del timeout, se devuelve un resultado \"vacio\" para que el llamador ofrezca seguir por texto (seccion 13, fallback)."
capa: backend
archivos:
  - backend/src/modules/ia/whisper/whisper.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
terminos: [whisper]
---

# WhisperService

Cliente de whisper.cpp LOCAL para el "oido" de Snoopy (Etapa 2, seccion 3 del pedido de voz). Misma excepcion acotada que Ollama/Piper: corre en la misma maquina/red local via `whisper-server.exe`, sin llamadas salientes. Unica responsabilidad: audio -> texto. No decide nada, no toca la base, no autoriza nada -- el texto resultante entra al MISMO flujo de `IaMotorService.procesar()` que un mensaje escrito, con las mismas verificaciones (seccion 10 del pedido: "no crear una via alternativa que saltee autenticacion/autorizacion"). Ningun metodo lanza: si whisper-server no responde, esta apagado o tarda mas del timeout, se devuelve un resultado "vacio" para que el llamador ofrezca seguir por texto (seccion 13, fallback).


## Metodos

`estado()` · `transcribir()`

## Archivos

- `backend/src/modules/ia/whisper/whisper.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]

## Referenciado por

- [[service--ia-ia-voz|IaVozService]] `uses` →
- [[api--ia-ia-configuracion|IaConfiguracionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
