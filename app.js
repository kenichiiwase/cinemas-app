const { SESSION_SECRET } = require('./config/appconfig.js').security;
const express = require('express');
const app = express();
const methodOverride = require('method-override');
const flash = require('connect-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const accountcontrol = require('./lib/security/accountcontrol');

// eslint-disable-next-line no-undef
app.use('/public', express.static(__dirname + '/public'));

// 認証情報の保存復元
app.use(cookieParser());
app.use(
  session({
    secret: SESSION_SECRET,
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

app.use('/', require('./routes/index.js'));
app.use('/cinemas/', require('./routes/cinemas.js'));
app.use('/bookmark/', require('./routes/bookmark.js'));
app.use('/trends/', require('./routes/trends.js'));
app.use('/user/', require('./routes/user.js'));
app.listen(3000);
