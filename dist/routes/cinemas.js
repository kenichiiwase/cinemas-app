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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import OPTIONS from "../config/mongodb.config";
var express_1 = __importDefault(require("express"));
var mongodb_1 = require("mongodb");
var csrf_1 = __importDefault(require("csrf"));
var axios_1 = __importDefault(require("axios"));
var router = express_1.default.Router();
var obj;
var data;
var apikey = "b2af30b05b5e266c41d08f8b67952271";
var url = "https://api.themoviedb.org/3/movie/popular?api_key=" + apikey + "&language=ja";
var connectionUrl = process.env.CONNECTION_URL;
if (!connectionUrl) {
    throw new Error("CONNECTION_URLが未設定です。");
}
var createRegistData = function (body, user) {
    var datetime = new Date();
    return {
        user_mail: user,
        published: datetime,
        release: body.release,
        title: body.title,
        poster: body.poster,
    };
};
// api取得url
router.get("/", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var res_1, error_1, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, axios_1.default.get(url)];
            case 1:
                res_1 = _a.sent();
                obj = res_1.data.results;
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                req.flash("message", "映画情報取得時にエラーが発生しました。システム管理者へお問い合わせください。");
                res.render("./index.ejs", {
                    message: req.flash("message"),
                });
                return [3 /*break*/, 3];
            case 3:
                data = {
                    list: obj,
                };
                res.render("./cinemas/index.ejs", data);
                return [2 /*return*/];
        }
    });
}); });
router.post("/posts/regist/confirm", function (req, res) {
    var tokens = new csrf_1.default();
    tokens.secret(function (error, secret) {
        var token = tokens.create(secret);
        req.session._csrf = secret;
        res.cookie("_csrf", token);
        var data = req.body;
        res.render("./cinemas/posts/regist-confirm.ejs", {
            data: data,
            message: req.flash("message"),
        });
    });
});
router.post("/posts/regist/execute", function (req, res, next) {
    var secret = req.session._csrf || "csrf";
    var token = req.cookies._csrf;
    // secret,tokenの組み合わせチェック
    var tokens = new csrf_1.default();
    if (tokens.verify(secret, token) === false) {
        throw new Error("Invalid Token.");
    }
    mongodb_1.MongoClient.connect(connectionUrl, function (error, client) { return __awaiter(void 0, void 0, void 0, function () {
        var db, userInf, countData, data_1, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!client) return [3 /*break*/, 8];
                    db = client.db(process.env.DATABASE);
                    userInf = req.user || "user";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, 7, 8]);
                    return [4 /*yield*/, db
                            .collection("video_info")
                            .find({ title: req.body.title })
                            .count()];
                case 2:
                    countData = _a.sent();
                    data_1 = createRegistData(req.body, userInf);
                    if (!(countData !== 0)) return [3 /*break*/, 3];
                    next();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, db.collection("video_info").insertOne(data_1)];
                case 4:
                    _a.sent();
                    res.redirect("/cinemas/posts/regist/complete");
                    _a.label = 5;
                case 5: return [3 /*break*/, 8];
                case 6:
                    error_2 = _a.sent();
                    req.flash("message", "登録時にエラーが発生しました。");
                    res.render("./cinemas/posts/regist-confirm.ejs", {
                        data: data,
                        message: req.flash("message"),
                    });
                    return [3 /*break*/, 8];
                case 7:
                    client.close();
                    return [7 /*endfinally*/];
                case 8: return [2 /*return*/];
            }
        });
    }); });
}, function (req, res) {
    var userInf = req.user || "user";
    var data = createRegistData(req.body, userInf);
    req.flash("message", "既に登録済みです。");
    res.render("./cinemas/posts/regist-confirm.ejs", {
        data: data,
        message: req.flash("message"),
    });
});
router.get("/posts/regist/complete", function (req, res) {
    delete req.session._csrf;
    res.clearCookie("_csrf");
    res.render("./cinemas/posts/regist-complete.ejs");
});
exports.default = router;
