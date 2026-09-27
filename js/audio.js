/* Effets sonores générés avec la Web Audio API (aucun fichier externe). */
window.SFX = (() => {
  let ctx = null;
  let master = null;
  let muted = false;
  try { muted = localStorage.getItem('adm-muted') === '1'; } catch (e) { /* stockage bloqué */ }

  function ac() {
    if (muted) return null;
    if (!ctx) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
      master = ctx.createGain();
      master.gain.value = 0.55;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, o = {}) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (o.when || 0);
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(freq, t);
    if (o.slide) osc.frequency.exponentialRampToValueAtTime(o.slide, t + dur);
    if (o.vibrato) {
      const lfo = c.createOscillator();
      const lg = c.createGain();
      lfo.frequency.value = o.vibrato;
      lg.gain.value = freq * 0.04;
      lfo.connect(lg).connect(osc.frequency);
      lfo.start(t); lfo.stop(t + dur);
    }
    const vol = o.vol == null ? 0.25 : o.vol;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (o.attack || 0.01));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g).connect(master);
    osc.start(t); osc.stop(t + dur + 0.05);
  }

  function noise(dur, o = {}) {
    const c = ac(); if (!c) return;
    const t = c.currentTime + (o.when || 0);
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const f = c.createBiquadFilter();
    f.type = o.filterType || 'lowpass';
    f.frequency.value = o.filter || 1200;
    f.Q.value = o.q || 0.8;
    const g = c.createGain();
    const vol = o.vol == null ? 0.25 : o.vol;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t); src.stop(t + dur + 0.02);
  }

  const NOTES = [523.25, 659.25, 783.99, 1046.5];

  return {
    isMuted: () => muted,
    toggle() {
      muted = !muted;
      try { localStorage.setItem('adm-muted', muted ? '1' : '0'); } catch (e) { /* ignore */ }
      if (!muted) this.click();
      return muted;
    },
    click() { tone(700, 0.05, { type: 'square', vol: 0.06 }); },
    correct() { tone(660, 0.1, { type: 'triangle', vol: 0.25 }); tone(990, 0.18, { type: 'triangle', vol: 0.25, when: 0.09 }); },
    wrong() { tone(170, 0.3, { type: 'sawtooth', vol: 0.14, slide: 100 }); },
    tick() { tone(1250, 0.03, { type: 'square', vol: 0.04 }); },
    pencil() { for (let i = 0; i < 4; i++) noise(0.04, { when: i * 0.05, filter: 3500, filterType: 'highpass', vol: 0.08 }); },
    bell() { for (let i = 0; i < 14; i++) tone(i % 2 ? 1480 : 1560, 0.07, { type: 'square', vol: 0.05, when: i * 0.065 }); },
    whistle() { tone(2700, 0.55, { type: 'sine', vol: 0.16, vibrato: 28 }); },
    applause(strength = 1) {
      const n = Math.round(25 * strength) + 5;
      for (let i = 0; i < n; i++) noise(0.05, { when: Math.random() * 1.4, filter: 2500 + Math.random() * 2000, filterType: 'bandpass', q: 1.5, vol: 0.12 });
    },
    boo() { tone(140, 0.7, { type: 'sawtooth', vol: 0.08, slide: 110, vibrato: 5 }); tone(150, 0.7, { type: 'sawtooth', vol: 0.06, slide: 115, when: 0.05 }); },
    punch() { tone(95, 0.3, { type: 'sine', vol: 0.7, slide: 38 }); noise(0.14, { filter: 900, vol: 0.55 }); },
    fall() { tone(950, 0.85, { type: 'sine', vol: 0.18, slide: 110 }); noise(0.3, { when: 0.85, filter: 220, vol: 0.7 }); tone(60, 0.3, { when: 0.85, vol: 0.5, slide: 35 }); },
    thunder() { noise(1.6, { filter: 260, vol: 0.55 }); noise(0.4, { filter: 600, vol: 0.3, when: 0.05 }); },
    fanfare() { [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5].forEach((f, i) => tone(f, i === 5 ? 0.6 : 0.16, { type: 'triangle', vol: 0.22, when: i * 0.13 })); },
    sad() { [392, 349.23, 329.63, 261.63].forEach((f, i) => tone(f, 0.45, { type: 'triangle', vol: 0.2, when: i * 0.38 })); },
    note(i, dur = 0.35) { tone(NOTES[i % 4], dur, { type: 'triangle', vol: 0.28 }); },
    paper() { noise(0.18, { filter: 2800, filterType: 'highpass', vol: 0.18 }); },
    stamp() { tone(110, 0.12, { vol: 0.45 }); noise(0.08, { filter: 500, vol: 0.4 }); },
    phone() { for (let i = 0; i < 2; i++) for (let j = 0; j < 8; j++) tone(j % 2 ? 480 : 440, 0.05, { type: 'square', vol: 0.06, when: i * 0.9 + j * 0.05 }); },
    whoosh() { noise(0.35, { filter: 1200, filterType: 'bandpass', vol: 0.25 }); },
  };
})();
