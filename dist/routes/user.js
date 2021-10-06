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
const hash_1 = __importDefault(require("../lib/security/hash"));
const router = express_1.default.Router();
const connectionUrl = process.env.CONNECTION_URL;
if (!connectionUrl) {
    throw new Error('CONNECTION_URLが未設定です。');
}
function createRegistData(body, totaluser, hash) {
    const datetime = new Date();
    return {
        user_id: totaluser + 1,
        email: body.email,
        name: `${body.lastName} ${body.firstName}`,
        password: hash,
        phoneNo: body.phoneNo,
        role: 'general',
        registtime: datetime,
    };
}
router.get('/', (req, res) => {
    res.render('./user/post/user-input.ejs', { message: req.flash('message') });
});
router.post('/post/regist/execute', (req, res, next) => {
    mongodb_1.MongoClient.connect(connectionUrl, (error, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (client) {
            const db = client.db(process.env.DATABSE);
            try {
                const results = yield db
                    .collection('users')
                    .find({ email: req.body.email })
                    .count();
                const totaluser = yield db.collection('users').find().count();
                if (results !== 0) {
                    next();
                }
                else {
                    const data = createRegistData(req.body, totaluser, hash_1.default.digest(req.body.password));
                    yield db.collection('users').insertOne(data);
                    res.redirect('/user/post/regist/complete');
                }
            }
            catch (error) {
                req.flash('message', 'ユーザー情報チェック時にエラーが発生しました。');
                res.render('./user/post/user-input.ejs', {
                    message: req.flash('message'),
                });
            }
            finally {
                client.close();
            }
        }
    }));
}, (req, res) => {
    req.flash('message', 'そのユーザー(メールアドレス)は既に登録されているため、登録できません。');
    res.render('./user/post/user-input.ejs', {
        message: req.flash('message'),
    });
});
router.get('/post/regist/complete', (req, res) => {
    res.render('./user/post/user-complete.ejs');
});
exports.default = router;
