import hash from "./hash";
import passport from "passport";
import * as passportLocal from "passport-local";
import express from "express";
import { MongoClient } from "mongodb";
const LocalStrategy = passportLocal.Strategy;
const connectionUrl = process.env.CONNECTION_URL;

if (!connectionUrl) {
  throw new Error("CONNECTION_URLが未設定です。");
}

// サーバーからクライアントへ保存する処理
passport.serializeUser((email, done) => {
  done(null, email);
});

// クライアントからサーバーへ復元する処理
passport.deserializeUser((email, done) => {
  MongoClient.connect(connectionUrl, async (error, client) => {
    if (client) {
      let db = client.db(process.env.DATABSE);
      try {
        const user = await db.collection("users").findOne({ email });
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
  "local-strategy",
  new LocalStrategy(
    {
      // formのname値,コールバックにリクエストオブジェクトを渡す
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req: express.Request, username, password, done) => {
      MongoClient.connect(connectionUrl, async (error, client) => {
        if (client) {
          const db = client.db(process.env.DATABSE);
          try {
            const userData = await db
              .collection("users")
              .findOne({ email: username, password: hash.digest(password) });
            if (userData) {
              // セッションIDの張替え
              req.session.regenerate((error) => {
                if (error) {
                  done(null, false, {
                    message: "システムエラー。管理者にお問い合わせください。",
                  });
                } else {
                  done(null, userData.email);
                }
              });
            } else {
              done(null, false, {
                message: "ユーザー名 または パスワード が間違っています。",
              });
            }
          } catch {
            done(null, false, {
              message: "システムエラー。管理者にお問い合わせください。",
            });
          } finally {
            client.close();
          }
        }
      });
    }
  )
);

// app.use()に渡す。
const initialize = function () {
  return [passport.initialize(), passport.session()];
};

const authenticate = function () {
  return passport.authenticate("local-strategy", {
    successRedirect: "/login/success",
    failureRedirect: "/",
  });
};

export default {
  initialize,
  authenticate,
};
