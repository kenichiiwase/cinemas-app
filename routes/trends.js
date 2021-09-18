const router = require("express").Router();
const axios = require("axios");
const apikey = "";
const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apikey}&language=ja`;

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
  res.render("./trends/index.ejs", data);
});

module.exports = router;
