import mongoose from "mongoose";

const guestUserSchema = new mongoose.Schema({
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Guest",
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userType: {
    type: String,
    default: "guest",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GuestUser = mongoose.model("GuestUser", guestUserSchema);
export default GuestUser;
