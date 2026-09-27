/* Données du jeu : écoles (faits vérifiés, septembre 2026), événements, ateliers et audition.
   Les règles d'admission décrites sont celles de l'admission 2027-2028. Les épreuves du jeu sont inventées. */
window.ADM = window.ADM || {};

ADM.SCHOOLS = [
  {
    id: 'brebeuf', name: 'Collège Jean-de-Brébeuf', short: 'Brébeuf', emoji: '🏛️', color: '#6b2d5c',
    type: 'Privé', hood: 'Côte-des-Neiges', founded: '1928 (Jésuites)',
    date: 'Sam. 26 ou dim. 27 sept.', dateShort: '27 sept.', slot: null, stars: 5, map: { x: 430, y: 350 },
    process: 'Examen maison fin septembre (2 à 3 h, matière de 5e année) : une partie <b>mathématique et logique</b> (environ 35 min) et trois parties de <b>français</b> : lecture et grammaire (environ 90 min). Le bulletin de 5e compte aussi. Frais : 50 $. 252 places en 1re secondaire, pour des centaines de candidats.',
    facts: [
      'Pierre Elliott Trudeau et son fils Justin y ont étudié : deux premiers ministres du Canada, père et fils!',
      'Robert Bourassa (premier ministre du Québec) et l\'astrophysicien Hubert Reeves aussi.',
      'Sa devise latine : <i>Viam veritatis elegi</i>, « J\'ai choisi la voie de la vérité ».',
      'De la 1re à la 4e secondaire, les classes ne sont pas mixtes : les gars d\'un bord, les filles de l\'autre.',
      'Le Collège fêtera ses 100 ans en 2028.',
    ],
    exam: {
      title: 'Le Grand Examen', format: 'Examen écrit', rule: 'avg', admit: 80, wait: 65,
      blurb: 'L\'examen le plus redouté de Montréal. Une partie de maths et de logique, puis deux parties de français. Le seuil est haut. Très haut.',
      parts: [
        { type: 'quiz', icon: '📐', title: 'Mathématique et logique', hint: '6 questions', intro: 'Suites logiques, fractions, problèmes… De la matière de 5e année, version Brébeuf.', bank: 'brebeuf_math', count: 6, time: 22 },
        { type: 'quiz', icon: '📖', title: 'Français : compréhension de lecture', hint: 'un texte, 3 questions', intro: 'Lis bien le texte. Il reste affiché pendant les questions.', bank: 'brebeuf_lecture', passage: 'brebeuf', fixed: true, time: 32 },
        { type: 'quiz', icon: '✍️', title: 'Français : grammaire', hint: '5 questions', intro: 'Accords, conjugaison, homophones : les pièges préférés des profs.', bank: 'brebeuf_gram', count: 5, time: 16 },
      ],
    },
    win: 'Tu montes le chemin de la Côte-Sainte-Catherine avec un sac à dos trop lourd. Deux premiers ministres ont marché dans ces corridors avant toi. Aucune pression. <i>Viam veritatis elegi!</i>',
    bully: 'Brébeuf t\'a pas pris? Même pas capable de faire une fraction?',
  },
  {
    id: 'jeaneudes', name: 'Collège Jean-Eudes', short: 'Jean-Eudes', emoji: '🦅', color: '#c62828',
    type: 'Privé', hood: 'Rosemont', founded: '1953 (Eudistes)',
    date: 'Sam. 3 oct.', dateShort: '3 oct.', slot: 'oct3', stars: 4, map: { x: 800, y: 300 },
    process: 'Examen maison le samedi 3 octobre 2026. Le collège ne publie pas le contenu (on parle de français et de maths de 5e année). Réponse en une semaine, puis inscription « premier arrivé, premier servi ». Jusqu\'à 360 places en 1re secondaire.',
    facts: [
      'Ses équipes sportives : les Aigles. 🦅',
      'Son blason montre une rose et une montagne : « Rose-mont »! Un jeu de mots avec le nom du quartier.',
      '11 concentrations en arts : cinéma, chant, danse, musique, théâtre, arts culinaires, photo…',
      'Le skieur Alexandre Bilodeau y a étudié. En 2010, il a gagné la première médaille d\'or olympique du Canada remportée au Canada.',
      'Il a ouvert ses portes en 1953 avec seulement 50 élèves.',
    ],
    exam: {
      title: 'L\'examen d\'admission', format: 'Examen écrit', rule: 'avg', admit: 72, wait: 58,
      blurb: 'Calcul mental, français, puis un défi bonus inspiré des concentrations en musique et en chant (ce défi-là est inventé pour le jeu!).',
      parts: [
        { type: 'calcul', icon: '🧮', title: 'Calcul mental', hint: '45 s, objectif 12', intro: 'Réponds le plus vite possible avec le pavé ou le clavier. Objectif : 12 bonnes réponses avant que le crayon soit usé.', seconds: 45, target: 12 },
        { type: 'quiz', icon: '✍️', title: 'Français', hint: '5 questions', intro: 'Vocabulaire, accords et conjugaison.', bank: 'je_fr', count: 5, time: 16 },
        { type: 'simon', icon: '🎤', title: 'Défi concentration musique', hint: 'mémoire musicale, 5 manches', intro: 'Écoute la mélodie, puis rejoue-la. Elle s\'allonge à chaque manche! Tu as droit à deux fausses notes.', rounds: 5, start: 3, weight: 0.6 },
      ],
    },
    win: 'Premier jour à Rosemont! Tu hésites déjà entre la concentration cinéma, la robotique et le chant. Les Aigles t\'accueillent avec un cri d\'aigle un peu raté. 🦅',
    bully: 'Jean-Eudes t\'a refusé? T\'es même pas capable de faire 7 × 8?',
  },
  {
    id: 'cdm', name: 'Collège de Montréal', short: 'Collège de Montréal', pin: 'Coll. de Montréal', emoji: '🦁', color: '#1d4fb8',
    type: 'Privé', hood: 'Centre-ville (rue Sherbrooke Ouest)', founded: '1767 (Sulpiciens)',
    date: 'Dossier + évaluation', dateShort: 'Dossier', slot: null, stars: 4, map: { x: 470, y: 470 },
    process: 'Plus d\'examen standardisé depuis 2025. Le collège regarde les bulletins de 4e et 5e année : 90 % et plus en français et en maths, c\'est la première ronde. Sinon, avec au moins 75 %, il y a une <b>évaluation globale</b> de logique et de français écrit. Frais : 50 $.',
    facts: [
      'Fondé le 1er juin 1767 : c\'est la première école secondaire de l\'île de Montréal, 100 ans avant la Confédération!',
      'Le poète Émile Nelligan y a <b>coulé son examen de latin</b> en 1893. Ça arrive aux meilleurs.',
      'Ses équipes : les Lions, en bleu royal et jaune. 🦁',
      'L\'astronaute David Saint-Jacques y a étudié.',
      'Tout près se dressent deux tours de pierre du fort de la Montagne, bâties à la fin des années 1600.',
    ],
    exam: {
      title: 'L\'évaluation globale', format: 'Évaluation (2e ronde)', rule: 'avg', admit: 72, wait: 58,
      blurb: 'Ton bulletin n\'était pas à 90 %… Te voilà à l\'évaluation globale : français écrit et logique.',
      parts: [
        { type: 'dictee', icon: '🖋️', title: 'Français écrit : la dictée', hint: '10 mots piégés', intro: 'Choisis la bonne orthographe pour chaque mot. Participes passés, homophones… La correction se fait au crayon rouge.', text: 'cdm', time: 14 },
        { type: 'quiz', icon: '🧩', title: 'Logique', hint: '4 énigmes', intro: 'Suites, déductions et casse-têtes.', bank: 'cdm_logic', count: 4, time: 25 },
      ],
    },
    win: 'Tu passes devant les vieilles tours de pierre, plus de 330 ans d\'histoire. Les Lions rugissent au gymnase. Même Nelligan a coulé son latin ici : tu es en bonne compagnie. 🦁',
    bully: 'Le Collège de Montréal t\'a refusé? Une école de 1767 veut pas de toi?!',
  },
  {
    id: 'msl', name: 'Collège Mont-Saint-Louis', short: 'Mont-Saint-Louis', emoji: '🐻', color: '#8a5a00',
    type: 'Privé', hood: 'Ahuntsic (Sault-au-Récollet)', founded: '1888 (Frères des écoles chrétiennes)',
    date: 'Analyse du dossier', dateShort: 'Bulletin', slot: null, stars: 3, map: { x: 560, y: 195 },
    process: '<b>Aucun examen!</b> Seulement les bulletins de 4e et surtout de 5e année : français, maths, sciences, univers social et anglais, comparés à la moyenne du groupe. <b>Aucun échec permis.</b> Environ 300 places en 1re secondaire. Frais : 50 $.',
    facts: [
      'Ses équipes : les Kodiaks, très forts au flag-football. 🐻',
      'L\'astronaute Julie Payette et le chef d\'orchestre Yannick Nézet-Séguin y ont étudié.',
      'Depuis 1969, le collège est une coopérative de parents.',
      'Il loge dans un ancien noviciat jésuite construit en 1852-1853 : un monument patrimonial!',
      'Son premier bâtiment, rue Sherbrooke Est, a été transformé en condos.',
    ],
    exam: {
      title: 'Le bulletin en accéléré', format: 'Bulletin seulement', rule: 'msl', admit: 80, wait: 66,
      blurb: 'Pas d\'examen : le collège regarde ton bulletin de 5e. Problème : tu ne te souviens plus de ta 5e année. Revis-la en 60 secondes!',
      parts: [
        { type: 'vraifaux', icon: '📊', title: 'Ta 5e année en 60 secondes', hint: 'vrai ou faux, 5 matières', intro: 'Réponds VRAI ou FAUX le plus vite possible. Chaque bonne réponse monte ta note dans la matière. Attention : un seul échec (moins de 60 %) et c\'est fichu!', bank: 'msl', seconds: 60 },
      ],
    },
    win: 'Premier jour à Ahuntsic : camp d\'intégration de 48 heures, iPad sous le bras. Les Kodiaks t\'adoptent. Grrr! 🐻',
    bully: 'Même Mont-Saint-Louis t\'a pas pris? C\'était juste ton bulletin, ça!',
  },
  {
    id: 'roberval', name: 'Académie De Roberval', short: 'Roberval', emoji: '🧭', color: '#1f8a7e',
    type: 'Public (CSSDM), sélectif', hood: 'Villeray (rue Jarry Est)', founded: 'Programme enrichi depuis 1994',
    date: 'Sam. 3 oct.', dateShort: '3 oct.', slot: 'oct3', stars: 4, map: { x: 680, y: 238 },
    process: 'École <b>publique et gratuite</b>, mais sélective : il faut au moins 75 % en français et en maths en 5e année, puis un test le samedi 3 octobre 2026 en <b>trois sous-tests</b> : compréhension en français, mathématique et logique. <b>Il faut réussir les trois.</b> Le résultat est donné en stanine, de 1 à 9. En 2022 : environ 120 élèves admis sur 300 par séance.',
    facts: [
      'On y apprend le latin dès la 1re secondaire. <i>Salve!</i> (« Salut! »)',
      'Son nom vient de Jean-François de La Rocque de Roberval, lieutenant général de la Nouvelle-France de 1541 à 1543.',
      'Son slogan : « Petite école, grande visée ».',
      'Depuis 2018, l\'école est temporairement installée rue Jarry : son vrai bâtiment a fermé à cause de moisissures.',
      'Génie en herbe, robotique, échecs, impro et radio étudiante : ça bouge!',
    ],
    exam: {
      title: 'Le test en trois sous-tests', format: 'Test standardisé', rule: 'roberval', admit: 0, wait: 0,
      blurb: 'Trois sous-tests chronométrés. Chacun donne un stanine sur 9. Un seul sous-test raté et c\'est non, même avec des 9 ailleurs!',
      parts: [
        { type: 'quiz', icon: '📖', title: 'Sous-test 1 : compréhension en français', hint: 'un texte, 4 questions', intro: 'Lis le texte, puis réponds. Il reste affiché.', bank: 'rob_fr', passage: 'roberval', fixed: true, time: 24 },
        { type: 'quiz', icon: '🔢', title: 'Sous-test 2 : mathématique', hint: '4 questions', intro: 'Problèmes et calculs de 5e année.', bank: 'rob_math', count: 4, time: 22 },
        { type: 'quiz', icon: '🔷', title: 'Sous-test 3 : logique', hint: '4 suites visuelles', intro: 'Trouve ce qui complète chaque suite, ou l\'intrus.', bank: 'rob_logic', count: 4, time: 18 },
      ],
    },
    win: '<i>Salve!</i> Premier cours de latin dans une petite école à la grande visée. Et c\'est gratuit : ton père renomme son onglet Excel « Économies ». 🧭',
    bully: 'Roberval t\'a pas pris? T\'as eu un stanine de 1 sur 9, c\'est ça?',
  },
  {
    id: 'villemarie', name: 'Collège Ville-Marie', short: 'Ville-Marie', emoji: '⚜️', color: '#d9651b',
    type: 'Privé', hood: 'Sainte-Marie (rue Sherbrooke Est)', founded: '1962 (Aurèle Daoust)',
    date: 'Sam. 26 sept.', dateShort: '26 sept.', slot: 'sep26', stars: 3, map: { x: 805, y: 440 },
    process: 'Pas d\'examen : des <b>ateliers d\'admission</b> (habiletés scolaires, motivation, personnalité) le samedi 26 septembre 2026, plus les bulletins de 4e et 5e année. 168 places en 1re secondaire, et au plus 700 demandes acceptées.',
    facts: [
      '« Ville-Marie », c\'est le premier nom de Montréal, fondée en 1642!',
      'Fondé en 1962 par Aurèle Daoust. Un nouveau pavillon porte son nom.',
      'Son équipe sportive : L\'EXPRESS.',
      'Il y a un programme d\'e-sports depuis 2019. 🎮',
      'On y porte l\'uniforme.',
    ],
    exam: {
      title: 'Les ateliers d\'admission', format: 'Ateliers', rule: 'avg', admit: 68, wait: 52,
      blurb: 'Trois ateliers pour voir comment tu travailles, en solo et en équipe… et pourquoi tu veux venir ici.',
      parts: [
        { type: 'sort', icon: '🗓️', title: 'Atelier : méthodes de travail', hint: 'organise ton agenda', intro: 'Classe tes tâches dans l\'ordre où tu devrais les faire. Chaque erreur coûte des points.', set: 'agenda', time: 40 },
        { type: 'choice', icon: '🍝', title: 'Atelier : travail d\'équipe', hint: 'la tour de spaghettis', intro: 'En équipe de quatre, bâtissez la plus haute tour avec 20 spaghettis, du ruban adhésif et une guimauve. L\'animatrice observe tout.', set: 'equipe', fixed: true },
        { type: 'choice', icon: '💬', title: 'Mini-entrevue : motivation', hint: '3 questions', intro: 'Une enseignante te pose quelques questions. Sois toi-même… en mieux.', set: 'motivation', fixed: true },
      ],
    },
    win: 'Uniforme repassé, tu arrives rue Sherbrooke Est. Ville-Marie, comme le premier nom de Montréal : te voilà dans l\'histoire! (Et dans le club d\'e-sports.) ⚜️',
    bully: 'Ville-Marie t\'a refusé? T\'es même pas capable de bâtir une tour de spaghettis?',
  },
  {
    id: 'gravel', name: 'École secondaire Robert-Gravel', short: 'Robert-Gravel', emoji: '🎭', color: '#7b1fa2',
    type: 'Public (CSSDM), art dramatique', hood: 'Plateau (avenue Fairmount Est)', founded: 'Art dramatique depuis 2004',
    date: 'Sam. 24 oct.', dateShort: '24 oct.', slot: 'oct24', stars: 4, map: { x: 592, y: 302 },
    process: 'C\'est une <b>audition</b>, le samedi 24 octobre 2026 : apprendre une scène imposée (les DEUX personnages), créer des personnages, bâtir une maquette et la présenter, puis jouer une scène en duo. Le jury regarde l\'effort, la créativité, l\'écoute et le travail d\'équipe. Ensuite… <b>tirage au sort</b> parmi les élèves qui ont réussi!',
    facts: [
      'C\'est la seule école au Québec entièrement consacrée à l\'art dramatique : environ 200 heures de théâtre par année!',
      'Robert Gravel (1944-1996) a cofondé la Ligue nationale d\'improvisation (LNI) en 1977. Son chandail nº 1 a été retiré.',
      'Deux profils : Jeu (sur scène) et Production (décors, costumes, maquillage, éclairage, son).',
      'À la LNI, quand le public n\'aime pas une décision de l\'arbitre, il lance des claques sur la patinoire!',
      'L\'école est sur l\'avenue Fairmount, à deux pas d\'une célèbre boulangerie de bagels. 🥯',
    ],
    exam: {
      title: 'L\'audition', format: 'Audition', rule: 'gravel', admit: 70, wait: 55,
      blurb: 'Pas de crayon HB ici : une scène, des personnages, une maquette et un duo. Le jury note ton écoute et ta créativité. Et même si tu réussis… il y a un tirage au sort.',
      parts: [
        { type: 'sort', icon: '📜', title: 'La scène imposée', hint: 'mémorise les deux personnages', intro: 'Tu as appris la scène imposée à la maison… en théorie. Relis-la, puis remets les répliques dans l\'ordre.', set: 'scene', memorize: 16, time: 40 },
        { type: 'choice', icon: '🎲', title: 'Création de personnages', hint: 'impro avec cartes d\'arbitre', intro: 'L\'animateur pige des cartes, comme à la LNI. Crée ton personnage et accepte les propositions : « Oui, et… »! Attention aux pénalités.', set: 'impro', count: 3 },
        { type: 'pick', icon: '🏗️', title: 'La maquette', hint: 'choisis 3 éléments de décor', intro: 'Construis la maquette du décor : choisis les 3 éléments qui racontent le mieux la scène, puis présente-la au jury.', set: 'maquette', time: 35 },
        { type: 'timing', icon: '🎙️', title: 'Scène en duo', hint: 'le timing, c\'est tout', intro: 'Joue la scène avec ton ou ta partenaire. Dis chaque réplique au bon moment : ni trop tôt, ni trop tard!', set: 'duo' },
      ],
    },
    win: 'Les projecteurs s\'allument sur l\'avenue Fairmount. 200 heures de théâtre par année, un bagel chaud entre deux répétitions… Robert Gravel serait fier. 🎭',
    bully: 'Robert-Gravel t\'a pas pris? Pas grave : ici, tu vas jouer la victime!',
  },
  {
    id: 'jeannemance', name: 'Polyvalente Jeanne-Mance', short: 'Jeanne-Mance', emoji: '😱', color: '#6d6f72',
    type: 'Public (CSSDM), école de quartier', hood: 'Plateau (rue de Bordeaux)', fallback: true, map: { x: 700, y: 362 },
    process: 'C\'est l\'école de quartier : pas d\'examen pour le programme régulier. Dans ce jeu, c\'est là que tu vas si aucune école ne t\'accepte.',
    facts: [
      'Son nom honore Jeanne Mance, cofondatrice de Montréal en 1642 et fondatrice de l\'Hôtel-Dieu.',
      'Pour vrai : elle offre le PEI, un mur d\'escalade et même un verger urbain. 🍎',
      'Toutes ses équipes s\'appellent les Dragons. 🐉',
    ],
  },
];

