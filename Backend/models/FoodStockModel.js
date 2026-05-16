import mongoose from "mongoose";

const foodStockSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      unique: true,
      index: true,
    },
    stocks: [
      {
        itemName: { type: String, required: true },
        unit: { type: String, default: 'KG' }, // KG, Liters, Pieces, etc.
        preparedQuantity: { type: Number, required: true, default: 0 },
        consumedQuantity: { type: Number, default: 0 },
        remainingQuantity: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true }
);

// Calculate remaining quantity before saving
foodStockSchema.pre('save', function(next) {
  this.stocks.forEach(stock => {
    stock.remainingQuantity = stock.preparedQuantity - stock.consumedQuantity;
  });
  next();
});

const FoodStock = mongoose.model("FoodStock", foodStockSchema);
export default FoodStock;
