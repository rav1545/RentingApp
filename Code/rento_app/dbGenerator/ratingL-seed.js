const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const Rating = require("../models/rating");
const Listing = require("../models/listing");
const mongoose = require("mongoose");
const connectDB = require("./../config/db");
connectDB();

async function seedDB() {
  async function seedRating() {
    try {
      const listing = await Listing.find();
      for (let i = 0; i < 68; i++) {
        let rating = new Rating({
          listing: listing[i]._id,
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