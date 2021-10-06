import express from 'express';
import { MongoClient } from 'mongodb';
import csrf from 'csrf';
import axios, { AxiosResponse } from 'axios';

const router = express.Router();
let obj: AxiosResponse<any>;
let data: object;
const apikey = '';

const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=ja`;

const connectionUrl = process.env.CONNECTION_URL;

if (!connectionUrl) {
  throw new Error('CONNECTION_URLが未設定です。');
}

function createRegistData(body: any, user: any): object {
  const datetime = new Date();
  return {
    user_mail: user,
    published: datetime,
    release: body.release,
    title: body.title,
    poster: body.poster,
  };
}

// api取得url
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const res = await axios.get(url);
    obj = res.data.results;
  } catch (error) {
    req.flash(
      'message',
      '映画情報取得時にエラーが発生しました。システム管理者へお問い合わせください。'
    );
    res.render('./index.ejs', {
      message: req.flash('message'),
    });
  }

  const data = {
    list: obj,
  };
  res.render('./cinemas/index.ejs', data);
});

router.post(
  '/posts/regist/confirm',
  (req: express.Request, res: express.Response) => {
    const tokens = new csrf();
    tokens.secret((error, secret) => {
      const token = tokens.create(secret);
      req.session._csrf = secret;
      res.cookie('_csrf', token);
      const data = req.body;
      res.render('./cinemas/posts/regist-confirm.ejs', {
        data,
        message: req.flash('message'),
      });
    });
  }
);

router.post(
  '/posts/regist/execute',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const secret = req.session._csrf || 'csrf';
    const token = req.cookies._csrf;

    // secret,tokenの組み合わせチェック
    const tokens = new csrf();
    if (tokens.verify(secret, token) === false) {
      throw new Error('Invalid Token.');
    }

    MongoClient.connect(connectionUrl, async (error, client) => {
      if (client) {
        const db = client.db(process.env.DATABASE);
        const userInf = req.user || 'user';
        try {
          const countData = await db
            .collection('video_info')
            .find({ title: req.body.title })
            .count();

          const data = createRegistData(req.body, userInf);

          if (countData !== 0) {
            next();
          } else {
            await db.collection('video_info').insertOne(data);
            res.redirect('/cinemas/posts/regist/complete');
          }
        } catch (error) {
          req.flash('message', '登録時にエラーが発生しました。');
          res.render('./cinemas/posts/regist-confirm.ejs', {
            data,
            message: req.flash('message'),
          });
        } finally {
          client.close();
        }
      }
    });
  },
  (req: express.Request, res: express.Response) => {
    const userInf = req.user || 'user';
    const data = createRegistData(req.body, userInf);
    req.flash('message', '既に登録済みです。');
    res.render('./cinemas/posts/regist-confirm.ejs', {
      data,
      message: req.flash('message'),
    });
  }
);

router.get(
  '/posts/regist/complete',
  (req: express.Request, res: express.Response) => {
    delete req.session._csrf;
    res.clearCookie('_csrf');
    res.render('./cinemas/posts/regist-complete.ejs');
  }
);

export default router;
