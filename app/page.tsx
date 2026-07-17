"use client";

import { useEffect, useMemo, useState } from "react";
import {
  FOCUS_GUIDE,
  LENGTH_GUIDE,
  type DebateBrowser,
  type Intensity,
  type Mode,
  type ReplyFocus,
  type ReplyLength,
  type ReplyVariant,
} from "../lib/eristico-engine";
import type { CouncilResult } from "../lib/agents/council";
import type { ResearchPack } from "../lib/research/person-research";
import {
  MAX_CUSTOM_STYLE_CHARS,
  WRITE_STYLES,
  type WriteStyleId,
} from "../lib/knowledge/styles";
import { PRIMARY_ARSENAL, STRATAGEMS } from "../lib/knowledge/stratagemas";
import { ABILITIES, ABILITY_CATEGORIES, abilitiesByTag } from "../lib/knowledge/abilities";

const modes: Array<{ id: Mode; icon: string; label: string; hint: string }> = [
  { id: "contraataque", icon: "⚔", label: "Contraataque", hint: "Variantes listas" },
  { id: "desmontar", icon: "👁", label: "Desmontar", hint: "Detecta tácticas" },
  { id: "arsenal", icon: "☢", label: "Arsenal", hint: "Máximo fuego" },
  { id: "pro", icon: "◆", label: "Pro", hint: "Captura · research · agentes" },
];

const intensities: Array<{ id: Intensity; icon: string; label: string }> = [
  { id: "cirujano", icon: "◆", label: "Cirujano" },
  { id: "viral", icon: "⚡", label: "Viral" },
  { id: "devastador", icon: "🔥", label: "Devastador" },
];

const focuses: Array<{ id: ReplyFocus; icon: string }> = [
  { id: "datos", icon: "📊" },
  { id: "publico", icon: "👥" },
  { id: "filosofico", icon: "☯" },
];

const lengths: Array<{ id: ReplyLength; icon: string }> = [
  { id: "corta", icon: "•" },
  { id: "media", icon: "••" },
  { id: "larga", icon: "•••" },
];

/** Límites de caracteres (módulos estándar + Pro) */
const MAX_OPPONENT_CHARS = 10_000;
const MAX_STANCE_CHARS = 10_000;
const MAX_POST_CHARS = 10_000;
const MAX_NARRATIVE_CHARS = 10_000;
const MAX_PERSON_CONTEXT_CHARS = 10_000;
const MAX_PERSON_NAME_CHARS = 500;
const MAX_PERSON_ROLE_CHARS = 500;

