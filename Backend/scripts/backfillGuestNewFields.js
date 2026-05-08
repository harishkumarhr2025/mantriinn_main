import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../DB/ConnectDB.js";
import Guest from "../models/GuestModel.js";

dotenv.config();

const runMigration = async () => {
  const mongoUrl = process.env.MONGO_URL_PROD || process.env.MONGO_URI;

  if (!mongoUrl) {
    throw new Error("MONGO_URL_PROD or MONGO_URI is missing in environment variables");
  }

  await connectDB(mongoUrl);

  const updates = [];

  const dateOfBirthResult = await Guest.updateMany(
    { date_of_birth: { $exists: false } },
    { $set: { date_of_birth: null } }
  );
  updates.push(["date_of_birth", dateOfBirthResult.modifiedCount]);

  const registrationFeeResult = await Guest.updateMany(
    { registration_fee: { $exists: false } },
    { $set: { registration_fee: 0 } }
  );
  updates.push(["registration_fee", registrationFeeResult.modifiedCount]);

  const advanceDepositResult = await Guest.updateMany(
    { advance_deposit: { $exists: false } },
    { $set: { advance_deposit: 0 } }
  );
  updates.push(["advance_deposit", advanceDepositResult.modifiedCount]);

  const mealPlanResult = await Guest.updateMany(
    { meal_plan: { $exists: false } },
    { $set: { meal_plan: [] } }
  );
  updates.push(["meal_plan", mealPlanResult.modifiedCount]);

  const checkoutReminderResult = await Guest.updateMany(
    { checkoutReminderSent: { $exists: false } },
    { $set: { checkoutReminderSent: false } }
  );
  updates.push(["checkoutReminderSent", checkoutReminderResult.modifiedCount]);

  const gstAmountResult = await Guest.updateMany(
    { GSTAmount: { $exists: false } },
    { $set: { GSTAmount: 0 } }
  );
  updates.push(["GSTAmount", gstAmountResult.modifiedCount]);

  const totalRoomRentResult = await Guest.updateMany(
    { totalRoomRent: { $exists: false } },
    { $set: { totalRoomRent: 0 } }
  );
  updates.push(["totalRoomRent", totalRoomRentResult.modifiedCount]);

  const grandTotalResult = await Guest.updateMany(
    { grand_total: { $exists: false } },
    { $set: { grand_total: 0 } }
  );
  updates.push(["grand_total", grandTotalResult.modifiedCount]);

  console.log("Guest field backfill summary:");
  updates.forEach(([field, count]) => {
    console.log(`- ${field}: ${count} document(s) updated`);
  });
};

runMigration()
  .then(async () => {
    await mongoose.disconnect();
    console.log("Guest backfill migration completed successfully");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Guest backfill migration failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
