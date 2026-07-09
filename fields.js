/* global TrelloPowerUp */

var t = TrelloPowerUp.iframe();

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

Promise.all([
  t.get('board', 'shared', 'fieldConfig'),
  t.get('card', 'shared', 'fieldValues')
]).then(function (results) {
  var config = results[0] || DEFAULT_CONFIG;
  var values = results[1] || DEFAULT_VALUES;

  document.getElementById('text-label').textContent = config.textLabel;
  document.getElementById('number-label').textContent = config.numberLabel;
  document.getElementById('checkbox-label').textContent = config.checkboxLabel;
  document.getElementById('dropdown-label').textContent = config.dropdownLabel;

  document.getElementById('text-input').value = values.text || '';
  document.getElementById('number-input').value = (values.number !== undefined && values.number !== null) ? values.number : '';
  document.getElementById('checkbox-input').checked = !!values.checkbox;

  var select = document.getElementById('dropdown-input');
  (config.dropdownOptions || []).forEach(function (opt) {
    var optionEl = document.createElement('option');
    optionEl.value = opt.label;
    optionEl.textContent = opt.label;
    if (opt.label === values.dropdown) optionEl.selected = true;
    select.appendChild(optionEl);
  });

  return t.sizeTo('#fields-form');
});

document.getElementById('fields-form').addEventListener('submit', function (e) {
  e.preventDefault();

  var numberVal = document.getElementById('number-input').value;
  var newValues = {
    text: document.getElementById('text-input').value,
    number: numberVal === '' ? '' : Number(numberVal),
    checkbox: document.getElementById('checkbox-input').checked,
    dropdown: document.getElementById('dropdown-input').value
  };

  t.set('card', 'shared', 'fieldValues', newValues).then(function () {
    t.closePopup();
  });
});
