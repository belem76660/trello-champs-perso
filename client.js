/* global TrelloPowerUp */

// ---------------------------------------------------------------------
// Power-Up "Champs personnalisés" : ajoute 4 champs par carte
// (texte, nombre, case à cocher, liste déroulante) stockés au niveau
// "shared" (visibles par tous les membres du board).
// ---------------------------------------------------------------------

var WHITE_ICON = './icon-white.svg';

var DEFAULT_CONFIG = {
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

var DEFAULT_VALUES = { text: '', number: '', checkbox: false, dropdown: '' };

function getFieldConfig(t) {
  return t.get('board', 'shared', 'fieldConfig').then(function (config) {
    return config || DEFAULT_CONFIG;
  });
}

function getFieldValues(t) {
  return t.get('card', 'shared', 'fieldValues').then(function (values) {
    return values || DEFAULT_VALUES;
  });
}

function findOption(config, label) {
  return (config.dropdownOptions || []).filter(function (o) {
    return o.label === label;
  })[0];
}

function openFieldsPopup(t) {
  return t.popup({
    title: 'Modifier les champs personnalisés',
    url: './fields.html',
    height: 380
  });
}

function openSettingsPopup(t) {
  return t.popup({
    title: 'Configurer les champs personnalisés',
    url: './settings.html',
    height: 440
  });
}

TrelloPowerUp.initialize({

  // Badges affichés sur la face avant de la carte
  'card-badges': function (t) {
    return Promise.all([getFieldConfig(t), getFieldValues(t)]).then(function (r) {
      var config = r[0];
      var values = r[1];
      var badges = [];

      if (values.dropdown) {
        var opt = findOption(config, values.dropdown);
        badges.push({ text: values.dropdown, color: opt ? opt.color : 'light-gray' });
      }
      if (values.checkbox) {
        badges.push({ text: '✓ ' + config.checkboxLabel, color: 'green' });
      }
      if (values.text) {
        badges.push({ text: values.text });
      }
      if (values.number !== '' && values.number !== undefined && values.number !== null) {
        badges.push({ text: String(values.number) });
      }
      return badges;
    });
  },

  // Badges affichés dans le détail de la carte (cliquables)
  'card-detail-badges': function (t) {
    return Promise.all([getFieldConfig(t), getFieldValues(t)]).then(function (r) {
      var config = r[0];
      var values = r[1];
      var opt = findOption(config, values.dropdown);

      return [
        {
          title: config.textLabel,
          text: values.text || '(vide)',
          callback: openFieldsPopup
        },
        {
          title: config.numberLabel,
          text: (values.number !== '' && values.number !== undefined) ? String(values.number) : '(vide)',
          callback: openFieldsPopup
        },
        {
          title: config.checkboxLabel,
          text: values.checkbox ? 'Oui' : 'Non',
          color: values.checkbox ? 'green' : null,
          callback: openFieldsPopup
        },
        {
          title: config.dropdownLabel,
          text: values.dropdown || '(non défini)',
          color: opt ? opt.color : null,
          callback: openFieldsPopup
        }
      ];
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
