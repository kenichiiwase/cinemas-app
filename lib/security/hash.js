require("dotenv").config();
const crypto = require("crypto");
const digest = function (text) {
  let hash;
  text += process.env.PASSWORD_SALT;

  for (var i = process.env.PASSWORD_STRETCH; i--; ) {
    hash = crypto.createHash("sha256");
    hash.update(text);
    text = hash.digest("hex");
  }
  return text;
};

module.exports = {
  digest,
};
