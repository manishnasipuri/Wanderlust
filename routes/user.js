const express = require('express');
const router = express.Router({mergeParams: true});
const User = require("../models/user.js");
const wrapAsync = require('../utils/wrapAsync.js');
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");


router.get("/signup", (req, res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", wrapAsync(async (req, res, next) => {
    try {
    let {username, email, password} = req.body;
    const newUser =  new User({username, email});
    const registeredUser = await User.register(newUser, password );
    console.log(registeredUser);
    res.login(registeredUser, err => {
        if(err) return next(err);
         req.flash("success", "Welcome to WonderLust");
         res.redirect("/listings");
    });
   
    } catch(e) {
        req.flash("error", e.message);
        res.redirect("/signup");
    }
}));




router.get("/login", (req, res) => {
    res.render("users/login.ejs");
});

router.post("/login",saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), async (req, res) => {
    req.flash("success", "Welcome back to Wonderlust");
    res.redirect(res.locals.redirectUrl || "/listings");  
});


router.get("/logout", (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        req.flash("success", "You have been logged out");
        res.redirect("/listings" );
    });
});

module.exports = router;