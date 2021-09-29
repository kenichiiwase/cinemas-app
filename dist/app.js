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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv = __importStar(require("dotenv"));
dotenv.config();
var express_1 = __importDefault(require("express"));
var method_override_1 = __importDefault(require("method-override"));
var connect_flash_1 = __importDefault(require("connect-flash"));
var express_session_1 = __importDefault(require("express-session"));
var cookie_parser_1 = __importDefault(require("cookie-parser"));
var index_js_1 = __importDefault(require("./routes/index.js"));
var cinemas_js_1 = __importDefault(require("./routes/cinemas.js"));
var bookmark_js_1 = __importDefault(require("./routes/bookmark.js"));
var trends_js_1 = __importDefault(require("./routes/trends.js"));
var user_js_1 = __importDefault(require("./routes/user.js"));
var accountcontrol_1 = __importDefault(require("./lib/security/accountcontrol"));
var app = (0, express_1.default)();
var sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
    throw new Error("SESSION_SECRETが未設定です。");
}
app.use("/public", express_1.default.static(__dirname + "/public"));
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
app.use((0, method_override_1.default)("_method"));
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
// 配列を分割代入
app.use.apply(app, accountcontrol_1.default.initialize());
app.use("/", index_js_1.default);
app.use("/cinemas/", cinemas_js_1.default);
app.use("/bookmark/", bookmark_js_1.default);
app.use("/trends/", trends_js_1.default);
app.use("/user/", user_js_1.default);
app.listen(3000);
