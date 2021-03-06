import passport from 'passport';
import * as passportLocal from 'passport-local';
import express from 'express';
import { MongoClient } from 'mongodb';
import hash from './hash';

const LocalStrategy = passportLocal.Strategy;
const connectionUrl = process.env.CONNECTION_URL;

if (!connectionUrl) {
  throw new Error('CONNECTION_URLが未設定です。');
}

// サーバーからクライアントへ保存する処理
passport.serializeUser((email, done) => {
  done(null, email);
});

// クライアントからサーバーへ復元する処理
passport.deserializeUser((email, done) => {
  MongoClient.connect(connectionUrl, async (error, client) => {
    if (client) {
      const db = client.db(process.env.DATABSE);
      try {
        const user = await db.collection('users').findOne({ email });
        done(null, user);
      } catch {
        done(error);
      } finally {
        client.close();
      }
    }
  });
});

// ログインボタン押下された際の処理
passport.use(
  'local-strategy',
  new LocalStrategy(
    {
      // formのname値,コールバックにリクエストオブジェクトを渡す
      usernameField: 'username',
      passwordField: 'password',
      passReqToCallback: true,
    },
    (req: express.Request, username, password, done) => {
      MongoClient.connect(connectionUrl, async (error, client) => {
        if (client) {
          const db = client.db(process.env.DATABSE);
          try {
            const userData = await db
              .collection('users')
              .findOne({ email: username, password: hash.digest(password) });
            if (userData) {
              // セッションIDの張替え
              req.session.regenerate((error) => {
                if (error) {
                  req.flash(
                    'message',
                    'システムエラー 管理者にお問い合わせください。'
                  );
                  done(null, false);
                } else {
                  done(null, userData.email);
                }
              });
            } else {
              req.flash(
                'message',
                'ユーザー名 または パスワードが間違っています。'
              );
              done(null, false);
            }
          } catch {
            req.flash(
              'message',
              'システムエラー 管理者にお問い合わせください。'
            );
            done(null, false);
          } finally {
            client.close();
          }
        }
      });
    }
  )
);

// app.use()に渡す。
const initialize = () => [passport.initialize(), passport.session()];

const authenticate = () =>
  passport.authenticate('local-strategy', {
    successRedirect: '/login/success',
    failureRedirect: '/',
  });

export default {
  initialize,
  authenticate,
};
