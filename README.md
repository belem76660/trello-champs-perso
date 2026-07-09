# Power-Up Trello — Champs personnalisés

Ce Power-Up ajoute une liste de champs personnalisés configurable, par board. Depuis la version 2 :

- **Nombre illimité de champs**, ajoutés un par un depuis les réglages du board ("Champs personnalisés" dans la barre du board, ou icône ⚙️ des Power-Ups).
- **4 types au choix** pour chaque champ : Texte, Nombre, Case à cocher, Liste déroulante (options et couleurs personnalisables).
- Sur chaque carte, chaque champ peut être **Annulé** (efface sa valeur) ou **Barré** (marque la valeur comme rayée, tout en la conservant) — deux boutons dédiés dans le popup d'édition de carte.

Les valeurs apparaissent en badge sur la face de la carte, dans le détail de la carte (cliquable pour éditer), et sont modifiables via un bouton "Champs personnalisés" dans la carte. Un champ barré s'affiche avec un style rayé (y compris dans les badges, via un caractère Unicode de superposition puisque Trello n'autorise que du texte brut dans les badges).

Les boards utilisant l'ancienne version (v1, 4 champs fixes) sont migrés automatiquement à la première ouverture : rien à faire, l'ancienne configuration est reprise telle quelle sous forme de 4 champs modifiables/supprimables individuellement.

## Fichiers

| Fichier | Rôle |
|---|---|
| `index.html` | Connecteur principal (chargé par Trello) |
| `client.js` | Déclare les capacités (badges, boutons, réglages) |
| `fields.html` / `fields.js` | Popup d'édition des valeurs sur une carte |
| `settings.html` / `settings.js` | Popup de configuration des libellés et de la liste déroulante |
| `icon-white.svg` / `icon-color.svg` | Icônes du Power-Up |

Stockage : les valeurs de carte sont dans `card/shared/fieldValues`, la configuration des champs dans `board/shared/fieldConfig` (visibles par tous les membres du board, comme les Custom Fields natifs de Trello).

## 1. Héberger les fichiers

Trello exige une URL **HTTPS publique** pointant vers `index.html`. Le plus simple est GitHub Pages :

1. Crée un dépôt GitHub (public ou privé) et mets-y tout le contenu du dossier `trello-powerup`.
2. Dans les réglages du dépôt → **Pages** → source = branche principale, dossier racine.
3. Récupère l'URL fournie, du type `https://TON-COMPTE.github.io/TON-DEPOT/index.html`.

Alternative rapide pour tester : [Glitch](https://glitch.com) ou [Netlify Drop](https://app.netlify.com/drop) (glisser-déposer le dossier).

## 2. Enregistrer le Power-Up sur Trello

1. Va sur [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin).
2. **Nouveau Power-Up / Intégration** → choisis le workspace concerné, donne un nom (ex: "Champs personnalisés").
3. Dans l'onglet **Capacités**, renseigne l'**URL du connecteur iframe** avec l'URL de ton `index.html` hébergé (étape 1).
4. Toujours dans **Capacités**, active :
   - `card-badges`
   - `card-detail-badges`
   - `card-buttons`
   - `board-buttons`
   - `show-settings`
5. Ajoute une icône (utilise `icon-color.svg` converti en PNG si Trello demande un format précis).
6. Enregistre, puis va sur un board Trello → menu **Power-Ups** → **Personnaliser les Power-Ups** → onglet correspondant à ton workspace → active ton Power-Up sur ce board.

## 3. Tester

- Ouvre une carte → bouton **Champs personnalisés** → renseigne les valeurs → Enregistrer.
- Les badges doivent apparaître sur la carte et dans son détail.
- Depuis la barre du board → **Champs personnalisés** (ou icône ⚙️ des Power-Ups) → renomme les champs ou modifie les options de la liste déroulante.

## Personnalisation

- Couleurs disponibles pour la liste déroulante : `green`, `yellow`, `orange`, `red`, `purple`, `blue`, `sky`, `lime`, `pink`, `black`, `light-gray` (couleurs standard des badges Trello).
- Pour ajouter un 5e champ, dupliquer la logique dans `client.js`, `fields.html/js` et `settings.js`.
- Pas de backend requis : tout passe par le stockage intégré des Power-Ups Trello (`t.get` / `t.set`), gratuit et illimité en usage normal.

## Limites à connaître

- Le stockage Power-Up n'est pas indexable ni requêtable en masse (pas de "trouve toutes les cartes où Priorité = Haute" côté API sans itérer carte par carte).
- Pour des besoins avancés (reporting, automatisation croisée), les Custom Fields natifs de Trello (Power-Up officiel, gratuit) ou une base de données externe via un vrai backend seraient plus adaptés.
