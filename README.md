# El Erístico Digital

Combate verbal para guerras de comentarios en **Facebook** y **X**.

Entrenado en las **38 estratagemas de Arthur Schopenhauer**, persuasión/influencia y técnicas de marco (masas, prueba social, carga de la prueba).  
**Sin censura blanda. Frases completas** (no truncados a mitad de idea).

**Repo:** https://github.com/jeova33/el-eristico-digital

## Modos

| Modo | Qué hace |
|------|----------|
| **Contraataque** | 3 variantes · tipo (datos / público / filosófico) · largo · navegador de fallos |
| **Desmontar** | Lee tácticas del rival y devuelve el golpe |
| **Arsenal** | Paquete completo del system prompt (E1, 4, 5, 6, 9, 12, 15, 16) |
| **Pro** | Captura de post · ficha del personaje · research web · consejo multi-agente · narrativa · comentario listo |

### Modo Pro

1. Sube **captura** del post + pega el **texto completo**.
2. Ficha: **quién lo dice**, a qué se dedica, contexto.
3. **Narrativa** que quieres imponer + tu postura.
4. **Research** (Wikipedia + búsquedas) y **consejo de 5 agentes**:
   - Schopenhauer (erística)
   - Influencia (prueba social, autoridad, escasez)
   - Masas (enemigo, etiqueta, división)
   - Narrativa (gancho, núcleo humano, anti-slop)
   - Abogado del Diablo (anticipa el contraataque)
5. Elige variante y copia el **comentario para publicar**.

### Estilos de escritura

Calle · Humano (anti-IA) · Narrativo · Erístico · Filosófico crudo · Datos duros

## Stack de conocimiento

- `lib/knowledge/stratagemas.ts` — 38 estratagemas
- `lib/knowledge/persuasion.ts` — system prompt + influencia
- `lib/knowledge/abilities.ts` — habilidades de PDFs (psicología, masas, manipulación)
- `lib/knowledge/styles.ts` — estilos + `polishComplete` (sin frases a medias)
- `lib/agents/council.ts` — multi-agente
- `lib/research/person-research.ts` — ficha / Wikipedia
- `lib/pro-engine.ts` — motor Pro
- `app/api/research/route.ts` — API research

## Correr en local (Windows)

```bash
npm ci
npx next dev -p 3456
```

Abre http://127.0.0.1:3456

> `npm run dev` usa Vite + Cloudflare Miniflare y puede fallar en Windows. Preferir Next.

## Licencia / uso

Herramienta de dialéctica erística (parecer tener razón). Tú decides qué publicas.  
No está pensada para delitos, acoso ilegal ni doxxing.
