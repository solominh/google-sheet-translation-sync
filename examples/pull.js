const { pull, push } = require("../src");
const config = require("./google-sheet-translation.config");

pull(config);
