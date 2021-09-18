const { OPTIONS } = require("../config/mongodb.config");
const router = require("express").Router();
const MongoClient = require("mongodb").MongoClient;
const hash = require("../lib/security/hash");

const createRegistData = function (body, totaluser, hash) {
  const datetime = new Date();
  return {
    user_id: totaluser + 1,
    email: body.email,
    name: body.lastName + " " + body.firstName,
    password: hash,
    phoneNo: body.phoneNo,
    role: "general",
    registtime: datetime,
  };
};

router.get("/", (req, res) => {
  res.render("./user/post/user-input.ejs", { message: req.flash("message") });
});

router.post(
  "/post/regist/execute",
  (req, res, next) => {
    MongoClient.connect(
      process.env.CONNECTION_URL,
      OPTIONS,
      async (error, client) => {
        const db = client.db(process.env.DATABSE);
        try {
          const results = await db
            .collection("users")
            .find({ email: req.body.email })
            .count();

          const totaluser = await db.collection("users").find().count();

          if (results !== 0) {
            next();
          } else {
            const data = createRegistData(
              req.body,
              totaluser,
              hash.digest(req.body.password)
            );
            await db.collection("users").insertOne(data);
            res.redirect("/user/post/regist/complete");
          }
        } catch (error) {
          req.flash(
            "message",
            "ユーザー情報チェック時にエラーが発生しました。"
          );
          res.render("./user/post/user-input.ejs", {
            message: req.flash("message"),
          });
        } finally {
          client.close();
        }
      }
    );
  },
  (req, res) => {
    req.flash(
      "message",
      "そのユーザー(メールアドレス)は既に登録されているため、登録できません。"
    );
    res.render("./user/post/user-input.ejs", {
      message: req.flash("message"),
    });
  }
);

router.get("/post/regist/complete", (req, res) => {
  res.render("./user/post/user-complete.ejs");
});

module.exports = router;
