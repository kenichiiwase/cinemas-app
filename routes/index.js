const router = require('express').Router();
const tokens = require('csrf')();
const { authenticate } = require('../lib/security/accountcontrol.js');

router.get('/', (req, res) => {
  res.render('./login.ejs', { message: req.flash('message') });
});

router.post('/', authenticate(), (req, res) => {
  res.render('./login.ejs', { message: req.flash('message') });
});

router.get('/login/success', (req, res) => {
  tokens.secret((error, secret) => {
    // secretに対応する新規tokenを生成
    const token = tokens.create(secret);
    // secretはsession保持
    req.session._csrf = secret;
    // tokenはcookie保持
    res.cookie('_csrf', token);
    res.render('./index.ejs', { message: req.flash('message') });
  });
});

router.post('/logout', authenticate(), (req, res) => {
  req.logout();
  res.redirect('/');
});

module.exports = router;
