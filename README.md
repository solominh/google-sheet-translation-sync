# GUIDE

## Installation

```bash
yarn add -D google-sheet-translation-sync
```

## Download app credentials

`credentials.json`

https://developers.google.com/sheets/api/quickstart/nodejs

## Create a `config.js` file

```js
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
  spreadsSheetId: "1m2BEgWXkQm***",
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
```

## Usage

```js
const { pull, push } = require("google-sheet-translation-sync");
const config = require("./config");

pull(config);
push(config);
```

## Folder structure

- config.js
- credentials.json
- token.json
- pull.js
- push.js

```json
  "scripts": {
    "pull": "node pull.js",
    "push": "node push.js"
  },
```
