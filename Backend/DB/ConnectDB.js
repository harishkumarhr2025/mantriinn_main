import mongoose from "mongoose";

const connectDB = async (url) => {
  try {
    await mongoose.connect(url);
    console.log("DB connected..");
  } catch (error) {
    console.log("Error in database connection");
  }
};

export default connectDB;
