const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const RatingAcc = require("../models/ratingAcc");
const Account = require("../models/account");
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
connectDB();

async function seedDB() {
  async function seedRating() {
    try {
      const account = await Account.find();
      for (let i = 0; i < 10; i++) {
        let rating = new RatingAcc({
          account: account[i]._id,
        });
      await rating.save();
      console.log(rating.get( 'ratings', null, {getters: false}))
      console.log(rating.ratings)
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
  await seedRating();

  await closeDB();
}

seedDB();