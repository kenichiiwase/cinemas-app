const {
  CONNECTION_URL,
  OPTIONS,
  DATABSE,
} = require("../../config/mongodb.config");
const hash = require("./hash");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const MongoClient = require("mongodb").MongoClient;
let initialize, authenticate;

// サーバーからクライアントへ保存する処理
passport.serializeUser((email, done) => {
  done(null, email);
});

// クライアントからサーバーへ復元する処理
passport.deserializeUser((email, done) => {
  MongoClient.connect(CONNECTION_URL, OPTIONS, async (error, client) => {
    let db = client.db(DATABSE);
    try {
      const user = await db.collection("users").findOne({ email });
      done(null, user);
    } catch {
      done(error);
    } finally {
      client.close();
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
    (req, username, password, done) => {
      MongoClient.connect(CONNECTION_URL, OPTIONS, async (error, client) => {
        const db = client.db(DATABSE);

        try {
          const userData = await db
            .collection("users")
            .findOne({ email: username, password: hash.digest(password) });
          if (userData) {
            // セッションIDの張替え
            req.session.regenerate((error) => {
              if (error) {
                done(
                  null,
                  false,
                  req.flash(
                    "message",
                    "システムエラー。管理者にお問い合わせください。"
                  )
                );
              } else {
                done(null, userData.email);
              }
            });
          } else {
            done(
              null,
              false,
              req.flash(
                "message",
                "ユーザー名 または パスワード が間違っています。"
              )
            );
          }
        } catch {
          done(
            null,
            false,
            req.flash(
              "message",
              "システムエラー。管理者にお問い合わせください。"
            )
          );
        } finally {
          client.close();
        }
      });
    }
  )
);

// app.use()に渡す。
initialize = function () {
  return [passport.initialize(), passport.session()];
};

authenticate = function () {
  return passport.authenticate("local-strategy", {
    successRedirect: "/login/success",
    failureRedirect: "/",
  });
};

module.exports = {
  initialize,
  authenticate,
};
