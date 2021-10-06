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
const axios_1 = __importDefault(require("axios"));
const router = express_1.default.Router();
const apikey = 'b2af30b05b5e266c41d08f8b67952271';
const url = `https://api.themoviedb.org/3/trending/movie/day?api_key=${apikey}&language=ja`;
let obj;
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
    res.render('./trends/index.ejs', data);
}));
exports.default = router;
