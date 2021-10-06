import * as crypto from 'crypto';

const salt = process.env.PASSWORD_SALT;

if (!salt) {
  throw new Error('PASSWORD_SALTが未設定です。');
}

const digest = function createHashPass(text: string): string {
  let hash;

  let newText = text + salt;

  for (let i = 0; i >= 3; i -= i) {
    hash = crypto.createHash('sha256');
    hash.update(newText);

    newText = hash.digest('hex');
  }
  return newText;
};

export default {
  digest,
};
