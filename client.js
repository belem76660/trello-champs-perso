/* global TrelloPowerUp */

// ---------------------------------------------------------------------
// Power-Up "Champs personnalisés" v2 : liste de champs configurable par
// board (nombre illimité, type au choix : texte / nombre / case à cocher /
// liste déroulante). Sur chaque carte, chaque champ peut être annulé
// (valeur effacée) ou barré (marqué visuellement comme rayé, valeur
// conservée).
// ---------------------------------------------------------------------

var WHITE_ICON = './icon-white.svg';

var DEFAULT_LEGACY_CONFIG = {
  textLabel: 'Texte',
  numberLabel: 'Nombre',
  checkboxLabel: 'Case à cocher',
  dropdownLabel: 'Priorité',
  dropdownOptions: [
    { label: 'Haute', color: 'red' },
    { label: 'Moyenne', color: 'yellow' },
    { label: 'Basse', color: 'green' }
  ]
};

// Récupère la liste des champs définis pour le board. Si l'ancien format
// (v1, un seul jeu de 4 champs fixes) est détecté et qu'aucune liste v2
// n'existe encore, il est converti automatiquement.
function getFieldDefs(t) {
  return t.get('board', 'shared', 'fieldDefs').then(function (defs) {
    if (defs && defs.length) return defs;
    return t.get('board', 'shared', 'fieldConfig').then(function (oldConfig) {
      if (!oldConfig) return [];
      var cfg = oldConfig || DEFAULT_LEGACY_CONFIG;
      return [
        { id: 'text', type: 'text', label: cfg.textLabel || 'Texte' },
        { id: 'number', type: 'number', label: cfg.numberLabel || 'Nombre' },
        { id: 'checkbox', type: 'checkbox', label: cfg.checkboxLabel || 'Case à cocher' },
        { id: 'dropdown', type: 'dropdown', label: cfg.dropdownLabel || 'Liste déroulante', options: cfg.dropdownOptions || [] }
      ];
    });
  });
}

function getFieldValues(t) {
  return t.get('card', 'shared', 'fieldValues').then(function (values) {
    return values || {};
  });
}

function findOption(fieldDef, label) {
  return (fieldDef.options || []).filter(function (o) {
    return o.label === label;
  })[0];
}

// true si le champ n'a pas de valeur significative à afficher
function isEmpty(type, value) {
  if (value === undefined || value === null) return true;
  if (type === 'checkbox') return value !== true;
  return value === '';
}

// Simule un texte barré en insérant un caractère Unicode "combining long
// stroke overlay" après chaque caractère (les badges Trello n'acceptent
// que du texte brut, pas de CSS).
function strike(str) {
  return String(str).split('').map(function (c) { return c + '̶'; }).join('');
}

function badgeColorFor(fieldDef, entry) {
  if (fieldDef.type === 'dropdown') {
    var opt = findOption(fieldDef, entry.value);
    return opt ? opt.color : 'light-gray';
  }
  if (fieldDef.type === 'checkbox') return 'green';
  return null;
}

function openFieldsPopup(t) {
  return t.popup({
    title: 'Modifier les champs personnalisés',
    url: './fields.html',
    height: 480,
    width: 400
  });
}

function openSettingsPopup(t) {
  return t.popup({
    title: 'Configurer les champs personnalisés',
    url: './settings.html',
    height: 500,
    width: 400
  });
}

TrelloPowerUp.initialize({

  // Badges affichés sur la face avant de la carte
  'card-badges': function (t) {
    return Promise.all([getFieldDefs(t), getFieldValues(t)]).then(function (r) {
      var fieldDefs = r[0];
      var fieldValues = r[1];
      var badges = [];

      fieldDefs.forEach(function (fieldDef) {
        var entry = fieldValues[fieldDef.id] || {};
        if (isEmpty(fieldDef.type, entry.value)) return;

        var text = (fieldDef.type === 'checkbox') ? fieldDef.label : String(entry.value);
        var color = entry.struck ? 'light-gray' : badgeColorFor(fieldDef, entry);
        if (entry.struck) text = strike(text);

        badges.push({ text: text, color: color });
      });

      return badges;
    });
  },

  // Badges affichés dans le détail de la carte (cliquables)
  'card-detail-badges': function (t) {
    return Promise.all([getFieldDefs(t), getFieldValues(t)]).then(function (r) {
      var fieldDefs = r[0];
      var fieldValues = r[1];

      return fieldDefs.map(function (fieldDef) {
        var entry = fieldValues[fieldDef.id] || {};
        var empty = isEmpty(fieldDef.type, entry.value);
        var text;

        if (empty) {
          text = '(vide)';
        } else if (fieldDef.type === 'checkbox') {
          text = 'Oui';
        } else {
          text = String(entry.value);
        }
        if (!empty && entry.struck) text = strike(text);

        return {
          title: fieldDef.label,
          text: text,
          color: empty ? null : (entry.struck ? 'light-gray' : badgeColorFor(fieldDef, entry)),
          callback: openFieldsPopup
        };
      });
    });
  },

  // Bouton dans le détail de la carte pour éditer les champs
  'card-buttons': function () {
    return [{
      icon: WHITE_ICON,
      text: 'Champs personnalisés',
      callback: openFieldsPopup
    }];
  },

  // Bouton dans la barre du board pour configurer les champs
  'board-buttons': function () {
    return [{
      icon: WHITE_ICON,
      text: 'Champs personnalisés',
      callback: openSettingsPopup
    }];
  },

  // Entrée dans le menu "Power-Ups" > icône engrenage
  'show-settings': function (t) {
    return openSettingsPopup(t);
  }

});
