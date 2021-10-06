import express from 'express';
import methodOverride from 'method-override';
import flash from 'connect-flash';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import * as dotenv from 'dotenv';
import index from './routes/index';
import cinemas from './routes/cinemas';
import bookmark from './routes/bookmark';
import trends from './routes/trends';
import user from './routes/user';
import accountcontrol from './lib/security/accountcontrol';

const app = express();
const sessionSecret = process.env.SESSION_SECRET;

if (!sessionSecret) {
  throw new Error('SESSION_SECRETが未設定です。');
}

app.use('/public', express.static(`${__dirname}/public`));
// 認証情報の保存復元
app.use(cookieParser());
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
  })
);

// メッセージを表示するため
app.use(flash());

// delete,put読み込む際に使用。
app.use(methodOverride('_method'));

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

// 配列を分割代入
app.use(...accountcontrol.initialize());
app.use('/', index);
app.use('/cinemas/', cinemas);
app.use('/bookmark/', bookmark);
app.use('/trends/', trends);
app.use('/user/', user);
app.listen(3000);
