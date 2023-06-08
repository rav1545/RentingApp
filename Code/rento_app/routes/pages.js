const express = require("express");
const csrf = require("tiny-csrf");
const nodemailer = require("nodemailer");
const router = express.Router();

const {
  userContactUsValidationRules,
  validateContactUs,
} = require("../config/validator");
const csrfProtection = csrf("123456789iamasecret987654321look");
router.use(csrfProtection);

//GET: display abous us page
router.get("/aboutus", (req, res) => {
  res.render("pages/aboutus", {
    pageName: "About Us",
  });
});

//GET: display shipping policy page
router.get("/policy", (req, res) => {
  res.render("pages/policy", {
    pageName: "RentO's Policy",
  });
});

//GET: display contact us page and form with csrf tokens
router.get("/contactus", (req, res) => {
  const successMsg = req.flash("success")[0];
  const errorMsg = req.flash("error");
  res.render("pages/contactus", {
    pageName: "Contact Us",
    csrfToken: req.csrfToken(),
    successMsg,
    errorMsg,
  });
});

//POST: handle contact us form logic using nodemailer
router.post(
  "/contactus",
  [userContactUsValidationRules(), validateContactUs],
  (req, res) => {
    // instantiate the SMTP server
    const smtpTrans = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        // company's email and password
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // email options
    const mailOpts = {
      from: req.body.email,
      to: process.env.GMAIL_EMAIL,
      subject: `RentO Enquiry from ${req.body.name}`,
      html: `
      <div>
      <h2 style="color: #457B9D; text-align:center;">Client's name: ${req.body.name}</h2>
      <h3 style="color: #457B9D;">Client's email: (${req.body.email})<h3>
      </div>
      <h3 style="color: #457B9D;">Client's message: </h3>
      <div style="font-size: 30;">
      ${req.body.message}
      </div>
      `,
    };

    // send the email
    smtpTrans.sendMail(mailOpts, (error, response) => {
      if (error) {
        req.flash(
          "error",
          "An error occured... Please check your internet connection and try again later"
        );
        return res.redirect("/pages/contactus");
      } else {
        req.flash(
          "success",
          "Email sent successfully! Thanks for your inquiry."
        );
        return res.redirect("/pages/contactus");
      }
    });
  }
);

module.exports = router;