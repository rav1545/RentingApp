const express = require("express");
const router = express.Router();
const Listing = require("../models/listing");
const RatingListing = require("../models/rating");
const Category = require("../models/category");
var moment = require("moment");

// GET: display all products
router.get("/", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const listings = await Listing.find({})
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Listing.count();

    res.render("main/index", {
      pageName: "All Listings",
      listings,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/listing/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// GET: search box
router.get("/search", async (req, res) => {
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];

  try {
    const listings = await Listing.find({
      title: { $regex: req.query.search, $options: "i" },
    })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category")
      .exec();
    const count = await Listing.count({
      title: { $regex: req.query.search, $options: "i" },
    });
    res.render("main/index", {
      pageName: "Search Results",
      listings,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: null,
      home: "/listings/search?search=" + req.query.search + "&",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

//GET: get a certain category by its slug (this is used for the categories navbar)
router.get("/:slug", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  const perPage = 8;
  let page = parseInt(req.query.page) || 1;
  try {
    const foundCategory = await Category.findOne({ slug: req.params.slug });
    const allListings = await Listing.find({ category: foundCategory.id })
      .sort("-createdAt")
      .skip(perPage * page - perPage)
      .limit(perPage)
      .populate("category");

    const count = await Listing.count({ category: foundCategory.id });

    res.render("main/index", {
      pageName: foundCategory.title,
      currentCategory: foundCategory,
      listings: allListings,
      successMsg,
      errorMsg,
      current: page,
      breadcrumbs: req.breadcrumbs,
      home: "/listing/" + req.params.slug.toString() + "/?",
      pages: Math.ceil(count / perPage),
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

// GET: display a certain product by its id
router.get("/:slug/:id", async (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error")[0];
  try {
    const listing = await Listing.findById(req.params.id).populate("category");
    const listingR = await RatingListing.findOne({listing: req.params.id});
    listingR.get( 'ratings', null, {getters: false});
    console.log(listingR.ratings)
    res.render("main/listing", {
      pageName: listing.title,
      listing,
      listingR,
      successMsg,
      errorMsg,
      moment: moment,
    });
  } catch (error) {
    console.log(error);
    return res.redirect("/");
  }
});

module.exports = router;