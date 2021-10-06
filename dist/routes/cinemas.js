"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongodb_1 = require("mongodb");
const csrf_1 = __importDefault(require("csrf"));
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
let obj;
let data;
const apikey = 'b2af30b05b5e266c41d08f8b67952271';
const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apikey}&language=ja`;
const connectionUrl = process.env.CONNECTION_URL;
if (!connectionUrl) {
    throw new Error('CONNECTION_URLが未設定です。');
}
function createRegistData(body, user) {
    const datetime = new Date();
    return {
        user_mail: user,
        published: datetime,
        release: body.release,
        title: body.title,
        poster: body.poster,
    };
}
// api取得url
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const res = yield axios_1.default.get(url);
        obj = res.data.results;
    }
    catch (error) {
        req.flash('message', '映画情報取得時にエラーが発生しました。システム管理者へお問い合わせください。');
        res.render('./index.ejs', {
            message: req.flash('message'),
        });
    }
    const data = {
        list: obj,
    };
    res.render('./cinemas/index.ejs', data);
}));
router.post('/posts/regist/confirm', (req, res) => {
    const tokens = new csrf_1.default();
    tokens.secret((error, secret) => {
        const token = tokens.create(secret);
        req.session._csrf = secret;
        res.cookie('_csrf', token);
        const data = req.body;
        res.render('./cinemas/posts/regist-confirm.ejs', {
            data,
            message: req.flash('message'),
        });
    });
});
router.post('/posts/regist/execute', (req, res, next) => {
    const secret = req.session._csrf || 'csrf';
    const token = req.cookies._csrf;
    // secret,tokenの組み合わせチェック
    const tokens = new csrf_1.default();
    if (tokens.verify(secret, token) === false) {
        throw new Error('Invalid Token.');
    }
    mongodb_1.MongoClient.connect(connectionUrl, (error, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (client) {
            const db = client.db(process.env.DATABASE);
            const userInf = req.user || 'user';
            try {
                const countData = yield db
                    .collection('video_info')
                    .find({ title: req.body.title })
                    .count();
                const data = createRegistData(req.body, userInf);
                if (countData !== 0) {
                    next();
                }
                else {
                    yield db.collection('video_info').insertOne(data);
                    res.redirect('/cinemas/posts/regist/complete');
                }
            }
            catch (error) {
                req.flash('message', '登録時にエラーが発生しました。');
                res.render('./cinemas/posts/regist-confirm.ejs', {
                    data,
                    message: req.flash('message'),
                });
            }
            finally {
                client.close();
            }
        }
    }));
}, (req, res) => {
    const userInf = req.user || 'user';
    const data = createRegistData(req.body, userInf);
    req.flash('message', '既に登録済みです。');
    res.render('./cinemas/posts/regist-confirm.ejs', {
        data,
        message: req.flash('message'),
    });
});
router.get('/posts/regist/complete', (req, res) => {
    delete req.session._csrf;
    res.clearCookie('_csrf');
    res.render('./cinemas/posts/regist-complete.ejs');
});
exports.default = router;