// ---------- Événements du trajet ----------
ADM.EVENTS = [
  { id: 'orange', icon: '🚇', short: 'Panne sur la ligne orange', text: 'Panne sur la ligne orange! Tu cours les trois derniers coins de rue et tu arrives à bout de souffle.', effect: { time: 0.8 } },
  { id: 'cones', icon: '🚧', short: 'Cônes orange partout', text: 'Des cônes orange partout! Ton père fait trois détours en marmonnant. Ton cœur bat vite.', effect: { time: 0.85 } },
  { id: 'bagel', icon: '🥯', short: 'Bagel chaud', text: 'Ta mère t\'a acheté un bagel sésame tout chaud. St-Viateur ou Fairmount? Le débat continue, mais ton cerveau est au top.', effect: { time: 1.15 } },
  { id: 'nightmare', icon: '😴', short: 'Mauvaise nuit', text: 'Tu as mal dormi : tu as rêvé que tu finissais à Jeanne-Mance.', effect: { time: 0.9 } },
  { id: 'aunt', icon: '👩‍🏫', short: 'Ta tante enseignante', text: 'Ta tante enseignante te donne ses trucs dans l\'auto : « Lis TOUJOURS la question deux fois. »', effect: { tutor: 1 } },
  { id: 'autumn', icon: '🍁', short: 'Belle journée d\'automne', text: 'Belle journée d\'automne. Les feuilles sont orange (comme les cônes). Tu te sens zen.', effect: { time: 1.1 } },
  { id: 'friends', icon: '📱', short: 'Texto de ta gang', text: 'Ta gang t\'envoie « bonne chance » avec 14 émojis. Ça fait du bien.', effect: { muffin: 1 } },
  { id: 'raccoon', icon: '🦝', short: 'Raton porte-bonheur', text: 'Un raton laveur te fait un clin d\'œil en fouillant dans le bac à compost. Ça porte chance, c\'est sûr.', effect: { tutor: 1 } },
  { id: 'pencil', icon: '✏️', short: 'Crayons oubliés', text: 'Tu as oublié tes crayons HB! Ta mère en trouve un dans le coffre à gants. Il est mâchouillé, mais il marche.', effect: {} },
  { id: 'snow', icon: '🌨️', short: 'Première neige', text: 'Première neige en octobre (classique). Tout le monde conduit comme si c\'était la première fois de sa vie.', effect: { time: 0.9 } },
  { id: 'bus165', only: ['brebeuf'], icon: '🚌', short: 'Autobus 165 bondé', text: 'L\'autobus 165 Côte-des-Neiges est plein à craquer. Tu fais le trajet le nez dans le sac à dos de quelqu\'un.', effect: { time: 0.85 } },
  { id: 'udem', only: ['brebeuf'], icon: '🎓', short: 'Encouragements', text: 'Des étudiants de l\'Université de Montréal, juste à côté, te crient « Bonne chance! ». Tu te sens déjà universitaire.', effect: { time: 1.1 } },
  { id: 'rosemont', only: ['jeaneudes'], icon: '🌹', short: 'Rose-mont', text: 'Tu remarques le blason : une rose et une montagne. « Rose-mont »! Petit rire nerveux, mais ça détend.', effect: { time: 1.1 } },
  { id: 'lions', only: ['cdm'], icon: '🦁', short: 'La mascotte des Lions', text: 'La mascotte des Lions te fait un high five à l\'entrée. Tu te sens invincible.', effect: { time: 1.15 } },
  { id: 'jarry', only: ['roberval'], icon: '🏗️', short: 'Mauvais bâtiment', text: 'Ton père se trompe de bâtiment : l\'Académie est temporairement rue Jarry depuis 2018! Petit sprint.', effect: { time: 0.85 } },
  { id: 'sherbrooke', only: ['villemarie', 'cdm'], icon: '🚧', short: 'Sherbrooke en travaux', text: 'La rue Sherbrooke est en travaux (surprise!). Tu finis le trajet à pied.', effect: { time: 0.85 } },
  { id: 'fairmount', only: ['gravel'], icon: '🥯', short: 'Odeur de bagels', text: 'L\'avenue Fairmount sent le bagel chaud. Ton trac descend d\'un cran.', effect: { time: 1.15 } },
  { id: 'noviciat', only: ['msl'], icon: '🏛️', short: 'Le vieux noviciat', text: 'Tu admires le vieux bâtiment de 1853 au bord de la rivière des Prairies. Ça inspire!', effect: { time: 1.1 } },
];

