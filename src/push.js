const authorize = require('./authorize');
const { google } = require('googleapis');

const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const { createGetColNumber } = require('./utils');

module.exports = function(config) {
  return new Promise((resolve, reject) => {
    const getColNumber = createGetColNumber(config.header);

    // Get language path
    _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
    const compiled = _.template(config.languagePathPattern);
    function getTranslationPath(lang) {
      return path.join(config.languagesRootPath, compiled({ language: lang }));
    }

    async function getTranslationRows() {
      const obj = {};
      for (let lang of config.languages) {
        obj[lang] = await fs.readJson(getTranslationPath(lang));
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
        row[getColNumber('key')] = key;
        row[getColNumber('note')] = '';
        for (let lang of config.languages) {
          row[getColNumber(lang)] = _.get(obj[lang], key);
        }

        rows.push(row);
      }

      return rows;
    }

    async function push(auth) {
      const sheets = google.sheets({ version: 'v4', auth });

      try {
        const rows = await getTranslationRows();
        // console.log(rows);

        await new Promise((resolve, reject) => {
          sheets.spreadsheets.values.update(
            {
              spreadsheetId: config.spreadsSheetId,
              range: `${config.sheetName}!${config.range}`,
              valueInputOption: 'RAW',
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

        console.log('Push completed');
        resolve('Push completed');
      } catch (error) {
        console.log('error', error);
        reject(error);
      }
    }

    authorize(config, push);
  });
};
