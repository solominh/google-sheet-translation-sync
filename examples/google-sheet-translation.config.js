const path = require("path");
const languages = ["en", "vi"];

module.exports = {
  credentialsPath: path.join(__dirname, "credentials.json"),
  tokenPath: path.join(__dirname, "token.json"),
  languages: languages,
  defaultLanguage: "en",
  languagesRootPath: path.join(__dirname, "../src/languages"),
  languagePathPattern: "{{language}}/translation.json",
  header: ["note", "key", ...languages],
  spreadsSheetId: "1m2BEgWXkQm4i5VY6sKSY0mYhBQmYY_uJNcUQgf4R-A4",
  sheetName: "test",
  // Ignore header => use A2 instead of A1
  // G100 => 100 lines
  pull: {
    range: "A2:F1500"
  },
  push: {
    range: "A1:F1500"
  }
};
