// Variant A — Editorial.
// Concept: black gallery wall. Serif headline (Fraunces — okay, scratch that:
// the rules forbid Inter/Fraunces overuse, so use 'Playfair Display' for
// editorial display + 'IBM Plex Sans' for body). Tight cream/black with
// nothing else. Big typographic moments, calm whitespace.

const { useState, useEffect, useRef } = React;

const themeA = {
  light: { bg: '#f4f1ea', surface: '#ffffff', border: 'rgba(0,0,0,.10)', text: '#171615', muted: '#6b6660', accent: '#171615', accentText: '#f4f1ea', subtle: 'rgba(0,0,0,.04)' },
  dark:  { bg: '#0d0d0e', surface: '#161617', border: 'rgba(255,255,255,.09)', text: '#ece8df', muted: '#8a857c', accent: '#ece8df', accentText: '#0d0d0e', subtle: 'rgba(255,255,255,.03)' },
  sepia: { bg: '#1a1612', surface: '#221d18', border: 'rgba(232,209,170,.12)', text: '#e8d1aa', muted: '#a08a6e', accent: '#e8d1aa', accentText: '#1a1612', subtle: 'rgba(232,209,170,.04)' },
};

// Pull shared globals into module scope. shared.jsx ran first.
const { SAMPLE_IMAGE, SAMPLE_RESULT, STEPS, SCREENS, useFakePipeline, useFakePlayhead, fmtTime, DEFAULT_CONTROLS, MOODS, VOCALS, GENRES } = window;

function VariantA({ theme = 'dark' }) {
  const t = themeA[theme] || themeA.dark;
  const [screen, setScreen] = useState('upload');
  const [controls, setControls] = useState(DEFAULT_CONTROLS);
  const [playing, setPlaying] = useState(false);
  const { stepIdx, done } = useFakePipeline(screen === 'loading');
  const [playT, setPlayT] = useFakePlayhead(playing, SAMPLE_RESULT.duration);

  useEffect(() => { if (done) setScreen('results'); }, [done]);

  const styles = {
    root: {
      width: '100%', height: '100%', background: t.bg, color: t.text,
      fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
      fontSize: 14, lineHeight: 1.55,
      display: 'flex', flexDirection: 'column',
    },
    header: {
      padding: '20px 32px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', borderBottom: `1px solid ${t.border}`,
    },
    logo: { fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' },
    logoMark: { fontStyle: 'italic' },
    nav: { display: 'flex', gap: 6, fontSize: 11, color: t.muted, textTransform: 'uppercase', letterSpacing: '.16em' },
    navItem: (active) => ({
      padding: '6px 10px', cursor: 'pointer', borderRadius: 999,
      background: active ? t.subtle : 'transparent', color: active ? t.text : t.muted,
    }),
    main: { flex: 1, padding: '40px 56px 48px', overflow: 'auto' },
  };

  return (
    <div style={styles.root}>
      <header style={styles.header}>
        <div style={styles.logo}>Per<span style={styles.logoMark}>Songify</span></div>
        <div style={styles.nav}>
          {SCREENS.map(s => (
            <div key={s} style={styles.navItem(screen === s)} onClick={() => setScreen(s)}>{s}</div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: t.muted, fontVariantNumeric: 'tabular-nums', textTransform: 'uppercase', letterSpacing: '.16em' }}>Iss. 04 · 2026</div>
      </header>

      <div style={styles.main}>
        {screen === 'upload'  && <UploadA t={t} controls={controls} setControls={setControls} onGenerate={() => setScreen('loading')} />}
        {screen === 'loading' && <LoadingA t={t} stepIdx={stepIdx} controls={controls} />}
        {screen === 'results' && <ResultsA t={t} playing={playing} setPlaying={setPlaying} playT={playT} setPlayT={setPlayT} onReset={() => { setPlaying(false); setPlayT(0); setScreen('upload'); }} />}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function UploadA({ t, controls, setControls, onGenerate }) {
  const [hasImage, setHasImage] = useState(true); // pre-loaded sample
  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: t.muted, marginBottom: 18 }}>An image · A song</div>
        <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 56, fontWeight: 400, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: 14 }}>
          Compose music<br/>from <em>any photograph</em>.
        </h1>
        <p style={{ color: t.muted, fontSize: 15, maxWidth: 460, margin: '0 auto' }}>
          Upload an image. We'll read its mood, palette and weight — then write you an original song.
        </p>
      </div>

      <div
        onClick={() => setHasImage(true)}
        style={{
          background: t.subtle, border: `1px solid ${t.border}`, borderRadius: 4,
          padding: hasImage ? 0 : '64px 32px', display: 'flex', alignItems: 'stretch', gap: 0, overflow: 'hidden',
          marginBottom: 28, minHeight: hasImage ? 240 : 'auto',
        }}
      >
        {hasImage ? (
          <>
            <div style={{ width: 240, flexShrink: 0, background: '#000' }}>
              <img src={SAMPLE_IMAGE} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
            </div>
            <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: t.muted, marginBottom: 8 }}>Selected image</div>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 22, fontWeight: 500 }}>amber-hour.jpg</div>
                <div style={{ color: t.muted, fontSize: 12, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>2.3 MB · 4032 × 3024</div>
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <button onClick={(e) => { e.stopPropagation(); setHasImage(false); }} style={{ background: 'transparent', border: `1px solid ${t.border}`, color: t.muted, padding: '8px 14px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Replace</button>
                <button onClick={(e) => { e.stopPropagation(); onGenerate(); }} style={{ background: t.accent, color: t.accentText, border: 'none', padding: '10px 20px', borderRadius: 999, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.02em' }}>
                  Compose →
                </button>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, textAlign: 'center', cursor: 'pointer' }}>
            <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 26, fontStyle: 'italic', marginBottom: 6 }}>Drop an image</div>
            <div style={{ color: t.muted, fontSize: 13 }}>JPG · PNG · WEBP &nbsp;·&nbsp; up to 12 MB</div>
          </div>
        )}
      </div>

      <ControlsA t={t} controls={controls} setControls={setControls} />
    </div>
  );
}

