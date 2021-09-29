"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var accountcontrol_js_1 = __importDefault(require("../lib/security/accountcontrol.js"));
var router = express_1.default.Router();
router.get("/", function (req, res) {
    res.render("./login.ejs", { message: req.flash("message") });
});
router.post("/", accountcontrol_js_1.default.authenticate(), function (req, res) {
    res.render("./login.ejs", { message: req.flash("message") });
});
router.get("/login/success", function (req, res) {
    res.render("./index.ejs", { message: req.flash("message") });
});
router.post("/logout", accountcontrol_js_1.default.authenticate(), function (req, res) {
    req.logout();
    res.redirect("/");
});
exports.default = router;
