/* Mini-jeux « scène » : ordre (mémoire/agenda), choix (ateliers, impro LNI), maquette, timing. */
(() => {
  'use strict';
  const G = window.Game;
  const D = G.D;
  const { $, $$, esc, pick, shuffle, clamp, rand } = G.u;
  const E = G.engines;

  const JURY = ['🧑‍🏫', '👩‍🎨', '🧔'];

  function wrap(s, part, progress, inner, stage) {
    const head = `<div class="exam-head"><h2>${s.emoji} ${esc(part.title)}</h2><span class="progress">${progress}</span></div>`;
    if (stage) return `<div class="exam">${head}<div class="stage"><div class="stage-inner">${inner}</div></div></div>`;
    return `<div class="exam">${head}<div class="sheet stack">${inner}</div></div>`;
  }

  const meterHTML = (v) => `<div class="applause"><span aria-hidden="true">👏</span><div class="meter"><div class="fill" id="meter" style="width:${v}%"></div></div><span id="meter-v">${v}</span></div>`;

  // =====================================================
  //  Remettre en ordre (scène mémorisée ou agenda)
  // =====================================================
  E.sort = function (s, part, done) {
    const set = D.SORT[part.set];
    const n = set.items.length;
    const fmt = (it) => (typeof it === 'string' ? esc(it) : `<b>${esc(it.who)} :</b> ${esc(it.t)}`);
    let errors = 0;
    let next = 0;
    let over = false;

    const finish = () => {
      if (over) return;
      over = true;
      const score = clamp(100 - errors * (set.penalty || 15), 0, 100);
      SFX.bell();
      this.later(() => done({ score, detail: { errors } }), 900);
    };

    const run = () => {
      let order = shuffle(set.items.map((it, k) => ({ it, k })));
      if (order.every((o, j) => o.k === j)) order = order.reverse();
      const time = Math.round((part.time || 40) * this.timeFactor());
      this.set(wrap(s, part, 'Remets en ordre', `
        ${G.pencilHTML()}
        <p class="question" style="font-size:1.1rem">${set.prompt}</p>
        <ol class="sort-list" id="placed"></ol>
        <div class="bubbles" id="pool">${order.map((o) => `<button class="bubble sort-item" data-k="${o.k}"><span class="dot">?</span><span>${fmt(o.it)}</span></button>`).join('')}</div>
        <p class="feedback" id="fb"></p>`, set.stage));
      const timer = this.timer(time, { onEnd: () => { errors += n - next; $('#fb').className = 'feedback ko'; $('#fb').textContent = 'Temps écoulé!'; finish(); } });
      $$('#pool .bubble').forEach((b) => {
        b.onclick = () => {
          if (over) return;
          const k = +b.dataset.k;
          if (k === next) {
            SFX.correct();
            const li = document.createElement('li');
            li.innerHTML = fmt(set.items[k]);
            $('#placed').appendChild(li);
            b.remove();
            next++;
            if (next >= n) { timer.stop(); $('#fb').className = 'feedback ok'; $('#fb').textContent = errors ? `Terminé avec ${errors} erreur${errors > 1 ? 's' : ''}.` : 'Parfait, aucune erreur!'; finish(); }
          } else {
            errors++;
            SFX.wrong();
            b.classList.add('wrong');
            this.shake(b);
            this.later(() => b.classList.remove('wrong'), 450);
            $('#fb').className = 'feedback ko';
            $('#fb').textContent = pick(['Pas tout de suite!', 'Hmm, non.', 'Ça vient plus tard!']);
          }
        };
      });
    };

    if (!set.memorize) return run();
    const mt = Math.round((part.memorize || 15) * this.timeFactor());
    this.set(wrap(s, part, 'Mémorise!', `
      ${G.pencilHTML()}
      <p class="question" style="font-size:1.1rem">${set.memorize}</p>
      <ol class="sort-list">${set.items.map((it) => `<li>${fmt(it)}</li>`).join('')}</ol>
      <div class="row"><button class="btn" id="ready">${this.ag('Prêt', 'Prête')}! Cache le texte →</button></div>`, set.stage));
    const t = this.timer(mt, { onEnd: run });
    $('#ready').onclick = () => { t.stop(); SFX.click(); run(); };
  };

  // =====================================================
  //  Choix de scénario (ateliers, impro)
  // =====================================================
  E.choice = function (s, part, done) {
    const set = D.CHOICE[part.set];
    const cards = (part.fixed ? set.cards.slice() : shuffle(set.cards)).slice(0, part.count || set.cards.length);
    const bonus = this.hasTrait('clown') ? 10 : 0;
    let i = 0;
    let total = 0;

    const finish = () => done({ score: clamp(Math.round(total / cards.length) + bonus, 0, 100) });

    const show = () => {
      if (i >= cards.length) return finish();
      const c = cards[i];
      const opts = shuffle(c.opts);
      let locked = false;
      const meterNow = i ? clamp(Math.round(total / i) + bonus, 0, 100) : 50;
      const lni = c.lni ? `
        <div class="ref-card" aria-label="Carte de l'arbitre">
          <span class="k">Nature</span><span class="v">${esc(c.lni.nature)}</span>
          <span class="k">Titre</span><span class="v big">« ${esc(c.lni.titre)} »</span>
          <span class="k">Joueurs</span><span class="v">${esc(c.lni.joueurs)}</span>
          <span class="k">Catégorie</span><span class="v">${esc(c.lni.categorie)}</span>
          <span class="k">Durée</span><span class="v">${esc(c.lni.duree)}</span>
        </div>` : '';
      const time = Math.round((c.lni ? 20 : 25) * this.timeFactor());
      this.set(wrap(s, part, `${i + 1} / ${cards.length}`, `
        ${set.stage ? `<div class="jury" id="jury">${JURY.map((j) => `<span>${j}</span>`).join('')}</div>` : ''}
        ${lni}
        ${G.pencilHTML()}
        ${c.lni ? '<p class="hand" style="font-size:1.1rem;color:#ffe9a8">Caucus de 20 secondes… comme à la LNI!</p>' : ''}
        <div class="referee"><span class="who" aria-hidden="true">${c.who}</span><p class="speech"><b>${esc(c.name)} :</b> ${c.say}</p></div>
        <p class="question" style="font-size:1.08rem;${set.stage ? 'color:#fff' : ''}">${c.prompt}</p>
        <div class="bubbles">${opts.map((o, k) => `<button class="bubble" data-k="${k}"><span class="dot">${'ABCD'[k]}</span><span>${o.t}</span></button>`).join('')}</div>
        <div id="react"></div>
        ${set.stage ? meterHTML(meterNow) : ''}
        <div class="row" id="next-row" hidden><button class="btn" id="next">${i + 1 < cards.length ? 'Suivant →' : 'Terminer →'}</button></div>`, set.stage));

      const timer = this.timer(time, {
        onEnd: () => choose(c.lni
          ? { pts: 10, foul: 'Jeu retardé', r: 'Tu as pris trop de temps en caucus. L\'arbitre siffle!' }
          : { pts: 20, r: 'Tu figes… Le silence est long. Très long.' }, -1),
      });
      const choose = (o, k) => {
        if (locked) return;
        locked = true;
        timer.stop();
        $$('.bubble').forEach((b) => { b.disabled = true; });
        if (k >= 0) $$('.bubble')[k].classList.add(o.pts >= 60 ? 'right' : 'wrong');
        total += o.pts;
        const react = $('#react');
        let html = '';
        if (o.foul) {
          html += `<div class="foul-banner">Pénalité : ${esc(o.foul)}!</div>`;
          SFX.whistle();
          if (set.stage) { this.later(() => SFX.boo(), 300); this.fly('🥾', 6); }
        } else if (o.pts >= 70) {
          SFX.applause(o.pts / 100);
          $$('#jury span').forEach((j, n) => this.later(() => j.classList.add('react'), n * 120));
        } else if (o.pts < 40) SFX.boo();
        else SFX.click();
        html += `<p class="speech" style="margin-top:8px">${o.r}</p>`;
        react.innerHTML = html;
        if (set.stage) {
          const v = clamp(Math.round(total / (i + 1)) + bonus, 0, 100);
          $('#meter').style.width = v + '%';
          $('#meter-v').textContent = v;
        }
        $('#next-row').hidden = false;
        $('#next').onclick = () => { i++; show(); };
        $('#next').focus();
      };
      $$('.bubble').forEach((b) => { b.onclick = () => choose(opts[+b.dataset.k], +b.dataset.k); });
      this.onKey((e) => {
        const k = { 1: 0, 2: 1, 3: 2, 4: 3 }[e.key];
        if (!locked && k != null && k < opts.length) choose(opts[k], k);
      });
    };
    show();
  };

  // =====================================================
  //  Choisir les bons éléments (maquette)
  // =====================================================
  E.pick = function (s, part, done) {
    const set = D.PICK[part.set];
    const items = shuffle(set.items);
    const need = set.need;
    const chosen = new Set();
    let over = false;
    const time = Math.round((part.time || 35) * this.timeFactor());

    this.set(wrap(s, part, `Choisis ${need} éléments`, `
      ${G.pencilHTML()}
      <p class="question" style="font-size:1.08rem;color:#fff">${set.prompt}</p>
      <div class="pick-grid">${items.map((it, k) => `<button class="pick-item" data-k="${k}" aria-pressed="false"><span class="e">${it.e}</span><span>${esc(it.t)}</span></button>`).join('')}</div>
      <div class="row"><button class="btn" id="present" disabled>Présenter ma maquette (0/${need})</button></div>
      <div id="react"></div>`, true));

    const present = () => {
      if (over) return;
      over = true;
      timer.stop();
      let good = 0;
      $$('.pick-item').forEach((b) => {
        const it = items[+b.dataset.k];
        b.disabled = true;
        if (chosen.has(+b.dataset.k)) {
          b.classList.add(it.ok ? 'good' : 'bad');
          if (it.ok) good++;
        } else if (it.ok) b.classList.add('missed');
      });
      const score = Math.round((good / need) * 100);
      const lines = items.filter((it, k) => chosen.has(k)).map((it) => `<li>${it.ok ? '✔' : '✘'} ${esc(it.r)}</li>`).join('');
      $('#react').innerHTML = `<div class="speech"><b>Le jury :</b><ul class="facts" style="margin-top:6px">${lines || '<li>Tu n\'as rien présenté… Le jury cligne des yeux.</li>'}</ul></div>
        <div class="row" style="margin-top:10px"><button class="btn" id="next">Continuer →</button></div>`;
      if (score >= 67) SFX.applause(score / 100); else SFX.boo();
      $('#next').onclick = () => done({ score });
    };
    const timer = this.timer(time, { onEnd: present });
    $$('.pick-item').forEach((b) => {
      b.onclick = () => {
        if (over) return;
        const k = +b.dataset.k;
        if (chosen.has(k)) chosen.delete(k);
        else if (chosen.size < need) chosen.add(k);
        else return this.toast(`Maximum ${need} éléments!`);
        SFX.click();
        b.setAttribute('aria-pressed', chosen.has(k));
        const btn = $('#present');
        btn.disabled = chosen.size !== need;
        btn.textContent = `Présenter ma maquette (${chosen.size}/${need})`;
      };
    });
    $('#present').onclick = present;
  };

  // =====================================================
  //  Timing de réplique (scène en duo)
  // =====================================================
  E.timing = function (s, part, done) {
    const set = D.TIMING[part.set];
    const lines = set.lines;
    const scores = [];
    let i = 0;

    const show = () => {
      if (i >= lines.length) {
        const score = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        return done({ score });
      }
      const L = lines[i];
      const center = rand(28, 72);
      const zoneW = Math.max(14, 24 - i * 3);
      const perfW = 7;
      const period = Math.max(1000, 1700 - i * 220);
      let locked = false;
      let pos = 0;
      const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50;
      this.set(wrap(s, part, `Réplique ${i + 1} / ${lines.length}`, `
        <div class="jury" id="jury">${JURY.map((j) => `<span>${j}</span>`).join('')}</div>
        <div class="referee"><span class="who" aria-hidden="true">🧑‍🎤</span><p class="speech"><b>Ton ou ta partenaire :</b> ${L.cue}</p></div>
        <p class="hand" style="font-size:1.15rem;color:#ffe9a8">Ta réplique : « ${esc(L.you)} »</p>
        <div class="timing" id="bar"><div class="zone" style="left:${center - zoneW / 2}%;width:${zoneW}%"></div><div class="zone perfect" style="left:${center - perfW / 2}%;width:${perfW}%"></div><div class="cursor" id="cur"></div></div>
        <div class="row center"><button class="btn big" id="say">🎙️ Dis ta réplique!</button></div>
        <p class="kbd-hint">Appuie quand le curseur est dans la zone verte (le jaune = timing parfait). Barre d'espace aussi.</p>
        <div id="react"></div>
        ${meterHTML(avg)}`, true));
      const t0 = performance.now();
      this.frame((t) => {
        if (locked) return false;
        const ph = ((t - t0) % period) / period;
        pos = ph < 0.5 ? ph * 2 * 100 : (1 - ph) * 2 * 100;
        const cur = $('#cur');
        if (cur) cur.style.left = pos + '%';
        if (t - t0 > 7000) { say(true); return false; }
        return true;
      });
      const say = (late) => {
        if (locked) return;
        locked = true;
        const d = Math.abs(pos - center);
        let pts; let msg;
        if (late) { pts = 15; msg = 'Trop tard! Ton ou ta partenaire improvise un malaise. 😅'; SFX.boo(); }
        else if (d <= perfW / 2) { pts = 100; msg = pick(['PARFAIT! Le timing est impeccable. 🌟', 'Wow! La salle retient son souffle. 🌟']); SFX.applause(1); }
        else if (d <= zoneW / 2) { pts = 75; msg = 'Bien placé! Le jury sourit. 🙂'; SFX.applause(0.6); }
        else { pts = 25; msg = pos < center ? 'Trop tôt! Tu as coupé la parole à ton ou ta partenaire.' : 'Trop tard! Un long silence gênant…'; SFX.boo(); }
        scores.push(pts);
        if (pts >= 75) $$('#jury span').forEach((j, n) => this.later(() => j.classList.add('react'), n * 120));
        const v = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
        $('#meter').style.width = v + '%';
        $('#meter-v').textContent = v;
        $('#react').innerHTML = `<p class="speech">${msg}</p>`;
        $('#say').disabled = true;
        this.later(() => { i++; show(); }, 1500);
      };
      $('#say').onclick = () => say(false);
      this.onKey((e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); say(false); } });
    };
    show();
  };
})();
