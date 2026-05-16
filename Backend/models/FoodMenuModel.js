import mongoose from "mongoose";

const foodMenuSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
  breakfast: {
    items: [
      {
        name: { type: String, required: true },
        description: { type: String }, // e.g., "Idli with Sambar and Chutney"
        price: { type: Number, required: true },
        quantity: { type: Number, default: 0 }, // Available plates
        category: { type: String, enum: ['Main', 'Beverage', 'Side'], default: 'Main' },
      },
    ],
  },
  lunch: {
    items: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 0 },
        category: { type: String, enum: ['Main', 'Beverage', 'Side'], default: 'Main' },
      },
    ],
  },
  dinner: {
    items: [
      {
        name: { type: String, required: true },
        description: { type: String },
        price: { type: Number, required: true },
        quantity: { type: Number, default: 0 },
        category: { type: String, enum: ['Main', 'Beverage', 'Side'], default: 'Main' },
      },
    ],
  },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const FoodMenu = mongoose.model("FoodMenu", foodMenuSchema);
export default FoodMenu;
