const express = require("express");
const csrf = require("tiny-csrf");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);
const Listing = require("../models/listing");
const Category = require("../models/category");
const Cart = require("../models/cart");
const Order = require("../models/order");
const middleware = require("../middleware");
const router = express.Router();

const csrfProtection = csrf("123456789iamasecret987654321look");
router.use(csrfProtection);

// GET: home page
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find({})
      .sort("-createdAt")
      .populate("category");
    res.render("main/home", { pageName: "Home", listings });
  } catch (error) {
    console.log(error);
    res.redirect("/");
  }
});

// GET: add a listing to the shopping cart when "Add to cart" button is pressed
router.get("/add-to-cart/:id", async (req, res) => {
  const productId = req.params.id;
  try {
    // get the correct cart, either from the db, session, or an empty cart.
    let user_cart;
    if (req.user) {
      user_cart = await Cart.findOne({ user: req.user._id });
    }
    let cart;
    if (
      (req.user && !user_cart && req.session.cart) ||
      (!req.user && req.session.cart)
    ) {
      cart = await new Cart(req.session.cart);
    } else if (!req.user || !user_cart) {
      cart = new Cart({});
    } else {
      cart = user_cart;
    }

    // add the listing to the cart
    const listing = await Listing.findById(productId);
    const itemIndex = cart.items.findIndex((l) => l.productId == productId);
    if (itemIndex > -1) {
      // if listing exists in the cart, inform user it's already in cart.
      req.flash("error", "Item is already in the cart!");
    } else {
      // if listing does not exists in cart, find it in the db to retrieve its price and add new item
      cart.items.push({
        productId: productId,
        price: listing.price,
        title: listing.title,
        productCode: listing.productCode,
      });
      cart.totalQty++;
      cart.totalCost += listing.price;
      req.flash("success", "Item added to the shopping cart");
    }

    // if the user is logged in, store the user's id and save cart to the db
    if (req.user) {
      cart.user = req.user._id;
      await cart.save();
    }
    req.session.cart = cart;
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});

// GET: view shopping cart contents
router.get("/shopping-cart", async (req, res) => {
  try {
    // find the cart, whether in session or in db based on the user state
    let cart_user;
    if (req.user) {
      cart_user = await Cart.findOne({ user: req.user._id });
    }
    // if user is signed in and has cart, load user's cart from the db
    if (req.user && cart_user) {
      req.session.cart = cart_user;
      return res.render("main/shopping-cart", {
        cart: cart_user,
        pageName: "Shopping Cart",
        listings: await listingsFromCart(cart_user),
      });
    }
    // if there is no cart in session and user is not logged in, cart is empty
    if (!req.session.cart) {
      return res.render("main/shopping-cart", {
        cart: null,
        pageName: "Shopping Cart",
        listings: null,
      });
    }
    // otherwise, load the session's cart
    return res.render("main/shopping-cart", {
      cart: req.session.cart,
      pageName: "Shopping Cart",
      listings: await listingsFromCart(req.session.cart),
    });
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});


// GET: remove listing from the cart
router.get("/remove/:id", async function (req, res, next) {
  const productId = req.params.id;
  let cart;
  try {
    if (req.user) {
      cart = await Cart.findOne({ user: req.user._id });
    } else if (req.session.cart) {
      cart = await new Cart(req.session.cart);
    }
    //fnd the item with productId
    let itemIndex = cart.items.findIndex((l) => l.productId == productId);
    if (itemIndex > -1) {
      //find the product to find its price
      cart.totalQty -= 1;
      cart.totalCost -= cart.items[itemIndex].price;
      await cart.items.remove({ _id: cart.items[itemIndex]._id });
    }
    req.session.cart = cart;
    //save the cart it only if user is logged in
    if (req.user) {
      await cart.save();
    }
    //delete cart if qty is 0
    if (cart.totalQty <= 0) {
      req.session.cart = null;
      await Cart.findByIdAndRemove(cart._id);
    }
    res.redirect(req.headers.referer);
  } catch (err) {
    console.log(err.message);
    res.redirect("/");
  }
});


// GET: checkout form with csrf token
router.get("/checkout", middleware.isLoggedIn, async (req, res) => {
  const errorMsg = req.flash("error")[0];

  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  //load the cart with the session's cart's id from the db
  cart = await Cart.findById(req.session.cart._id);

  const errMsg = req.flash("error")[0];
  res.render("main/checkout", {
    total: Math.floor((cart.totalCost + (cart.totalCost * 0.015)) * 100) / 100,
    csrfToken: req.csrfToken(),
    errorMsg,
    pageName: "Checkout",
  });
});

// POST: handle checkout logic and payment using Stripe
router.post("/checkout", middleware.isLoggedIn, async (req, res) => {
  if (!req.session.cart) {
    return res.redirect("/shopping-cart");
  }
  const cart = await Cart.findById(req.session.cart._id);
  stripe.charges.create(
    {
      amount: cart.totalCost * 100,
      currency: "usd",
      source: req.body.stripeToken,
      description: "Test charge",
    },
    function (err, charge) {
      if (err) {
        req.flash("error", err.message);
        console.log(err);
        return res.redirect("/checkout");
      }
      const order = new Order({
        user: req.user,
        cart: {
          totalQty: cart.totalQty,
          totalCost: cart.totalCost,
          items: cart.items,
        },
        address: req.body.address,
        paymentId: charge.id,
      });
        order.save().then(()=>{
          cart.save();
        
          const beingRented = async (id) => {
            try {
              const updatedresult = await Listing.findByIdAndUpdate(
                {_id: id},
                {
                  $set: {available: false},
                },
              );
              console.log(updatedresult);
            } catch (error) {
              console.log(error);
            }
          }

          for (let i = 0; i < cart.totalQty; i++) {
            beingRented(cart.items[i].productId);
          }

          Cart.findByIdAndDelete(cart._id);
          req.flash("success", "Successfully purchased");
          req.session.cart = null;
          res.redirect("/account/account");
      }).catch((err)=>{
          console.log(err);
          res.redirect("/checkout");
      });
    }
  );
});

// create listings array to store the info of each product in the cart
async function listingsFromCart(cart) {
  let listings = []; // array of objects
  for (const item of cart.items) {
    let foundListing = (
      await Listing.findById(item.productId).populate("category")
    ).toObject();
    foundListing["totalPrice"] = item.price;
    listings.push(foundListing);
  }
  return listings;
}

module.exports = router;