// ---------- Remettre en ordre ----------
ADM.SORT = {
  agenda: {
    prompt: 'On est lundi soir. Clique sur tes tâches dans l\'ordre où tu devrais les faire (la plus urgente d\'abord).',
    items: [
      'Réviser pour l\'examen de maths de DEMAIN matin',
      'Finir le devoir de français (à remettre mercredi)',
      'Lire les chapitres pour le club de lecture (vendredi)',
      'Avancer le projet de sciences (dans deux semaines)',
      'Ranger ta chambre (ta mère a dit « un jour »)',
    ],
    penalty: 15,
  },
  scene: {
    stage: true,
    memorize: 'Voici la scène imposée, « Le dernier bagel ». Mémorise l\'ordre des répliques des DEUX personnages!',
    prompt: 'Remets les répliques dans l\'ordre. Clique d\'abord sur la première.',
    items: [
      { who: 'ALEX', t: 'Excusez-moi… c\'est le dernier bagel au sésame?' },
      { who: 'SAM', t: 'Oui. Et je l\'attends depuis 6 h du matin.' },
      { who: 'ALEX', t: 'Moi, depuis 5 h 59.' },
      { who: 'SAM', t: 'Alors… on le coupe en deux?' },
      { who: 'ALEX', t: 'Marché conclu. Mais je garde la moitié avec le plus de graines.' },
      { who: 'SAM', t: '…On recommence la négociation.' },
    ],
    penalty: 15,
  },
};

