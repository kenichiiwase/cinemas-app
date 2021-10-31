import express from 'express';
import axios, { AxiosResponse } from 'axios';

const router = express.Router();
const apikey = '';
const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apikey}&language=ja`;
let cinemaObj: AxiosResponse<any>;

router.get('/', async (req: express.Request, res: express.Response) => {
  try {
    const res = await axios.get(url);
    cinemaObj = res.data.results;
  } catch (error) {
    req.flash(
      'message',
      '映画情報取得時にエラーが発生しました。システム管理者へお問い合わせください。'
    );
    res.render('./index.ejs', {
      message: req.flash('message'),
    });
  }
  const cinemaData = {
    list: cinemaObj,
  };
  res.render('./trends/index.ejs', cinemaData);
});

export default router;
