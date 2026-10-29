const fs = require('fs');
const path = require('path');
const dict = {
  it: JSON.parse(fs.readFileSync(path.join(__dirname, 'locales/it.json'), 'utf8')),
  en: JSON.parse(fs.readFileSync(path.join(__dirname, 'locales/en.json'), 'utf8'))
};
function t(lang, key) {
  const l = dict[lang] ? lang : 'it';
  return dict[l][key] || dict.it[key] || key;
}
module.exports = { t };
