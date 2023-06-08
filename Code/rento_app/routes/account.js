const express = require("express");
const router = express.Router();
const csrf = require("tiny-csrf");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const Listing = require("../models/listing");
const Account = require("../models/account");
const RatingList = require("../models/rating");
const RatingAcc = require("../models/ratingAcc");
const Category = require("../models/category")
const Order = require("../models/order");
const Cart = require("../models/cart");
const middleware = require("../middleware");
const {faker} = require("@faker-js/faker");

//Populate the condition and rules from the validator file.
const {
  userSignUpValidationRules,
  userSignInValidationRules,
  validateSignup,
  validateSignin,
} = require("../config/validator");
const csrfProtection = csrf("123456789iamasecret987654321look");
router.use(csrfProtection);

// GET: display the signup form with csrf token
router.get("/signup", middleware.isNotLoggedIn, (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("account/signup", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign Up",
  });
});

// POST: handle the signup logic
router.post(
  "/signup",
  [
    middleware.isNotLoggedIn,
    userSignUpValidationRules(),
    validateSignup,
    passport.authenticate("local.signup", {
      successRedirect: "/account/account",
      failureRedirect: "/account/signup",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
      //if there is cart session, save it to the user's cart in db

      if (req.session.cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // redirect to the previous URL
      if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect("/account/account");
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/");
    }
  }
);

// GET: display the signin form with csrf token
router.get("/signin", middleware.isNotLoggedIn, async (req, res) => {
  var errorMsg = req.flash("error")[0];
  res.render("account/signin", {
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Sign In",
  });
});

// POST: handle the signin logic
router.post(
  "/signin",
  [
    middleware.isNotLoggedIn,
    userSignInValidationRules(),
    validateSignin,
    passport.authenticate("local.signin", {
      failureRedirect: "/account/signin",
      failureFlash: true,
    }),
  ],
  async (req, res) => {
    try {
      // cart logic when the user logs in
      let cart = await Cart.findOne({ user: req.user._id });
      // if there is a cart session and user has no cart, save it to the user's cart in db
      if (req.session.cart && !cart) {
        const cart = await new Cart(req.session.cart);
        cart.user = req.user._id;
        await cart.save();
      }
      // if user has a cart in db, load it to session
      if (cart) {
        req.session.cart = cart;
      }
      // redirect to old URL before signing in
      if (req.session.oldUrl) {
        var oldUrl = req.session.oldUrl;
        req.session.oldUrl = null;
        res.redirect(oldUrl);
      } else {
        res.redirect("/account/account");
      }
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/");
    }
  }
);

// GET: display user's profile
router.get("/account", middleware.isLoggedIn, async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  try {
    // find all orders of this user
    allOrders = await Order.find({ user: req.user });
    // Find all listings this user has created
   let allListings = await Listing.find({ owner: req.user }).populate("category");
    // Find rating for this User
   let rating = await RatingAcc.find({account: req.user});
    //Find Account Details
    let account = await Account.find({_id: req.user});
    res.render("account/account", {
      orders: allOrders,
      listings: allListings,
      rating: rating,
      account: account,
      errorMsg,
      successMsg,
      pageName: "Account Profile",
    });
  } catch (err) {
    console.log(err);
    return res.redirect("/");
  }
});

// GET: display create page
router.get("/create", (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error");
  res.render("account/create", {
    pageName: "Create a Listing",
    csrfToken: req.csrfToken(),
    successMsg,
    errorMsg,
  });
});

//POST: Create Listing
router.post("/create", async (req, res) => {
    try {
      faker.seed(0);
      const categ = await Category.findOne({ title: req.body.category});
      console.log(req.body.category);  
      console.log(categ); 
      const newListing = await new Listing({
        productCode: faker.helpers.replaceSymbolWithNumber("####-##########"),
        title: req.body.title,
        description: req.body.description,
        imagePath: req.body.image,
        price: req.body.price,
        contactN: req.user.fullname,
        contactP: req.user.phone,
        contactE: req.user.email,
        location: req.body.location,
        available: true,
        category: categ._id,
        owner: req.user._id,
      });
      await newListing.save();
      const newRatingList = await new RatingList({
        listing: newListing._id,
      })
      newRatingList.save();
      res.redirect("/account/account");
    } catch (err) {
      console.log(err);
      req.flash("error", err.message);
      return res.redirect("/");
    }
  }
);

// GET: logout
router.get("/logout", middleware.isLoggedIn, (req, res) => {
  req.logout(function(err) {
    if (err) { return next(err);}
    req.session.cart = null;
    res.redirect("/");
  });
});
module.exports = router;