const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Account = require("../models/account");
const Category = require("../models/category");
const mongoose = require("mongoose");
const {faker} = require("@faker-js/faker");
const connectDB = require("./../config/db");
connectDB();

async function seedDB() {
  faker.seed(0);

  //----------------------Email
  const email_address = [
    "cristian50ramirez@yaoo.com",
    "Cr4zy50@gmail.com",
    "crazycr07@yahoo.com",
    "ghett0_cris50@hotmail.com",
    "Undertaker@wwe.org",
    "rey.619.mysterio@raw.com",
    "walter67@imperium.org",
    "sin.verguenza@yahoo.com",
    "m4nk1nd.smackdown@gmail.com",
  ];

  //----------------------Password
  const passwords = [
    "Password11111",
    "Password22222",
    "Password33333",
    "Password44444",
    "Password55555",
    "Password66666",
    "Password77777",
    "Password88888",
    "Password99999",
  ];

  //--------------------Full name
  const full_names = [
    "Noel Ramirez",
    "Bill Gates",
    "Luke Skywalker",
    "Tom Hanks",
    "Jason Lee",
    "Ric Flair",
    "The Mankind",
    "Undertaker",
    "Rey Mysrterio",
  ];

  //--------------------Phone number
  const phone_numbers = [
    "(818)675-6932",
    "(818)675-6933",
    "(818)675-6934",
    "(818)675-6935",
    "(818)675-6936",
    "(818)675-6937",
    "(818)675-6938",
    "(818)675-6939",
    "(818)675-6940",
  ];

  async function seedProducts(emailArr, passwordArr, nameArr, phoneArr) {
    try {
      for (let i = 0; i < emailArr.length; i++) {
        let acc = new Account({
          accountId: faker.helpers.replaceSymbolWithNumber("####-##########"),
          email: emailArr[i],
          password: passwordArr[i],
          fullname: nameArr[i],
          phone: phoneArr[i],
        });
        await acc.save();
      }
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async function closeDB() {
    console.log("CLOSING CONNECTION");
    await mongoose.disconnect();
  }

  await seedProducts(email_address, passwords, full_names, phone_numbers);
  await closeDB();
}

seedDB();