// ---------- Scénarios à choix ----------
ADM.CHOICE = {
  equipe: {
    stage: false,
    cards: [
      {
        who: '👧', name: 'Rosalie, de ton équipe', say: '« Moi, je pense qu\'il faut faire une base en triangle! »', prompt: 'Que fais-tu?',
        opts: [
          { t: '« Bonne idée! Et si on doublait les spaghettis pour la rendre plus solide? »', pts: 100, r: 'L\'animatrice note quelque chose avec un grand sourire. Écouter ET proposer : parfait!' },
          { t: '« Non, on fait MA tour. J\'ai vu une vidéo. »', pts: 25, r: 'Rosalie croise les bras. L\'animatrice écrit : « leadership… autoritaire ».' },
          { t: 'Tu manges la guimauve.', pts: 5, r: 'Il n\'y a plus de guimauve. Toute l\'équipe te regarde. Silence.' },
          { t: '« Ok… » (et tu ne dis plus rien de tout l\'atelier)', pts: 45, r: 'C\'est gentil, mais on ne t\'entend plus du tout.' },
        ],
      },
      {
        who: '👦', name: 'Thomas, de ton équipe', say: '« La tour penche! Elle va tomber! »', prompt: 'Il reste deux minutes. Tu…',
        opts: [
          { t: 'proposes de mettre du ruban à la base pendant que quelqu\'un tient la tour.', pts: 100, r: 'La tour tient! L\'animatrice lève le pouce.' },
          { t: 'cries : « C\'EST LA FAUTE À THOMAS! »', pts: 10, r: 'Thomas est vexé. L\'animatrice écrit une très longue note…' },
          { t: 'ajoutes 12 spaghettis au sommet pour qu\'elle soit plus haute.', pts: 35, r: 'Crac. La tour s\'effondre sous le poids. Au moins, c\'était ambitieux.' },
          { t: 'filmes la tour qui penche pour ta story.', pts: 15, r: 'Les cellulaires sont interdits pendant l\'atelier. Oups.' },
        ],
      },
      {
        who: '👩‍🏫', name: 'L\'animatrice', say: '« Votre tour est la plus petite du groupe. Qu\'est-ce que vous en retenez? »', prompt: 'Tu réponds…',
        opts: [
          { t: '« On aurait dû tester la base avant de monter. La prochaine fois, on fait un plan! »', pts: 100, r: '« Excellent! C\'est exactement ça, apprendre. »' },
          { t: '« Les spaghettis étaient défectueux. »', pts: 20, r: 'L\'animatrice hausse un sourcil. Les spaghettis ont le dos large.' },
          { t: '« On a eu du fun pareil! »', pts: 60, r: '« J\'aime l\'attitude! Mais qu\'est-ce que vous changeriez? »' },
          { t: '« C\'est sur combien, cette activité-là? »', pts: 30, r: '« Ce n\'est pas noté comme ça… » (Ça l\'est un peu.)' },
        ],
      },
    ],
  },
  motivation: {
    stage: false,
    cards: [
      {
        who: '👩‍🏫', name: 'Madame Lafleur', say: '« Pourquoi veux-tu venir au Collège Ville-Marie? »', prompt: 'Ta réponse :',
        opts: [
          { t: '« J\'aime vos programmes, comme Sport plein air et Initiative, et j\'ai envie de me dépasser. »', pts: 100, r: 'Elle sourit : « Tu as fait tes devoirs! »' },
          { t: '« Ma mère veut. »', pts: 20, r: '« Et toi, qu\'est-ce que tu veux? » Malaise.' },
          { t: '« Parce que c\'est proche d\'un McDo. »', pts: 10, r: 'Elle ne note rien. C\'est pire que si elle notait.' },
          { t: '« Pour l\'uniforme : je vais sauver du temps le matin. »', pts: 55, r: 'Elle rit. Honnête, au moins!' },
        ],
      },
      {
        who: '👩‍🏫', name: 'Madame Lafleur', say: '« Parle-moi d\'une fois où tu as eu de la difficulté à l\'école. »', prompt: 'Ta réponse :',
        opts: [
          { t: '« Les fractions! J\'ai demandé de l\'aide et j\'ai pratiqué chaque soir. »', pts: 100, r: '« La persévérance : c\'est exactement ce qu\'on cherche. »' },
          { t: '« Jamais. Tout est facile pour moi. »', pts: 25, r: 'Elle écrit : « humilité à travailler ».' },
          { t: '« Le prof était méchant, c\'était de sa faute. »', pts: 15, r: 'Hmm. Elle griffonne quelque chose.' },
          { t: '« Je m\'en souviens pas, j\'étais dans la lune. »', pts: 35, r: '« Au moins, c\'est honnête… »' },
        ],
      },
      {
        who: '👩‍🏫', name: 'Madame Lafleur', say: '« Dernière question. Le savais-tu? « Ville-Marie », c\'était le premier nom de… »', prompt: 'Complète sa phrase :',
        opts: [
          { t: '« …Montréal, en 1642! »', pts: 100, r: '« Bravo! Maisonneuve et Jeanne Mance seraient fiers. » (Jeanne Mance… brrr.)' },
          { t: '« …Laval? »', pts: 15, r: 'Elle retient un fou rire.' },
          { t: '« …un chalet dans les Laurentides? »', pts: 10, r: 'Non.' },
          { t: '« …la rue Sherbrooke? »', pts: 30, r: 'Pas tout à fait, mais tu es sur la bonne île.' },
        ],
      },
    ],
  },
  impro: {
    stage: true,
    cards: [
      {
        lni: { nature: 'Mixte', titre: 'Le dernier bagel', joueurs: 'Illimité', categorie: 'Chantée', duree: '2 min 30' },
        who: '🧑‍🎤', name: 'Ton ou ta partenaire', say: '« ♪ Je suis un raton laveur, et j\'ai faim de bagels ♪ »', prompt: 'La catégorie est CHANTÉE. Tu réponds…',
        opts: [
          { t: '« ♪ Et moi, le boulanger, j\'ai caché le dernier au sommet du mont Royal ♪ »', pts: 100, r: 'Tu chantes ET tu fais avancer l\'histoire. Le jury tape des mains!' },
          { t: '« Un raton? Non, t\'es juste une personne. »', pts: 10, r: 'Tu refuses la proposition de ton ou ta partenaire!', foul: 'Obstruction' },
          { t: '« Moi aussi, j\'ai faim. » (sans chanter)', pts: 25, r: 'C\'était une catégorie chantée…', foul: 'Thème non respecté' },
          { t: 'Tu fais une imitation d\'opéra pendant deux minutes en ignorant la scène.', pts: 20, r: 'Drôle, mais tu prends toute la place.', foul: 'Cabotinage' },
        ],
      },
      {
        lni: { nature: 'Comparée', titre: 'Le cône orange', joueurs: '2', categorie: 'Libre', duree: '2 min' },
        who: '🧑‍🎤', name: 'Ton ou ta partenaire', say: '« Chef! Un cône orange est apparu devant la maison ce matin… et il me parle. »', prompt: 'Tu joues le ou la chef. Tu dis…',
        opts: [
          { t: '« Oui, et il veut devenir maire de Montréal! Vite, organisons une élection! »', pts: 100, r: '« Oui, et… » : tu acceptes et tu ajoutes. Le public embarque!' },
          { t: '« Les cônes, ça parle pas. Fin de la scène. »', pts: 15, r: 'Tu bloques la proposition.', foul: 'Obstruction' },
          { t: '« Hein? Quoi? Quel cône? »', pts: 30, r: 'Tu n\'as pas écouté ton ou ta partenaire.', foul: 'Manque d\'écoute' },
          { t: '« Oui. » (et tu attends)', pts: 50, r: 'Tu acceptes, mais tu n\'ajoutes rien. La scène s\'essouffle.' },
        ],
      },
      {
        lni: { nature: 'Mixte', titre: 'Le premier jour', joueurs: '3', categorie: 'Sans paroles', duree: '1 min 30' },
        who: '🧑‍🎤', name: 'Ton ou ta partenaire', say: '(mime quelqu\'un qui cherche désespérément son casier)', prompt: 'La catégorie est SANS PAROLES. Tu…',
        opts: [
          { t: 'mimes le concierge qui arrive avec un énorme trousseau de clés.', pts: 100, r: 'Pas un mot, et tout est clair. Le jury adore!' },
          { t: 'dis : « Ton casier est là-bas! »', pts: 20, r: 'C\'était sans paroles…', foul: 'Thème non respecté' },
          { t: 'sors ton vrai cellulaire pour éclairer la scène.', pts: 25, r: 'Un vrai objet sur scène? Interdit!', foul: 'Accessoire illégal' },
          { t: 'mimes que tu cherches, toi aussi, pendant une éternité.', pts: 55, r: 'Tu écoutes, mais la scène tourne en rond.' },
        ],
      },
      {
        lni: { nature: 'Mixte', titre: 'Les examens d\'admission', joueurs: 'Illimité', categorie: 'À la manière d\'un film d\'horreur', duree: '3 min' },
        who: '🧑‍🎤', name: 'Ton ou ta partenaire', say: '« Chuuut… As-tu entendu? On dirait… un crayon HB qui roule dans le corridor… »', prompt: 'Catégorie : film d\'horreur. Tu dis…',
        opts: [
          { t: '(en chuchotant) « Et regarde… la feuille-réponse est déjà remplie… avec MON nom… »', pts: 100, r: 'Frissons dans la salle. Catégorie parfaitement respectée!' },
          { t: '« C\'est juste le vent! Allons manger une poutine! »', pts: 30, r: 'Tu brises l\'ambiance d\'horreur.', foul: 'Thème non respecté' },
          { t: 'Tu éclates de rire et tu sors de ton personnage.', pts: 15, r: 'Tu as décroché!', foul: 'Décrochage' },
          { t: '« AAAAH! » (tu cries très fort, puis plus rien)', pts: 55, r: 'Efficace… mais il faut construire la suite!' },
        ],
      },
      {
        lni: { nature: 'Comparée', titre: 'Le raton du mont Royal', joueurs: '2', categorie: 'Rimée', duree: '2 min' },
        who: '🧑‍🎤', name: 'Ton ou ta partenaire', say: '« Sur le mont Royal, un raton très poli… »', prompt: 'La catégorie est RIMÉE. Tu continues…',
        opts: [
          { t: '« …rêvait d\'un bagel et d\'un lit bien garni! »', pts: 100, r: 'Ça rime ET ça avance. Bravo!' },
          { t: '« …mangeait des déchets. »', pts: 30, r: 'Ça ne rime pas!', foul: 'Thème non respecté' },
          { t: '« …euh… pis? »', pts: 35, r: 'Tu ne proposes rien. La scène s\'arrête net.' },
          { t: '« Un raton? C\'est tellement cliché, les ratons. »', pts: 15, r: 'Tu refuses l\'idée ET tu la juges.', foul: 'Obstruction' },
        ],
      },
    ],
  },
};

