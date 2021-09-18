const { OPTIONS } = require("../config/mongodb.config");
require("dotenv").config();
const router = require("express").Router();
const MongoClient = require("mongodb").MongoClient;
const tokens = require("csrf")();
const axios = require("axios");
const apikey = "";
const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=ja`;

const createRegistData = function (body, user) {
  const datetime = new Date();
  return {
    user_mail: user,
    published: datetime,
    release: body.release,
    title: body.title,
    poster: body.poster,
  };
};

// api取得url
router.get("/", async (req, res) => {
  try {
    const res = await axios.get(url);
    obj = res.data.results;
  } catch (error) {
    req.flash(
      "message",
      "映画情報取得時にエラーが発生しました。システム管理者へお問い合わせください。"
    );
    res.render("./index.ejs", {
      message: req.flash("message"),
    });
  }
  const data = {
    list: obj,
  };
  res.render("./cinemas/index.ejs", data);
});

router.post("/posts/regist/confirm", (req, res) => {
  tokens.secret((error, secret) => {
    let token = tokens.create(secret);
    req.session._csrf = secret;
    res.cookie("_csrf", token);
    const data = req.body;
    res.render("./cinemas/posts/regist-confirm.ejs", {
      data,
      message: req.flash("message"),
    });
  });
});

router.post(
  "/posts/regist/execute",
  (req, res, next) => {
    const secret = req.session._csrf;
    const token = req.cookies._csrf;

    // secret,tokenの組み合わせチェック
    if (tokens.verify(secret, token) === false) {
      throw new Error("Invalid Token.");
    }

    MongoClient.connect(
      process.env.CONNECTION_URL,
      OPTIONS,
      async (error, client) => {
        const db = client.db(process.env.DATABASE);
        const userInf = req.user;
        try {
          const countData = await db
            .collection("video_info")
            .find({ title: req.body.title })
            .count();

          const data = createRegistData(req.body, userInf);

          if (countData !== 0) {
            next();
          } else {
            await db.collection("video_info").insertOne(data);
            res.redirect("/cinemas/posts/regist/complete");
          }
        } catch (error) {
          req.flash("message", "登録時にエラーが発生しました。");
          res.render("./cinemas/posts/regist-confirm.ejs", {
            data,
            message: req.flash("message"),
          });
        } finally {
          client.close();
        }
      }
    );
  },
  (req, res) => {
    const data = createRegistData(req.body);
    req.flash("message", "既に登録済みです。");
    res.render("./cinemas/posts/regist-confirm.ejs", {
      data,
      message: req.flash("message"),
    });
  }
);

router.get("/posts/regist/complete", (req, res) => {
  delete req.session._csrf;
  res.clearCookie("_csrf");
  res.render("./cinemas/posts/regist-complete.ejs");
});

module.exports = router;
