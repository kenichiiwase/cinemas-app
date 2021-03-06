import express from 'express';
import { MongoClient } from 'mongodb';
import hash from '../lib/security/hash';

const router = express.Router();
const connectionUrl = process.env.CONNECTION_URL;

if (!connectionUrl) {
  throw new Error('CONNECTION_URLが未設定です。');
}

const createUserData = (body: any, hash: string) => {
  const datetime = new Date();
  return {
    // user_id: totaluser + 1,
    email: body.email,
    name: `${body.lastName} ${body.firstName}`,
    password: hash,
    phone_no: body.phoneNo,
    regist_time: datetime,
  };
};

router.get('/', (req: express.Request, res: express.Response) => {
  res.render('./user/post/user-input.ejs', { message: req.flash('message') });
});

router.post(
  '/post/regist/execute',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    MongoClient.connect(connectionUrl, async (error, client) => {
      if (client) {
        const db = client.db(process.env.DATABSE);
        try {
          const mailCount = await db
            .collection('users')
            .find({ email: req.body.email })
            .count();

          // const totaluser = await db.collection('users').find().count();

          if (mailCount !== 0) {
            next();
          } else {
            const userData = createUserData(
              req.body,
              hash.digest(req.body.password)
            );
            await db.collection('users').insertOne(userData);
            res.redirect('/user/post/regist/complete');
          }
        } catch (error) {
          req.flash(
            'message',
            'ユーザー情報チェック時にエラーが発生しました。'
          );
          res.render('./user/post/user-input.ejs', {
            message: req.flash('message'),
          });
        } finally {
          client.close();
        }
      }
    });
  },
  (req: express.Request, res: express.Response) => {
    req.flash(
      'message',
      'そのユーザー(メールアドレス)は既に登録されているため、登録できません。'
    );
    res.render('./user/post/user-input.ejs', {
      message: req.flash('message'),
    });
  }
);

router.get(
  '/post/regist/complete',
  (req: express.Request, res: express.Response) => {
    res.render('./user/post/user-complete.ejs');
  }
);

export default router;
