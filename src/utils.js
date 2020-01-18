function createGetColNumber(header) {
  // Get column number from title
  const keys = header.reduce((obj, title, index) => {
    obj[title] = index;
    return obj;
  }, {});
  function getColNumber(key) {
    return keys[key];
  }

  return getColNumber;
}

module.exports = {
  createGetColNumber
};
