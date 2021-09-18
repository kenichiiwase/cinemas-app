const { OPTIONS } = require("../config/mongodb.config.js");
require("dotenv").config();
let router = require("express").Router();
let MongoClient = require("mongodb").MongoClient;

router.get("/", (req, res) => {
  MongoClient.connect(
    process.env.CONNECTION_URL,
    OPTIONS,
    async (error, client) => {
      let db = client.db(process.env.DATABASE);
      try {
        const results = await db
          .collection("video_info")
          .find({ user_mail: req.user })
          .toArray();
        const data = {
          list: results,
        };
        res.render("./bookmark/index.ejs", data);
      } catch (error) {
        req.flash(
          "message",
          "お気に入り映画情報取得時にエラーが発生しました。"
        );
        res.render("./index.ejs", {
          message: req.flash("message"),
        });
      } finally {
        client.close();
      }
    }
  );
});

router.post("/delete/confirm", (req, res) => {
  const data = req.body;
  res.render("./bookmark/delete/delete-confirm.ejs", {
    data,
    message: req.flash("message"),
  });
});

router.delete("/delete/execute", (req, res) => {
  MongoClient.connect(
    process.env.CONNECTION_URL,
    OPTIONS,
    async (error, client) => {
      const db = client.db(process.env.DATABASE);
      const data = req.body;
      try {
        await Promise.all([
          db.collection("video_info").deleteOne({ title: req.body.title }),
        ]);
        res.redirect("/bookmark/delete/complete");
      } catch (error) {
        req.flash("message", "お気に入り映画削除時にエラーが発生しました。");
        res.render("./bookmark/delete/delete-confirm.ejs", {
          data,
          message: req.flash("message"),
        });
      } finally {
        client.close();
      }
    }
  );
});

router.get("/delete/complete", (req, res) => {
  res.render("./bookmark/delete/delete-complete.ejs");
});

module.exports = router;
