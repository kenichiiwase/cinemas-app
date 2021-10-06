"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const passport_1 = __importDefault(require("passport"));
const passportLocal = __importStar(require("passport-local"));
const mongodb_1 = require("mongodb");
const hash_1 = __importDefault(require("./hash"));
const LocalStrategy = passportLocal.Strategy;
const connectionUrl = process.env.CONNECTION_URL;
if (!connectionUrl) {
    throw new Error('CONNECTION_URLが未設定です。');
}
// サーバーからクライアントへ保存する処理
passport_1.default.serializeUser((email, done) => {
    done(null, email);
});
// クライアントからサーバーへ復元する処理
passport_1.default.deserializeUser((email, done) => {
    mongodb_1.MongoClient.connect(connectionUrl, (error, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (client) {
            const db = client.db(process.env.DATABSE);
            try {
                const user = yield db.collection('users').findOne({ email });
                done(null, user);
            }
            catch (_a) {
                done(error);
            }
            finally {
                client.close();
            }
        }
    }));
});
// ログインボタン押下された際の処理
passport_1.default.use('local-strategy', new LocalStrategy({
    // formのname値,コールバックにリクエストオブジェクトを渡す
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true,
}, (req, username, password, done) => {
    mongodb_1.MongoClient.connect(connectionUrl, (error, client) => __awaiter(void 0, void 0, void 0, function* () {
        if (client) {
            const db = client.db(process.env.DATABSE);
            try {
                const userData = yield db.collection('users').findOne({
                    email: username,
                    password: hash_1.default.digest(password),
                });
                if (userData) {
                    // セッションIDの張替え
                    req.session.regenerate((error) => {
                        if (error) {
                            done(null, false, {
                                message: 'システムエラー。管理者にお問い合わせください。',
                            });
                        }
                        else {
                            done(null, userData.email);
                        }
                    });
                }
                else {
                    done(null, false, {
                        message: 'ユーザー名 または パスワード が間違っています。',
                    });
                }
            }
            catch (_a) {
                done(null, false, {
                    message: 'システムエラー。管理者にお問い合わせください。',
                });
            }
            finally {
                client.close();
            }
        }
    }));
}));
// app.use()に渡す。
const initialize = () => [passport_1.default.initialize(), passport_1.default.session()];
const authenticate = () => passport_1.default.authenticate('local-strategy', {
    successRedirect: '/login/success',
    failureRedirect: '/',
});
exports.default = {
    initialize,
    authenticate,
};
