const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI
    await mongoose
      .connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .catch((error) => console.log(error));
    const client = mongoose.connection.getClient();
    console.log("MongDB CONNECTED SUCCESSFULLY!");
    return client;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = connectDB;