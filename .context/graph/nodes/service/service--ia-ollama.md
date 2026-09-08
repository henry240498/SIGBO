---
id: service--ia-ollama
tipo: SERVICE
nombre: OllamaService
nivel: L2
dominio: inteligencia
resumen: "Cliente de Ollama LOCAL para Snoopy (Etapa 1 del pedido de integracion). Nunca toca la base de datos, nunca decide autorizacion, nunca ejecuta nada por si solo -- cada metodo devuelve texto/sugerencias que IaMotorService valida o usa como input de un paso ya existente. Ningun metodo lanza: si Ollama no responde, esta apagado o tarda mas del timeout configurado, se devuelve un resultado \"vacio\" (null/false/texto original) para que el llamador siga funcionando sin Ollama (seccion 19 del pedido, \"fallback\")."
capa: backend
archivos:
  - backend/src/modules/ia/ollama/ollama.service.ts
edges:
  - [belongs_to, domain--inteligencia]
  - [uses, component--modulo-ia]
terminos: [ollama]
---

# OllamaService

Cliente de Ollama LOCAL para Snoopy (Etapa 1 del pedido de integracion). Nunca toca la base de datos, nunca decide autorizacion, nunca ejecuta nada por si solo -- cada metodo devuelve texto/sugerencias que IaMotorService valida o usa como input de un paso ya existente. Ningun metodo lanza: si Ollama no responde, esta apagado o tarda mas del timeout configurado, se devuelve un resultado "vacio" (null/false/texto original) para que el llamador siga funcionando sin Ollama (seccion 19 del pedido, "fallback").


## Metodos

`estado()` · `probarConexion()` · `probarGeneracion()` · `sugerirHerramienta()` · `reformular()`

## Archivos

- `backend/src/modules/ia/ollama/ollama.service.ts`

## Relaciones

- `belongs_to` → [[domain--inteligencia|Inteligencia Artificial]]
- `uses` → [[component--modulo-ia|ia (modulo NestJS)]]

## Referenciado por

- [[service--ia-ia-motor|IaMotorService]] `uses` →
- [[api--ia-ia-configuracion|IaConfiguracionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
