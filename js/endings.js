/* Les lettres, la liste d'attente, la victoire… ou Jeanne-Mance. */
(() => {
  'use strict';
  const G = window.Game;
  const D = G.D;
  const S = G.screens;
  const { $, $$, esc, pick } = G.u;
  const byId = G.byId;

  // ---------- Verdict de chaque école ----------
  G.decide = function (s) {
    const ex = this.state.exams[s.id];
    const t = ex.total;
    const r = s.exam;
    const retenu = this.ag('retenu', 'retenue');
    if (r.rule === 'roberval') {
      const st = ex.results.map((x) => this.stanine(x.score));
      const min = Math.min(...st);
      const mean = st.reduce((a, b) => a + b, 0) / st.length;
      const txt = `Stanines : ${st.join(' · ')} (sur 9).`;
      if (min >= 5 && mean >= 6) return { v: 'admis', why: `${txt} Les trois sous-tests sont réussis!` };
      if (min >= 4 && mean >= 5) return { v: 'attente', why: `${txt} Presque… il manquait un petit quelque chose.` };
      return { v: 'refuse', why: `${txt} Il fallait réussir les trois sous-tests.` };
    }
    if (r.rule === 'msl') {
      const fails = (ex.results[0].detail || []).filter((d) => d.score < 60).map((d) => d.subject);
      if (fails.length) {
        const why = `Échec en ${fails.join(', ')}. À Mont-Saint-Louis, aucun échec n'est permis.`;
        return t >= r.wait ? { v: 'attente', why } : { v: 'refuse', why };
      }
    }
    if (r.rule === 'gravel') {
      if (t >= r.admit) {
        return Math.random() < 0.65
          ? { v: 'admis', why: 'Audition réussie ET ton nom est sorti au tirage au sort! 🎲', tirage: true }
          : { v: 'attente', why: 'Audition réussie… mais ton nom n\'est pas sorti au tirage au sort. 🎲', tirage: true };
      }
      if (t >= r.wait) return { v: 'attente', why: 'Le jury a aimé, sans plus. Liste d\'attente.' };
      return { v: 'refuse', why: `Le jury ne t'a pas ${retenu}. Le théâtre, c'est dur.` };
    }
    if (t >= r.admit) return { v: 'admis', why: `Résultat : ${t} %. Bienvenue!` };
    if (t >= r.wait) return { v: 'attente', why: `Résultat : ${t} %. Tu es sur la liste d'attente.` };
    return { v: 'refuse', why: `Résultat : ${t} %. Nous avons reçu un nombre record de demandes…` };
  };

  const STAMP = { admis: 'Admis', attente: 'Liste d\'attente', refuse: 'Refusé' };
  const stampText = (v) => (v === 'admis' ? G.ag('Admis', 'Admise') : v === 'refuse' ? G.ag('Refusé', 'Refusée') : STAMP[v]);
  const REACT = {
    admis: ['Ta mère crie dans la cuisine! 🎉', 'Ton père texte toute la famille. 📱', 'Le chien jappe de joie. 🐶'],
    attente: ['Ta mère dit : « C\'est pas un non! » 🤞', 'Ton père ajoute une colonne dans son Excel.'],
    refuse: ['Ta mère dit : « C\'est leur perte. » 😤', 'Ton père soupire très fort.', 'Le chien te lèche la main. 🐶'],
  };

  // ---------- La boîte aux lettres ----------
  S.mail = function () {
    const st = this.state;
    if (!st.decisions) {
      st.decisions = {};
      st.order.forEach((id) => { st.decisions[id] = this.decide(byId(id)); });
    }
    const name = esc(st.player.name);
    const env = st.order.map((id) => {
      const s = byId(id);
      const d = st.decisions[id];
      return `<button class="envelope" data-id="${id}" style="--pc:${s.color}" aria-label="Ouvrir la lettre de ${esc(s.short)}">
        <div class="inner">
          <div class="face front"><span class="seal">${s.emoji}</span><span class="to">À : ${name}</span><span class="from">${esc(s.name)}</span></div>
          <div class="face back"><span class="stamp ${d.v}">${stampText(d.v)}</span><span style="font-size:.85rem">${esc(d.why)}</span></div>
        </div></button>`;
    }).join('');
    this.set(`
      <div class="stack">
        <h1 class="chalk-title" style="font-size:clamp(2rem,6vw,3rem)">📬 Le facteur est passé!</h1>
        <p class="chalk-sub">Quelques semaines plus tard. Ta mère a mis les lettres sur la table. Personne ne respire.</p>
        <div class="mailbox">${env}</div>
        <p class="hand" id="react" style="font-size:1.35rem;color:var(--pencil);min-height:1.6em"></p>
        <div class="row" id="next-row" hidden><button class="btn big" id="next">Continuer →</button></div>
      </div>`);
    let opened = 0;
    $$('.envelope').forEach((b) => {
      b.onclick = () => {
        if (b.classList.contains('open')) return;
        b.classList.add('open');
        opened++;
        const d = st.decisions[b.dataset.id];
        SFX.paper();
        this.later(() => {
          SFX.stamp();
          if (d.v === 'admis') { SFX.fanfare(); this.confetti(40); } else if (d.v === 'refuse') SFX.wrong();
          $('#react').textContent = pick(REACT[d.v]);
        }, 650);
        if (opened >= st.order.length) this.later(() => { $('#next-row').hidden = false; $('#next').focus(); }, 1300);
      };
    });
    $('#next').onclick = () => {
      const waiting = st.order.filter((id) => st.decisions[id].v === 'attente' && !st.decisions[id].called);
      this.go(waiting.length ? 'phone' : 'resolve');
    };
  };

  // ---------- Le téléphone sonne (liste d'attente) ----------
  S.phone = function () {
    const st = this.state;
    const id = st.order.find((x) => st.decisions[x].v === 'attente' && !st.decisions[x].called);
    if (!id) return this.go('resolve');
    const s = byId(id);
    const d = st.decisions[id];
    d.called = true;
    const lucky = Math.random() < 0.4;
    this.set(`
      <div class="event-card sheet plain stack center" style="text-align:center">
        <p class="eyebrow">Quelques semaines plus tard…</p>
        <div class="phone" id="ph" aria-hidden="true">☎️</div>
        <p style="font-size:1.15rem">Le téléphone sonne. L'afficheur indique : <b>${esc(s.name)}</b>.</p>
        <div id="talk"></div>
        <div class="row center" id="acts"><button class="btn big green" id="pick">Décrocher</button></div>
      </div>`);
    SFX.phone();
    this.every(() => SFX.phone(), 2000);
    $('#pick').onclick = () => {
      this.clear();
      this.renderHud();
      $('#ph').style.animation = 'none';
      if (lucky) {
        d.v = 'admis';
        d.why = 'Une place s\'est libérée! Tu as été ' + this.ag('appelé', 'appelée') + ' sur la liste d\'attente. ☎️';
        SFX.fanfare();
        this.confetti(60);
        $('#talk').innerHTML = `<p class="speech">« Bonjour! Une place vient de se libérer au ${esc(s.short)}. Est-ce qu'elle vous intéresse toujours? »</p><p class="hand" style="font-size:1.4rem;color:var(--green)">Ta mère : « OUI! OUI! OUI! »</p>`;
      } else {
        d.v = 'refuse';
        d.why = 'Toutes les places ont été comblées. La liste d\'attente n\'a pas bougé.';
        SFX.sad();
        $('#talk').innerHTML = `<p class="speech">« Bonjour… Malheureusement, toutes nos places sont comblées cette année. Bonne chance! »</p><p class="hand" style="font-size:1.4rem;color:var(--red)">Ta mère raccroche. Long silence.</p>`;
      }
      $('#acts').innerHTML = '<button class="btn big" id="next">Continuer →</button>';
      $('#next').onclick = () => this.go('phone');
    };
  };

  // ---------- Suite logique ----------
  S.resolve = function () {
    const st = this.state;
    const admitted = st.order.filter((id) => st.decisions[id].v === 'admis');
    if (!admitted.length) return this.go('jeanneMance', {});
    if (admitted.length === 1) return this.go('victory', admitted[0]);
    return this.go('choose', admitted);
  };

  S.choose = function (ids) {
    const cards = ids.map((id) => {
      const s = byId(id);
      return `<button class="choose-card" data-id="${id}" style="--pc:${s.color}"><div class="school-head"><div class="school-badge">${s.emoji}</div><div><b style="font-size:1.1rem">${esc(s.name)}</b><br><span class="muted">${esc(s.type)} · ${esc(s.hood)}</span></div></div><span class="stars">${G.u.stars(s.stars)}</span></button>`;
    }).join('');
    this.set(`
      <div class="stack">
        <h1 class="chalk-title" style="font-size:clamp(2rem,6vw,3rem)">Tu as le choix! 😎</h1>
        <p class="chalk-sub">${ids.length} écoles veulent de toi. Ton père a imprimé son Excel en couleur. Où vas-tu en septembre?</p>
        <div class="choose-grid">${cards}</div>
      </div>`);
    SFX.fanfare();
    $$('.choose-card').forEach((b) => { b.onclick = () => { SFX.click(); this.go('victory', b.dataset.id); }; });
  };

  // ---------- Victoire ----------
  S.victory = function (id) {
    const st = this.state;
    const s = byId(id);
    const nbAdmis = st.order.filter((x) => st.decisions[x].v === 'admis').length;
    const best = Math.max(...st.order.map((x) => st.exams[x].total));
    const p = st.player;
    this.set(`
      <div class="stack">
        <div class="diploma" style="--pc:${s.color}">
          <p class="eyebrow">Lettre d'admission officielle · Secondaire 1 · 2027-2028</p>
          <div class="seal-big">${s.emoji}</div>
          <h2 style="font-size:clamp(1.6rem,5vw,2.3rem)">${esc(s.name)}</h2>
          <p>a le plaisir d'accueillir</p>
          <p class="name">${esc(p.name)}</p>
          <div style="width:120px">${G.avatarSVG(p)}</div>
          <p style="max-width:52ch">${s.win}</p>
          <div class="stats">
            <div class="stat"><div class="n">${st.order.length}</div><div class="l">Épreuves</div></div>
            <div class="stat"><div class="n">${nbAdmis}</div><div class="l">${this.ag('Admis', 'Admise')}</div></div>
            <div class="stat"><div class="n">${best} %</div><div class="l">Meilleure note</div></div>
            <div class="stat"><div class="n">${st.jokersUsed}</div><div class="l">Jokers utilisés</div></div>
          </div>
          <p class="red-pen" style="font-size:1.3rem">Tu as évité Jeanne-Mance. Les bullies vont devoir attendre! 😎</p>
          <div class="row center"><button class="btn big" id="again">Rejouer</button><button class="btn ghost" id="new">Nouveau personnage</button></div>
        </div>
      </div>`);
    SFX.fanfare();
    this.confetti(140);
    this.later(() => this.confetti(80), 1500);
    $('#again').onclick = () => this.restart(true);
    $('#new').onclick = () => this.restart(false);
  };

  G.restart = function (keep) {
    const p = this.state.player;
    this.state = this.newState();
    if (keep) { Object.assign(this.state.player, p); this.go('map'); }
    else this.go('create');
  };

  // =====================================================
  //  FIN : Polyvalente Jeanne-Mance
  // =====================================================
  function yardSVG() {
    return `<svg class="bg" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f8891"/><stop offset="1" stop-color="#b3bac1"/></linearGradient></defs>
      <rect width="1600" height="900" fill="url(#sky)"/>
      <ellipse cx="300" cy="90" rx="220" ry="50" fill="#9aa2aa"/><ellipse cx="1250" cy="70" rx="260" ry="55" fill="#99a1a9"/>
      <rect x="120" y="170" width="1360" height="420" fill="#a2a4a6" stroke="#25273a" stroke-width="6"/>
      <rect x="120" y="170" width="1360" height="70" fill="#5b6770" stroke="#25273a" stroke-width="6"/>
      <text x="800" y="220" text-anchor="middle" font-family="Bagel Fat One, sans-serif" font-size="46" fill="#eef1f3" letter-spacing="4">POLYVALENTE JEANNE-MANCE</text>
      ${[0, 1, 2].map((r) => Array.from({ length: 11 }, (_, c) => `<rect x="${170 + c * 118}" y="${270 + r * 95}" width="80" height="58" fill="#5d6b75" stroke="#25273a" stroke-width="4"/>`).join('')).join('')}
      <rect x="730" y="470" width="140" height="120" fill="#4a3f38" stroke="#25273a" stroke-width="6"/>
      <g transform="translate(1180 150)"><ellipse cx="0" cy="0" rx="26" ry="16" fill="#111"/><circle cx="22" cy="-10" r="11" fill="#111"/><path d="M31 -10l16 4-16 4z" fill="#e0a20c"/><path d="M-20 0l-26 10 8-14z" fill="#111"/></g>
      <rect x="0" y="590" width="1600" height="310" fill="#6b6d70"/>
      <path d="M0 700H1600M400 590L250 900M1200 590L1350 900" stroke="#f1f1e8" stroke-width="6" opacity="0.55"/>
      <g transform="translate(1440 420)"><rect x="-8" y="0" width="16" height="300" fill="#3b3f45"/><rect x="-70" y="-10" width="140" height="90" fill="#fff" stroke="#25273a" stroke-width="5"/><rect x="-26" y="30" width="52" height="36" fill="none" stroke="#d7263d" stroke-width="5"/><ellipse cx="0" cy="92" rx="32" ry="8" fill="none" stroke="#f26b1d" stroke-width="6"/></g>
      <ellipse cx="560" cy="820" rx="130" ry="22" fill="#55585c"/>
      <path d="M0 560H110M0 520H110M0 600H110" stroke="#4a4d52" stroke-width="4"/>
      ${Array.from({ length: 6 }, (_, k) => `<path d="M${k * 22} 500V610" stroke="#4a4d52" stroke-width="4"/>`).join('')}
    </svg>`;
  }

  S.jeanneMance = function (opts = {}) {
    const st = this.state;
    const p = st.player;
    const failed = st.order.slice().reverse().map(byId).find((s) => s);
    document.body.classList.add('gloom');
    const letter = opts.voluntary
      ? `<p style="font-size:1.1rem">Tu as choisi la Polyvalente Jeanne-Mance <b>volontairement</b>. Personne ne comprend. Ta grand-mère allume un lampion.</p>`
      : `<p class="eyebrow">Lettre du Centre de services scolaire de Montréal</p>
         <p style="font-size:1.1rem">« Madame, Monsieur, votre enfant <b>${esc(p.name)}</b> n'ayant été ${this.ag('admis', 'admise')} dans aucun établissement, ${this.ag('il', 'elle', 'iel')} est ${this.ag('inscrit', 'inscrite')} à son école de quartier : <b>la Polyvalente Jeanne-Mance</b>. »</p>
         <p class="hand" style="font-size:1.3rem">Ta mère s'assoit. Ton père ouvre l'onglet « Plan D ». Il est vide.</p>`;
    this.set(`
      <div class="exam">
        <div class="sheet stack">
          ${letter}
          <div class="row"><button class="btn red big" id="go">Fin août 2027. Premier jour d'école… →</button></div>
        </div>
      </div>`);
    SFX.sad();
    $('#go').onclick = () => this.go('yard', { voluntary: !!opts.voluntary, failedId: failed && failed.id });
  };

  S.yard = function (opts) {
    const st = this.state;
    const p = st.player;
    document.body.classList.add('gloom');
    const bullyLook = [
      { skinColor: '#e2ae86', shirtColor: '#3a3f47', cap: '#1c1c1c', shades: true },
      { skinColor: '#b97a56', shirtColor: '#7a2a2a', cap: '#d7263d', shades: false },
      { skinColor: '#f6d3b8', shirtColor: '#2d4a3b', cap: '#15151a', shades: true },
    ];
    const nouveau = this.ag('le p\'tit nouveau', 'la p\'tite nouvelle', 'la nouvelle recrue');
    const failedSchool = opts.failedId ? byId(opts.failedId) : null;
    const taunt = opts.voluntary
      ? `Y paraît que t'es ${this.ag('venu', 'venue')} ICI… volontairement?!`
      : (failedSchool ? failedSchool.bully : 'T\'as coulé tous tes examens, hein?');
    const bullyHTML = (k, o = {}) => `<div class="actor flip bully" id="b${k}" style="left:110%;width:14.5%"><div class="fig">${G.avatarSVG({}, Object.assign({ bully: true, face: 'mean' }, bullyLook[k], o))}</div></div>`;
    this.set(`
      <div class="stack">
        <div class="yard" id="yard">
          ${yardSVG()}
          <div class="actor" id="me" style="left:-16%"><div class="fig">${G.avatarSVG(p, { face: 'worried' })}</div></div>
          ${bullyHTML(0)}${bullyHTML(1)}${bullyHTML(2)}
        </div>
        <div class="choice-row" id="acts"></div>
        <div class="row center"><button class="btn chalk-btn" id="skip">Passer ⏭</button></div>
      </div>`);
    const yard = $('#yard');
    const me = $('#me');
    const b = [0, 1, 2].map((k) => $('#b' + k));
    const say = (el, txt, side = '', ms = 2200) => {
      const old = el.querySelector('.say'); if (old) old.remove();
      const d = document.createElement('div');
      d.className = 'say ' + side;
      d.textContent = txt;
      el.appendChild(d);
      if (ms) this.later(() => d.remove(), ms);
    };
    const T = (ms, fn) => this.later(fn, ms);
    const end = () => this.go('gameOver', opts);
    $('#skip').onclick = end;

    SFX.bell();
    me.classList.add('walk');
    T(100, () => { me.style.left = '26%'; });
    T(1800, () => { me.classList.remove('walk'); say(me, 'Bon… ça va bien aller.', 'left'); });
    T(3000, () => {
      b.forEach((x, k) => { x.classList.add('walk'); x.style.left = ['50%', '64%', '78%'][k]; });
    });
    T(4800, () => { b.forEach((x) => x.classList.remove('walk')); say(b[0], `Heille! Regardez ${nouveau}…`, 'right'); });
    T(7000, () => say(b[1], taunt, 'right', 2800));
    T(10000, () => say(b[2], 'Donne-nous ton lunch.', 'right'));
    T(11600, () => {
      $('#acts').innerHTML = `
        <button class="btn" data-c="lunch">🥪 Donner ton lunch</button>
        <button class="btn blue" data-c="talk">🗣️ Essayer de t'expliquer</button>
        <button class="btn red" data-c="mom">😱 Crier « MAAAMAN! »</button>`;
      $$('#acts button').forEach((btn) => { btn.onclick = () => choose(btn.dataset.c); });
    });

    const lines = {
      lunch: ['C\'est des sushis de ma mère…', 'Des SUSHIS?! Ark.'],
      talk: ['Techniquement, j\'étais sur une liste d\'attente…', 'Techniquement, t\'es à Jeanne-Mance.'],
      mom: ['MAAAAAMAN!', this.ag('Ta mère est pas là, champion.', 'Ta mère est pas là, championne.', 'Ta mère est pas là.')],
    };
    let chosen = false;
    const choose = (c) => {
      if (chosen) return;
      chosen = true;
      $('#acts').innerHTML = '';
      SFX.click();
      say(me, lines[c][0], 'left');
      T(1800, () => say(b[0], lines[c][1], 'right'));
      T(3600, punch);
    };

    const punch = () => {
      const lead = b[0];
      lead.style.transition = 'left 0.35s ease-in';
      lead.classList.add('walk');
      lead.style.left = '35%';
      T(380, () => {
        lead.classList.remove('walk');
        lead.querySelector('.fig').innerHTML = G.avatarSVG({}, Object.assign({ bully: true, face: 'mean', fist: true }, bullyLook[0]));
        const fist = document.createElement('div');
        fist.className = 'fist';
        fist.textContent = '🤛';
        fist.style.left = '37%';
        fist.style.bottom = '24%';
        yard.appendChild(fist);
        const pow = document.createElement('div');
        pow.className = 'pow';
        pow.textContent = 'POW!';
        pow.style.left = '24%';
        pow.style.top = '14%';
        yard.appendChild(pow);
        SFX.punch();
        this.shake(yard);
        this.shake(document.getElementById('app'));
        me.querySelector('.fig').innerHTML = G.avatarSVG(p, { face: 'hurt' });
        me.classList.add('hit');
        say(me, 'OUF!', 'left', 1200);
        T(500, () => fist.remove());
      });
      T(1700, () => {
        me.classList.remove('hit');
        me.classList.add('fallen');
        me.querySelector('.fig').innerHTML = G.avatarSVG(p, { face: 'ko' });
        SFX.fall();
        T(900, () => { this.shake(yard); });
      });
      T(2900, () => {
        const dz = document.createElement('div');
        dz.className = 'dizzy';
        dz.textContent = '💫';
        dz.style.left = '42%';
        dz.style.top = '6%';
        me.appendChild(dz);
        const dz2 = dz.cloneNode(true);
        dz2.textContent = '⭐';
        dz2.style.animationDelay = '-0.6s';
        me.appendChild(dz2);
        say(b[1], 'HAHAHA!', 'right', 1600);
      });
      T(4300, () => {
        b.forEach((x) => { x.style.transition = 'left 1.8s linear'; x.classList.add('walk'); x.style.left = '115%'; });
        say(b[0], 'Bienvenue à la polyvalente!', 'right', 1600);
      });
      T(6800, end);
    };
  };

  S.gameOver = function (opts) {
    const st = this.state;
    const p = st.player;
    document.body.classList.add('gloom');
    const tried = st.order.map(byId);
    const failedList = tried.length ? tried.map((s) => esc(s.short)).join(', ') : 'Aucune (volontaire!)';
    this.set(`
      <div class="gameover">
        <h1>GAME OVER</h1>
        <p class="chalk-sub" style="color:#fff">${esc(p.name)} a reçu un coup de poing dans le ventre et ${this.ag('est tombé', 'est tombée', 'est tombé·e')} au sol.</p>
        <div style="width:min(220px,50vw);transform:rotate(90deg);margin:10px 0 -10px">${G.avatarSVG(p, { face: 'ko' })}</div>
        <dl class="report">
          <dt>Rapport d'incident nº 0001</dt><dd>Premier jour du secondaire, 8 h 03</dd>
          <dt>Lieu</dt><dd>Cour de la Polyvalente Jeanne-Mance</dd>
          <dt>Cause</dt><dd>Un coup de poing dans le ventre (et ${tried.length} lettre${tried.length > 1 ? 's' : ''} de refus)</dd>
          <dt>Écoles tentées</dt><dd>${failedList}</dd>
          <dt>Note de l'auteur</dt><dd style="font-weight:400">Pour vrai : Jeanne-Mance offre le PEI, a un mur d'escalade et un verger urbain, et ses Dragons ont été nommés équipe de basketball de l'année (division 3) au RSEQ en 2024. Les bullies de ce jeu sont 100 % inventés.</dd>
        </dl>
        <div class="row center"><button class="btn big" id="again">Recommencer ma 6e année</button><button class="btn chalk-btn" id="new">Nouveau personnage</button></div>
      </div>`);
    SFX.sad();
    $('#again').onclick = () => this.restart(true);
    $('#new').onclick = () => this.restart(false);
  };
})();