function ControlsA({ t, controls, setControls }) {
  const row = { display: 'grid', gridTemplateColumns: '120px 1fr', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${t.border}`, gap: 16 };
  const label = { fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: t.muted };
  const chips = { display: 'flex', gap: 6, flexWrap: 'wrap' };
  const chip = (active) => ({
    padding: '5px 12px', borderRadius: 999, fontSize: 12,
    border: `1px solid ${active ? t.text : t.border}`,
    background: active ? t.text : 'transparent',
    color: active ? t.bg : t.text,
    cursor: 'pointer', fontFamily: 'inherit',
  });
  return (
    <div>
      <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, fontStyle: 'italic', marginBottom: 4 }}>Direction <span style={{ color: t.muted, fontStyle: 'normal', fontSize: 12, fontFamily: 'inherit', letterSpacing: '.16em', textTransform: 'uppercase' }}>· optional</span></div>
      <div style={{ borderTop: `1px solid ${t.border}`, marginTop: 12 }}>
        <div style={row}>
          <div style={label}>Mood</div>
          <div style={chips}>{MOODS.map(m => <button key={m} style={chip(controls.mood === m)} onClick={() => setControls(c => ({...c, mood: m}))}>{m}</button>)}</div>
        </div>
        <div style={row}>
          <div style={label}>Genre</div>
          <div style={chips}>{GENRES.map(g => <button key={g} style={chip(controls.genre === g)} onClick={() => setControls(c => ({...c, genre: g}))}>{g}</button>)}</div>
        </div>
        <div style={row}>
          <div style={label}>Vocals</div>
          <div style={chips}>{VOCALS.map(v => <button key={v} style={chip(controls.vocals === v)} onClick={() => setControls(c => ({...c, vocals: v}))}>{v}</button>)}</div>
        </div>
        <div style={row}>
          <div style={label}>Tempo</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <input type="range" min="60" max="160" value={controls.tempo}
              onChange={e => setControls(c => ({...c, tempo: +e.target.value}))}
              style={{ flex: 1, accentColor: t.text }} />
            <div style={{ fontVariantNumeric: 'tabular-nums', width: 64, textAlign: 'right', fontFamily: '"Playfair Display", serif', fontSize: 18 }}>{controls.tempo} <span style={{ fontFamily: 'inherit', fontSize: 11, color: t.muted, letterSpacing: '.16em' }}>BPM</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function LoadingA({ t, stepIdx, controls }) {
  return (
    <div style={{ maxWidth: 760, margin: '40px auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
      <div style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 4, background: '#000', filter: 'brightness(.7)' }}>
        <img src={SAMPLE_IMAGE} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
      </div>
      <div>
        <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: t.muted, marginBottom: 14 }}>Now composing</div>
        <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 38, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 10 }}>
          A song is taking shape.
        </h2>
        <p style={{ color: t.muted, marginBottom: 32, fontSize: 14 }}>Usually 60–90 seconds. {controls.genre} · {controls.mood.toLowerCase()} · {controls.tempo} bpm.</p>

        <div style={{ borderTop: `1px solid ${t.border}` }}>
          {STEPS.map((s, i) => {
            const isDone = i < stepIdx;
            const isActive = i === stepIdx;
            return (
              <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', alignItems: 'center', padding: '14px 0', borderBottom: `1px solid ${t.border}`, opacity: isDone || isActive ? 1 : 0.4 }}>
                <div style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, fontStyle: 'italic', color: t.muted }}>{String(i+1).padStart(2,'0')}</div>
                <div style={{ fontSize: 14 }}>{s.label}</div>
                <div style={{ fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: isDone ? t.text : isActive ? t.text : t.muted }}>
                  {isDone ? '✓ Done' : isActive ? <BlinkLabel /> : 'Queued'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BlinkLabel() {
  return (
    <span>
      Working
      <span style={{ animation: 'persongifyBlink 1.4s steps(4) infinite' }}>…</span>
      <style>{`@keyframes persongifyBlink { 0% { opacity: 0; } 50% { opacity: 1; } }`}</style>
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────────
function ResultsA({ t, playing, setPlaying, playT, setPlayT, onReset }) {
  const r = SAMPLE_RESULT;
  const [tab, setTab] = useState('lyrics');
  const [shareCopied, setShareCopied] = useState(false);
  const pct = (playT / r.duration) * 100;

  return (
    <div style={{ maxWidth: 880, margin: '0 auto' }}>
      {/* Hero */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 32, alignItems: 'stretch', marginBottom: 28 }}>
        <div style={{ aspectRatio: '1', overflow: 'hidden', borderRadius: 4, background: '#000' }}>
          <img src={SAMPLE_IMAGE} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 11, letterSpacing: '.24em', textTransform: 'uppercase', color: t.muted, marginBottom: 12 }}>An original composition</div>
            <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 52, fontWeight: 400, lineHeight: 1.02, letterSpacing: '-0.02em', marginBottom: 16 }}>
              {r.title.split(' ').map((w, i) => i === 1 ? <em key={i}> {w}</em> : <span key={i}>{i ? ' ' : ''}{w}</span>)}
            </h1>
            <div style={{ display: 'flex', gap: 16, color: t.muted, fontSize: 13, flexWrap: 'wrap' }}>
              <span>{r.genre}</span><span>·</span><span>{r.mood}</span><span>·</span><span style={{ fontVariantNumeric: 'tabular-nums' }}>{r.tempo} BPM</span><span>·</span><span>{r.key}</span>
            </div>
          </div>

          {/* Player */}
          <div style={{ marginTop: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
              <button
                onClick={() => setPlaying(p => !p)}
                style={{ width: 56, height: 56, borderRadius: '50%', border: `1px solid ${t.text}`, background: t.text, color: t.bg, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <div style={{ flex: 1 }}>
                <div onClick={(e) => {
                  const r2 = e.currentTarget.getBoundingClientRect();
                  setPlayT(((e.clientX - r2.left) / r2.width) * r.duration);
                }} style={{ height: 2, background: t.border, position: 'relative', cursor: 'pointer', marginBottom: 6 }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: t.text }} />
                  <div style={{ position: 'absolute', left: `${pct}%`, top: '50%', transform: 'translate(-50%,-50%)', width: 8, height: 8, borderRadius: '50%', background: t.text }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontVariantNumeric: 'tabular-nums', fontSize: 11, color: t.muted, letterSpacing: '.06em' }}>
                  <span>{fmtTime(playT)}</span><span>{fmtTime(r.duration)}</span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={{ flex: 1, background: 'transparent', border: `1px solid ${t.border}`, color: t.text, padding: '10px 16px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.04em' }}>↓ Download MP3</button>
              <button onClick={() => { setShareCopied(true); setTimeout(() => setShareCopied(false), 1600); }} style={{ flex: 1, background: 'transparent', border: `1px solid ${t.border}`, color: t.text, padding: '10px 16px', borderRadius: 999, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.04em' }}>{shareCopied ? '✓ Link copied' : 'Copy share link'}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ borderTop: `1px solid ${t.border}`, borderBottom: `1px solid ${t.border}`, display: 'flex', gap: 24, padding: '12px 0', marginBottom: 18 }}>
        {['lyrics', 'about'].map(k => (
          <div key={k} onClick={() => setTab(k)} style={{ fontFamily: '"Playfair Display", serif', fontSize: 18, fontStyle: 'italic', cursor: 'pointer', color: tab === k ? t.text : t.muted, paddingBottom: 2, borderBottom: tab === k ? `1px solid ${t.text}` : '1px solid transparent' }}>
            {k === 'lyrics' ? 'The Lyrics' : 'On the image'}
          </div>
        ))}
      </div>

      {tab === 'lyrics' ? (
        <pre style={{ fontFamily: '"Playfair Display", serif', fontSize: 19, lineHeight: 1.65, whiteSpace: 'pre-wrap', color: t.text, columnCount: 2, columnGap: 40, fontWeight: 400 }}>{r.lyrics}</pre>
      ) : (
        <div style={{ fontSize: 16, lineHeight: 1.7, color: t.text, maxWidth: 620 }}>
          <span style={{ fontFamily: '"Playfair Display", serif', fontSize: 44, lineHeight: .9, float: 'left', marginRight: 8, marginTop: 4, fontWeight: 500 }}>{r.description[0]}</span>
          {r.description.slice(1)}
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: 40 }}>
        <button onClick={onReset} style={{ background: 'transparent', border: 'none', color: t.muted, fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: 'inherit' }}>← Try another image</button>
      </div>
    </div>
  );
}

window.VariantA = VariantA;
