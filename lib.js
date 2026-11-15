/* vapolia/analytics-portal-basicui : rendu commun des panneaux des tableaux de bord Vapolia Analytics. Aucune couleur, aucun nom ni aucun seuil de projet dans ce code.
   Charte du projet : le panneau déclare la lecture { "id": "charte", "table": "charte" }. La bibliothèque lit d.charte[0] à chaque
   onData, sans appel du panneau. Sans cette lecture, ou pour une colonne absente, la valeur par défaut s'applique.
   Colonnes de la table charte, une seule ligne, toutes facultatives. Une couleur a une variante <colonne>_dark pour le thème
   sombre. Sans variante, la couleur claire sert aux deux thèmes.
     name                         nom de l'app, cité par va.recos
     health_hours                 âge du dernier événement, en heures, au-delà duquel va.kpis affiche une alerte (48)
     recent_first                 false : période la plus ancienne à gauche (true)
     pal1 … pal10                 palette des séries
     fg, gr, mu, tb, hv           graphiques et tableaux : texte, grille, texte secondaire, fond d'infobulle, survol
     card_fg, card_mu, card_bd, card_bg   cartes : texte, texte secondaire, bordure, fond
     up, dn, warn, hi, me, lo     cartes : hausse, baisse, avertissement, priorité haute, moyenne, basse
     sel_bg, sel_bar              ligne de tableau sélectionnée : fond, liseré
     accent_bg, accent_tx         onglet sélectionné : fond, texte
     ink_light, ink_dark          texte posé sur une couleur claire, sur une couleur foncée (sans variante _dark)
   Fonctions exportées (window.va) :
     va.PAL : string[]                                   palette de 10 couleurs (charte du projet), remplie selon le thème à chaque onData
     va.setTheme(d)                                      applique la palette du thème de d (fait automatiquement par onData)
     va.onColor(hex) -> string                           couleur de texte lisible sur ce fond
     va.arr(v) -> Array                                  v si c'est un tableau, sinon []
     va.esc(v) -> string                                 échappe & < > " pour le HTML
     va.day(v) -> string                                 'aaaa-mm-jj…' -> 'jj/mm'
     va.month(v) -> string                               'aaaa-mm-jj…' -> 'mois aa' (ex. 'oct. 26')
     va.colors(d) -> { fg, gr, mu, tb, hv }              couleurs des graphiques selon d.theme
     va.cardColors(d) -> { fg, mu, bd, bg, up, dn, warn, hi, me, lo }   couleurs des cartes
     va.first(el) -> boolean                             vrai au premier rendu du conteneur seulement
     va.empty(el, d, anim, msg?)                         affiche « Pas encore de données sur la période »
     va.isCurrent(raw, period) -> boolean                vrai si raw tombe dans la période en cours ('day'|'week'|'month', UTC)
     va.complete(rows, key, period) -> Array             lignes hors période en cours
     va.periods(rows, key, period) -> [dernière, précédente]   les deux dernières périodes complètes (valeurs de key)
     va.sumWhere(rows, key, val, col) -> number|null     somme de col sur les lignes où row[key] (10 premiers car.) === val ; null si aucune
     va.weekStart(o?) -> 'aaaa-mm-jj'                    lundi UTC de la semaine courante moins o semaines (1 = dernière complète)
     va.monthStart(o?) -> 'aaaa-mm-jj'                   1er du mois courant moins o mois (1 = dernier complet)
     va.series(rows, xKey, cols, fmt?) -> { raw, x, s }  colonnes -> séries ; cols : [[colonne, libellé, lblFn(row)?], ...]
     va.pivot(rows, xKey, catKey, valKey, fmt?, labels?, lblFn?) -> { raw, x, s }   lignes longues -> une série par catégorie ; labels : {cat: libellé} ;
                                                         lblFn(row) -> string : étiquette du point (s.l)
     Série : { n, v, l?, c? } ; l[i] : étiquette écrite sur le graphique (opts.labels) et dans l'infobulle ; c : couleur imposée
     va.series : cols [[colonne, libellé, lblFn?, couleur?], ...]
     va.group(rows, key, catKey, valKey) -> Array        regroupe par clé, une colonne sommée par catégorie
     va.bucketKey(b) -> number                           ordre d'une tranche ('lt_15m' < '15_30m' < '1_2h' < 'gt_4h')
     va.bucketLabel(b) -> string                         'lt_15m' -> '< 15 min', '1_2h' -> '1–2 h', '5_10km' -> '5–10 km'
     va.chart(el, d, data, type, opts?)                  graphique SVG ; type 'line'|'bar'|'stack' ; opts { unit, period, max, note, labels, reverse } ou unit ; labels : valeurs écrites sur le graphique ;
                                                         reverse : période la plus récente à gauche ; par défaut vrai si opts.period et recent_first de la charte
     va.table(el, d, cols, rows, note?, opts?)           tableau triable ; cols : [[clé, libellé, alignement?], ...] ; opts { onRow, isSel, cellStyle, barPct }
                                                         opts.barPct(row, clé) -> 0–100|null : mini-barre sous la valeur
     va.miniBar(d, pct, color?) -> string                HTML d'une mini-barre (piste 80 px max, alignée à droite)
     va.bar(pct, color) -> string                        CSS d'un fond en barre horizontale, pct de 0 à 100
     va.hbars(el, d, items, opts?)                       barres horizontales ; items : [{ label, value, text?, sub? }] ; opts { max, unit, note }
     va.tabs(el, d, names, sel, onSel)                   boutons de sélection ; renvoie le conteneur du contenu
     va.periodCols(rows, key, period, fmt?, n?) -> cols   colonnes de matrix : les n (6) dernières périodes, la plus récente d'abord si recent_first de la charte
     va.matrix(el, d, m)                                 tableau lignes × périodes ; m : { cols: [{ key, label, current? }],
                                                         rows: [{ label, color?, cells: { key: { text, sub?, pct? } } }], note?, title? }
                                                         pct (0–100) dessine une mini-barre sous le chiffre (couleur de la ligne) ; colonne current en clair
     va.kpis(el, d, groups, health?)                     tuiles KPI groupées ; groups : [{ title, items: [[libellé, valeur, préc., unité?], ...] }]
                                                         tuile teintée selon l'écart : flèche et % en coin, écart absolu dessous (en points si unité %)
                                                         health : lignes de health_daily ; alerte si dernier événement > health_hours de la charte
     va.recos(el, d, note)                               cartes de recommandations depuis une note Markdown
   va.recos : la date de l'analyse est dans le titre du panneau, mis à jour à chaque rafraîchissement.
   Bibliothèques à charger avant : aucune.
   Garder les signatures compatibles : ajouter des fonctions plutôt que les modifier. */
