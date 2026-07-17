# El Erístico Digital

Aplicación web de **combate verbal** para guerras de comentarios en Facebook y X.

Entrenada en las **38 estratagemas de Arthur Schopenhauer** (Dialéctica Erística) y
principios de persuasión moderna: audiencia primero, prueba social, carga cognitiva,
asimetría de la prueba, tribalismo y enmarcado.

## Qué hace

1. **Contraataque** — pegas el comentario del oponente + tu postura → análisis táctico + texto listo para publicar.
2. **Desmontar** — detecta tácticas del rival y devuelve el golpe con marco a tu favor.
3. **Arsenal** — dispara el paquete completo del system prompt (E1, 4, 5, 6, 9, 12, 15, 16).

### Intensidades

| Intensidad  | Estilo                                              |
| ----------- | --------------------------------------------------- |
| Cirujano    | Frío, preciso, ironía controlada                    |
| Viral       | Optimizado para likes y punchline                   |
| Devastador  | Máxima presión: avalancha + ad hominem + cierre     |

### Formato de salida (system prompt)

```
Análisis Táctico (Breve): …
El Contraataque: … (listo para copiar y pegar)
```

## Conocimiento embebido

- `lib/knowledge/stratagemas.ts` — las 38 estratagemas + nombres digitales.
- `lib/knowledge/persuasion.ts` — system prompt + principios de influencia.
- `lib/eristico-engine.ts` — motor local que aplica estratagemas al texto.

Fuentes de referencia usadas en el diseño del motor:

- Las 38 estratagemas de Schopenhauer (persuasión moderna / derrota argumentativa)
- Psicología de la persuasión e influencia (leyes, masas, marcos)

## Estado actual

MVP con motor **local/demostrativo** (sin API de IA en el cliente). La UI y la lógica
táctica funcionan offline en el navegador. Para producción, sustituye el motor por
`POST /api/generate` con el system prompt de `persuasion.ts`.

## Requisitos

- Node.js 22.13 o superior
- npm 10 o superior

## Ejecutar localmente

```bash
npm ci
npm run dev
```

Compilación y validación:

```bash
npm run build
npm run validate:artifact
```

## Archivos principales

- `app/page.tsx` — interfaz El Erístico Digital
- `app/globals.css` — tema dark / magenta combate
- `lib/eristico-engine.ts` — generación de contraataques
- `lib/knowledge/*` — estratagemas y persuasión
- `worker/index.ts` — entrada Cloudflare Worker (Vinext)

## Conectar una IA real

Reemplaza la llamada a `generateEristic` en `page.tsx` por `POST /api/generate`.

Cuerpo sugerido:

```json
{
  "mode": "contraataque",
  "intensity": "viral",
  "opponentText": "…",
  "stanceText": "…"
}
```

System prompt: export `SYSTEM_PROMPT_CORE` desde `lib/knowledge/persuasion.ts`.
Nunca expongas la API key en el cliente.

## Seguridad y ética

- No publica por ti.
- No almacena conversaciones en esta demo.
- Es una herramienta de **dialéctica erística** (parecer tener razón). Úsala con criterio;
  también sirve para **reconocer** las mismas tácticas cuando te las aplican.
