const router = require("express").Router();
const { authenticate } = require("../lib/security/accountcontrol.js");

router.get("/", (req, res) => {
  res.render("./login.ejs", { message: req.flash("message") });
});

router.post("/", authenticate(), (req, res) => {
  res.render("./login.ejs", { message: req.flash("message") });
});

router.get("/login/success", (req, res) => {
  res.render("./index.ejs", { message: req.flash("message") });
});

router.post("/logout", authenticate(), (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = router;
