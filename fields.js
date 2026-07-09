/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();

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

function getFieldDefs() {
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

function getFieldValues() {
  return t.get('card', 'shared', 'fieldValues').then(function (values) {
    return values || {};
  });
}

function defaultEntry(type) {
  return { value: type === 'checkbox' ? false : '', struck: false };
}

function updateStrikeButton(btn, struck) {
  btn.textContent = struck ? 'Rétablir' : 'Barrer';
  btn.classList.toggle('active', struck);
}

function buildFieldRow(fieldDef, entry) {
  var wrapper = document.createElement('div');
  wrapper.className = 'field-row' + (entry.struck ? ' struck' : '');
  wrapper.dataset.id = fieldDef.id;
  wrapper.dataset.type = fieldDef.type;

  var top = document.createElement('div');
  top.className = 'field-row-top';

  var label = document.createElement('span');
  label.className = 'label';
  label.textContent = fieldDef.label;

  var actions = document.createElement('div');
  actions.className = 'field-actions';

  var strikeBtn = document.createElement('button');
  strikeBtn.type = 'button';
  strikeBtn.className = 'btn-strike';
  updateStrikeButton(strikeBtn, entry.struck);

  var clearBtn = document.createElement('button');
  clearBtn.type = 'button';
  clearBtn.className = 'btn-clear';
  clearBtn.textContent = 'Annuler';

  actions.appendChild(strikeBtn);
  actions.appendChild(clearBtn);
  top.appendChild(label);
  top.appendChild(actions);
  wrapper.appendChild(top);

  var inputWrap = document.createElement('div');
  inputWrap.className = 'field-input-wrap';

  var input;
  if (fieldDef.type === 'text') {
    input = document.createElement('input');
    input.type = 'text';
    input.className = 'field-value';
    input.value = entry.value || '';
    inputWrap.appendChild(input);
  } else if (fieldDef.type === 'number') {
    input = document.createElement('input');
    input.type = 'number';
    input.className = 'field-value';
    input.value = (entry.value !== '' && entry.value !== undefined && entry.value !== null) ? entry.value : '';
    inputWrap.appendChild(input);
  } else if (fieldDef.type === 'checkbox') {
    var line = document.createElement('div');
    line.className = 'checkbox-line';
    input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'field-value';
    input.checked = !!entry.value;
    line.appendChild(input);
    inputWrap.appendChild(line);
  } else if (fieldDef.type === 'dropdown') {
    input = document.createElement('select');
    input.className = 'field-value';
    var noneOpt = document.createElement('option');
    noneOpt.value = '';
    noneOpt.textContent = '-- Aucun --';
    input.appendChild(noneOpt);
    (fieldDef.options || []).forEach(function (opt) {
      var o = document.createElement('option');
      o.value = opt.label;
      o.textContent = opt.label;
      if (opt.label === entry.value) o.selected = true;
      input.appendChild(o);
    });
    inputWrap.appendChild(input);
  }

  wrapper.appendChild(inputWrap);

  strikeBtn.addEventListener('click', function () {
    var struck = !wrapper.classList.contains('struck');
    wrapper.classList.toggle('struck', struck);
    updateStrikeButton(strikeBtn, struck);
  });

  clearBtn.addEventListener('click', function () {
    if (fieldDef.type === 'checkbox') {
      input.checked = false;
    } else {
      input.value = '';
    }
    wrapper.classList.remove('struck');
    updateStrikeButton(strikeBtn, false);
  });

  return wrapper;
}

Promise.all([getFieldDefs(), getFieldValues()]).then(function (results) {
  var fieldDefs = results[0];
  var fieldValues = results[1];

  document.getElementById('no-fields').style.display = fieldDefs.length ? 'none' : 'block';

  var container = document.getElementById('fields-container');
  fieldDefs.forEach(function (fieldDef) {
    var entry = fieldValues[fieldDef.id] || defaultEntry(fieldDef.type);
    container.appendChild(buildFieldRow(fieldDef, entry));
  });

  return t.sizeTo('body');
});

document.getElementById('save-btn').addEventListener('click', function () {
  var newValues = {};

  Array.prototype.forEach.call(document.querySelectorAll('.field-row'), function (wrapper) {
    var id = wrapper.dataset.id;
    var type = wrapper.dataset.type;
    var struck = wrapper.classList.contains('struck');
    var input = wrapper.querySelector('.field-value');
    var value;

    if (type === 'checkbox') {
      value = input.checked;
    } else if (type === 'number') {
      value = input.value === '' ? '' : Number(input.value);
    } else {
      value = input.value;
    }

    newValues[id] = { value: value, struck: struck };
  });

  t.set('card', 'shared', 'fieldValues', newValues).then(function () {
    t.closePopup();
  });
});
