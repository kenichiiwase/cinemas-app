import express from "express";
import accountControl from "../lib/security/accountcontrol";

const router = express.Router();

router.get("/", (req: express.Request, res: express.Response) => {
  res.render("./login.ejs", { message: req.flash("message") });
});

router.post(
  "/",
  accountControl.authenticate(),
  (req: express.Request, res: express.Response) => {
    res.render("./login.ejs", { message: req.flash("message") });
  },
);

router.get("/login/success", (req: express.Request, res: express.Response) => {
  res.render("./index.ejs", { message: req.flash("message") });
});

router.post(
  "/logout",
  accountControl.authenticate(),
  (req: express.Request, res: express.Response) => {
    req.logout();
    res.redirect("/");
  },
);

export default router;