// ---------- Maquette ----------
ADM.PICK = {
  maquette: {
    prompt: 'La scène se passe « dans un dépanneur de Montréal, à minuit, pendant une tempête de neige ». Choisis les 3 éléments de décor qui la racontent le mieux.',
    need: 3,
    items: [
      { e: '🧊', t: 'Une machine à slush qui clignote', ok: true, r: 'La machine à slush : on est clairement dans un dépanneur!' },
      { e: '🕛', t: 'Une horloge qui indique minuit', ok: true, r: 'L\'horloge situe l\'heure. Bien pensé!' },
      { e: '❄️', t: 'Une fenêtre couverte de neige', ok: true, r: 'La neige dans la fenêtre : la tempête est là!' },
      { e: '🏖️', t: 'Un parasol de plage', ok: false, r: 'Un parasol… en pleine tempête? Le jury est perplexe.' },
      { e: '🦖', t: 'Un dinosaure gonflable', ok: false, r: 'Un dinosaure. Audacieux. Mais pourquoi?' },
      { e: '🏰', t: 'Un château fort', ok: false, r: 'Un château fort dans un dépanneur? Hmm.' },
      { e: '🎄', t: 'Un sapin de Noël géant', ok: false, r: 'Joli, mais ça ne dit pas « dépanneur ».' },
      { e: '🌋', t: 'Un volcan en éruption', ok: false, r: 'Un volcan à Montréal? Le jury sourit poliment.' },
    ],
  },
};

// ---------- Scène en duo ----------
ADM.TIMING = {
  duo: {
    lines: [
      { cue: '« On ferme dans deux minutes… Tu veux quelque chose? »', you: 'Juste… le dernier bagel.' },
      { cue: '« Désolé. Quelqu\'un vient de l\'acheter. »', you: 'QUOI?! J\'ai traversé la tempête pour ça!' },
      { cue: '« …Bon. Je t\'en fais un nouveau. Au sésame? »', you: 'Tu viens de sauver ma soirée!' },
    ],
  },
};
