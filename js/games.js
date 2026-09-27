/* Mini-jeux « papier » : QCM, dictée, calcul mental, Simon musical, bulletin éclair. */
(() => {
  'use strict';
  const G = window.Game;
  const D = G.D;
  const { $, $$, esc, pick, shuffle, clamp, randi } = G.u;
  const E = G.engines;
  const LETTERS = 'ABCD';
  const CATS = { math: 'Mathématique', logique: 'Logique', fr: 'Français', lecture: 'Compréhension de lecture', culture: 'Culture', en: 'English' };

  // ---------- Crayon-minuterie ----------
  G.pencilHTML = () => `<div class="pencil-wrap"><div class="pencil" id="pencil"><div class="eraser"></div><div class="ferrule"></div><div class="track"><div class="body" id="pencil-body"><span class="label-hb">HB</span></div></div></div></div>`;

  G.timer = function (seconds, { onEnd, onTick } = {}) {
    const start = performance.now();
    let total = seconds * 1000;
    let done = false;
    let lastSec = null;
    const api = {
      add(sec) { total += sec * 1000; },
      stop() { done = true; },
      left() { return Math.max(0, total - (performance.now() - start)) / 1000; },
    };
    this.frame(() => {
      if (done) return false;
      const left = api.left();
      const body = document.getElementById('pencil-body');
      if (body) body.style.width = ((left * 1000) / total) * 100 + '%';
      const pen = document.getElementById('pencil');
      if (pen) pen.classList.toggle('low', left <= 5);
      const sec = Math.ceil(left);
      if (sec !== lastSec) {
        lastSec = sec;
        if (onTick) onTick(sec);
        if (sec <= 5 && sec > 0) SFX.tick();
      }
      if (left <= 0) { done = true; if (onEnd) onEnd(); return false; }
      return true;
    });
    return api;
  };

  G.toolsHTML = (withTutor = true) => {
    const j = G.state.jokers;
    return `<div class="exam-tools">
      ${withTutor ? `<button class="tool-btn" id="tutor" ${j.tutor ? '' : 'disabled'}>🧑‍🏫 Tuteur privé ×${j.tutor}</button>` : ''}
      <button class="tool-btn" id="muffin" ${j.muffin ? '' : 'disabled'}>🧁 Muffin +10 s ×${j.muffin}</button>
    </div>`;
  };

  G.bindMuffin = function (timer) {
    const b = $('#muffin');
    if (!b) return;
    b.onclick = () => {
      if (!this.useJoker('muffin')) return;
      timer.add(10);
      SFX.correct();
      b.textContent = `🧁 Muffin +10 s ×${this.state.jokers.muffin}`;
      b.disabled = true;
      this.toast('🧁 Miam! +10 secondes');
    };
  };

  // =====================================================
  //  QCM à bulles (avec texte de lecture optionnel)
  // =====================================================
  E.quiz = function (s, part, done) {
    const bank = D.Q[part.bank];
    const qs = (part.fixed ? bank.slice() : shuffle(bank)).slice(0, part.count || bank.length);
    const passage = part.passage ? D.PASSAGES[part.passage] : null;
    let i = 0;
    let correct = 0;

    const finish = () => done({ score: Math.round((correct / qs.length) * 100), detail: { correct, n: qs.length } });

    const ask = () => {
      if (i >= qs.length) return finish();
      const q = qs[i];
      const opts = shuffle(q.a.map((t, k) => ({ t, ok: k === 0 })));
      const okIndex = opts.findIndex((o) => o.ok);
      let time = part.time || 15;
      if ((q.cat === 'math' || q.cat === 'logique') && this.hasTrait('math')) time += 5;
      if ((q.cat === 'fr' || q.cat === 'lecture') && this.hasTrait('fr')) time += 5;
      time = Math.round(time * this.timeFactor());
      let locked = false;

      this.set(`
        <div class="exam">
          <div class="exam-head"><h2>${s.emoji} ${esc(part.title)}</h2><span class="progress">Question ${i + 1} / ${qs.length}</span></div>
          ${G.pencilHTML()}
          <div class="sheet stack">
            ${passage ? `<div class="passage"><p class="eyebrow">${esc(passage.title)}</p>${passage.text}</div>` : ''}
            <span class="qcat">${CATS[q.cat] || ''}</span>
            <p class="question">${q.q}${q.v ? `<span class="visual">${q.v}</span>` : ''}</p>
            <div class="bubbles">${opts.map((o, k) => `<button class="bubble" data-k="${k}"><span class="dot">${LETTERS[k]}</span><span>${o.t}</span></button>`).join('')}</div>
            <p class="feedback" id="fb" aria-live="assertive"></p>
            <div class="row" id="next-row" hidden><button class="btn" id="next">Suivant →</button></div>
          </div>
          ${G.toolsHTML(opts.length > 2)}
        </div>`);

      const timer = this.timer(time, { onEnd: () => answer(-1) });
      const next = () => { i++; ask(); };

      const answer = (k) => {
        if (locked) return;
        locked = true;
        timer.stop();
        const btns = $$('.bubble');
        btns.forEach((b) => { b.disabled = true; });
        const fb = $('#fb');
        const good = k === okIndex;
        if (good) {
          correct++;
          btns[k].classList.add('right');
          fb.className = 'feedback ok';
          fb.textContent = pick(['Bravo!', 'Exact!', 'Bien vu!', 'Yes!', 'Tiguidou!']) + (q.note ? ' ' + q.note : '');
          SFX.correct();
        } else {
          if (k >= 0) btns[k].classList.add('wrong');
          btns[okIndex].classList.add('right');
          fb.className = 'feedback ko';
          fb.textContent = (k < 0 ? 'Temps écoulé! ⏰' : 'Oups!') + (q.why ? ' ' + q.why : '') + (q.note ? ' ' + q.note : '');
          SFX.wrong();
        }
        if (!good || q.note) {
          $('#next-row').hidden = false;
          $('#next').onclick = next;
          $('#next').focus();
        } else {
          this.later(next, 850);
        }
      };

      $$('.bubble').forEach((b) => { b.onclick = () => { SFX.pencil(); answer(+b.dataset.k); }; });
      const tut = $('#tutor');
      if (tut) tut.onclick = () => {
        if (locked || !this.useJoker('tutor')) return;
        const wrong = shuffle(opts.map((o, k) => k).filter((k) => k !== okIndex)).slice(0, Math.min(2, opts.length - 2));
        wrong.forEach((k) => $$('.bubble')[k].classList.add('dim'));
        tut.disabled = true;
        tut.textContent = `🧑‍🏫 Tuteur privé ×${this.state.jokers.tutor}`;
        SFX.click();
        this.toast('🧑‍🏫 « Psst… c\'est pas ces deux-là. » (75 $ de l\'heure)');
      };
      this.bindMuffin(timer);
      this.onKey((e) => {
        const map = { 1: 0, 2: 1, 3: 2, 4: 3, a: 0, b: 1, c: 2, d: 3 };
        const k = map[e.key.toLowerCase()];
        if (!locked && k != null && k < opts.length) { SFX.pencil(); answer(k); }
        else if (locked && e.key === 'Enter' && !$('#next-row').hidden) next();
      });
    };
    ask();
  };

  // =====================================================
  //  Dictée à trous
  // =====================================================
  E.dictee = function (s, part, done) {
    const dict = D.DICTEE[part.text];
    const blanks = dict.parts.filter((x) => typeof x !== 'string');
    const n = blanks.length;
    const answers = [];
    let idx = 0;
    let fautes = 0;
    let forgiven = false;

    const textHTML = () => {
      let b = 0;
      return dict.parts.map((x) => {
        if (typeof x === 'string') return esc(x);
        const my = b++;
        const a = answers[my];
        if (a == null) return `<span class="blank ${my === idx ? 'current' : ''}">${my === idx ? '___' : '&nbsp;'}</span>`;
        if (a === x.o[0]) return `<span class="blank ok">${esc(a)}</span>`;
        return `<span class="blank ko"><s>${esc(a || '∅')}</s>${esc(x.o[0])}</span>`;
      }).join('');
    };

    const finish = () => {
      const counted = Math.max(0, fautes - (forgiven ? 1 : 0));
      const score = Math.round(((n - counted) / n) * 100);
      this.set(`
        <div class="exam">
          <div class="exam-head"><h2>${s.emoji} ${esc(part.title)}</h2></div>
          <div class="sheet stack">
            <p class="eyebrow">${esc(dict.title)} · version corrigée</p>
            <p class="dictee-text">${textHTML()}</p>
            <p class="red-pen" style="font-size:1.6rem;transform:rotate(-2deg)">${counted === 0 ? 'Aucune faute! Bravo! ⭐' : `${counted} faute${counted > 1 ? 's' : ''} : −${Math.round(100 / n)} % par faute`}${forgiven ? ' (ta 1re faute ne compte pas, rat de bibliothèque!)' : ''}</p>
            <div class="row"><button class="btn" id="go">Continuer →</button></div>
          </div>
        </div>`);
      $('#go').onclick = () => done({ score, detail: { fautes: counted } });
    };

    const ask = () => {
      if (idx >= n) return finish();
      const bl = blanks[idx];
      const opts = shuffle(bl.o);
      let time = (part.time || 14) + (this.hasTrait('fr') ? 5 : 0);
      time = Math.round(time * this.timeFactor());
      let locked = false;
      this.set(`
        <div class="exam">
          <div class="exam-head"><h2>${s.emoji} ${esc(part.title)}</h2><span class="progress">Mot ${idx + 1} / ${n}</span></div>
          ${G.pencilHTML()}
          <div class="sheet stack">
            <p class="eyebrow">${esc(dict.title)}</p>
            <p class="dictee-text">${textHTML()}</p>
            <div class="dictee-opts">${opts.map((o, k) => `<button class="bubble" data-k="${k}"><span class="dot">${LETTERS[k]}</span><span>${esc(o)}</span></button>`).join('')}</div>
            <p class="rule" id="rule" hidden></p>
            <div class="row" id="next-row" hidden><button class="btn" id="next">Suivant →</button></div>
          </div>
          ${G.toolsHTML(false)}
        </div>`);
      const timer = this.timer(time, { onEnd: () => answer(-1) });
      const next = () => { idx++; ask(); };
      const answer = (k) => {
        if (locked) return;
        locked = true;
        timer.stop();
        const chosen = k >= 0 ? opts[k] : '';
        answers[idx] = chosen;
        const ok = chosen === bl.o[0];
        const btns = $$('.bubble');
        btns.forEach((b) => { b.disabled = true; });
        btns[opts.indexOf(bl.o[0])].classList.add('right');
        if (ok) { SFX.correct(); this.later(next, 700); }
        else {
          fautes++;
          if (this.hasTrait('fr') && fautes === 1) forgiven = true;
          if (k >= 0) btns[k].classList.add('wrong');
          SFX.wrong();
          $('#rule').hidden = false;
          $('#rule').innerHTML = `<b>${k < 0 ? 'Temps écoulé!' : 'Faute!'}</b> ${bl.r}`;
          $('#next-row').hidden = false;
          $('#next').onclick = next;
          $('#next').focus();
        }
        $('.dictee-text').innerHTML = textHTML();
      };
      $$('.bubble').forEach((b) => { b.onclick = () => { SFX.pencil(); answer(+b.dataset.k); }; });
      this.bindMuffin(timer);
      this.onKey((e) => {
        const k = { 1: 0, 2: 1, 3: 2, 4: 3 }[e.key];
        if (!locked && k != null && k < opts.length) answer(k);
        else if (locked && e.key === 'Enter' && !$('#next-row').hidden) next();
      });
    };
    ask();
  };

  // =====================================================
  //  Calcul mental chronométré (pavé numérique)
  // =====================================================
  E.calcul = function (s, part, done) {
    const target = part.target || 12;
    let seconds = (part.seconds || 45) + (this.hasTrait('math') ? 10 : 0);
    seconds = Math.round(seconds * this.timeFactor());
    let count = 0;
    let tries = 0;
    let input = '';
    let cur = null;
    let over = false;

    const gen = () => {
      const lvl = Math.min(3, Math.floor(count / 4));
      const type = pick(lvl === 0 ? ['+', '-', '×'] : ['+', '-', '×', '÷']);
      let a; let b; let r;
      if (type === '+') { a = randi(12, 40 + lvl * 25); b = randi(8, 30 + lvl * 25); r = a + b; }
      else if (type === '-') { a = randi(30, 70 + lvl * 30); b = randi(6, a - 5); r = a - b; }
      else if (type === '×') { a = randi(2, 9 + lvl); b = randi(3, 9 + (lvl > 1 ? 3 : 0)); r = a * b; }
      else { b = randi(2, 9); r = randi(2, 9 + lvl); a = b * r; }
      return { txt: `${a} ${type} ${b}`, r };
    };

    this.set(`
      <div class="exam">
        <div class="exam-head"><h2>${s.emoji} ${esc(part.title)}</h2><span class="progress" id="cnt">✔ 0 / objectif ${target}</span></div>
        ${G.pencilHTML()}
        <div class="sheet stack center" style="text-align:center">
          <div class="calc-display"><span id="prob"></span><span>=</span><span class="calc-answer" id="ans">&nbsp;</span></div>
          <div class="numpad">
            ${[7, 8, 9, 4, 5, 6, 1, 2, 3].map((d) => `<button data-d="${d}">${d}</button>`).join('')}
            <button class="del" data-d="del" aria-label="Effacer">⌫</button><button data-d="0">0</button><button class="ok" data-d="ok" aria-label="Valider">✓</button>
          </div>
          <p class="kbd-hint" style="color:var(--ink-2)">Clavier : chiffres, Retour arrière, Entrée.</p>
        </div>
        ${G.toolsHTML(false)}
      </div>`);

    const show = () => { $('#prob').textContent = cur.txt; $('#ans').innerHTML = input || '&nbsp;'; };
    const nextProb = () => { cur = gen(); input = ''; show(); };
    const end = () => {
      if (over) return;
      over = true;
      const score = clamp(Math.round((count / target) * 100), 0, 100);
      $('#prob').textContent = 'Crayons levés!';
      $('#ans').textContent = count;
      SFX.bell();
      this.later(() => done({ score, detail: { count, tries } }), 1400);
    };
    const timer = this.timer(seconds, { onEnd: end });
    const submit = () => {
      if (over || !input) return;
      tries++;
      const ans = $('#ans');
      ans.classList.remove('flash-ok', 'flash-ko');
      void ans.offsetWidth;
      if (+input === cur.r) {
        count++;
        SFX.correct();
        ans.classList.add('flash-ok');
        $('#cnt').textContent = `✔ ${count} / objectif ${target}`;
        this.later(() => { ans.classList.remove('flash-ok'); nextProb(); }, 180);
      } else {
        SFX.wrong();
        ans.classList.add('flash-ko');
        input = '';
        this.later(show, 250);
      }
    };
    const press = (d) => {
      if (over) return;
      if (d === 'del') input = input.slice(0, -1);
      else if (d === 'ok') return submit();
      else if (input.length < 4) input += d;
      SFX.click();
      show();
    };
    $$('.numpad button').forEach((b) => {
      b.onclick = () => { press(b.dataset.d); b.blur(); };
    });
    this.onKey((e) => {
      if (/^[0-9]$/.test(e.key)) press(e.key);
      else if (e.key === 'Backspace') { e.preventDefault(); press('del'); }
      else if (e.key === 'Enter') { e.preventDefault(); press('ok'); }
    });
    this.bindMuffin(timer);
    nextProb();
  };

  // =====================================================
  //  Simon musical
  // =====================================================
  E.simon = function (s, part, done) {
    const PADS = [
      { e: '🎹', c: '#f26b1d' }, { e: '🥁', c: '#1d5fae' },
      { e: '🎺', c: '#22915a' }, { e: '🎤', c: '#d7263d' },
    ];
    const rounds = part.rounds || 5;
    let len = part.start || 3;
    let round = 0;
    let lives = 2;
    let seq = [];
    let pos = 0;
    let listening = false;

    this.set(`
      <div class="exam">
        <div class="exam-head"><h2>${s.emoji} ${esc(part.title)}</h2><span class="progress" id="rnd"></span></div>
        <div class="sheet stack">
          <p class="simon-status" id="st">Écoute bien…</p>
          <div class="simon">${PADS.map((p, k) => `<button data-k="${k}" style="background:${p.c}" aria-label="Note ${k + 1}" disabled>${p.e}</button>`).join('')}</div>
          <p class="muted center" style="text-align:center;font-size:.85rem">Fausses notes permises : <b id="lives">${'❤️'.repeat(lives)}</b> · Clavier : 1 2 3 4</p>
        </div>
      </div>`);
    const pads = $$('.simon button');
    const flash = (k, ms) => {
      pads[k].classList.add('lit');
      SFX.note(k, ms / 1000);
      this.later(() => pads[k].classList.remove('lit'), ms);
    };
    const setPads = (on) => pads.forEach((p) => { p.disabled = !on; });
    const play = () => {
      listening = false;
      setPads(false);
      $('#rnd').textContent = `Manche ${round + 1} / ${rounds}`;
      $('#st').textContent = 'Écoute bien… 👂';
      const gap = Math.max(300, 560 - round * 50);
      seq.forEach((k, j) => this.later(() => flash(k, gap * 0.7), 600 + j * gap));
      this.later(() => { listening = true; pos = 0; setPads(true); $('#st').textContent = 'À toi! Rejoue la mélodie 🎶'; }, 600 + seq.length * gap);
    };
    const newRound = () => { seq = Array.from({ length: len }, () => randi(0, 3)); play(); };
    const finish = () => {
      setPads(false);
      done({ score: Math.round((round / rounds) * 100), detail: { round } });
    };
    const tap = (k) => {
      if (!listening) return;
      flash(k, 220);
      if (k !== seq[pos]) {
        listening = false;
        setPads(false);
        lives--;
        SFX.wrong();
        $('#lives').textContent = lives > 0 ? '❤️'.repeat(lives) : '💔';
        if (lives < 0) {
          $('#st').textContent = 'Oh non… le rideau tombe. 🎻';
          return this.later(finish, 1300);
        }
        $('#st').textContent = 'Fausse note! 😬 On recommence la manche.';
        return this.later(play, 1200);
      }
      pos++;
      if (pos >= seq.length) {
        listening = false;
        round++;
        len++;
        $('#st').textContent = pick(['Bravo! 👏', 'Magnifique! 🎵', 'Wow! 🌟']);
        if (round >= rounds) { SFX.fanfare(); return this.later(finish, 1100); }
        this.later(newRound, 1000);
      }
    };
    pads.forEach((p) => { p.onclick = () => tap(+p.dataset.k); });
    this.onKey((e) => { const k = { 1: 0, 2: 1, 3: 2, 4: 3 }[e.key]; if (k != null) tap(k); });
    this.later(newRound, 700);
  };

  // =====================================================
  //  Bulletin éclair (vrai ou faux, par matière)
  // =====================================================
  E.vraifaux = function (s, part, done) {
    const bank = D.Q[part.bank];
    const subjects = [...new Set(bank.map((q) => q.s))];
    const bySub = {};
    subjects.forEach((sub) => { bySub[sub] = shuffle(bank.filter((q) => q.s === sub)); });
    const stats = {};
    subjects.forEach((sub) => { stats[sub] = { ok: 0, asked: 0 }; });
    const queue = [];
    const maxLen = Math.max(...subjects.map((sub) => bySub[sub].length));
    for (let r = 0; r < maxLen; r++) shuffle(subjects).forEach((sub) => { if (bySub[sub][r]) queue.push(bySub[sub][r]); });
    let i = 0;
    let over = false;
    let locked = false;
    const seconds = Math.round((part.seconds || 60) * this.timeFactor());

    this.set(`
      <div class="exam">
        <div class="exam-head"><h2>${s.emoji} ${esc(part.title)}</h2><span class="progress" id="cnt">0 réponse</span></div>
        ${G.pencilHTML()}
        <div class="sheet stack center" style="text-align:center">
          <span class="qcat" id="sub"></span>
          <p class="question" id="q" style="min-height:3em"></p>
          <div class="vf-buttons">
            <button class="btn green big" id="vrai">✔ VRAI</button>
            <button class="btn red big" id="faux">✘ FAUX</button>
          </div>
          <p class="feedback" id="fb"></p>
          <p class="kbd-hint" style="color:var(--ink-2)">Clavier : V ou ← pour vrai, F ou → pour faux.</p>
        </div>
        ${G.toolsHTML(false)}
      </div>`);

    const show = () => {
      if (i >= queue.length) return end();
      $('#sub').textContent = queue[i].s;
      $('#q').textContent = queue[i].q;
      locked = false;
    };
    const end = () => {
      if (over) return;
      over = true;
      timer.stop();
      const detail = subjects.map((sub) => {
        const st = stats[sub];
        const score = st.asked ? Math.round(40 + (60 * st.ok) / st.asked) : 58;
        return { subject: sub, score, avg: randi(72, 80) };
      });
      const score = Math.round(detail.reduce((a, d) => a + d.score, 0) / detail.length);
      SFX.bell();
      $('#q').textContent = 'Le bulletin est prêt!';
      this.later(() => done({ score, detail }), 1100);
    };
    const answer = (v) => {
      if (over || locked) return;
      locked = true;
      const q = queue[i];
      const st = stats[q.s];
      st.asked++;
      const fb = $('#fb');
      if (v === q.v) { st.ok++; SFX.correct(); fb.className = 'feedback ok'; fb.textContent = '✔'; }
      else { SFX.wrong(); fb.className = 'feedback ko'; fb.textContent = `✘ C'était ${q.v ? 'VRAI' : 'FAUX'}${q.why ? ' : ' + q.why : ''}`; }
      const total = Object.values(stats).reduce((a, x) => a + x.asked, 0);
      $('#cnt').textContent = `${total} réponse${total > 1 ? 's' : ''}`;
      i++;
      this.later(show, v === q.v ? 250 : 900);
    };
    const timer = this.timer(seconds, { onEnd: end });
    $('#vrai').onclick = () => answer(true);
    $('#faux').onclick = () => answer(false);
    this.onKey((e) => {
      const k = e.key.toLowerCase();
      if (k === 'v' || k === 'arrowleft') answer(true);
      if (k === 'f' || k === 'arrowright') answer(false);
    });
    this.bindMuffin(timer);
    show();
  };
})();
