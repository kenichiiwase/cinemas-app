import * as crypto from 'crypto';

const salt = process.env.PASSWORD_SALT;

if (!salt) {
  throw new Error('PASSWORD_SALTが未設定です。');
}

const digest = (text: string): string => {
  let hash;

  let newText = text + salt;

  for (let i = 3; i >= 0; i -= 1) {
    hash = crypto.createHash('sha256');
    hash.update(newText);
    newText = hash.digest('hex');
  }
  return newText;
};

export default {
  digest,
};
