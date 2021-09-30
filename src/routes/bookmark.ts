import express from "express";
import { MongoClient } from "mongodb";
let router = express.Router();
const connectionUrl = process.env.CONNECTION_URL;

if (!connectionUrl) {
  throw new Error("CONNECTION_URLが未設定です。");
}

router.get("/", (req: express.Request, res: express.Response) => {
  MongoClient.connect(connectionUrl, async (error, client) => {
    if (client) {
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
  });
});

router.post(
  "/delete/confirm",
  (req: express.Request, res: express.Response) => {
    const data = req.body;
    res.render("./bookmark/delete/delete-confirm.ejs", {
      data,
      message: req.flash("message"),
    });
  }
);

router.delete(
  "/delete/execute",
  (req: express.Request, res: express.Response) => {
    MongoClient.connect(connectionUrl, async (error, client) => {
      if (client) {
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
    });
  }
);

router.get(
  "/delete/complete",
  (req: express.Request, res: express.Response) => {
    res.render("./bookmark/delete/delete-complete.ejs");
  }
);

export default router;
