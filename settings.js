/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();

var COLORS = ['green', 'yellow', 'orange', 'red', 'purple', 'blue', 'sky', 'lime', 'pink', 'black', 'light-gray'];

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

function addOptionRow(opt) {
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
  removeBtn.className = 'remove-btn';
  removeBtn.textContent = '✕';
  removeBtn.addEventListener('click', function () {
    row.remove();
    t.sizeTo('body');
  });

  row.appendChild(input);
  row.appendChild(select);
  row.appendChild(removeBtn);
  document.getElementById('options-list').appendChild(row);
  t.sizeTo('body');
}

t.get('board', 'shared', 'fieldConfig').then(function (config) {
  config = config || DEFAULT_CONFIG;

  document.getElementById('text-label-input').value = config.textLabel;
  document.getElementById('number-label-input').value = config.numberLabel;
  document.getElementById('checkbox-label-input').value = config.checkboxLabel;
  document.getElementById('dropdown-label-input').value = config.dropdownLabel;

  (config.dropdownOptions || []).forEach(addOptionRow);
  return t.sizeTo('body');
});

document.getElementById('add-option').addEventListener('click', function () {
  addOptionRow();
});

document.getElementById('save-btn').addEventListener('click', function () {
  var options = Array.prototype.map.call(document.querySelectorAll('.option-row'), function (row) {
    return {
      label: row.querySelector('.option-label').value.trim(),
      color: row.querySelector('.option-color').value
    };
  }).filter(function (o) { return o.label; });

  var config = {
    textLabel: document.getElementById('text-label-input').value || 'Texte',
    numberLabel: document.getElementById('number-label-input').value || 'Nombre',
    checkboxLabel: document.getElementById('checkbox-label-input').value || 'Case à cocher',
    dropdownLabel: document.getElementById('dropdown-label-input').value || 'Liste déroulante',
    dropdownOptions: options
  };

  t.set('board', 'shared', 'fieldConfig', config).then(function () {
    t.closePopup();
  });
});
