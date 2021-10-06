"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const accountcontrol_1 = __importDefault(require("../lib/security/accountcontrol"));
const router = express_1.default.Router();
router.get('/', (req, res) => {
    res.render('./login.ejs', { message: req.flash('message') });
});
router.post('/', accountcontrol_1.default.authenticate(), (req, res) => {
    res.render('./login.ejs', { message: req.flash('message') });
});
router.get('/login/success', (req, res) => {
    res.render('./index.ejs', { message: req.flash('message') });
});
router.post('/logout', accountcontrol_1.default.authenticate(), (req, res) => {
    req.logout();
    res.redirect('/');
});
exports.default = router;
