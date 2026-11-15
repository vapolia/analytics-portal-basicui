# analytics-portal-basicui

Bibliothèque de rendu des panneaux des tableaux de bord Vapolia Analytics : graphiques, tableaux, tuiles KPI et cartes de
recommandations. Ce README s'adresse à l'agent ou à la personne qui écrit un panneau, puis à celle qui publie une version.

## Summary

1. Un gestionnaire importe `vapolia/analytics-portal-basicui@v1` dans son projet, depuis le portail ou par son agent.
2. Un panneau nomme `analytics-portal-basicui` dans `render.libs` et appelle les fonctions de `window.va`.
3. La bibliothèque ne contient aucune couleur ni aucun seuil de projet. Elle lit la table `charte` du projet, que le portail envoie
   à chaque panneau.
4. Une version est un tag git. `v1` suit la dernière version compatible, `v1.2.0` désigne une version précise. Un projet reste sur
   le commit qu'il a importé jusqu'à sa prochaine mise à jour.

## Importer la bibliothèque dans un projet

Le projet garde une copie en lecture seule, figée sur le commit de la référence au moment de l'import.

| Depuis | Import | Mise à jour |
|---|---|---|
| Le portail | Paramètres du projet, « Ajouter une bibliothèque externe », avec `vapolia/analytics-portal-basicui@v1`. | Bouton « Mettre à jour » de la bibliothèque. |
| Un agent | `import_lib(project, "vapolia/analytics-portal-basicui@v1")` | `import_lib` avec `check: true` dit si la référence a avancé, puis `import_lib` sans `check` met à jour. |

Une mise à jour s'applique aussitôt à tous les panneaux du projet qui nomment la bibliothèque. Un gestionnaire revient à la copie
précédente dans les paramètres du projet, pendant 15 jours.

## Utiliser la bibliothèque dans un panneau

```json
{
  "title": "Actifs par semaine",
  "data": [
    { "id": "actives", "view": "weekly_active" }
  ],
  "render": {
    "libs": ["analytics-portal-basicui"],
    "html": "<div id=\"c\"></div><script>dashboard.onData(d => va.chart(document.getElementById('c'), d, va.series(d.actives, 'week', [['actives', 'Actifs']]), 'line', { period: 'week' }))</script>"
  }
}
```

- Le portail envoie la table `charte` du projet à chaque panneau, sous `d.charte`. La bibliothèque la lit à chaque `onData`, sans
  appel ni lecture à déclarer dans le panneau.
- Chaque fonction de rendu prend l'élément cible, puis `d`, l'objet reçu par `onData`. Elle redessine tout à chaque appel.
- La bibliothèque ne dépend d'aucune autre.

Le commentaire en tête de [lib.js](lib.js) liste toutes les fonctions avec leur signature. Les principales :

| Fonction | Rendu |
|---|---|
| `va.chart(el, d, data, type, opts?)` | Courbes, barres ou barres empilées en SVG, avec légende et infobulle. La période en cours est dessinée en clair. |
| `va.table(el, d, cols, rows, note?, opts?)` | Tableau triable, avec sélection de ligne et mini-barres. |
| `va.matrix(el, d, m)` | Tableau lignes × périodes. |
| `va.hbars(el, d, items, opts?)` | Barres horizontales. |
| `va.kpis(el, d, groups, health?)` | Tuiles KPI avec l'écart à la période précédente, et l'état de la collecte. |
| `va.recos(el, d, note)` | Cartes de recommandations depuis une note Markdown. |
| `va.tabs(el, d, names, sel, onSel)` | Boutons de sélection au-dessus d'un contenu. |
| `va.series`, `va.pivot`, `va.group` | Mise en forme des lignes d'une vue pour `va.chart`. |
| `va.complete`, `va.periods`, `va.isCurrent` | Périodes complètes et période en cours. |

## Charte du projet

La table `charte` du projet a une seule ligne, écrite avec `save_data(project, "charte", "table", [{ … }])`. Toutes ses colonnes sont
facultatives : une colonne absente prend la valeur par défaut de la bibliothèque.

Une couleur a une variante `<colonne>_dark` pour le thème sombre. Sans variante, la couleur claire sert aux deux thèmes.

| Colonnes | Rôle | Défaut |
|---|---|---|
| `name` | Nom de l'app, cité par `va.recos`. | « du projet » |
| `health_hours` | Âge du dernier événement, en heures, au-delà duquel `va.kpis` affiche une alerte. | 48 |
| `recent_first` | `false` place la période la plus ancienne à gauche. | `true` |
| `pal1` à `pal10` | Palette des séries. | 10 couleurs |
| `fg`, `gr`, `mu`, `tb`, `hv` | Graphiques et tableaux : texte, grille, texte secondaire, fond d'infobulle, survol. | gris neutres |
| `card_fg`, `card_mu`, `card_bd`, `card_bg` | Cartes : texte, texte secondaire, bordure, fond. | gris neutres |
| `up`, `dn`, `warn` | Hausse, baisse, avertissement. | vert, rouge, orange |
| `hi`, `me`, `lo` | Priorité haute, moyenne, basse d'une recommandation. | rouge, orange, bleu |
| `sel_bg`, `sel_bar` | Ligne de tableau sélectionnée : fond, liseré. | bleu |
| `accent_bg`, `accent_tx` | Onglet sélectionné : fond, texte. | vert, blanc |
| `ink_light`, `ink_dark` | Texte posé sur une couleur claire, sur une couleur foncée. Sans variante `_dark`. | `#222222`, `#ffffff` |

Exemple :

```json
[{ "name": "Mon app", "health_hours": 24, "pal1": "#0b5fff", "pal1_dark": "#7aa7ff", "pal2": "#ff7a00", "fg": "#1a1a1a", "fg_dark": "#f2f2f2" }]
```

## Versions

| Référence à l'import | Désigne |
|---|---|
| `vapolia/analytics-portal-basicui@v1` | La dernière version compatible. Le tag `v1` est déplacé à chaque version 1.x. |
| `vapolia/analytics-portal-basicui@v1.2.0` | Cette version. |
| `vapolia/analytics-portal-basicui@<commit>` | Ce commit. |

Une version 1.x ajoute des fonctions, des options ou des colonnes de charte. Elle ne change ni ne retire une signature, et garde le
rendu des appels existants. Un changement incompatible ouvre `v2`.

## Publier une version

1. Modifier `lib.js`, et tenir à jour le commentaire d'en-tête : les fonctions, leurs signatures et les colonnes de la charte.
2. Vérifier la syntaxe : `node --check lib.js`.
3. Commiter, puis poser le tag de la version et déplacer le tag majeur :
   ```powershell
   git tag v1.1.0
   git tag -f v1
   git push origin main v1.1.0
   git push -f origin v1
   ```
