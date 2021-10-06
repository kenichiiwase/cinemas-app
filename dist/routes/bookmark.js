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
const router = express_1.default.Router();
const connectionUrl = process.env.CONNECTION_URL;
if (!connectionUrl) {
    throw new Error('CONNECTION_URLが未設定です。');
}
router.get('/', (req, res) => {
    mongodb_1.MongoClient.connect(connectionUrl, (error, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (client) {
            const db = client.db(process.env.DATABASE);
            try {
                const results = yield db
                    .collection('video_info')
                    .find({ user_mail: req.user })
                    .toArray();
                const data = {
                    list: results,
                };
                res.render('./bookmark/index.ejs', data);
            }
            catch (error) {
                req.flash('message', 'お気に入り映画情報取得時にエラーが発生しました。');
                res.render('./index.ejs', {
                    message: req.flash('message'),
                });
            }
            finally {
                client.close();
            }
        }
    }));
});
router.post('/delete/confirm', (req, res) => {
    const data = req.body;
    res.render('./bookmark/delete/delete-confirm.ejs', {
        data,
        message: req.flash('message'),
    });
});
router.delete('/delete/execute', (req, res) => {
    mongodb_1.MongoClient.connect(connectionUrl, (error, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (client) {
            const db = client.db(process.env.DATABASE);
            const data = req.body;
            try {
                yield Promise.all([
                    db.collection('video_info').deleteOne({ title: req.body.title }),
                ]);
                res.redirect('/bookmark/delete/complete');
            }
            catch (error) {
                req.flash('message', 'お気に入り映画削除時にエラーが発生しました。');
                res.render('./bookmark/delete/delete-confirm.ejs', {
                    data,
                    message: req.flash('message'),
                });
            }
            finally {
                client.close();
            }
        }
    }));
});
router.get('/delete/complete', (req, res) => {
    res.render('./bookmark/delete/delete-complete.ejs');
});
exports.default = router;
