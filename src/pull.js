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

    async function pull(auth) {
      const sheets = google.sheets({ version: 'v4', auth });

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
      // console.log(rows);
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
            const key = row[getColNumber('key')];
            const value = row[getColNumber(lang)];

            // value undefined or contain \n
            if (value) {
              translation[key] = value.trim();
            }
          });

          const finalTranslation = {
            ...prevObj,
            ...translation
          };
          await fs.outputJSON(prevPath, finalTranslation, { spaces: 2 });
        }

        console.log('Pull completed');
        resolve('Pull completed');
      } catch (error) {
        console.log('Pull error', error);
        reject(error);
      }
    }

    authorize(config, pull);
  });
};
