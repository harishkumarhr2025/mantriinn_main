import mongoose from "mongoose";

const laundryRequestSchema = new mongoose.Schema(
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
    clothType: {
      type: [String],
      required: true,
    },
    numberOfItems: {
      type: Number,
      required: true,
      min: 1,
    },
    washType: {
      type: String,
      enum: ["Gentle Wash", "Normal Wash", "Heavy Duty Wash", "Dry Clean"],
      required: true,
    },
    takenTime: {
      type: Date,
      default: Date.now,
    },
    deliveryTime: {
      type: Date,
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
    emergencyCharge: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Completed", "Delivered"],
      default: "Pending",
    },
    specialInstructions: {
      type: String,
    },
  },
  { timestamps: true }
);

const LaundryRequest = mongoose.model("LaundryRequest", laundryRequestSchema);
export default LaundryRequest;
