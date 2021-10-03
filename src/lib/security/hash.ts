import * as crypto from "crypto";

const salt = process.env.PASSWORD_SALT;

if (!salt) {
  throw new Error("PASSWORD_SALTが未設定です。");
}

const digest = function createHashPass(text: string):string {
  let hash;

  text += salt;

  for (let i = 3; i--;) {
    hash = crypto.createHash("sha256");
    hash.update(text);

    text = hash.digest("hex");
  }
  return text;
};

export default {
  digest,
};
