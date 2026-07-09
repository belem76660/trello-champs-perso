/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();

var COLORS = ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black', 'light-gray'];

var TYPE_LABELS = {
  text: 'Texte',
  number: 'Nombre',
  checkbox: 'Case à cocher',
  dropdown: 'Liste déroulante'
};

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

function makeId() {
  return 'f' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

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

function addOptionRow(container, opt) {
  opt = opt || { label: '', color: 'sky' };
  var row = document.createElement('div');
  row.className = 'option-row';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'option-label';
  input.value = opt.label;
  input.placeholder = 'Libellé (ex: Haute)';

  var select = document.createElement('select');
  select.className = 'option-color color-select';
  COLORS.forEach(function (c) {
    var o = document.createElement('option');
    o.value = c;
    o.textContent = c;
    if (c === opt.color) o.selected = true;
    select.appendChild(o);
  });

  var removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-option';
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', function () {
    row.remove();
    t.sizeTo('body');
  });

  row.appendChild(input);
  row.appendChild(select);
  row.appendChild(removeBtn);
  container.appendChild(row);
}

function renderFieldDef(fieldDef) {
  var wrapper = document.createElement('div');
  wrapper.className = 'field-def';
  wrapper.dataset.id = fieldDef.id;
  wrapper.dataset.type = fieldDef.type;

  var header = document.createElement('div');
  header.className = 'field-def-header';

  var typeBadge = document.createElement('span');
  typeBadge.className = 'type-badge';
  typeBadge.textContent = TYPE_LABELS[fieldDef.type] || fieldDef.type;

  var labelInput = document.createElement('input');
  labelInput.type = 'text';
  labelInput.className = 'field-label-input';
  labelInput.value = fieldDef.label;

  var removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'remove-field';
  removeBtn.textContent = '✕';
  removeBtn.title = 'Supprimer ce champ';
  removeBtn.addEventListener('click', function () {
    wrapper.remove();
    t.sizeTo('body');
  });

  header.appendChild(typeBadge);
  header.appendChild(labelInput);
  header.appendChild(removeBtn);
  wrapper.appendChild(header);

  if (fieldDef.type === 'dropdown') {
    var optionsContainer = document.createElement('div');
    optionsContainer.className = 'dropdown-options';
    (fieldDef.options || []).forEach(function (opt) {
      addOptionRow(optionsContainer, opt);
    });

    var addOptionBtn = document.createElement('button');
    addOptionBtn.type = 'button';
    addOptionBtn.className = 'add-option';
    addOptionBtn.textContent = '+ Ajouter une option';
    addOptionBtn.addEventListener('click', function () {
      addOptionRow(optionsContainer, null);
      t.sizeTo('body');
    });

    wrapper.appendChild(optionsContainer);
    wrapper.appendChild(addOptionBtn);
  }

  return wrapper;
}

function renderAll(fieldDefs) {
  var list = document.getElementById('fields-list');
  list.innerHTML = '';
  document.getElementById('empty-hint').style.display = fieldDefs.length ? 'none' : 'block';
  fieldDefs.forEach(function (fieldDef) {
    list.appendChild(renderFieldDef(fieldDef));
  });
  t.sizeTo('body');
}

getFieldDefs().then(function (fieldDefs) {
  renderAll(fieldDefs);
});

document.getElementById('add-field-btn').addEventListener('click', function () {
  var type = document.getElementById('new-field-type').value;
  var labelInput = document.getElementById('new-field-label');
  var label = labelInput.value.trim() || TYPE_LABELS[type];

  var fieldDef = { id: makeId(), type: type, label: label };
  if (type === 'dropdown') {
    fieldDef.options = [
      { label: 'Haute', color: 'red' },
      { label: 'Moyenne', color: 'yellow' },
      { label: 'Basse', color: 'green' }
    ];
  }

  document.getElementById('fields-list').appendChild(renderFieldDef(fieldDef));
  document.getElementById('empty-hint').style.display = 'none';
  labelInput.value = '';
  t.sizeTo('body');
});

document.getElementById('save-btn').addEventListener('click', function () {
  var defs = Array.prototype.map.call(document.querySelectorAll('.field-def'), function (wrapper) {
    var type = wrapper.dataset.type;
    var fieldDef = {
      id: wrapper.dataset.id,
      type: type,
      label: wrapper.querySelector('.field-label-input').value.trim() || TYPE_LABELS[type]
    };

    if (type === 'dropdown') {
      fieldDef.options = Array.prototype.map.call(wrapper.querySelectorAll('.option-row'), function (row) {
        return {
          label: row.querySelector('.option-label').value.trim(),
          color: row.querySelector('.option-color').value
        };
      }).filter(function (o) { return o.label; });
    }

    return fieldDef;
  });

  t.set('board', 'shared', 'fieldDefs', defs).then(function () {
    t.closePopup();
  });
});
