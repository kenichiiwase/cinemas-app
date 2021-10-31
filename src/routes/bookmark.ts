import express from 'express';
import { MongoClient } from 'mongodb';

const router = express.Router();
const connectionUrl = process.env.CONNECTION_URL;

if (!connectionUrl) {
  throw new Error('CONNECTION_URLが未設定です。');
}

const createcinemaDelHistory = (cinemaTitle: string, mail: string) => {
  const datetime = new Date();
  return {
    cinema_title: cinemaTitle,
    user_mail: mail,
    regist_time: datetime,
  };
};

router.get('/', (req: express.Request, res: express.Response) => {
  MongoClient.connect(connectionUrl, async (error, client) => {
    if (client) {
      if (req.user) {
        const userObj = Object.create(req.user);
        const db = client.db(process.env.DATABASE);
        try {
          const cinemaInfoResults = await db
            .collection('cinema_user')
            .aggregate([
              {
                $match: { user_mail: userObj.email },
              },
              {
                $lookup: {
                  from: 'cinemas',
                  localField: 'cinema_title',
                  foreignField: 'title',
                  as: 'cinema_info',
                },
              },
            ])
            .toArray();

          const cinemaInfoData = {
            list: cinemaInfoResults,
          };

          res.render('./bookmark/index.ejs', cinemaInfoData);
        } catch (error) {
          req.flash(
            'message',
            'お気に入り映画情報取得時にエラーが発生しました。'
          );
          res.render('./index.ejs', {
            message: req.flash('message'),
          });
        } finally {
          client.close();
        }
      }
    }
  });
});

router.post(
  '/delete/confirm',
  (req: express.Request, res: express.Response) => {
    const data = req.body;
    res.render('./bookmark/delete/delete-confirm.ejs', {
      data,
      message: req.flash('message'),
    });
  }
);

router.delete(
  '/delete/execute',
  (req: express.Request, res: express.Response) => {
    MongoClient.connect(connectionUrl, async (error, client) => {
      if (client) {
        const db = client.db(process.env.DATABASE);
        const data = req.body;
        if (req.user) {
          // ユーザIDを取得
          const userObj = Object.create(req.user);
          const cinemaDelHistory = createcinemaDelHistory(
            req.body.title,
            userObj.email
          );

          try {
            await Promise.all([
              db.collection('cinema_user').deleteOne({
                cinema_title: req.body.title,
                user_mail: userObj.email,
              }),
            ]);

            await db
              .collection('cinema_delete_history')
              .insertOne(cinemaDelHistory);

            res.redirect('/bookmark/delete/complete');
          } catch (error) {
            req.flash(
              'message',
              'お気に入り映画削除時にエラーが発生しました。'
            );
            res.render('./bookmark/delete/delete-confirm.ejs', {
              data,
              message: req.flash('message'),
            });
          } finally {
            client.close();
          }
        }
      }
    });
  }
);

router.get(
  '/delete/complete',
  (req: express.Request, res: express.Response) => {
    res.render('./bookmark/delete/delete-complete.ejs');
  }
);

export default router;
