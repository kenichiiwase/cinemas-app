import * as crypto from 'crypto';

const salt = process.env.PASSWORD_SALT;
const stretch = 3;

if (!salt) {
  throw new Error('PASSWORD_SALTが未設定です。');
}

const digest = (text: string): string => {
  let hash;

  let newText = text + salt;

  for (let i = stretch; i--; ) {
    hash = crypto.createHash('sha256');
    hash.update(newText);

    newText = hash.digest('hex');
  }
  return newText;
};

export default {
  digest,
};
