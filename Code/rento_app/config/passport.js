const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("../models/account");
const Rating = require("../models/ratingAcc");
const {faker} = require("@faker-js/faker");

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) { 
  console.log("Deserializing User")
  try{
    User.findById(id).then(user => {
    done(null, user); 
    });
  } catch (err) {
    done(err);
  }
});
  /*
  passport.deserializeUser(function(id, done) { 
  User.findById(id, function (err, user) {
     done(err, user); 
    }); 
  });
passport.deserializeUser((id, done) =>{
  User.findById(id, (err, user)).then(function (user){
    done(err, user);
  })
  .catch(function (err) {
    console.log(err);
  });
});
*/
passport.use(
  "local.signup",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (user) {
          return done(null, false, { message: "Email already exists" });
        }
        if (password != req.body.password2) {
          return done(null, false, { message: "Passwords must match" });
        }
        const newUser = await new User();
        newUser.email = email;
        newUser.password = newUser.encryptPassword(password);
        newUser.fullname = req.body.name;
        newUser.phone = req.body.phone
        newUser.accountId = faker.helpers.replaceSymbolWithNumber("####-##########"),
        await newUser.save();
        const newRating = await new Rating();
        newRating.account = newUser._id;
        await newRating.save();
        return done(null, newUser);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);

passport.use(
  "local.signin",
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      passReqToCallback: false,
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email: email });
        if (!user) {
          return done(null, false, { message: "Account doesn't exist" });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: "Wrong password" });
        }
        return done(null, user);
      } catch (error) {
        console.log(error);
        return done(error);
      }
    }
  )
);