/* Moteur principal : état, écrans, HUD, carte, avatar. */
(() => {
  'use strict';
  const D = window.ADM;

  // ---------- Utilitaires ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);

  const MAX_EXAMS = 4;
  const SKINS = ['#f6d3b8', '#e2ae86', '#b97a56', '#7a4b33'];
  const HAIRS = ['#2b1d14', '#6b4226', '#d9a441', '#b0472a', '#15151a'];
  const SHIRTS = ['#f26b1d', '#1d5fae', '#22915a', '#d7263d', '#7b4ab6', '#f6c33b'];
  const TRAITS = [
    { id: 'math', icon: '🧮', name: 'Génie des maths', desc: '+10 s au calcul mental, +5 s aux questions de maths.' },
    { id: 'fr', icon: '📚', name: 'Rat de bibliothèque', desc: 'Ta 1re faute de dictée ne compte pas. +5 s en français.' },
    { id: 'clown', icon: '🎭', name: 'Clown de la classe', desc: '+10 points de charisme aux ateliers et aux auditions.' },
    { id: 'zen', icon: '🧘', name: 'Zen total', desc: 'Toutes les minuteries durent 25 % plus longtemps.' },
  ];

  const byId = (id) => D.SCHOOLS.find((s) => s.id === id);

  // ---------- Avatar SVG ----------
  function avatarSVG(p, o = {}) {
    const skin = o.skinColor || SKINS[p.skin] || SKINS[0];
    const hair = o.hairColor || HAIRS[p.hair] || HAIRS[0];
    const shirt = o.shirtColor || SHIRTS[p.shirt] || SHIRTS[0];
    const face = o.face || 'happy';
    const ink = '#25273a';
    let eyes;
    if (face === 'ko') eyes = `<path d="M43 49l9 9M52 49l-9 9M68 49l9 9M77 49l-9 9" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`;
    else if (o.shades) eyes = `<rect x="36" y="46" width="48" height="13" rx="5" fill="#101014"/><path d="M40 50h12" stroke="#555" stroke-width="2"/>`;
    else if (face === 'hurt') eyes = `<path d="M42 52l10 4M78 52l-10 4" stroke="${ink}" stroke-width="3.5" stroke-linecap="round"/>`;
    else eyes = `<circle cx="48" cy="54" r="4.2" fill="${ink}"/><circle cx="72" cy="54" r="4.2" fill="${ink}"/>`;
    const mouths = {
      happy: `<path d="M47 69q13 11 26 0" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      worried: `<path d="M49 75q11 -8 22 0" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      hurt: `<ellipse cx="60" cy="74" rx="7" ry="9" fill="${ink}"/>`,
      ko: `<path d="M48 74q6 -5 12 0t12 0" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
      mean: `<path d="M48 74q12 -4 24 2" stroke="${ink}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`,
    };
    const brows = face === 'mean' ? `<path d="M38 40l16 6M82 40l-16 6" stroke="${ink}" stroke-width="4" stroke-linecap="round"/>` : '';
    const hairPath = o.cap
      ? `<path d="M28 50a32 30 0 0 1 64 0z" fill="${o.cap}" stroke="${ink}" stroke-width="3"/><rect x="8" y="42" width="26" height="8" rx="4" fill="${o.cap}" stroke="${ink}" stroke-width="3"/>`
      : `<path d="M29 56a31 31 0 0 1 62 0q-8 -14 -31 -13q-23 -1 -31 13z" fill="${hair}" stroke="${ink}" stroke-width="3" stroke-linejoin="round"/>`;
    const straps = o.bully ? '' : `<path d="M44 92v44M76 92v44" stroke="${ink}" stroke-width="5" stroke-linecap="round" opacity="0.75"/>`;
    const fist = o.fist ? `<circle cx="104" cy="112" r="10" fill="${skin}" stroke="${ink}" stroke-width="3"/>` : '';
    const rightArm = o.fist
      ? `<rect x="86" y="94" width="26" height="15" rx="7" fill="${shirt}" stroke="${ink}" stroke-width="3"/>`
      : `<rect x="86" y="92" width="16" height="46" rx="8" fill="${shirt}" stroke="${ink}" stroke-width="3"/><circle cx="94" cy="140" r="7" fill="${skin}" stroke="${ink}" stroke-width="3"/>`;
    return `<svg viewBox="0 0 120 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="40" y="144" width="16" height="42" rx="6" fill="#34495e" stroke="${ink}" stroke-width="3"/>
      <rect x="64" y="144" width="16" height="42" rx="6" fill="#34495e" stroke="${ink}" stroke-width="3"/>
      <rect x="34" y="182" width="26" height="11" rx="5" fill="${ink}"/><rect x="62" y="182" width="26" height="11" rx="5" fill="${ink}"/>
      <rect x="18" y="92" width="16" height="46" rx="8" fill="${shirt}" stroke="${ink}" stroke-width="3"/>
      <circle cx="26" cy="140" r="7" fill="${skin}" stroke="${ink}" stroke-width="3"/>
      <rect x="31" y="86" width="58" height="64" rx="15" fill="${shirt}" stroke="${ink}" stroke-width="3"/>
      ${straps}${rightArm}${fist}
      <rect x="52" y="78" width="16" height="12" fill="${skin}" stroke="${ink}" stroke-width="3"/>
      <circle cx="60" cy="56" r="30" fill="${skin}" stroke="${ink}" stroke-width="3"/>
      ${hairPath}${brows}${eyes}${mouths[face] || mouths.happy}
    </svg>`;
  }

  // ---------- Carte de Montréal (stylisée, « nord montréalais » en haut) ----------
  function mapSVG() {
    return `<svg viewBox="0 0 1000 640" role="img" aria-label="Carte stylisée de l'île de Montréal">
      <defs><pattern id="waves" width="46" height="22" patternUnits="userSpaceOnUse"><path d="M0 11q11.5 -9 23 0t23 0" fill="none" stroke="#b5d6e4" stroke-width="2"/></pattern></defs>
      <rect width="1000" height="640" fill="#cfe6ef"/>
      <rect width="1000" height="640" fill="url(#waves)"/>
      <path d="M0 0H1000V40C850 45 700 70 520 115C380 150 200 170 0 200Z" fill="#e3ecd2" stroke="#25273a" stroke-width="3"/>
      <path d="M0 520C250 540 450 580 650 590C800 596 920 560 1000 470V640H0Z" fill="#e3ecd2" stroke="#25273a" stroke-width="3"/>
      <text x="470" y="62" font-family="Bagel Fat One, sans-serif" font-size="30" fill="#8a9a7a">LAVAL</text>
      <text x="360" y="622" font-family="Bagel Fat One, sans-serif" font-size="26" fill="#8a9a7a">RIVE-SUD</text>
      <text x="90" y="250" font-family="Kalam, cursive" font-size="22" fill="#4f7d93" transform="rotate(-12 90 250)">Rivière des Prairies</text>
      <text x="120" y="492" font-family="Kalam, cursive" font-size="24" fill="#4f7d93" transform="rotate(7 120 492)">Fleuve Saint-Laurent</text>
      <path d="M40 360C60 300 140 260 240 240C340 220 420 200 520 170C620 140 760 110 880 95C930 90 975 100 985 125C990 170 960 240 930 300C900 370 870 430 840 470C800 520 720 520 650 505C580 495 520 510 460 500C380 488 320 470 250 450C170 430 90 420 40 360Z" fill="#f6f0da" stroke="#25273a" stroke-width="4"/>
      <path d="M392 292C430 470 520 505 590 462S700 330 642 70" fill="none" stroke="#f26b1d" stroke-width="7" stroke-dasharray="2 12" stroke-linecap="round" opacity="0.85"/>
      <text x="336" y="284" font-family="Lexend, sans-serif" font-size="14" font-weight="700" fill="#bd4f0e">Ligne orange</text>
      <ellipse cx="505" cy="398" rx="64" ry="40" fill="#8cc084" stroke="#25273a" stroke-width="3"/>
      <path d="M524 356v24M515 364h18" stroke="#25273a" stroke-width="4" stroke-linecap="round"/>
      <text x="480" y="400" font-family="Kalam, cursive" font-size="17" font-weight="700" fill="#24502c">mont Royal</text>
      <ellipse cx="772" cy="546" rx="34" ry="15" fill="#e3ecd2" stroke="#25273a" stroke-width="3"/>
      <path d="M742 500L800 604" stroke="#25273a" stroke-width="7" stroke-linecap="round"/>
      <path d="M742 500L800 604" stroke="#8fa0b0" stroke-width="3" stroke-dasharray="6 5"/>
      <g transform="translate(888 300)"><ellipse cx="0" cy="8" rx="28" ry="12" fill="#fff" stroke="#25273a" stroke-width="3"/><path d="M13 4Q25 -38 4 -50" fill="none" stroke="#25273a" stroke-width="5" stroke-linecap="round"/></g>
      <text x="856" y="340" font-family="Kalam, cursive" font-size="15" fill="#5a5d72">le Stade</text>
      <text x="300" y="370" font-size="24">🚧</text><text x="640" y="482" font-size="22">🚧</text><text x="872" y="200" font-size="22">🚧</text><text x="210" y="330" font-size="20">🚧</text>
      <text x="470" y="380" font-size="18">🦝</text>
    </svg>`;
  }

  // ---------- Le jeu ----------
  const Game = {
    D, MAX_EXAMS, SKINS, HAIRS, SHIRTS, TRAITS, byId, avatarSVG,
    u: { $, $$, esc, rand, randi, pick, shuffle, clamp, reduceMotion, stars },
    state: null,
    cleanups: [],
    screens: {},
    engines: {},

    newState() {
      return {
        player: { name: '', g: 'x', skin: 0, hair: 0, shirt: 0, trait: null },
        jokers: { tutor: 2, muffin: 1 },
        exams: {},
        order: [],
        mod: null,
        seenEvents: [],
        jokersUsed: 0,
        current: null,
      };
    },

    boot() {
      this.state = this.newState();
      this.go('title');
    },

    // Accord selon le genre choisi : ag('admis', 'admise', 'admis·e')
    ag(m, f, x) { const g = this.state.player.g; return g === 'm' ? m : g === 'f' ? f : (x || m + '·e'); },
    hasTrait(t) { return this.state.player.trait === t; },

    // ---------- Gestion des écrans ----------
    go(name, ...args) {
      this.clear();
      try { window.scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { window.scrollTo(0, 0); }
      this.screenName = name;
      this.screens[name].apply(this, args);
      this.renderHud();
    },
    clear() {
      this.cleanups.forEach((f) => { try { f(); } catch (e) { /* ignore */ } });
      this.cleanups = [];
      $('#fx').innerHTML = '';
      this.closeModal();
      document.body.classList.remove('gloom');
    },
    set(html) { $('#screen').innerHTML = html; },
    later(fn, ms) { const id = setTimeout(fn, ms); this.cleanups.push(() => clearTimeout(id)); return id; },
    every(fn, ms) { const id = setInterval(fn, ms); this.cleanups.push(() => clearInterval(id)); return id; },
    listen(target, type, fn, opts) { target.addEventListener(type, fn, opts); this.cleanups.push(() => target.removeEventListener(type, fn, opts)); },
    frame(fn) {
      let id; let alive = true;
      const loop = (t) => { if (!alive) return; if (fn(t) !== false) id = requestAnimationFrame(loop); };
      id = requestAnimationFrame(loop);
      this.cleanups.push(() => { alive = false; cancelAnimationFrame(id); });
    },
    onKey(fn) {
      this.listen(document, 'keydown', (e) => {
        const tag = e.target && e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;
        // Entrée/Espace sur un bouton : le navigateur déclenche déjà le clic
        if (tag === 'BUTTON' && (e.key === 'Enter' || e.key === ' ')) return;
        fn(e);
      });
    },

    // ---------- Modale ----------
    openModal(html, onClose) {
      this.closeModal();
      const back = document.createElement('div');
      back.className = 'modal-back';
      back.innerHTML = `<div class="modal sheet" role="dialog" aria-modal="true">${html}</div>`;
      document.body.appendChild(back);
      const close = () => { this.closeModal(); if (onClose) onClose(); };
      back.addEventListener('click', (e) => { if (e.target === back || e.target.closest('[data-close]')) close(); });
      this._modalKey = (e) => { if (e.key === 'Escape') close(); };
      document.addEventListener('keydown', this._modalKey);
      this._modal = back;
      const first = back.querySelector('button:not([disabled])');
      if (first) first.focus();
      return back;
    },
    closeModal() {
      if (this._modal) { this._modal.remove(); this._modal = null; }
      if (this._modalKey) { document.removeEventListener('keydown', this._modalKey); this._modalKey = null; }
    },
    toast(msg, ms = 1800) {
      const t = document.createElement('div');
      t.className = 'toast'; t.textContent = msg;
      document.body.appendChild(t);
      setTimeout(() => t.remove(), ms);
    },

    // ---------- Effets ----------
    confetti(n = 90) {
      if (reduceMotion) return;
      const colors = ['#f26b1d', '#1d5fae', '#22915a', '#d7263d', '#f6c33b', '#7b4ab6'];
      for (let i = 0; i < n; i++) {
        const c = document.createElement('div');
        c.className = 'confetti';
        c.style.left = rand(0, 100) + 'vw';
        c.style.background = pick(colors);
        c.style.setProperty('--dx', rand(-120, 120) + 'px');
        c.style.setProperty('--rot', rand(360, 1080) + 'deg');
        c.style.animationDuration = rand(2.2, 4.2) + 's';
        c.style.animationDelay = rand(0, 0.8) + 's';
        $('#fx').appendChild(c);
      }
    },
    fly(emoji, n = 5) {
      for (let i = 0; i < n; i++) {
        const f = document.createElement('div');
        f.className = 'flying';
        f.textContent = emoji;
        const fromLeft = Math.random() < 0.5;
        f.style.left = (fromLeft ? rand(-5, 10) : rand(85, 100)) + 'vw';
        f.style.top = rand(70, 100) + 'vh';
        f.style.setProperty('--dx', (fromLeft ? 1 : -1) * rand(30, 55) + 'vw');
        f.style.setProperty('--dy', -rand(35, 70) + 'vh');
        f.style.setProperty('--rot', rand(-720, 720) + 'deg');
        f.style.animationDelay = rand(0, 0.4) + 's';
        $('#fx').appendChild(f);
      }
    },
    shake(el) { if (reduceMotion || !el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); },

    // ---------- HUD ----------
    renderHud() {
      const hud = $('#hud');
      const st = this.state;
      if (['title', 'create'].includes(this.screenName) || !st.player.name) { hud.hidden = true; return; }
      hud.hidden = false;
      hud.innerHTML = `
        <div class="hud-logo">ADMISSION <small>Montréal · automne 2026</small></div>
        <span class="hud-chip">${avatarSVG(st.player)} ${esc(st.player.name)}</span>
        <span class="hud-chip" title="Jokers : tuteur privé et muffin">🧑‍🏫 ${st.jokers.tutor} · 🧁 ${st.jokers.muffin}</span>
        <span class="hud-chip" title="Demandes d'admission utilisées">📨 ${st.order.length}/${MAX_EXAMS}</span>
        <button class="hud-btn" id="mute" aria-label="Couper ou remettre le son">${SFX.isMuted() ? '🔇' : '🔊'}</button>`;
      $('#mute').onclick = () => { SFX.toggle(); $('#mute').textContent = SFX.isMuted() ? '🔇' : '🔊'; };
    },

    // ---------- Règles d'examen ----------
    timeFactor() {
      let f = (this.state.mod && this.state.mod.time) || 1;
      if (this.hasTrait('zen')) f *= 1.25;
      return f;
    },
    blockReason(s) {
      const st = this.state;
      if (s.fallback) return null;
      if (st.exams[s.id]) return 'Déjà fait! Le résultat arrivera avec les autres lettres.';
      if (st.order.length >= MAX_EXAMS) return `Tu as utilisé tes ${MAX_EXAMS} demandes d'admission. Ta mère a dit : « Pas une de plus! »`;
      if (s.slot) {
        const clash = st.order.map(byId).find((o) => o.slot === s.slot);
        if (clash) return `Même date que ${clash.short} (${s.date}). Tu ne peux pas être à deux places en même temps!`;
      }
      return null;
    },
    examTotal(results) {
      const w = results.reduce((a, r) => a + (r.weight || 1), 0) || 1;
      return Math.round(results.reduce((a, r) => a + r.score * (r.weight || 1), 0) / w);
    },
    stanine(score) { return clamp(Math.round((score / 100) * 8) + 1, 1, 9); },
    impression(total) {
      if (total >= 85) return { e: '😎', t: '« Facile. » (Tu mens un peu, mais c\'est bon signe.)' };
      if (total >= 70) return { e: '🙂', t: '« Correct… je pense? »' };
      if (total >= 50) return { e: '😬', t: '« Euh… on peut-tu aller manger une poutine? »' };
      return { e: '😱', t: '« J\'veux pas en parler. »' };
    },

    // ---------- Déroulement d'un examen ----------
    startExam(s) {
      this.state.current = { id: s.id, results: [], i: 0 };
      this.nextPart();
    },
    nextPart() {
      const cur = this.state.current;
      const s = byId(cur.id);
      if (cur.i >= s.exam.parts.length) return this.finishExam();
      this.go('partIntro', s, cur.i);
    },
    finishExam() {
      const st = this.state;
      const cur = st.current;
      const s = byId(cur.id);
      st.exams[s.id] = { results: cur.results, total: this.examTotal(cur.results) };
      st.order.push(s.id);
      st.mod = null;
      st.current = null;
      this.go('examDone', s);
    },
    useJoker(kind) {
      const st = this.state;
      if (st.jokers[kind] <= 0) return false;
      st.jokers[kind]--;
      st.jokersUsed++;
      this.renderHud();
      return true;
    },
  };

  // =====================================================
  //  ÉCRANS
  // =====================================================
  const S = Game.screens;

  S.title = function () {
    const names = D.SCHOOLS.map((s) => `<span class="${s.fallback ? 'danger' : ''}">${esc(s.name)}</span>`).join('');
    this.set(`
      <section class="title-screen">
        <p class="chalk-sub">Montréal · automne 2026 · 6e année</p>
        <h1 class="chalk-title">ADMISSION</h1>
        <p class="tag">Sept écoles. Un automne. Une seule peur : Jeanne-Mance.</p>
        <div class="title-cone" aria-hidden="true">🚧</div>
        <div class="title-schools">${names}</div>
        <button class="btn big" id="start">Commencer ma 6e année</button>
        <p class="disclaimer">Parodie faite pour rire. Les écoles sont réelles et leurs vraies règles d'admission 2027-2028 ont inspiré le jeu, mais les épreuves sont inventées. Les bullies aussi.</p>
      </section>`);
    $('#start').onclick = () => { SFX.bell(); this.go('create'); };
    if (!reduceMotion) {
      this.every(() => {
        const l = document.createElement('div');
        l.className = 'leaf';
        l.textContent = pick(['🍁', '🍂', '🍁']);
        l.style.left = rand(0, 100) + 'vw';
        l.style.setProperty('--dx', rand(-120, 120) + 'px');
        l.style.setProperty('--rot', rand(-720, 720) + 'deg');
        l.style.animationDuration = rand(6, 11) + 's';
        l.style.fontSize = rand(16, 30) + 'px';
        $('#fx').appendChild(l);
        l.addEventListener('animationend', () => l.remove());
      }, 700);
    }
  };

  S.create = function () {
    const p = this.state.player;
    const sw = (arr, key, label) => arr.map((c, i) => `<button class="swatch" style="background:${c}" data-k="${key}" data-i="${i}" aria-pressed="${p[key] === i}" aria-label="${label} ${i + 1}"></button>`).join('');
    const genders = [['m', 'Un gars'], ['f', 'Une fille'], ['x', 'Je préfère pas dire']];
    this.set(`
      <div class="stack">
        <h1 class="chalk-title" style="font-size:clamp(2rem,6vw,3.2rem)">Qui passe les examens?</h1>
        <div class="sheet">
          <div class="creator">
            <div class="avatar-preview"><div id="preview">${avatarSVG(p)}</div><span class="hand" id="preview-name" style="font-size:1.4rem">${esc(p.name || '…')}</span></div>
            <div class="stack">
              <div class="field"><label for="name">Ton prénom</label><input type="text" id="name" maxlength="18" autocomplete="off" placeholder="Ex. : Léa, Samuel, Mohamed…" value="${esc(p.name)}"></div>
              <div class="field"><span class="label">Je suis…</span><div class="row">${genders.map(([g, l]) => `<button class="tool-btn" data-g="${g}" aria-pressed="${p.g === g}">${l}</button>`).join('')}</div></div>
              <div class="field"><span class="label">Peau</span><div class="swatches">${sw(SKINS, 'skin', 'Teint')}</div></div>
              <div class="field"><span class="label">Cheveux</span><div class="swatches">${sw(HAIRS, 'hair', 'Cheveux')}</div></div>
              <div class="field"><span class="label">Chandail</span><div class="swatches">${sw(SHIRTS, 'shirt', 'Chandail')}</div></div>
              <div class="field"><span class="label">Ton super-pouvoir de 6e année</span>
                <div class="traits">${TRAITS.map((t) => `<button class="trait" data-t="${t.id}" aria-pressed="${p.trait === t.id}"><b>${t.icon} ${t.name}</b><span>${t.desc}</span></button>`).join('')}</div>
              </div>
              <div class="row"><button class="btn big" id="go" disabled>C'est moi! →</button><span class="muted" id="why" style="font-size:.9rem"></span></div>
            </div>
          </div>
        </div>
      </div>`);
    const refresh = () => {
      $('#preview').innerHTML = avatarSVG(p);
      $('#preview-name').textContent = p.name || '…';
      const ok = p.name.trim().length > 0 && p.trait;
      $('#go').disabled = !ok;
      $('#why').textContent = ok ? '' : (!p.name.trim() ? 'Écris ton prénom.' : 'Choisis ton super-pouvoir.');
    };
    $('#name').addEventListener('input', (e) => { p.name = e.target.value.trimStart(); refresh(); });
    $('#name').addEventListener('keydown', (e) => { if (e.key === 'Enter' && !$('#go').disabled) $('#go').click(); });
    $$('.swatch').forEach((b) => b.onclick = () => {
      p[b.dataset.k] = +b.dataset.i; SFX.click();
      $$(`.swatch[data-k="${b.dataset.k}"]`).forEach((x) => x.setAttribute('aria-pressed', x === b));
      refresh();
    });
    $$('[data-g]').forEach((b) => b.onclick = () => { p.g = b.dataset.g; SFX.click(); $$('[data-g]').forEach((x) => x.setAttribute('aria-pressed', x === b)); });
    $$('.trait').forEach((b) => b.onclick = () => { p.trait = b.dataset.t; SFX.click(); $$('.trait').forEach((x) => x.setAttribute('aria-pressed', x === b)); refresh(); });
    $('#go').onclick = () => { p.name = p.name.trim(); SFX.correct(); this.go('intro'); };
    refresh();
    $('#name').focus();
  };

  S.intro = function () {
    const n = esc(this.state.player.name);
    this.set(`
      <div class="stack">
        <div class="comic">
          <div class="panel"><span class="cap">Fin septembre, 6e année</span><div class="emoji-big">👩‍🍳🗓️</div>
            <p class="speech">« ${n}, mon trésor, c'est la saison des examens d'admission! J'ai collé le calendrier sur le frigo. »</p></div>
          <div class="panel"><span class="cap">Le soir même</span><div class="emoji-big">👨‍💻📊</div>
            <p class="speech">« J'ai fait un fichier Excel. Onglet Plan A, onglet Plan B, onglet Plan C… onglet Plan D. »</p></div>
          <div class="panel dark"><span class="cap">Et si tu ne réussis rien?</span><div class="emoji-big">🏫⚡</div>
            <p class="speech">« …ce sera la <b>Polyvalente Jeanne-Mance</b>. »</p></div>
        </div>
        <div class="sheet">
          <h2>Les règles</h2>
          <ul class="facts" style="margin-top:10px">
            <li>Choisis jusqu'à <b>${MAX_EXAMS} écoles</b> sur la carte. Les frais d'inscription coûtent environ 50 $ chacun, et ta mère a dit : pas une de plus.</li>
            <li>Chaque école a sa vraie façon d'admettre : examen, test standardisé, ateliers, bulletin ou audition. Chacune devient un mini-jeu différent.</li>
            <li>Regarde les dates : deux épreuves tombent le <b>même samedi</b>.</li>
            <li>Toutes les lettres arrivent à la fin. ${this.ag('Admis', 'Admise')} nulle part? Direction Jeanne-Mance…</li>
            <li>Jokers : <b>🧑‍🏫 Tuteur privé ×2</b> (élimine deux mauvais choix) et <b>🧁 Muffin ×1</b> (+10 secondes).</li>
          </ul>
          <div class="row" style="margin-top:16px"><button class="btn big" id="go">Voir la carte des écoles →</button></div>
        </div>
      </div>`);
    this.later(() => SFX.thunder(), 1100);
    $('#go').onclick = () => { SFX.click(); this.go('map'); };
  };

  S.map = function () {
    const st = this.state;
    const pins = D.SCHOOLS.map((s) => {
      const done = !!st.exams[s.id];
      const blocked = !done && this.blockReason(s);
      const cls = ['pin', done && 'done', s.fallback && 'danger', blocked && 'full'].filter(Boolean).join(' ');
      return `<button class="${cls}" data-id="${s.id}" style="left:${s.map.x / 10}%;top:${s.map.y / 6.4}%;--pc:${s.color}" aria-label="${esc(s.name)}"><span class="head"><span>${s.emoji}</span></span><span class="label">${esc(s.pin || s.short)}</span></button>`;
    }).join('');
    const rows = [];
    for (let i = 0; i < MAX_EXAMS; i++) {
      const id = st.order[i];
      if (id) {
        const s = byId(id);
        rows.push(`<div class="cal-row"><span class="d">${esc(s.dateShort)}</span><span class="s">${s.emoji} ${esc(s.short)}</span><span class="sc">${this.impression(st.exams[id].total).e}</span></div>`);
      } else rows.push(`<div class="cal-row"><span class="d">—</span><span class="s muted">Demande libre</span></div>`);
    }
    const n = st.order.length;
    this.set(`
      <div class="stack">
        <div class="row" style="justify-content:space-between">
          <h1 class="chalk-title" style="font-size:clamp(1.8rem,5vw,2.6rem)">Où veux-tu aller?</h1>
          <p class="chalk-sub" style="font-size:1.2rem">Clique sur une école pour voir comment on y entre.</p>
        </div>
        <div class="map-layout">
          <div class="map-wrap">${mapSVG()}${pins}</div>
          <aside class="fridge">
            <h3>Sur le frigo</h3>
            <div class="cal">${rows.join('')}</div>
            <div class="jokers"><span class="joker-pill">🧑‍🏫 Tuteur ×${st.jokers.tutor}</span><span class="joker-pill">🧁 Muffin ×${st.jokers.muffin}</span></div>
            <p style="font-size:.88rem" class="muted">${n === 0 ? 'Aucune épreuve passée. Ta mère te regarde.' : n >= MAX_EXAMS ? 'C\'est fini! Il reste à attendre le facteur.' : `Encore ${MAX_EXAMS - n} demande${MAX_EXAMS - n > 1 ? 's' : ''} possible${MAX_EXAMS - n > 1 ? 's' : ''}.`}</p>
            <button class="btn ${n >= MAX_EXAMS ? 'green' : 'blue'}" id="mail" ${n ? '' : 'disabled'}>Attendre les lettres 📬</button>
          </aside>
        </div>
      </div>`);
    $$('.pin').forEach((b) => b.onclick = () => { SFX.click(); this.schoolModal(byId(b.dataset.id)); });
    $('#mail').onclick = () => this.confirmMail();
  };

  Game.confirmMail = function () {
    const st = this.state;
    if (st.order.length >= MAX_EXAMS) return this.go('mail');
    const m = this.openModal(`
      <div class="stack">
        <h2>Déjà fini?</h2>
        <p>Tu as fait ${st.order.length} épreuve${st.order.length > 1 ? 's' : ''} sur ${MAX_EXAMS} possibles. Moins d'essais, plus de risque de finir à Jeanne-Mance…</p>
        <div class="row"><button class="btn green" id="yes">Oui, j'attends les lettres</button><button class="btn ghost" data-close>Non, je continue</button></div>
      </div>`);
    m.querySelector('#yes').onclick = () => this.go('mail');
  };

  Game.schoolModal = function (s) {
    if (s.fallback) return this.jeanneModal(s);
    const block = this.blockReason(s);
    const parts = s.exam.parts.map((p) => `<li>${p.icon} <b>${esc(p.title)}</b>${p.hint ? ` : ${esc(p.hint)}` : ''}</li>`).join('');
    const m = this.openModal(`
      <div class="stack" style="--pc:${s.color}">
        <div class="school-head"><div class="school-badge">${s.emoji}</div>
          <div><h2 style="font-size:1.6rem">${esc(s.name)}</h2><p class="muted">${esc(s.type)} · ${esc(s.hood)}</p></div></div>
        <div class="meta-grid">
          <div class="meta"><div class="k">Fondé en</div><div class="v">${esc(s.founded)}</div></div>
          <div class="meta"><div class="k">Épreuve</div><div class="v">${esc(s.exam.format)}</div></div>
          <div class="meta"><div class="k">Date</div><div class="v">${esc(s.date)}</div></div>
          <div class="meta"><div class="k">Sélectivité</div><div class="v stars">${stars(s.stars)}</div></div>
        </div>
        <div><p class="eyebrow">Comment on entre, pour vrai</p><p>${s.process}</p></div>
        <div><p class="eyebrow">Le savais-tu?</p><ul class="facts">${s.facts.map((f) => `<li>${f}</li>`).join('')}</ul></div>
        <div><p class="eyebrow">Ce qui t'attend dans le jeu</p><ul class="facts">${parts}</ul></div>
        ${block ? `<p class="red-pen" style="font-size:1.15rem">${esc(block)}</p>` : ''}
        <div class="row"><button class="btn" id="goexam" ${block ? 'disabled' : ''}>Y aller! →</button><button class="btn ghost" data-close>Fermer</button></div>
      </div>`);
    const b = m.querySelector('#goexam');
    if (b && !block) b.onclick = () => { SFX.click(); this.go('event', s); };
  };

  Game.jeanneModal = function (s) {
    const m = this.openModal(`
      <div class="stack" style="--pc:${s.color}">
        <div class="school-head"><div class="school-badge">${s.emoji}</div>
          <div><h2 style="font-size:1.6rem">${esc(s.name)}</h2><p class="muted">${esc(s.type)} · ${esc(s.hood)}</p></div></div>
        <div><p class="eyebrow">Comment on entre</p><p>${s.process}</p></div>
        <div><p class="eyebrow">Le savais-tu?</p><ul class="facts">${s.facts.map((f) => `<li>${f}</li>`).join('')}</ul></div>
        <p class="red-pen" style="font-size:1.2rem">Mais dans CE jeu-ci, c'est ici que tu finis si tu rates tout. Brrr.</p>
        <div class="row" id="jm-actions"><button class="btn red" id="volunteer">Y aller volontairement 🤡</button><button class="btn ghost" data-close>Non merci!</button></div>
      </div>`);
    m.querySelector('#volunteer').onclick = () => {
      SFX.wrong();
      m.querySelector('#jm-actions').innerHTML = `
        <p style="flex-basis:100%"><b>Es-tu VRAIMENT ${this.ag('sûr', 'sûre')}?</b> Ta mère vient d'échapper sa tasse de café. Ton père ferme son fichier Excel en silence.</p>
        <button class="btn red" id="really">Oui, j'aime le danger</button><button class="btn ghost" data-close>Non, je me suis trompé de bouton</button>`;
      m.querySelector('#really').onclick = () => this.go('jeanneMance', { voluntary: true });
    };
  };

  S.event = function (s) {
    const st = this.state;
    let pool = D.EVENTS.filter((e) => (!e.only || e.only.includes(s.id)) && !st.seenEvents.includes(e.id));
    if (!pool.length) pool = D.EVENTS.filter((e) => !e.only);
    const specific = pool.filter((e) => e.only);
    const ev = specific.length && Math.random() < 0.6 ? pick(specific) : pick(pool);
    st.seenEvents.push(ev.id);
    const fx = ev.effect || {};
    st.mod = null;
    let tag = '<span class="effect-tag neutral">Aucun effet. Ouf.</span>';
    if (fx.time) {
      st.mod = { time: fx.time, label: ev.short };
      const pct = Math.round((fx.time - 1) * 100);
      tag = `<span class="effect-tag ${pct > 0 ? 'good' : 'bad'}">⏱️ Temps ${pct > 0 ? '+' : '−'}${Math.abs(pct)} % pour cette épreuve</span>`;
    } else if (fx.tutor) { st.jokers.tutor += fx.tutor; tag = `<span class="effect-tag good">🧑‍🏫 +${fx.tutor} Tuteur privé</span>`; }
    else if (fx.muffin) { st.jokers.muffin += fx.muffin; tag = `<span class="effect-tag good">🧁 +${fx.muffin} Muffin</span>`; }
    this.set(`
      <div class="event-card sheet plain stack center">
        <p class="eyebrow">En route vers ${esc(s.short)} · ${esc(s.date)}</p>
        <div class="icon" aria-hidden="true">${ev.icon}</div>
        <p style="font-size:1.15rem">${ev.text}</p>
        ${tag}
        <button class="btn big" id="go">Arriver à l'épreuve →</button>
      </div>`);
    if (fx.time && fx.time < 1) SFX.wrong(); else if (fx.time || fx.tutor || fx.muffin) SFX.correct();
    $('#go').onclick = () => { SFX.click(); this.go('examIntro', s); };
  };

  S.examIntro = function (s) {
    const st = this.state;
    const parts = s.exam.parts.map((p, i) => `<li><b>Partie ${i + 1} : ${p.icon} ${esc(p.title)}</b>${p.hint ? ` : ${esc(p.hint)}` : ''}</li>`).join('');
    const mods = [];
    if (st.mod) mods.push(`⏱️ ${esc(st.mod.label)} : temps ×${st.mod.time.toFixed(2).replace('.', ',')}`);
    if (this.hasTrait('zen')) mods.push('🧘 Zen total : temps +25 %');
    this.set(`
      <div class="exam">
        <div class="sheet stack" style="--pc:${s.color}">
          <div class="school-head"><div class="school-badge">${s.emoji}</div>
            <div><p class="eyebrow">${esc(s.date)} · ${esc(s.exam.format)}</p><h2>${esc(s.exam.title)}</h2></div></div>
          <p>${s.exam.blurb}</p>
          <ol class="facts" style="list-style:none;padding:0">${parts}</ol>
          ${mods.length ? `<p class="hand" style="font-size:1.1rem;color:var(--blue)">${mods.join('<br>')}</p>` : ''}
          <p class="muted" style="font-size:.9rem">Seuil d'admission : secret 🤫 · Sélectivité <span class="stars">${stars(s.stars)}</span></p>
          <div class="row"><button class="btn big" id="go">Retourner la feuille ✏️</button></div>
        </div>
      </div>`);
    $('#go').onclick = () => { SFX.bell(); this.startExam(s); };
  };

  S.partIntro = function (s, i) {
    const p = s.exam.parts[i];
    const total = s.exam.parts.length;
    this.set(`
      <div class="exam">
        <div class="sheet plain stack center" style="text-align:center">
          <p class="eyebrow">${esc(s.short)} · Partie ${i + 1} de ${total}</p>
          <div style="font-size:3.4rem;line-height:1">${p.icon}</div>
          <h2>${esc(p.title)}</h2>
          <p style="max-width:52ch">${p.intro}</p>
          <button class="btn big" id="go">C'est parti!</button>
          <p class="muted" style="font-size:.8rem">Astuce : les touches 1, 2, 3, 4 marchent aussi pour répondre.</p>
        </div>
      </div>`);
    const start = () => { SFX.click(); this.go('part', s, i); };
    $('#go').onclick = start;
    $('#go').focus();
  };

  S.part = function (s, i) {
    const p = s.exam.parts[i];
    const cur = this.state.current;
    const eng = this.engines[p.type];
    eng.call(this, s, p, (res) => {
      cur.results.push(Object.assign({ title: p.title, icon: p.icon, weight: p.weight || 1, type: p.type }, res));
      cur.i++;
      this.nextPart();
    });
  };

  S.examDone = function (s) {
    const st = this.state;
    const ex = st.exams[s.id];
    const imp = this.impression(ex.total);
    const lines = ex.results.map((r) => {
      let extra = '';
      if (s.exam.rule === 'roberval') extra = ` · stanine <b>${this.stanine(r.score)}</b>/9`;
      return `<li>${r.icon} ${esc(r.title)} : <b>${r.score} %</b>${extra}</li>`;
    }).join('');
    let special = '';
    if (s.exam.rule === 'msl') {
      const b = ex.results[0].detail || [];
      special = `<div class="meta-grid">${b.map((x) => `<div class="meta"><div class="k">${esc(x.subject)}</div><div class="v" style="color:${x.score < 60 ? 'var(--red)' : 'inherit'}">${x.score} % <span class="muted" style="font-weight:400">(groupe : ${x.avg} %)</span></div></div>`).join('')}</div>`;
    }
    if (s.exam.rule === 'gravel') special = '<p class="hand" style="font-size:1.15rem;color:var(--blue)">Le jury note ta prestation. Si tu passes, il y aura quand même… un tirage au sort. 🎲</p>';
    if (s.exam.rule === 'roberval') special = '<p class="hand" style="font-size:1.15rem;color:var(--blue)">Rappel : à Roberval, il faut réussir les TROIS sous-tests.</p>';
    const last = st.order.length >= MAX_EXAMS;
    this.set(`
      <div class="exam">
        <div class="sheet stack center" style="text-align:center;--pc:${s.color}">
          <p class="eyebrow">Tu sors de l'épreuve de ${esc(s.short)}</p>
          <div class="verdict-emoji">${imp.e}</div>
          <div class="score-big">${ex.total} %</div>
          <p class="hand" style="font-size:1.35rem">Ta mère : « Pis? Comment ça s'est passé? »<br>Toi : ${imp.t}</p>
          <ul class="facts" style="text-align:left">${lines}</ul>
          ${special}
          <p class="muted" style="font-size:.9rem">Le verdict arrivera par la poste avec les autres lettres.</p>
          <div class="row center"><button class="btn big ${last ? 'green' : ''}" id="go">${last ? 'Attendre les lettres 📬' : 'Retour à la carte'}</button></div>
        </div>
      </div>`);
    if (ex.total >= 70) SFX.fanfare(); else SFX.sad();
    $('#go').onclick = () => { SFX.click(); this.go(last ? 'mail' : 'map'); };
  };

  window.Game = Game;
})();
