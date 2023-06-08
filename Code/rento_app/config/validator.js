const { check, validationResult } = require("express-validator");

const userSignUpValidationRules = () => {
  return [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Invalid email").not().isEmpty().isEmail(),
    check("phone", "Invalid phone").not().isEmpty(),
    check("password", "Please enter a password with 8 or more characters")
      .not()
      .isEmpty()
      .isLength({ min: 8 }),
  ];
};

const userSignInValidationRules = () => {
  return [
    check("email", "Invalid email").not().isEmpty().isEmail(),
    check("password", "Invalid password").not().isEmpty().isLength({ min: 8 }),
  ];
};

const userContactUsValidationRules = () => {
  return [
    check("name", "Please enter a name").not().isEmpty(),
    check("email", "Please enter a valid email address")
      .not()
      .isEmpty()
      .isEmail(),
    check("message", "Please enter a message with at least 10 words")
      .not()
      .isEmpty()
      .isLength({ min: 10 }),
  ];
};

const validateSignup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash("error", messages);
    return res.redirect("/account/signup");
  }
  next();
};

const validateSignin = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    req.flash("error", messages);
    return res.redirect("/account/signin");
  }
  next();
};

const validateContactUs = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    var messages = [];
    errors.array().forEach((error) => {
      messages.push(error.msg);
    });
    console.log(messages);
    req.flash("error", messages);
    return res.redirect("/pages/contactus");
  }
  next();
};

module.exports = {
  userSignUpValidationRules,
  userSignInValidationRules,
  userContactUsValidationRules,
  validateSignup,
  validateSignin,
  validateContactUs,
};