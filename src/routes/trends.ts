import express from "express";
import axios, { AxiosResponse } from "axios";
let router = express.Router();
const apikey = "b2af30b05b5e266c41d08f8b67952271";
const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apikey}&language=ja`;
let obj: AxiosResponse<any>;

router.get("/", async (req: express.Request, res: express.Response) => {
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

export default router;
