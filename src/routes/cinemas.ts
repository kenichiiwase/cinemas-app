import express from 'express';
import { MongoClient } from 'mongodb';
import Csrf from 'csrf';
import axios, { AxiosResponse } from 'axios';

const router = express.Router();
let cinemaObj: AxiosResponse<any>;
const apikey = '';

const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=ja`;

const connectionUrl = process.env.CONNECTION_URL;

if (!connectionUrl) {
  throw new Error('CONNECTION_URLが未設定です。');
}

const createCinemaData = (body: {
  title: string;
  release: string;
  poster: string;
}) => {
  const datetime = new Date();
  return {
    title: body.title,
    release: body.release,
    poster: body.poster,
    regist_time: datetime,
  };
};

const createCinemaUserData = (cinemaTitle: string, mail: string) => {
  const datetime = new Date();
  return {
    cinema_title: cinemaTitle,
    user_mail: mail,
    regist_time: datetime,
  };
};

// api取得url
router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const res = await axios.get(url);
    cinemaObj = res.data.results;
  } catch (error) {
    req.flash(
      'message',
      '映画情報取得時にエラーが発生しました。システム管理者へお問い合わせください。'
    );
    res.render('./index.ejs', {
      message: req.flash('message'),
    });
  }

  const cinemaData = {
    list: cinemaObj,
  };

  res.render('./cinemas/index.ejs', cinemaData);
});

router.post(
  '/posts/regist/confirm',
  (req: express.Request, res: express.Response) => {
    const tokens = new Csrf();
    tokens.secret((error, secret) => {
      const token = tokens.create(secret);
      req.session._csrf = secret;
      res.cookie('_csrf', token);
      const cinemaData = req.body;
      res.render('./cinemas/posts/regist-confirm.ejs', {
        cinemaData,
        message: req.flash('message'),
      });
    });
  }
);

router.post(
  '/posts/regist/execute',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const secret = req.session._csrf;
    if (!secret) {
      throw new Error('Invalid Csrf.');
    }
    const token = req.cookies._csrf;

    // secret,tokenの組み合わせチェック
    const tokens = new Csrf();
    if (tokens.verify(secret, token) === false) {
      throw new Error('Invalid Token.');
    }

    MongoClient.connect(connectionUrl, async (error, client) => {
      if (client) {
        const db = client.db(process.env.DATABASE);
        if (req.user) {
          // ユーザIDを取得
          const userObj = Object.create(req.user);

          try {
            const cinemaCount = await db
              .collection('cinemas')
              .find({ title: req.body.title, release: req.body.release })
              .count();

            if (cinemaCount !== 0) {
              const cinemaRegistDataCount = await db
                .collection('cinema_user')
                .find({
                  cinema_title: req.body.title,
                  user_mail: userObj.email,
                })
                .count();

              // 既に同じユーザで映画情報が登録されている場合
              if (cinemaRegistDataCount !== 0) {
                next();
              } else {
                const cinemaUserData = createCinemaUserData(
                  req.body.title,
                  userObj.email
                );
                await db.collection('cinema_user').insertOne(cinemaUserData);
                res.redirect('/cinemas/posts/regist/complete');
              }
            } else {
              const cinemaData = createCinemaData(req.body);
              await db.collection('cinemas').insertOne(cinemaData);
              const cinemaUserData = createCinemaUserData(
                req.body.title,
                userObj.email
              );
              await db.collection('cinema_user').insertOne(cinemaUserData);
              res.redirect('/cinemas/posts/regist/complete');
            }
          } catch (error) {
            const cinemaData = req.body;
            req.flash('message', '登録時にエラーが発生しました。');
            res.render('./cinemas/posts/regist-confirm.ejs', {
              cinemaData,
              message: req.flash('message'),
            });
          } finally {
            client.close();
          }
        }
      }
    });
  },
  (req: express.Request, res: express.Response) => {
    if (req.user) {
      const cinemaData = req.body;
      req.flash('message', '既に登録済みです。');
      res.render('./cinemas/posts/regist-confirm.ejs', {
        cinemaData,
        message: req.flash('message'),
      });
    }
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
