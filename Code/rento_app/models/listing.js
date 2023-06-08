const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imagePath: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  contactN: {
    type: String,
    required: true,
  },
  contactP: {
    type: String,
    required: true,
  },
  contactE: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
  },
  available: {
    type: Boolean,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Listing", productSchema);