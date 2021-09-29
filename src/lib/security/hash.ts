import * as crypto from "crypto";
const salt = process.env.PASSWORD_SALT;

if (!salt) {
  throw new Error("PASSWORD_SALTが未設定です。");
}

const digest = function (text: string) {
  let hash;

  text += salt;

  for (var i = 3; i--; ) {
    hash = crypto.createHash("sha256");
    hash.update(text);
    text = hash.digest("hex");
  }
  return text;
};

export default {
  digest,
};
