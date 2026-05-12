// Shared logic, sample content, and small primitives reused across variants.
// Each variant imports the *concept* — they each ship their own visual layer.

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// Sample image used by all prototypes (a small abstract photo placeholder).
// Inlined SVG so prototypes work offline and look intentional without a real
// upload.
const SAMPLE_IMAGE = "data:image/svg+xml;utf8," + encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a1820"/>
      <stop offset=".5" stop-color="#3b2a3f"/>
      <stop offset="1" stop-color="#7a4a3a"/>
    </linearGradient>
    <radialGradient id="s" cx=".75" cy=".25" r=".4">
      <stop offset="0" stop-color="#f4d28a" stop-opacity=".9"/>
      <stop offset="1" stop-color="#f4d28a" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="600" height="600" fill="url(#g)"/>
  <rect width="600" height="600" fill="url(#s)"/>
  <path d="M0 420 Q150 360 300 400 T600 380 L600 600 L0 600 Z" fill="#0a0a10" opacity=".85"/>
  <path d="M0 460 Q200 420 360 450 T600 440 L600 600 L0 600 Z" fill="#000" opacity=".7"/>
  <circle cx="450" cy="160" r="42" fill="#f4d28a" opacity=".85"/>
</svg>
`);

// Sample lyrics + description for the results view (so prototypes feel
// complete without a backend).
const SAMPLE_RESULT = {
  title: "Amber Hour",
  genre: "Indie folk",
  mood: "Wistful",
  tempo: 86,
  key: "G major",
  duration: 142, // seconds
  description:
    "A wide horizon at golden hour. The sky bleeds warm amber into deep indigo, with a low silhouette of hills cutting across the lower third. The air feels still — that suspended moment between day and night when sound carries further than usual.",
  lyrics:
`The hills are leaning into night
A copper light along the ridge
I keep my hands inside my coat
And count the breath between each bridge

Amber hour, amber hour
Tell me where the daylight goes
Amber hour, amber hour
Holds me close before it closes

A field is humming under stars
A train is passing somewhere far
I'll meet you at the bend in time
Where every quiet thing belongs`
};

// ── Step machine ──────────────────────────────────────────────────────────
// Three real backend stages, surfaced consistently across variants.
const STEPS = [
  { id: 'upload',  label: 'Upload to cloud storage',     short: 'Upload' },
  { id: 'analyze', label: 'Analyze image with Gemini',   short: 'Analyze' },
  { id: 'compose', label: 'Compose music with Lyria',    short: 'Compose' },
];

// Hook driving the fake pipeline animation. Used by every variant.
function useFakePipeline(running) {
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!running) { setStepIdx(0); setDone(false); return; }
    setStepIdx(0); setDone(false);
    const t1 = setTimeout(() => setStepIdx(1), 1800);
    const t2 = setTimeout(() => setStepIdx(2), 4200);
    const t3 = setTimeout(() => setDone(true), 7200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [running]);
  return { stepIdx, done };
}

// Fake play head — just animates a progress bar so the player feels alive
// without needing real audio.
function useFakePlayhead(playing, duration) {
  const [t, setT] = useState(0);
  const raf = useRef(null);
  const last = useRef(null);
  useEffect(() => {
    if (!playing) {
      if (raf.current) cancelAnimationFrame(raf.current);
      last.current = null;
      return;
    }
    const tick = (now) => {
      if (last.current == null) last.current = now;
      const dt = (now - last.current) / 1000;
      last.current = now;
      setT((prev) => {
        const next = prev + dt;
        if (next >= duration) return 0;
        return next;
      });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => raf.current && cancelAnimationFrame(raf.current);
  }, [playing, duration]);
  return [t, setT];
}

const fmtTime = (s) => {
  if (!isFinite(s) || s < 0) s = 0;
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2,'0')}`;
};

// Generation controls (mood / gender / genre / tempo) shared shape, each
// variant skins this differently.
const DEFAULT_CONTROLS = {
  mood: 'Wistful',
  vocals: 'Female',
  genre: 'Indie folk',
  tempo: 86,
};

const MOODS  = ['Wistful', 'Bright', 'Tense', 'Dreamy', 'Driving', 'Hushed'];
const VOCALS = ['Female', 'Male', 'Duet', 'Instrumental'];
const GENRES = ['Indie folk', 'Synthwave', 'Hip-hop', 'Lo-fi', 'Ambient', 'Soul', 'Post-rock', 'Jazz'];

// SCREENS
const SCREENS = ['upload', 'loading', 'results'];

Object.assign(window, {
  SAMPLE_IMAGE, SAMPLE_RESULT, STEPS, SCREENS,
  useFakePipeline, useFakePlayhead, fmtTime,
  DEFAULT_CONTROLS, MOODS, VOCALS, GENRES,
});
