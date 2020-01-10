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

  async function pull(auth) {
    const sheets = google.sheets({ version: "v4", auth });

    const res = await new Promise((resolve, reject) => {
      sheets.spreadsheets.values.get(
        {
          spreadsheetId: config.spreadsSheetId,
          range: `${config.sheetName}!${config.range}`
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

    const rows = res.data.values;
    console.log(rows);
    await writeTranslation(rows);
  }

  async function writeTranslation(jsonArray) {
    try {
      // Remove header
      if (config.header) {
        jsonArray.shift();
      }

      // Write file
      for (let lang of config.languages) {
        const prevPath = getTranslationPath(lang);
        let prevObj;
        try {
          prevObj = (await fs.readJson(prevPath)) || {};
        } catch (error) {
          prevObj = {};
        }

        const translation = {};
        jsonArray.forEach(row => {
          const key = row[getColNumber("key")];
          const value = row[getColNumber(lang)];
          translation[key] = value;
        });

        const finalTranslation = {
          ...prevObj,
          ...translation
        };
        await fs.outputJSON(prevPath, finalTranslation, { spaces: 2 });
      }
    } catch (error) {
      console.log(error);
    }
  }

  authorize(config, pull);
};
