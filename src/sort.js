const authorize = require('./authorize');

const { google } = require('googleapis');

const { createGetColNumber } = require('./utils');

module.exports = function sort(config) {
  authorize(config, run);
  const getColNumber = createGetColNumber(config.header);

  async function run(auth) {
    const sheets = google.sheets({ version: 'v4', auth });

    console.log('sort started');
    const rows = await pullRows(sheets);
    const header = rows.shift();
    const newRows = await handleSort(rows);
    await pushRows(sheets, [header, ...newRows]);
    console.log('sort completed');
  }

  function handleSort(rows) {
    const newRows = [...rows];
    const { languages } = config;

    function isNeedTranslation(row) {
      const note = getColNumber('note');
      if (row[note]) return true;

      const languageNeedTranslation = languages.find(language => {
        const key = getColNumber(language);
        return !row[key] || row[key] === '__NOT_TRANSLATED__';
      });

      return Boolean(languageNeedTranslation);
    }

    newRows.sort((a, b) => {
      const isANeedTranslation = isNeedTranslation(a);
      const isBNeedTranslation = isNeedTranslation(b);

      if (isANeedTranslation && !isBNeedTranslation) {
        return 1;
      } else if (isBNeedTranslation && !isANeedTranslation) {
        return -1;
      }

      const key = getColNumber('key');
      if (a[key] > b[key]) return 1;
      if (a[key] < b[key]) return -1;
      return 0;
    });

    return newRows;
  }

  async function pullRows(sheets) {
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
    return res.data.values;
  }

  async function pushRows(sheets, rows) {
    return new Promise((resolve, reject) => {
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
  }
};