export default function Home() {
  const [mode, setMode] = useState<Mode>("contraataque");
  const [intensity, setIntensity] = useState<Intensity>("viral");
  const [focus, setFocus] = useState<ReplyFocus>("publico");
  const [length, setLength] = useState<ReplyLength>("media");
  const [writeStyle, setWriteStyle] = useState<WriteStyleId>("eristico");
  const [writeStyleCustom, setWriteStyleCustom] = useState("");

  const [opponentText, setOpponentText] = useState("");
  const [stanceText, setStanceText] = useState("");

  // Pro fields
  const [postText, setPostText] = useState("");
  const [personName, setPersonName] = useState("");
  const [personRole, setPersonRole] = useState("");
  const [personContext, setPersonContext] = useState("");
  const [narrativeIntent, setNarrativeIntent] = useState("");
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  const [analysis, setAnalysis] = useState("");
  const [variants, setVariants] = useState<ReplyVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [browser, setBrowser] = useState<DebateBrowser | null>(null);
  const [council, setCouncil] = useState<CouncilResult | null>(null);
  const [research, setResearch] = useState<ResearchPack | null>(null);
  const [stratagemIds, setStratagemIds] = useState<number[]>([]);
  const [copied, setCopied] = useState<"none" | "full" | "counter">("none");
  const [generating, setGenerating] = useState(false);
  const [researching, setResearching] = useState(false);
  const [browserOpen, setBrowserOpen] = useState(true);
  const [councilOpen, setCouncilOpen] = useState(true);
  const [seed, setSeed] = useState(0);
  const [apiSource, setApiSource] = useState("");
  const [apiModel, setApiModel] = useState("");
  const [apiProviderLabel, setApiProviderLabel] = useState("");
  const [apiWarning, setApiWarning] = useState("");
  const [apiError, setApiError] = useState("");
  /** auto | xai | gemini | nvidia */
  const [llmProvider, setLlmProvider] = useState<"auto" | "xai" | "gemini" | "nvidia">("auto");
  const [providersOnline, setProvidersOnline] = useState<
    Array<{ id: string; label: string; configured: boolean; model: string }>
  >([]);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/generate")
      .then((r) => r.json())
      .then((j: {
        providers?: Array<{ id: string; label: string; configured: boolean; model: string }>;
      }) => {
        if (!cancelled && Array.isArray(j.providers)) setProvidersOnline(j.providers);
      })
      .catch(() => {
        /* sin server */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const providerCards = useMemo(
    () =>
      [
        {
          id: "auto" as const,
          icon: "⚡",
          label: "Auto",
          hint: "Primera API con clave",
        },
        {
          id: "xai" as const,
          icon: "𝕏",
          label: "Grok",
          hint: "xAI · combativo",
        },
        {
          id: "gemini" as const,
          icon: "✦",
          label: "Gemini",
          hint: "Google · rápido",
        },
        {
          id: "nvidia" as const,
          icon: "▲",
          label: "NVIDIA",
          hint: "NIM · Llama",
        },
      ].map((card) => {
        if (card.id === "auto") {
          const anyOn = providersOnline.some((p) => p.configured);
          return { ...card, configured: anyOn || providersOnline.length === 0, model: "" };
        }
        const st = providersOnline.find((p) => p.id === card.id);
        return {
          ...card,
          configured: st ? st.configured : true,
          model: st?.model || "",
        };
      }),
    [providersOnline],
  );

  const active = useMemo(() => modes.find((item) => item.id === mode)!, [mode]);
  const activeStrats = useMemo(
    () => STRATAGEMS.filter((s) => stratagemIds.includes(s.id)),
    [stratagemIds],
  );
  const counterattack = variants[selectedVariant]?.text ?? "";
  const hasResult = variants.length > 0;
  const isPro = mode === "pro";

  function selectMode(next: Mode) {
    setMode(next);
    setAnalysis("");
    setVariants([]);
    setBrowser(null);
    setCouncil(null);
    setResearch(null);
    setStratagemIds([]);
    setSelectedVariant(0);
    setCopied("none");
    if (next === "pro") {
      setIntensity("devastador");
      setWriteStyle("eristico");
    }
  }

  function onScreenshot(file: File | null) {
    if (!file) {
      setScreenshotPreview(null);
      return;
    }
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => setScreenshotPreview(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function fetchResearch(): Promise<ResearchPack | null> {
    setResearching(true);
    try {
      const res = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personName,
          personRole,
          personContext,
          opponentText: opponentText || postText,
          narrativeIntent,
        }),
      });
      const data = (await res.json()) as { ok: boolean; pack?: ResearchPack };
      if (data.ok && data.pack) {
        setResearch(data.pack);
        return data.pack;
      }
    } catch {
      /* offline / API fail: continue without wiki */
    } finally {
      setResearching(false);
    }
    return null;
  }

  async function runGenerate(nextSeed?: number) {
    const attackSource = isPro
      ? opponentText.trim() || postText.trim()
      : opponentText.trim();
    if (!attackSource) return;

    const s = nextSeed ?? Date.now() % 100000;
    setSeed(s);
    setGenerating(true);
    setCopied("none");
    setApiError("");
    setApiWarning("");

    let pack: ResearchPack | null = research;
    if (isPro && (personName.trim() || personRole.trim())) {
      pack = (await fetchResearch()) || pack;
    }

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          intensity,
          focus,
          length,
          writeStyle,
          writeStyleCustom:
            writeStyle === "custom" ? writeStyleCustom.trim() || undefined : undefined,
          opponentText: attackSource,
          postText: isPro ? postText || attackSource : undefined,
          stanceText,
          personName: isPro ? personName : undefined,
          personRole: isPro ? personRole : undefined,
          personContext: isPro ? personContext : undefined,
          narrativeIntent: isPro ? narrativeIntent || stanceText : undefined,
          researchNotes: pack?.notes,
          seed: s,
          provider: llmProvider === "auto" ? undefined : llmProvider,
        }),
      });

      const json = (await res.json()) as {
        ok: boolean;
        error?: string;
        source?: string;
        provider?: string;
        providerLabel?: string;
        model?: string;
        warning?: string;
        data?: {
          analysis?: string;
          attackProfile?: string;
          plainSummary?: string;
          weakPoints?: DebateBrowser["weakPoints"];
          winLevers?: string[];
          avoid?: string[];
          researchLeads?: string[];
          searchQueries?: string[];
          variants?: ReplyVariant[];
          council?: {
            synthesis: string;
            turns: Array<{
              agentId: string;
              agentName: string;
              color: string;
              read: string;
              move: string;
            }>;
          } | null;
        };
      };

      if (!json.ok || !json.data?.variants?.length) {
        setApiError(json.error || "No se pudo generar. Revisa XAI_API_KEY o reintenta.");
        setGenerating(false);
        return;
      }

      const d = json.data;
      setApiSource(json.source || json.provider || "");
      setApiModel(json.model || "");
      setApiProviderLabel(json.providerLabel || json.source || "");
      setApiWarning(json.warning || "");
      setAnalysis(d.analysis || "");
      const nextVariants = d.variants ?? [];
      setVariants(nextVariants);
      setStratagemIds(nextVariants[0]?.stratagemIds ?? []);
      setSelectedVariant(0);

      if (d.council?.turns?.length) {
        setCouncil({
          synthesis: d.council.synthesis,
          turns: d.council.turns.map((t) => ({
            ...t,
            agentId: t.agentId as CouncilResult["turns"][0]["agentId"],
            abilities: [],
          })),
          finalStrike: nextVariants[0]?.text || "",
          narrativeStrike: nextVariants[1]?.text || "",
        });
        setCouncilOpen(true);
        setBrowser(null);
      } else {
        setCouncil(null);
        setBrowser({
          attackProfile: d.attackProfile || "Análisis Grok",
          plainSummary: d.plainSummary || "",
          weakPoints: d.weakPoints || [],
          researchLeads: d.researchLeads || [],
          searchQueries: d.searchQueries || [],
          winLevers: d.winLevers || [],
          avoid: d.avoid || [],
        });
        setBrowserOpen(true);
      }
      if (pack) setResearch(pack);

      window.setTimeout(
        () =>
          document
            .getElementById("resultado")
            ?.scrollIntoView({ behavior: "smooth", block: "center" }),
        80,
      );
    } catch (e) {
      setApiError(e instanceof Error ? e.message : "Error de red al llamar /api/generate");
    } finally {
      setGenerating(false);
    }
  }

  function generate() {
    void runGenerate();
  }

  function regenerateVariants() {
    void runGenerate(seed + 13);
  }

  async function copyText(kind: "full" | "counter") {
    const payload =
      kind === "counter"
        ? counterattack
        : counterattack;
    if (!payload.trim()) return;
    await navigator.clipboard.writeText(payload);
    setCopied(kind);
    window.setTimeout(() => setCopied("none"), 1800);
  }

  function shareX() {
    window.open(
      `https://x.com/intent/post?text=${encodeURIComponent(`${counterattack}\n\n— El Erístico Digital`)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function shareFacebook() {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(counterattack)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  function openSearch(query: string) {
    window.open(
      `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <main>
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />

      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="El Erístico Digital, inicio">
          El Erístico <span>Digital</span>
          <i aria-hidden="true" />
        </a>
        <nav aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#arsenal-38">Habilidades</a>
          <a href="#preguntas">Preguntas</a>
        </nav>
        <a className="login" href="#planes">
          Ver planes
        </a>
      </header>

      <section className="hero" id="inicio">
        <div className="doodle bubble" aria-hidden="true">
          E38
        </div>
        <div className="doodle heart" aria-hidden="true">
          ⚔
        </div>
        <p className="eyebrow">Comentarios y posts · sin censura · Pro multi-agente</p>
        <h1>
          Gana la guerra
          <br />
          <span>de comentarios y post</span>
        </h1>
        <p className="lead">
          Respuestas y publicaciones listas: investiga al personaje, debate con{" "}
          <b>Schopenhauer e influencia</b>, elige variante y pega el golpe en <b>Facebook</b> o{" "}
          <b>X</b> — comentario o post.
        </p>
      </section>

      <section className="composer" aria-label="Generador erístico">
        <div className="mode-grid mode-grid-4" role="tablist" aria-label="Elige una herramienta">
          {modes.map((item) => (
            <button
              key={item.id}
              className={`mode ${mode === item.id ? "active" : ""} mode-${item.id}`}
              onClick={() => selectMode(item.id)}
              role="tab"
              aria-selected={mode === item.id}
            >
              <span className="mode-icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>
                <strong>{item.label}</strong>
                <small>{item.hint}</small>
              </span>
            </button>
          ))}
        </div>

        {isPro && (
          <div className="pro-panel">
            <div className="pro-banner">
              <strong>Modo Pro</strong>
              <span>
                Captura del post · ficha del personaje · research web · consejo de agentes ·
                narrativa · sin censura · sin frases a medias
              </span>
            </div>

            <div className="input-grid split">
              <label className="text-box upload-box">
                <span>Captura del post (imagen)</span>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input"
                  onChange={(e) => onScreenshot(e.target.files?.[0] ?? null)}
                />
                {screenshotPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={screenshotPreview} alt="Captura del post" className="shot-preview" />
                ) : (
                  <p className="upload-hint">
                    Sube un pantallazo del post. Pega también el texto abajo (el motor razona sobre el
                    texto; la imagen es referencia visual).
                  </p>
                )}
              </label>
              <label className="text-box">
                <span>Texto del post / lo que dice el post</span>
                <textarea
                  value={postText}
                  onChange={(e) => setPostText(e.target.value.slice(0, MAX_POST_CHARS))}
                  placeholder="Pega el texto completo del post. Frases enteras, sin cortar a mitad…"
                  rows={6}
                />
                <span className="text-footer">
                  <span>Post</span>
                  {postText.length}/{MAX_POST_CHARS}
                </span>
              </label>
            </div>

            <div className="input-grid split">
              <label className="text-box">
                <span>Comentario o post enemigo (si es un reply)</span>
                <textarea
                  value={opponentText}
                  onChange={(e) =>
                    setOpponentText(e.target.value.slice(0, MAX_OPPONENT_CHARS))
                  }
                  placeholder="Si te atacan en un comentario o post, pégalo aquí completo."
                  rows={4}
                />
                <span className="text-footer">
                  <span>Ataque</span>
                  {opponentText.length}/{MAX_OPPONENT_CHARS}
                </span>
              </label>
              <label className="text-box">
                <span>Narrativa que quieres expresar</span>
                <textarea
                  value={narrativeIntent}
                  onChange={(e) =>
                    setNarrativeIntent(e.target.value.slice(0, MAX_NARRATIVE_CHARS))
                  }
                  placeholder="Ej: Quiero que se vea que predica moral y no rinde cuentas; que el público sienta el bluff."
                  rows={4}
                />
                <span className="text-footer">
                  <span>Narrativa</span>
                  {narrativeIntent.length}/{MAX_NARRATIVE_CHARS}
                </span>
              </label>
            </div>

            <div className="control-block">
              <strong className="control-label">Ficha del personaje (quién lo dice)</strong>
              <p className="control-hint">
                Nombre, a qué se dedica y contexto. El agente busca en la web y razona antes de
                golpear.
              </p>
              <div className="person-grid">
                <label className="mini-field">
                  <span>Nombre</span>
                  <input
                    value={personName}
                    onChange={(e) =>
                      setPersonName(e.target.value.slice(0, MAX_PERSON_NAME_CHARS))
                    }
                    placeholder="Ej: Maricel Cohen"
                    maxLength={MAX_PERSON_NAME_CHARS}
                  />
                </label>
                <label className="mini-field">
                  <span>A qué se dedica / cargo</span>
                  <input
                    value={personRole}
                    onChange={(e) =>
                      setPersonRole(e.target.value.slice(0, MAX_PERSON_ROLE_CHARS))
                    }
                    placeholder="Ej: empresaria, política, influencer…"
                    maxLength={MAX_PERSON_ROLE_CHARS}
                  />
                </label>
              </div>
              <label className="mini-field full">
                <span>Contexto extra (historial, bando, por qué ataca)</span>
                <textarea
                  value={personContext}
                  onChange={(e) =>
                    setPersonContext(e.target.value.slice(0, MAX_PERSON_CONTEXT_CHARS))
                  }
                  placeholder="Lo que sepas: partidos, negocios, polémicas previas, relación contigo…"
                  rows={3}
                />
                <span className="text-footer">
                  <span>Contexto</span>
                  {personContext.length}/{MAX_PERSON_CONTEXT_CHARS}
                </span>
              </label>
              <button
                type="button"
                className="research-btn"
                disabled={researching || (!personName.trim() && !personRole.trim())}
                onClick={() => void fetchResearch()}
              >
                {researching ? "Investigando…" : "🔍 Investigar en la web ahora"}
              </button>
            </div>
          </div>
        )}

        {!isPro && (
          <div className="input-grid split">
            <label className="text-box">
              <span>
                {mode === "desmontar"
                  ? "Pega el comentario o post del oponente (lo disecciono)"
                  : "Comentario o post del oponente"}
              </span>
              <textarea
                value={opponentText}
                onChange={(event) =>
                  setOpponentText(event.target.value.slice(0, MAX_OPPONENT_CHARS))
                }
                placeholder="Pega el comentario o post completo. No cortes a mitad de frase."
                rows={5}
              />
              <span className="text-footer">
                <span>f&nbsp;&nbsp;𝕏</span>
                {opponentText.length}/{MAX_OPPONENT_CHARS}
              </span>
            </label>
            <label className="text-box">
              <span>Mi postura + órdenes (se cumplen en cada variante)</span>
              <textarea
                value={stanceText}
                onChange={(event) =>
                  setStanceText(event.target.value.slice(0, MAX_STANCE_CHARS))
                }
                placeholder='Ej: "Ten criterio, cátedra de datos y termina con frases bíblicas."'
                rows={5}
              />
              <span className="text-footer">
                <span>Órdenes al motor</span>
                {stanceText.length}/{MAX_STANCE_CHARS}
              </span>
            </label>
          </div>
        )}

        {isPro && (
          <div className="input-grid" style={{ marginTop: 14 }}>
            <label className="text-box">
              <span>Mi postura + órdenes de entrega (obligatorias en cada variante)</span>
              <textarea
                value={stanceText}
                onChange={(event) =>
                  setStanceText(event.target.value.slice(0, MAX_STANCE_CHARS))
                }
                placeholder='Ej: "Criterio firme, cátedra de datos y termina con frases bíblicas."'
                rows={3}
              />
              <span className="text-footer">
                <span>Órdenes al motor</span>
                {stanceText.length}/{MAX_STANCE_CHARS}
              </span>
            </label>
          </div>
        )}

        <div className="control-block who-answers" id="quien-contesta">
          <strong className="control-label">¿Quién te contesta?</strong>
          <p className="control-hint">
            Elige la IA que escribe tu contraataque o post. Puedes cambiarla en cada generación.
          </p>
          <div className="who-grid" role="radiogroup" aria-label="Quién te contesta">
            {providerCards.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={llmProvider === p.id}
                className={`who-card ${llmProvider === p.id ? "active" : ""} ${!p.configured ? "offline" : ""}`}
                onClick={() => setLlmProvider(p.id)}
                title={
                  p.configured
                    ? p.model
                      ? `${p.label} · ${p.model}`
                      : p.label
                    : `${p.label}: sin API key en el servidor`
                }
              >
                <span className="who-icon" aria-hidden="true">
                  {p.icon}
                </span>
                <span className="who-text">
                  <b>{p.label}</b>
                  <small>{p.hint}</small>
                  {p.configured ? (
                    <em className="who-status on">Lista</em>
                  ) : (
                    <em className="who-status off">Sin key</em>
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="control-block">
          <strong className="control-label">Estilo de escritura</strong>
          <p className="control-hint">
            Skills: calle, humano anti-IA, narrativo, erístico, filosófico crudo, datos,{" "}
            <b>libre (la IA decide)</b> o <b>a tu medida</b> (escribes el estilo).
          </p>
          <div className="style-row">
            {WRITE_STYLES.map((st) => (
              <button
                key={st.id}
                type="button"
                className={`style-chip ${writeStyle === st.id ? "active" : ""} ${st.id === "libre" || st.id === "custom" ? "style-chip-special" : ""}`}
                onClick={() => setWriteStyle(st.id)}
              >
                <b>{st.label}</b>
                <small>{st.hint}</small>
              </button>
            ))}
          </div>
          {writeStyle === "libre" && (
            <p className="control-hint style-extra-hint">
              La IA elige el tono (o mezcla) que más gane este hilo: calle, datos, narrativa, etc.
              No hace falta que lo describas.
            </p>
          )}
          {writeStyle === "custom" && (
            <label className="text-box style-custom-box">
              <span>Describe el estilo de escritura que quieres</span>
              <textarea
                value={writeStyleCustom}
                onChange={(e) =>
                  setWriteStyleCustom(e.target.value.slice(0, MAX_CUSTOM_STYLE_CHARS))
                }
                placeholder='Ej: "Como abuelo de pueblo, irónico, con refranes, sin groserías, corto y con pregunta final."'
                rows={3}
              />
              <span className="text-footer">
                <span>Tu estilo</span>
                {writeStyleCustom.length}/{MAX_CUSTOM_STYLE_CHARS}
              </span>
            </label>
          )}
        </div>

        <div className="control-block">
          <strong className="control-label">Tipo de respuesta</strong>
          <p className="control-hint">Sin tecnicismos de adorno. Sin frases incompletas. Sin censura blanda.</p>
          <div className="chip-row" role="group" aria-label="Tipo de respuesta">
            {focuses.map((item) => (
              <button
                key={item.id}
                type="button"
                className={`chip ${focus === item.id ? "active" : ""}`}
                onClick={() => setFocus(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                <span>
                  <b>{FOCUS_GUIDE[item.id].label}</b>
                  <small>{FOCUS_GUIDE[item.id].hint}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="control-block">
          <strong className="control-label">Largo</strong>
          <div className="tone-picker length-picker" aria-label="Largo de la respuesta">
            {lengths.map((item) => (
              <button
                key={item.id}
                type="button"
                className={length === item.id ? "active" : ""}
                onClick={() => setLength(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {LENGTH_GUIDE[item.id].label}
                <em>{LENGTH_GUIDE[item.id].hint}</em>
              </button>
            ))}
          </div>
        </div>

        <div className="action-row">
          <div className="tone-picker" aria-label="Elige la intensidad">
            <strong>Intensidad</strong>
            {intensities.map((item) => (
              <button
                key={item.id}
                type="button"
                className={intensity === item.id ? "active" : ""}
                onClick={() => setIntensity(item.id)}
              >
                <span aria-hidden="true">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
          <button
            className="generate"
            onClick={generate}
            disabled={
              generating ||
              researching ||
              !(isPro ? postText.trim() || opponentText.trim() : opponentText.trim())
            }
          >
            <span aria-hidden="true">✦</span>
            {generating || researching
              ? researching
                ? "Investigando personaje…"
                : "IA pensando el claim…"
              : isPro
                ? "Pro · IA: research + golpe"
                : mode === "desmontar"
                  ? "Desmontar con IA"
                  : mode === "arsenal"
                    ? "Arsenal con IA"
                    : `Generar con ${llmProvider === "auto" ? "IA" : llmProvider === "xai" ? "Grok" : llmProvider === "gemini" ? "Gemini" : "NVIDIA"}`}
          </button>
        </div>

        {apiError && (
          <div className="api-banner error" role="alert">
            <strong>Error:</strong> {apiError}
          </div>
        )}
        {apiWarning && !apiError && (
          <div className="api-banner warn" role="status">
            <strong>Aviso:</strong> {apiWarning}
          </div>
        )}

        {!hasResult && (
          <div className="ready-line">
            <span className="check">⚔</span>
            <p>
              <strong>
                Motores: <b>Grok</b> · <b>Gemini</b> · <b>NVIDIA</b> — coherentes con el post real.
              </strong>
              <br />
              Variables: <code>XAI_API_KEY</code> / <code>GEMINI_API_KEY</code> /{" "}
              <code>NVIDIA_API_KEY</code> (+ opcional <code>LLM_PROVIDER</code>). Sin clave = local.
            </p>
            <span className="ready-copy">▣&nbsp;&nbsp; API</span>
          </div>
        )}

        {hasResult && (
          <section className="result" id="resultado" aria-live="polite">
            <div className="result-top">
              <span>✦ El Erístico Digital</span>
              <span className="result-badge">
                {apiProviderLabel || apiSource || "local"}
                {apiModel ? ` · ${apiModel}` : ""} · {active.label} · {writeStyle} ·{" "}
                {FOCUS_GUIDE[focus].label} · {LENGTH_GUIDE[length].label} · {intensity}
              </span>
            </div>

            {activeStrats.length > 0 && (
              <div className="strat-chips" aria-label="Estratagemas usadas">
                {activeStrats.map((s) => (
                  <span key={s.id} title={s.summary}>
                    E{s.id} {s.digitalName}
                  </span>
                ))}
              </div>
            )}

            {/* Research Pro */}
            {isPro && research && (
              <div className="browser-panel">
                <div className="browser-toggle" style={{ cursor: "default" }}>
                  <span>🔍 Intel del personaje / post</span>
                  <span className="browser-toggle-hint">{research.query}</span>
                </div>
                <div className="browser-body">
                  <p className="analysis-text">{research.notes}</p>
                  {research.hits.length > 0 && (
                    <ul className="lever-list" style={{ marginTop: 12 }}>
                      {research.hits.map((h) => (
                        <li key={h.url || h.title}>
                          <a href={h.url} target="_blank" rel="noreferrer">
                            {h.title}
                          </a>
                          : {h.summary}
                        </li>
                      ))}
                    </ul>
                  )}
                  {research.angles.length > 0 && (
                    <>
                      <h3 className="mt">Ángulos tácticos</h3>
                      <ul className="lever-list">
                        {research.angles.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </>
                  )}
                  <h3 className="mt">Seguir investigando</h3>
                  <div className="search-chips">
                    {research.searchLinks.map((l) => (
                      <button
                        key={l.url}
                        type="button"
                        className="search-chip"
                        onClick={() => window.open(l.url, "_blank", "noopener,noreferrer")}
                      >
                        🔍 {l.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Multi-agent council */}
            {council && (
              <div className="browser-panel" style={{ marginTop: 14 }}>
                <button
                  type="button"
                  className="browser-toggle"
                  onClick={() => setCouncilOpen((o) => !o)}
                  aria-expanded={councilOpen}
                >
                  <span>🎭 Consejo multi-agente</span>
                  <span className="browser-toggle-hint">
                    {councilOpen ? "Ocultar" : "Abrir"} · Schopenhauer · Influencia · Masas ·
                    Narrativa · Diablo
                  </span>
                </button>
                {councilOpen && (
                  <div className="browser-body">
                    <p className="analysis-text" style={{ marginBottom: 14 }}>
                      {council.synthesis}
                    </p>
                    <div className="agent-grid">
                      {council.turns.map((t) => (
                        <article key={t.agentId} className="agent-card" style={{ borderColor: t.color }}>
                          <header>
                            <strong style={{ color: t.color }}>{t.agentName}</strong>
                          </header>
                          <p>
                            <b>Lee:</b> {t.read}
                          </p>
                          <p>
                            <b>Propone:</b> {t.move}
                          </p>
                          <div className="strat-chips">
                            {t.abilities.map((a) => (
                              <span key={a.id} title={a.rule}>
                                {a.name}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {browser && (
              <div className="browser-panel">
                <button
                  type="button"
                  className="browser-toggle"
                  onClick={() => setBrowserOpen((o) => !o)}
                  aria-expanded={browserOpen}
                >
                  <span>🧭 Navegador de debate</span>
                  <span className="browser-toggle-hint">
                    {browserOpen ? "Ocultar" : "Abrir"} · fallos y vacíos
                  </span>
                </button>
                {browserOpen && (
                  <div className="browser-body">
                    <div className="browser-profile">
                      <h3>Tipo de ataque</h3>
                      <p className="browser-profile-tag">{browser.attackProfile}</p>
                      <p>{browser.plainSummary}</p>
                    </div>
                    <div className="browser-grid">
                      <div>
                        <h3>Fallos y vacíos</h3>
                        <ul className="weak-list">
                          {browser.weakPoints.map((w) => (
                            <li key={w.title}>
                              <strong>{w.title}</strong>
                              <span>{w.detail}</span>
                              <em>→ {w.howToWin}</em>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h3>Palancas</h3>
                        <ul className="lever-list">
                          {browser.winLevers.map((l) => (
                            <li key={l}>{l}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="search-chips" style={{ marginTop: 12 }}>
                      {browser.searchQueries.map((q) => (
                        <button
                          key={q}
                          type="button"
                          className="search-chip"
                          onClick={() => openSearch(q)}
                        >
                          🔍 {q.length > 64 ? `${q.slice(0, 64)}…` : q}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="result-block">
              <h3>Notas internas (no copies esto al hilo)</h3>
              <p className="analysis-text">{analysis}</p>
            </div>

            <div className="result-block">
              <h3>Elige el texto a pegar (suena a ti, no a IA)</h3>
              <div className="variant-tabs" role="tablist">
                {variants.map((v, i) => (
                  <button
                    key={v.id}
                    type="button"
                    role="tab"
                    aria-selected={selectedVariant === i}
                    className={`variant-tab ${selectedVariant === i ? "active" : ""}`}
                    onClick={() => setSelectedVariant(i)}
                  >
                    <strong>{v.label}</strong>
                    <small>{v.angle}</small>
                  </button>
                ))}
              </div>
            </div>

            <div className="result-block highlight">
              <h3>
                Copia y pega en el grupo{" "}
                <span className="variant-current">{variants[selectedVariant]?.label ?? ""}</span>
              </h3>
              <blockquote className="publishable">{counterattack}</blockquote>
              <p className="copy-hint">Solo este bloque. Las notas de arriba no van al post.</p>
            </div>

            <div className="result-actions">
              <button className="copy-button" onClick={() => copyText("counter")}>
                {copied === "counter" || copied === "full" ? "✓ Copiado" : "▣ Copiar para pegar"}
              </button>
              <button className="social fb" onClick={shareFacebook} aria-label="Facebook">
                f
              </button>
              <button className="social x" onClick={shareX} aria-label="X">
                𝕏
              </button>
              <button className="again" onClick={regenerateVariants}>
                Otra ronda
              </button>
            </div>
          </section>
        )}
      </section>

      <section className="steps" id="como-funciona">
        <p className="section-kicker">Cómo gana Pro</p>
        <h2>Ficha. Research. Consejo. Golpe.</h2>
        <div className="step-grid">
          <article>
            <span>01</span>
            <h3>Captura + personaje</h3>
            <p>Post, screenshot, nombre, oficio y la narrativa que quieres imponer.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Investigación + agentes</h3>
            <p>Wikipedia/web + Schopenhauer, Influencia, Masas, Narrativa y el Diablo.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Comentario sin cortes</h3>
            <p>Variantes completas, sin censura blanda, listas para pegar en el hilo.</p>
          </article>
        </div>
      </section>

      <section className="tactics" id="arsenal-38">
        <p className="section-kicker">Arsenal de habilidades</p>
        <h2>Psicología · influencia · manipulación · erística</h2>
        <p className="tactics-note" style={{ marginBottom: 28 }}>
          Destilado de PDFs (Telegram / Gamma): Schopenhauer, Cialdini, 52 leyes, ciencia de la
          influencia, 7 técnicas prohibidas, manipulación mental y de masas, emociones colectivas,
          manipulación emocional digital. Se usan por dentro al generar; el texto a pegar sigue
          siendo voz humana.
        </p>
        <div className="ability-cats">
          {ABILITY_CATEGORIES.map((cat) => {
            const items = abilitiesByTag(cat.id).slice(0, 6);
            if (!items.length) return null;
            return (
              <div key={cat.id} className="ability-cat">
                <h3>{cat.label}</h3>
                <p>{cat.description}</p>
                <div className="tactic-grid compact">
                  {items.map((a) => (
                    <article key={a.id}>
                      <span>{a.source}</span>
                      <h3>{a.name}</h3>
                      <p>{a.use}</p>
                    </article>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <p className="tactics-note">
          {ABILITIES.length} habilidades · {STRATAGEMS.length} estratagemas Schopenhauer · core E
          {PRIMARY_ARSENAL.join(", E")}.
        </p>
      </section>

      <section className="faq" id="preguntas">
        <p className="section-kicker">Preguntas</p>
        <h2>Sin rodeos.</h2>
        <details>
          <summary>¿Las respuestas van sin censura?</summary>
          <p>
            Sí: el motor no suaviza el golpe erístico. Tú decides si publicas. No inventa delitos ni
            doxxing ilegal; ataca argumento, pose y credibilidad pública.
          </p>
        </details>
        <details>
          <summary>¿Por qué no más frases a medias?</summary>
          <p>
            Se eliminó el truncado con puntos suspensivos a mitad de idea. Las salidas se pulen para
            cerrar en frase completa.
          </p>
        </details>
        <details>
          <summary>¿Qué hace el modo Pro?</summary>
          <p>
            Captura, ficha del personaje, research web, consejo de 5 agentes (Schopenhauer +
            influencia/masas/narrativa/diablo), variantes listas para comentario o post.
          </p>
        </details>
      </section>

      <section className="plans" id="planes">
        <p className="section-kicker">Planes</p>
        <h2>Pro es el dojo completo.</h2>
        <div className="plan-grid">
          <article>
            <h3>Gratis</h3>
            <strong>$0</strong>
            <p>Contraataque · desmontar · arsenal</p>
            <a href="#inicio">Probar</a>
          </article>
          <article className="featured">
            <span>Incluido en app</span>
            <h3>Modo Pro</h3>
            <strong>Local</strong>
            <p>Captura · research · multi-agente · estilos</p>
            <a href="#inicio">Usar Pro</a>
          </article>
        </div>
      </section>

      <footer>
        <a className="brand" href="#inicio">
          El Erístico <span>Digital</span>
        </a>
        <p>Estrategia pura de combate verbal. Open source.</p>
        <small>© 2026 El Erístico Digital</small>
      </footer>
    </main>
  );
}
