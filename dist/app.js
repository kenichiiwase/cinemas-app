"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const method_override_1 = __importDefault(require("method-override"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const express_session_1 = __importDefault(require("express-session"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const index_1 = __importDefault(require("./routes/index"));
const cinemas_1 = __importDefault(require("./routes/cinemas"));
const bookmark_1 = __importDefault(require("./routes/bookmark"));
const trends_1 = __importDefault(require("./routes/trends"));
const user_1 = __importDefault(require("./routes/user"));
const accountcontrol_1 = __importDefault(require("./lib/security/accountcontrol"));
const app = (0, express_1.default)();
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error('SESSION_SECRETが未設定です。');
}
app.use('/public', express_1.default.static(`${__dirname}/public`));
// 認証情報の保存復元
app.use((0, cookie_parser_1.default)());
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
}));
// メッセージを表示するため
app.use((0, connect_flash_1.default)());
// delete,put読み込む際に使用。
app.use((0, method_override_1.default)('_method'));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// 配列を分割代入
app.use(...accountcontrol_1.default.initialize());
app.use('/', index_1.default);
app.use('/cinemas/', cinemas_1.default);
app.use('/bookmark/', bookmark_1.default);
app.use('/trends/', trends_1.default);
app.use('/user/', user_1.default);
app.listen(3000);
