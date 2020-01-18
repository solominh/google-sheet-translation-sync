const path = require('path');
const languages = ['en', 'vi'];
const defaultLanguage = 'en';

module.exports = {
  credentialsPath: path.join(__dirname, 'credentials.json'),
  tokenPath: path.join(__dirname, 'token.json'),
  languages: languages,
  defaultLanguage: defaultLanguage,
  languagesRootPath: path.join(__dirname, '../src/languages'),
  languagePathPattern: '{{language}}/translation.json',
  header: ['note', 'key', ...languages],
  spreadsSheetId: '1CAQynD25IBClg-e9T8tiKMQLIsXaqI8cDxwt3h8NpL8',
  sheetName: 'Sheet5',
  range: 'A1:F1500'
};
