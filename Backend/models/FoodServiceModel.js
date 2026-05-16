import mongoose from "mongoose";

const foodServiceSchema = new mongoose.Schema(
  {
    guestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    roomNo: {
      type: String,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },
    breakfast: {
      selected: { type: Boolean, default: false },
      items: [{ type: String }],
      price: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
    },
    lunch: {
      selected: { type: Boolean, default: false },
      items: [{ type: String }],
      price: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
    },
    dinner: {
      selected: { type: Boolean, default: false },
      items: [{ type: String }],
      price: { type: Number, default: 0 },
      completed: { type: Boolean, default: false },
    },
    totalPrice: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed"],
      default: "Pending",
    },
    specialInstructions: {
      type: String,
    },
  },
  { timestamps: true }
);

const FoodService = mongoose.model("FoodService", foodServiceSchema);
export default FoodService;
