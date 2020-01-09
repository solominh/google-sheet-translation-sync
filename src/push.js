const authorize = require("./authorize");
const { google } = require("googleapis");

const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");

module.exports = function(config) {
  // Get column number from title
  const keys = config.header.reduce((obj, title, index) => {
    obj[title] = index;
    return obj;
  }, {});
  function getColNumber(key) {
    return keys[key];
  }

  // Get language path
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  const compiled = _.template(config.languagePathPattern);
  function getTranslationPath(lang) {
    return path.join(config.languagesRootPath, compiled({ language: lang }));
  }

  function getTranslationRows() {
    const obj = {};
    for (let lang of config.languages) {
      const str = fs.readFileSync(getTranslationPath(lang));
      obj[lang] = JSON.parse(str);
    }

    // Get all keys
    let keys = [];
    const langSources = {};
    for (let lang of config.languages) {
      const langKeys = Object.keys(obj[lang]);
      keys = _.union(keys, langKeys);

      langSources[lang] = obj[lang];
    }

    const rows = [];
    rows.push(config.header);
    for (let key of keys) {
      const row = [];
      row[getColNumber("key")] = key;
      row[getColNumber("note")] = "";
      for (let lang of config.languages) {
        row[getColNumber(lang)] = _.get(obj[lang], key);
      }

      rows.push(row);
    }

    return rows;
  }

  async function push(auth) {
    const sheets = google.sheets({ version: "v4", auth });

    const rows = getTranslationRows();
    console.log(rows);

    try {
      await new Promise((resolve, reject) => {
        sheets.spreadsheets.values.update(
          {
            spreadsheetId: config.spreadsSheetId,
            range: `${config.sheetName}!${config.push.range}`,
            valueInputOption: "RAW",
            resource: {
              values: rows
            }
          },
          (err, res) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(res);
          }
        );
      });
    } catch (error) {
      console.log(error);
    }
  }

  authorize(config, push);
};