(function () {
  'use strict';

  var CSS = ".an .gb{transform-box:fill-box;transform-origin:50% 100%;animation:gG .55s cubic-bezier(.2,.8,.2,1) both}@keyframes gG{from{transform:scaleY(0)}}.an .gh{transform-box:fill-box;transform-origin:0 50%;animation:gH .6s cubic-bezier(.2,.8,.2,1) both}@keyframes gH{from{transform:scaleX(0)}}.an .gl{stroke-dasharray:1;stroke-dashoffset:1;animation:gD .9s ease-out forwards}@keyframes gD{to{stroke-dashoffset:0}}.an .gd{animation:gF .35s ease-out .6s both}.an .fi{animation:gU .4s ease-out both}@keyframes gF{from{opacity:0}}@keyframes gU{from{opacity:0;transform:translateY(4px)}}.gb,.gd{transition:opacity .15s,r .15s}.hb,.hg{transition:opacity .12s}.tt{position:absolute;top:6px;left:0;pointer-events:none;font-size:12px;line-height:1.45;padding:6px 9px;border-radius:6px;white-space:nowrap;box-shadow:0 2px 10px rgba(0,0,0,.18);opacity:0;transform:translateY(3px);transition:opacity .12s,transform .12s}.tt.on{opacity:1;transform:none}.lg .it{cursor:pointer;user-select:none;transition:opacity .15s}.lg .it.off{opacity:.35;text-decoration:line-through}tr.r{transition:background .15s}tr.r:hover{background:var(--hv)}th.s{cursor:pointer;user-select:none}.card{transition:transform .15s,box-shadow .15s}.card:hover{transform:translateY(-1px);box-shadow:0 3px 10px rgba(0,0,0,.12)}.tb button{font:inherit;font-size:12px;border-radius:14px;padding:3px 10px;cursor:pointer;margin:0 4px 4px 0}body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;margin:0}@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}";

  function injectCss() {
    if (document.getElementById('va-css')) return;
    var s = document.createElement('style');
    s.id = 'va-css';
    s.textContent = CSS;
    (document.head || document.documentElement).appendChild(s);
  }
  injectCss();

  /* Valeurs par défaut, remplacées colonne par colonne par la charte du projet. */
  var DEF = {"name": "du projet", "healthHours": 48, "recentFirst": true, "pal": {"light": ["#2e7d32", "#1565c0", "#ef6c00", "#8e24aa", "#c62828", "#00838f", "#6d4c41", "#9e9d24", "#546e7a", "#d81b60"], "dark": ["#66bb6a", "#64b5f6", "#ffa726", "#ba68c8", "#ef5350", "#4dd0e1", "#a1887f", "#d4e157", "#90a4ae", "#f06292"]}, "colors": {"light": {"fg": "#333", "gr": "#e3e3e3", "mu": "#777", "tb": "#fff", "hv": "#f2f6f2"}, "dark": {"fg": "#ddd", "gr": "#444", "mu": "#999", "tb": "#2a2a2a", "hv": "#2b2b2b"}}, "cards": {"light": {"fg": "#222", "mu": "#6b6b6b", "bd": "#e2e2e2", "bg": "#fafafa", "up": "#2e7d32", "dn": "#c62828", "warn": "#e65100", "hi": "#c62828", "me": "#e65100", "lo": "#1565c0"}, "dark": {"fg": "#e6e6e6", "mu": "#9a9a9a", "bd": "#3a3a3a", "bg": "#1f1f1f", "up": "#66bb6a", "dn": "#ef5350", "warn": "#ffb74d", "hi": "#ef5350", "me": "#ffb74d", "lo": "#64b5f6"}}, "sel": {"light": {"bg": "#e3edf9", "bar": "#1565c0"}, "dark": {"bg": "#1f2d3d", "bar": "#64b5f6"}}, "accent": {"light": {"bg": "#2e7d32", "tx": "#ffffff"}, "dark": {"bg": "#66bb6a", "tx": "#1b1b1b"}}, "ink": {"onLight": "#222222", "onDark": "#ffffff"}};
  var CFG = DEF;

  /* Colonnes de la charte lues pour chaque groupe de couleurs : clé interne -> colonne. */
  var COLS = {
    colors: { fg: 'fg', gr: 'gr', mu: 'mu', tb: 'tb', hv: 'hv' },
    cards: { fg: 'card_fg', mu: 'card_mu', bd: 'card_bd', bg: 'card_bg', up: 'up', dn: 'dn', warn: 'warn', hi: 'hi', me: 'me', lo: 'lo' },
    sel: { bg: 'sel_bg', bar: 'sel_bar' },
    accent: { bg: 'accent_bg', tx: 'accent_tx' }
  };
  function has(v) { return v != null && v !== ''; }
  function themed(row, map, def) {
    var o = { light: {}, dark: {} };
    Object.keys(map).forEach(function (k) {
      var l = row[map[k]], dk = row[map[k] + '_dark'];
      o.light[k] = has(l) ? l : def.light[k];
      o.dark[k] = has(dk) ? dk : has(l) ? l : def.dark[k];
    });
    return o;
  }
  /* Reconstruit CFG depuis d.charte[0]. Appelé à chaque onData, avant le panneau. */
  function configure(d) {
    var row = d && Array.isArray(d.charte) ? d.charte[0] : null;
    if (!row || typeof row !== 'object') { CFG = DEF; return; }
    var pal = { light: [], dark: [] };
    for (var i = 0; i < 10; i++) {
      var l = row['pal' + (i + 1)], dk = row['pal' + (i + 1) + '_dark'];
      pal.light.push(has(l) ? l : DEF.pal.light[i]);
      pal.dark.push(has(dk) ? dk : has(l) ? l : DEF.pal.dark[i]);
    }
    CFG = {
      name: has(row.name) ? String(row.name) : DEF.name,
      healthHours: +row.health_hours > 0 ? +row.health_hours : DEF.healthHours,
      recentFirst: !(row.recent_first === false || row.recent_first === 'false' || row.recent_first === 0),
      pal: pal,
      colors: themed(row, COLS.colors, DEF.colors),
      cards: themed(row, COLS.cards, DEF.cards),
      sel: themed(row, COLS.sel, DEF.sel),
      accent: themed(row, COLS.accent, DEF.accent),
      ink: { onLight: has(row.ink_light) ? row.ink_light : DEF.ink.onLight, onDark: has(row.ink_dark) ? row.ink_dark : DEF.ink.onDark }
    };
  }

  /* PAL change de contenu selon le thème : même tableau, valeurs remplacées. */
  var PAL = CFG.pal.light.slice();
  function th(d, o) { return d && d.theme === 'dark' ? o.dark : o.light; }
  function setTheme(d) {
    configure(d);
    var src = th(d, CFG.pal);
    for (var i = 0; i < src.length; i++) PAL[i] = src[i];
  }
  /* Couleur du texte posé sur une couleur de fond : marine sur fond clair, blanc cassé sur fond foncé. */
  function onColor(hex) {
    var h = String(hex).replace('#', ''), r = parseInt(h.substr(0, 2), 16), g = parseInt(h.substr(2, 2), 16), b = parseInt(h.substr(4, 2), 16);
    return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? CFG.ink.onLight : CFG.ink.onDark;
  }
  /* Chaque onData applique d'abord la charte du projet, puis la palette du thème reçu. */
  if (window.dashboard && typeof window.dashboard.onData === 'function' && !window.dashboard._vaWrapped) {
    var od = window.dashboard.onData;
    window.dashboard.onData = function (cb) { return od.call(window.dashboard, function (d) { setTheme(d); return cb(d); }); };
    window.dashboard._vaWrapped = true;
  }
  var MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

  function arr(v) { return Array.isArray(v) ? v : []; }
  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function day(v) { var s = String(v); return s.slice(8, 10) + '/' + s.slice(5, 7); }
  function month(v) { var s = String(v); return MOIS[+s.slice(5, 7) - 1] + ' ' + s.slice(2, 4); }

  function colors(d) { return Object.assign({}, th(d, CFG.colors)); }
  function cardColors(d) { return Object.assign({}, th(d, CFG.cards)); }

  function first(el) {
    if (el._vaSeen) return false;
    el._vaSeen = true;
    return true;
  }
  function empty(el, d, anim, msg) {
    el.innerHTML = '<div class="' + (anim ? 'an' : '') + '"><div class="fi" style="color:' + colors(d).mu + ';padding:8px;font-size:13px">' + esc(msg || 'Pas encore de données sur la période.') + '</div></div>';
  }

  function isCurrent(raw, period) {
    if (!period || raw == null) return false;
    var s = String(raw).slice(0, 10), now = new Date(), today = now.toISOString().slice(0, 10);
    if (period === 'day') return s === today;
    if (period === 'month') return s.slice(0, 7) === today.slice(0, 7);
    if (period === 'week') { var t = Date.parse(s + 'T00:00:00Z'); return !isNaN(t) && now - t < 7 * 864e5; }
    return false;
  }
  function complete(rows, key, period) {
    return arr(rows).filter(function (r) { return !isCurrent(r[key], period); });
  }
  function periods(rows, key, period) {
    var ks = Array.from(new Set(complete(rows, key, period).map(function (r) { return String(r[key]); }))).sort().reverse();
    return [ks[0] == null ? null : ks[0], ks[1] == null ? null : ks[1]];
  }
  function sumWhere(rows, key, val, col) {
    var t = null, v = val == null ? null : String(val).slice(0, 10);
    arr(rows).forEach(function (r) { if (v != null && String(r[key]).slice(0, 10) === v) t = (t || 0) + (+r[col] || 0); });
    return t;
  }
  /* Lundi (UTC) de la semaine courante moins o semaines, 'aaaa-mm-jj'. */
  function weekStart(o) {
    var t = new Date();
    t.setUTCHours(0, 0, 0, 0);
    t.setUTCDate(t.getUTCDate() - ((t.getUTCDay() + 6) % 7) - 7 * (o || 0));
    return t.toISOString().slice(0, 10);
  }
  /* 1er jour (UTC) du mois courant moins o mois, 'aaaa-mm-jj'. */
  function monthStart(o) {
    var t = new Date();
    return new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth() - (o || 0), 1)).toISOString().slice(0, 10);
  }

  function series(rows, xKey, cols, fmt) {
    var r = arr(rows).slice().sort(function (a, b) { return a[xKey] < b[xKey] ? -1 : 1; });
    return {
      raw: r.map(function (o) { return o[xKey]; }),
      x: r.map(function (o) { return (fmt || day)(o[xKey]); }),
      s: cols.map(function (c) {
        var q = { n: c[1], v: r.map(function (o) { return o[c[0]] == null ? 0 : +o[c[0]]; }) };
        if (typeof c[2] === 'function') q.l = r.map(function (o) { return c[2](o); });
        if (c[3]) q.c = c[3];
        return q;
      })
    };
  }

  function pivot(rows, xKey, catKey, valKey, fmt, labels, lblFn) {
    rows = arr(rows);
    var xs = Array.from(new Set(rows.map(function (o) { return o[xKey]; }))).sort();
    var cats = Array.from(new Set(rows.map(function (o) { return o[catKey]; })));
    var idx = new Map(xs.map(function (x, i) { return [x, i]; }));
    var s = cats.map(function (c) { return { n: labels && labels[c] ? labels[c] : (c == null ? '?' : c), v: xs.map(function () { return 0; }) }; });
    var ci = new Map(cats.map(function (c, i) { return [c, i]; }));
    if (lblFn) s.forEach(function (q) { q.l = xs.map(function () { return null; }); });
    rows.forEach(function (o) {
      var q = s[ci.get(o[catKey])], i = idx.get(o[xKey]);
      q.v[i] += +o[valKey] || 0;
      if (lblFn) q.l[i] = lblFn(o);
    });
    return { raw: xs, x: xs.map(fmt || day), s: s };
  }

  function group(rows, key, catKey, valKey) {
    var m = new Map();
    arr(rows).forEach(function (o) {
      var k = o[key];
      if (!m.has(k)) { var n = {}; n[key] = k; m.set(k, n); }
      var g = m.get(k);
      g[o[catKey]] = (g[o[catKey]] || 0) + (+o[valKey] || 0);
    });
    return Array.from(m.values());
  }

  function bucketKey(b) {
    var s = String(b == null ? '' : b).toLowerCase();
    if (/^(lt|under|less)/.test(s)) return -1;
    if (/^(gt|over|more|plus)/.test(s) || /plus$/.test(s)) return 1e9;
    var m = /(\d+(?:\.\d+)?)/.exec(s);
    if (!m) return 1e8;
    var v = +m[1];
    if (/h$/.test(s)) v *= 60;
    if (/d$|j$/.test(s)) v *= 1440;
    return v;
  }
  function unitLabel(u) { return { m: 'min', h: 'h', km: 'km', d: 'j', j: 'j', s: 's' }[u] || u; }
  function bucketLabel(b) {
    var s = String(b == null ? '?' : b), m;
    if ((m = /^lt_(\d+)([a-z]+)$/i.exec(s))) return '< ' + m[1] + ' ' + unitLabel(m[2]);
    if ((m = /^gt_(\d+)([a-z]+)$/i.exec(s))) return '> ' + m[1] + ' ' + unitLabel(m[2]);
    if ((m = /^(\d+)_(\d+)([a-z]+)$/i.exec(s))) return m[1] + '–' + m[2] + ' ' + unitLabel(m[3]);
    if ((m = /^(\d+)([a-z]+)_plus$/i.exec(s))) return '> ' + m[1] + ' ' + unitLabel(m[2]);
    return s.replace(/_/g, ' ');
  }

  function niceStep(t) {
    var e = Math.pow(10, Math.floor(Math.log10(t))), a = t / e;
    return (a <= 1 ? 1 : a <= 2 ? 2 : a <= 2.5 ? 2.5 : a <= 5 ? 5 : 10) * e;
  }

  function chart(el, d, data, type, opts) {
    if (typeof opts === 'string') opts = { unit: opts };
    opts = opts || {};
    var unit = opts.unit || '', c = colors(d), hidden = new Set();
    var W = Math.max(280, (d.width || 600) - 16), L = 44, n = data.x.length, anim = first(el);
    var r1 = function (v) { return Math.round(10 * v) / 10; };
    if (!n) return empty(el, d, anim);
    var rev = opts.reverse != null ? !!opts.reverse : !!(CFG.recentFirst && opts.period);
    if (rev) data = { raw: data.raw && data.raw.slice().reverse(), x: data.x.slice().reverse(),
      s: data.s.map(function (q) { return { n: q.n, c: q.c, v: q.v.slice().reverse(), l: q.l && q.l.slice().reverse() }; }) };
    var ce = rev ? 0 : n - 1;
    var cur = data.raw && isCurrent(data.raw[ce], opts.period) ? ce : -1;
    var bw = (W - L - 10) / n, cx = function (i) { return L + bw * (i + 0.5); };
    var lbl = function (i) { return data.x[i] + (i === cur ? ' (en cours)' : ''); };

    (function draw(anim) {
      var sc = function (j) { return data.s[j].c || PAL[j % 10]; };
      var vis = data.s.map(function (s, j) { return { n: s.n, v: s.v, l: s.l, j: j }; }).filter(function (s) { return !hidden.has(s.j); });
      var stack = type === 'stack';
      var tot = data.x.map(function (_, i) {
        return stack ? vis.reduce(function (a, s) { return a + (s.v[i] || 0); }, 0)
                     : Math.max.apply(null, [0].concat(vis.map(function (s) { return s.v[i] || 0; })));
      });
      var top = opts.max || Math.max(4, 4 * niceStep(Math.max.apply(null, [1].concat(tot)) / 4));
      var y = function (v) { return 202 - v / top * 192; };
      var dl = function (i) { return anim ? 'animation-delay:' + Math.min(30 * i, 420) + 'ms' : ''; };
      var fo = function (i) { return i === cur ? ' fill-opacity=".4"' : ''; };
      var w = '', k, tx = '', lab = function (s, i) { return s.l && s.l[i] != null ? String(s.l[i]) : r1(s.v[i] || 0) + unit; };
      var txt = function (x, yy, t, fill, i) { return '<text class="gd" x="' + x + '" y="' + yy + '" text-anchor="middle" font-size="10" font-weight="600" fill="' + fill + '"' + (i === cur ? ' opacity=".55"' : '') + ' style="pointer-events:none">' + esc(t) + '</text>'; };

      for (k = 0; k <= 4; k++) {
        var gv = top * k / 4, gy = y(gv);
        w += '<line x1="44" x2="' + (W - 10) + '" y1="' + gy + '" y2="' + gy + '" stroke="' + c.gr + '"/><text x="40" y="' + (gy + 4) + '" text-anchor="end" fill="' + c.mu + '" font-size="10">' + r1(gv) + esc(unit) + '</text>';
      }
      var step = Math.ceil(n / 10);
      data.x.forEach(function (x, i) {
        if (i % step === 0) w += '<text x="' + cx(i) + '" y="217" text-anchor="middle" fill="' + c.mu + '" font-size="10">' + esc(x) + '</text>';
      });

      if (type === 'line') {
        w += '<line class="hg" x1="0" x2="0" y1="10" y2="202" stroke="' + c.mu + '" stroke-dasharray="3 3" opacity="0"/>';
        vis.forEach(function (s) {
          var col = sc(s.j), pts = s.v.map(function (v, i) { return cx(i) + ',' + y(v || 0); });
          var solid = cur < 0 || n < 2 ? pts : cur ? pts.slice(0, cur) : pts.slice(1);
          if (solid.length > 1) w += '<polyline class="gl" pathLength="1" fill="none" stroke="' + col + '" stroke-width="2" stroke-linejoin="round" points="' + solid.join(' ') + '"/>';
          if (cur >= 0 && n > 1) w += '<polyline class="gd" fill="none" stroke="' + col + '" stroke-width="2" stroke-dasharray="4 3" opacity=".6" points="' + (cur ? pts.slice(cur - 1) : pts.slice(0, 2)).join(' ') + '"/>';
          w += s.v.map(function (v, i) { return '<circle class="gd" data-i="' + i + '" cx="' + cx(i) + '" cy="' + y(v || 0) + '" r="3" fill="' + col + '"' + fo(i) + '/>'; }).join('');
          if (opts.labels) s.v.forEach(function (v, i) { tx += txt(cx(i), y(v || 0) - 7, lab(s, i), col, i); });
        });
      } else {
        w += '<rect class="hb" x="0" y="10" width="' + bw + '" height="192" fill="' + c.fg + '" opacity="0"/>';
        var maxBw = Math.min(bw, 60);
        if (stack) {
          data.x.forEach(function (_, i) {
            var base = 0;
            vis.forEach(function (s) {
              var v = s.v[i] || 0;
              if (!v) return;
              w += '<rect class="gb" data-i="' + i + '" x="' + (cx(i) - 0.35 * maxBw) + '" width="' + (0.7 * maxBw) + '" y="' + y(base + v) + '" height="' + Math.max(0, y(base) - y(base + v)) + '" rx="1.5" fill="' + sc(s.j) + '"' + fo(i) + ' style="' + dl(i) + '"/>';
              if (opts.labels && y(base) - y(base + v) >= 13 && lab(s, i).length * 5.6 <= 0.7 * maxBw + 4) tx += txt(cx(i), (y(base) + y(base + v)) / 2 + 3.5, lab(s, i), i === cur ? c.fg : onColor(sc(s.j)), i);
              base += v;
            });
          });
        } else {
          var bwi = 0.8 * maxBw / vis.length;
          data.x.forEach(function (_, i) {
            vis.forEach(function (s, q) {
              var v = s.v[i] || 0;
              w += '<rect class="gb" data-i="' + i + '" x="' + (cx(i) - 0.4 * maxBw + bwi * q) + '" width="' + Math.max(1, bwi - 1) + '" y="' + y(v) + '" height="' + Math.max(0, y(0) - y(v)) + '" rx="1.5" fill="' + sc(s.j) + '"' + fo(i) + ' style="' + dl(i) + '"/>';
              if (opts.labels && lab(s, i).length * 5.6 <= bwi + 6) tx += txt(cx(i) - 0.4 * maxBw + bwi * q + (bwi - 1) / 2, y(v) - 4, lab(s, i), c.fg, i);
            });
          });
        }
      }

      w += tx;
      var leg = data.s.length > 1
        ? '<div class="lg" style="display:flex;flex-wrap:wrap;gap:4px 12px;font-size:12px;color:' + c.fg + ';margin:0 0 4px">' +
          data.s.map(function (s, j) {
            return '<span class="it' + (hidden.has(j) ? ' off' : '') + '" data-j="' + j + '" title="Cliquer pour masquer / afficher"><span style="display:inline-block;width:10px;height:10px;border-radius:2px;background:' + sc(j) + ';margin-right:4px"></span>' + esc(s.n) + '</span>';
          }).join('') + '</div>'
        : '';
      var foot = (cur >= 0 ? '<div style="font-size:11px;color:' + c.mu + ';margin-top:2px">' + esc(data.x[cur]) + ' : période en cours, incomplète (en clair) — ne pas la comparer.</div>' : '') +
        (opts.note ? '<div style="font-size:11px;color:' + c.mu + ';margin-top:2px">' + opts.note + '</div>' : '');
      el.innerHTML = '<div class="' + (anim ? 'an' : '') + '">' + leg + '<div style="position:relative"><svg width="' + W + '" height="230" viewBox="0 0 ' + W + ' 230" style="max-width:100%;height:auto;display:block;touch-action:pan-y">' + w + '</svg><div class="tt" style="background:' + c.tb + ';color:' + c.fg + ';border:1px solid ' + c.gr + '"></div></div>' + foot + '</div>';

      var svg = el.querySelector('svg'), tt = el.querySelector('.tt'), hb = svg.querySelector('.hb'), hg = svg.querySelector('.hg'), marks = svg.querySelectorAll('[data-i]');
      var off = function () {
        tt.classList.remove('on');
        if (hb) hb.setAttribute('opacity', 0);
        if (hg) hg.setAttribute('opacity', 0);
        marks.forEach(function (m) { if (m.tagName === 'circle') m.setAttribute('r', 3); else m.style.opacity = 1; });
      };
      svg.addEventListener('pointermove', function (ev) {
        var b = svg.getBoundingClientRect(), i = Math.floor(((ev.clientX - b.left) * W / b.width - L) / bw);
        if (i < 0 || i >= n) return off();
        if (hb) { hb.setAttribute('x', L + bw * i); hb.setAttribute('opacity', d.theme === 'dark' ? 0.1 : 0.05); }
        if (hg) { hg.setAttribute('x1', cx(i)); hg.setAttribute('x2', cx(i)); hg.setAttribute('opacity', 0.8); }
        marks.forEach(function (m) {
          var on = +m.dataset.i === i;
          if (m.tagName === 'circle') m.setAttribute('r', on ? 5 : 3); else m.style.opacity = on ? 1 : 0.5;
        });
        tt.innerHTML = '<div style="font-weight:600;margin-bottom:2px">' + esc(lbl(i)) + '</div>' +
          vis.map(function (s) {
            return '<div><span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + sc(s.j) + ';margin-right:5px"></span>' + esc(s.n) + ' : <b>' + r1(s.v[i] || 0) + esc(unit) + '</b>' + (s.l && s.l[i] != null && String(s.l[i]) !== r1(s.v[i] || 0) + unit ? ' <span style="opacity:.75">(' + esc(s.l[i]) + ')</span>' : '') + '</div>';
          }).join('') +
          (stack && vis.length > 1 ? '<div style="border-top:1px solid ' + c.gr + ';margin-top:3px;padding-top:3px">Total : <b>' + r1(tot[i]) + esc(unit) + '</b></div>' : '');
        var px = cx(i) * b.width / W, tw = tt.offsetWidth;
        tt.style.left = (px + 14 + tw > b.width ? Math.max(0, px - 14 - tw) : px + 14) + 'px';
        tt.classList.add('on');
      });
      svg.addEventListener('pointerleave', off);
      el.querySelectorAll('.lg .it').forEach(function (it) {
        it.addEventListener('click', function () {
          var j = +it.dataset.j;
          if (hidden.has(j)) hidden.delete(j); else if (hidden.size < data.s.length - 1) hidden.add(j);
          draw(false);
        });
      });
    })(anim);
  }

  function bar(pct, color) {
    var p = Math.max(0, Math.min(100, +pct || 0));
    return 'background:linear-gradient(to right,' + color + ' 0,' + color + ' ' + p + '%,transparent ' + p + '%)';
  }

  function miniBar(d, pct, color) {
    var p = Math.max(0, Math.min(100, +pct || 0)), c = colors(d);
    return '<div style="height:4px;margin:3px 0 0 auto;width:80px;max-width:100%;background:' + c.gr + ';border-radius:2px;overflow:hidden"><div class="gh" style="height:100%;width:' + p + '%;background:' + (color || PAL[0]) + ';border-radius:2px"></div></div>';
  }

  function table(el, d, cols, rows, note, opts) {
    opts = opts || {};
    var c = colors(d), anim = first(el), dark = d && d.theme === 'dark';
    var sel = th(d, CFG.sel), selBg = sel.bg, selBar = sel.bar;
    var al = function (col, j) { return col[2] === 'left' || col[2] === 'right' || col[2] === 'center' ? col[2] : (j ? 'right' : 'left'); };
    var cs = function (o, k) { var s = opts.cellStyle ? opts.cellStyle(o, k) : ''; return s ? ';' + String(s).replace(/"/g, "'") : ''; };
    rows = arr(rows);
    if (!rows.length) return empty(el, d, anim);
    var sk = null, dir = 1;
    var num = function (v) {
      if (v == null || /^\d{4}-\d\d/.test(String(v))) return null;
      var f = parseFloat(String(v).replace(',', '.'));
      return isNaN(f) ? null : f;
    };
    (function draw(anim) {
      var r = rows.slice();
      if (sk != null) {
        var key = cols[sk][0];
        r.sort(function (a, b) {
          var x = num(a[key]), y = num(b[key]);
          return dir * (x != null && y != null ? x - y : String(a[key] == null ? '' : a[key]).localeCompare(String(b[key] == null ? '' : b[key]), 'fr', { numeric: true }));
        });
      }
      el.innerHTML = '<div class="' + (anim ? 'an' : '') + '"><div style="overflow-x:auto"><table style="--hv:' + c.hv + ';border-collapse:collapse;font-size:13px;color:' + c.fg + ';width:100%"><tr>' +
        cols.map(function (col, j) {
          return '<th class="s" data-k="' + j + '" title="Trier" style="text-align:' + al(col, j) + ';border-bottom:1px solid ' + c.mu + ';padding:4px 6px;white-space:nowrap">' + esc(col[1]) + ' <span style="display:inline-block;width:1em;text-align:center;color:' + (sk === j ? c.fg : c.mu) + ';font-size:11px">' + (sk === j ? (dir > 0 ? '▲' : '▼') : '↕') + '</span></th>';
        }).join('') + '</tr>' +
        r.map(function (o, i) {
          var on = !!(opts.isSel && opts.isSel(o));
          return '<tr class="r fi"' + (opts.onRow ? ' data-r="' + i + '"' : '') + ' style="' + (opts.onRow ? 'cursor:pointer;' : '') + (on ? 'background:' + selBg + ';font-weight:600;' : '') + (anim ? 'animation-delay:' + Math.min(25 * i, 400) + 'ms' : '') + '">' +
            cols.map(function (col, j) {
              return '<td style="text-align:' + al(col, j) + ';padding:4px 6px;border-bottom:1px solid ' + c.gr + ';white-space:nowrap' + (on && !j ? ';box-shadow:inset 3px 0 0 ' + selBar : '') + cs(o, col[0]) + '">' + (o[col[0]] == null ? '–' : esc(o[col[0]])) + (opts.barPct && opts.barPct(o, col[0]) != null ? miniBar(d, opts.barPct(o, col[0])) : '') + '</td>';
            }).join('') + '</tr>';
        }).join('') + '</table></div>' +
        (note ? '<div style="font-size:12px;color:' + c.mu + ';margin-top:6px">' + note + '</div>' : '') + '</div>';
      el.querySelectorAll('th.s').forEach(function (th) {
        th.addEventListener('click', function () {
          var j = +th.dataset.k;
          if (sk === j) dir = -dir; else { sk = j; dir = j ? -1 : 1; }
          draw(false);
        });
      });
      if (opts.onRow) el.querySelectorAll('tr[data-r]').forEach(function (tr) {
        tr.addEventListener('click', function () {
          opts.onRow(r[+tr.dataset.r]);
          draw(false);
        });
      });
    })(anim);
  }

  /* Barres horizontales. items : [{ label, value, text?, sub?, color? }] ; value pilote la longueur,
     text remplace la valeur affichée, sub ajoute un détail en gris. opts { max, unit, note (HTML de confiance) }. */
  function hbars(el, d, items, opts) {
    opts = opts || {};
    var c = colors(d), anim = first(el);
    items = arr(items);
    if (!items.length) return empty(el, d, anim);
    var max = opts.max || Math.max.apply(null, [1].concat(items.map(function (it) { return +it.value || 0; })));
    var h = items.map(function (it, i) {
      var p = Math.max(0, Math.min(100, 100 * (+it.value || 0) / max));
      var col = it.color || PAL[0];
      return '<div class="fi" style="margin:0 0 7px;' + (anim ? 'animation-delay:' + Math.min(40 * i, 400) + 'ms' : '') + '">' +
        '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:' + c.fg + ';margin-bottom:2px"><span>' + esc(it.label) + '</span><span><b>' + esc(it.text != null ? it.text : (it.value == null ? '–' : it.value + (opts.unit || ''))) + '</b>' + (it.sub ? ' <span style="color:' + c.mu + '">' + esc(it.sub) + '</span>' : '') + '</span></div>' +
        '<div style="height:10px;border-radius:5px;background:' + c.gr + ';overflow:hidden"><div class="gh" style="height:100%;width:' + p + '%;background:' + col + ';border-radius:5px;' + (anim ? 'animation-delay:' + Math.min(40 * i, 400) + 'ms' : '') + '"></div></div></div>';
    }).join('');
    el.innerHTML = '<div class="' + (anim ? 'an' : '') + '">' + h + (opts.note ? '<div style="font-size:11px;color:' + c.mu + ';margin-top:4px">' + opts.note + '</div>' : '') + '</div>';
  }

  /* Boutons de sélection au-dessus d'un contenu. Renvoie l'élément où dessiner le contenu. */
  function tabs(el, d, names, sel, onSel) {
    var c = colors(d), ac = th(d, CFG.accent), on = ac.bg, onTx = ac.tx;
    if (!el._vaTabs) {
      el.innerHTML = '<div class="tb"></div><div class="tc"></div>';
      el._vaTabs = true;
    }
    var tb = el.querySelector('.tb');
    tb.innerHTML = arr(names).map(function (n, i) {
      var s = i === sel;
      return '<button data-t="' + i + '" style="border:1px solid ' + (s ? on : c.gr) + ';background:' + (s ? on : 'transparent') + ';color:' + (s ? onTx : c.fg) + ';font-weight:' + (s ? 600 : 400) + '">' + esc(n) + '</button>';
    }).join('');
    tb.querySelectorAll('button').forEach(function (b) { b.addEventListener('click', function () { onSel(+b.dataset.t); }); });
    return el.querySelector('.tc');
  }

  function periodCols(rows, key, period, fmt, n) {
    var ks = Array.from(new Set(arr(rows).map(function (r) { return String(r[key]).slice(0, 10); }))).sort().slice(-(n || 6));
    if (CFG.recentFirst) ks.reverse();
    return ks.map(function (k) { return { key: k, label: (fmt || day)(k), current: isCurrent(k, period) }; });
  }

  /* Tableau lignes × périodes : chiffre principal, détail en gris, fond en barre selon pct. */
  function matrix(el, d, m) {
    var c = colors(d), anim = first(el), dark = d && d.theme === 'dark';
    var cols = arr(m && m.cols), rows = arr(m && m.rows);
    if (!cols.length || !rows.length) return empty(el, d, anim);
    var h = (m.title ? '<div style="font-size:12px;font-weight:600;color:' + c.fg + ';margin:10px 0 4px">' + esc(m.title) + '</div>' : '') +
      '<div style="overflow-x:auto"><table style="border-collapse:collapse;font-size:12px;color:' + c.fg + ';width:100%"><tr><th style="text-align:left;padding:4px 6px;border-bottom:1px solid ' + c.mu + ';width:99%"></th>' +
      cols.map(function (k) { return '<th style="text-align:right;padding:4px 10px;min-width:84px;border-bottom:1px solid ' + c.mu + ';white-space:nowrap;font-weight:600' + (k.current ? ';color:' + c.mu + ';font-weight:400' : '') + '">' + esc(k.label) + (k.current ? '<br><span style="font-size:10px">en cours</span>' : '') + '</th>'; }).join('') + '</tr>' +
      rows.map(function (r, i) {
        return '<tr class="r fi" style="' + (anim ? 'animation-delay:' + Math.min(25 * i, 400) + 'ms' : '') + '"><td style="text-align:left;padding:4px 6px;border-bottom:1px solid ' + c.gr + ';white-space:nowrap">' +
          (r.color ? '<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + r.color + ';margin-right:6px"></span>' : '') + esc(r.label) + '</td>' +
          cols.map(function (k) {
            var v = r.cells && r.cells[k.key];
            return '<td style="text-align:right;padding:4px 10px;border-bottom:1px solid ' + c.gr + ';white-space:nowrap' + (k.current ? ';opacity:.55' : '') + '">' +
              (v ? '<b>' + esc(v.text) + '</b>' + (v.sub != null && v.sub !== '' ? ' <span style="color:' + c.mu + '">' + esc(v.sub) + '</span>' : '') + (v.pct != null ? miniBar(d, v.pct, r.color) : '') : '<span style="color:' + c.mu + '">–</span>') + '</td>';
          }).join('') + '</tr>';
      }).join('') + '</table></div>' +
      (m.note ? '<div style="font-size:11px;color:' + c.mu + ';margin-top:6px">' + m.note + '</div>' : '');
    el.innerHTML = '<div class="' + (anim ? 'an' : '') + '">' + h + '</div>';
  }

  function reduced() { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); }

  function fr(x) { return (Math.round(10 * x) / 10).toLocaleString('fr-FR'); }
  function sgn(x) { return (x > 0 ? '+' : x < 0 ? '−' : '') + fr(Math.abs(x)); }
  /* Tuile teintée : fond et liseré selon le sens de l'écart, flèche et % en coin, écart absolu dessous. */
  function tile(c, label, v, prev, unit, i, anim) {
    var has = prev != null && v != null && !isNaN(+v) && !isNaN(+prev), dv = has ? +v - +prev : 0;
    var col = !has ? c.bd : dv > 0 ? c.up : dv < 0 ? c.dn : c.mu, tint = has && dv && /^#[0-9a-f]{6}$/i.test(col);
    var pts = /%/.test(unit || ''), ar = dv > 0 ? '↗ ' : dv < 0 ? '↘ ' : '= ';
    var corner = !has ? '' : pts ? ar + sgn(dv) + ' pt' + (Math.abs(dv) >= 2 ? 's' : '') : +prev ? ar + sgn(100 * dv / +prev) + ' %' : dv ? ar + 'nouveau' : '= 0 %';
    var sub = !has ? '&nbsp;' : !dv ? 'identique (' + esc(fr(+prev)) + esc(unit || '') + ')' : esc(sgn(dv)) + (pts ? ' pt' + (Math.abs(dv) >= 2 ? 's' : '') : '') + ' — avant : ' + esc(fr(+prev)) + esc(unit || '');
    var isInt = v != null && Math.round(+v) === +v;
    return '<div class="fi card" style="border:1px solid ' + (tint ? col + '40' : c.bd) + ';border-left:4px solid ' + col + ';background:' + (tint ? col + '14' : c.bg) + ';border-radius:8px;padding:10px 12px;min-width:130px;flex:1;' + (anim ? 'animation-delay:' + 60 * i + 'ms' : '') + '">' +
      '<div style="display:flex;justify-content:space-between;gap:8px;font-size:12px;color:' + c.mu + '"><span>' + esc(label) + '</span>' + (corner ? '<span style="color:' + col + ';font-weight:700;white-space:nowrap">' + esc(corner) + '</span>' : '') + '</div>' +
      '<div style="font-size:24px;font-weight:600;color:' + c.fg + '">' + (v == null ? '–' : '<span' + (isInt ? ' data-n="' + (+v || 0) + '"' : '') + '>' + esc(isInt ? v : fr(+v)) + '</span>' + esc(unit || '')) + '</div>' +
      '<div style="font-size:12px;color:' + c.mu + '">' + sub + '</div></div>';
  }

  function health(c, rows) {
    var r = arr(rows)[0];
    if (!r || !r.last_received_at) return '';
    var t = new Date(r.last_received_at), ok = (Date.now() - t) / 36e5 < CFG.healthHours;
    return '<div style="margin-top:10px;font-size:13px;color:' + (ok ? c.up : c.dn) + '">● Collecte ' + (ok ? 'OK' : 'EN ALERTE') + ' — dernier événement reçu : ' + esc(t.toLocaleString('fr-FR')) + '</div>';
  }

  function kpis(el, d, groups, healthRows) {
    var c = cardColors(d), anim = first(el), n = 0, h = '';
    arr(groups).forEach(function (g) {
      if (!g || !arr(g.items).length) return;
      h += '<div style="font-size:13px;font-weight:600;color:' + c.fg + ';margin:8px 0 6px">' + esc(g.title) + '</div><div style="display:flex;flex-wrap:wrap;gap:8px">' +
        g.items.map(function (it) { return tile(c, it[0], it[1], it[2], it[3], n++, anim); }).join('') + '</div>';
    });
    h += health(c, healthRows);
    el.innerHTML = '<div class="' + (anim ? 'an' : '') + '">' + (h || '<div style="color:' + c.mu + '">Pas encore de données.</div>') + '</div>';
    if (!anim || reduced()) return;
    var t0 = performance.now();
    el.querySelectorAll('[data-n]').forEach(function (s) {
      var target = +s.dataset.n;
      var step = function (now) {
        var p = Math.min(1, (now - t0) / 700);
        s.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      s.textContent = '0';
      requestAnimationFrame(step);
    });
  }

  function inline(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>'); }
  function recos(el, d, note) {
    var c = cardColors(d), anim = first(el), prio = { haute: c.hi, moyenne: c.me, basse: c.lo };
    if (!note || !note.markdown) { el.innerHTML = '<div style="color:' + c.mu + ';font-size:13px">Aucune recommandation enregistrée. Demander à Claude « mets à jour les recommandations ' + CFG.name + ' ».</div>'; return; }
    var up = note.updatedAt ? new Date(note.updatedAt) : null, age = up ? Math.floor((Date.now() - up) / 864e5) : 0;
    var h = '<div style="font-size:13px;color:' + c.mu + ';margin-bottom:8px">Pour mettre à jour : demander à Claude « mets à jour les recommandations ' + CFG.name + ' ».</div>';
    if (age > 14) h += '<div style="border:1px solid ' + c.warn + ';color:' + c.warn + ';border-radius:6px;padding:6px 10px;margin-bottom:8px;font-size:13px">Analyse vieille de ' + age + ' jours : les chiffres ont pu changer. Demander une mise à jour.</div>';
    var cards = [], cur = null, intro = [];
    note.markdown.split(/\r?\n/).forEach(function (line) {
      var t = line.trim(), m;
      if (!t || /^#\s/.test(t)) return;
      if ((m = /^##\s+(.+?)(?:\s*\{(haute|moyenne|basse)\})?$/.exec(t))) { cur = { t: m[1], p: m[2], lines: [] }; cards.push(cur); return; }
      (cur ? cur.lines : intro).push(t.replace(/^[-*]\s+/, ''));
    });
    h += intro.map(function (l) { return '<div style="font-size:13px;color:' + c.fg + ';margin-bottom:6px">' + inline(l) + '</div>'; }).join('');
    h += cards.map(function (k, i) {
      var col = prio[k.p] || c.bd;
      return '<div class="fi card" style="' + (anim ? 'animation-delay:' + 50 * i + 'ms;' : '') + 'border:1px solid ' + c.bd + ';border-left:4px solid ' + col + ';background:' + c.bg + ';border-radius:6px;padding:8px 12px;margin-bottom:8px;color:' + c.fg + '">' +
        '<div style="font-size:14px;font-weight:600">' + (i + 1) + '. ' + inline(k.t) +
        (k.p ? ' <span style="font-size:11px;font-weight:700;color:' + onColor(col) + ';background:' + col + ';border-radius:10px;padding:2px 8px;margin-left:6px;text-transform:uppercase;letter-spacing:.04em">' + esc(k.p) + '</span>' : '') + '</div>' +
        k.lines.map(function (l) {
          var m = /^\*\*(.+?)\*\*\s*(.*)$/.exec(l);
          return '<div style="font-size:13px;margin-top:4px">' + (m ? '<span style="color:' + c.mu + '">' + esc(m[1]) + '</span> ' + inline(m[2]) : inline(l)) + '</div>';
        }).join('') + '</div>';
    }).join('');
    el.innerHTML = '<div class="' + (anim ? 'an' : '') + '">' + h + '</div>';
  }

  window.va = {
    PAL: PAL, setTheme: setTheme, onColor: onColor, arr: arr, esc: esc, day: day, month: month, colors: colors, cardColors: cardColors,
    first: first, empty: empty, isCurrent: isCurrent, complete: complete, periods: periods, sumWhere: sumWhere,
    weekStart: weekStart, monthStart: monthStart,
    series: series, pivot: pivot, group: group, bucketKey: bucketKey, bucketLabel: bucketLabel,
    chart: chart, table: table, bar: bar, miniBar: miniBar, hbars: hbars, tabs: tabs, periodCols: periodCols, matrix: matrix, kpis: kpis, recos: recos
  };
})();
