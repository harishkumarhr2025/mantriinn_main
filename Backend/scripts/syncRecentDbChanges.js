import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../DB/ConnectDB.js";
import Guest from "../models/GuestModel.js";
import User from "../models/AuthModel.js";
import WhatsAppTemplate from "../models/WhatsAppTemplateModel.js";

dotenv.config();

const extractVariables = (body = "") => {
  const matches = body.match(/\{\{(\w+)\}\}/g) || [];
  return [...new Set(matches.map((m) => m.replace(/[{}]/g, "")))];
};

const upsertTemplate = async ({ name, category, body, isActive = true }) => {
  const variables = extractVariables(body);
  const result = await WhatsAppTemplate.findOneAndUpdate(
    { name },
    { $set: { category, body, variables, isActive } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  return result;
};

const runMigration = async () => {
  const mongoUrl = process.env.MONGO_URL_PROD || process.env.MONGO_URI;
  if (!mongoUrl) {
    throw new Error("MONGO_URL_PROD or MONGO_URI is missing in environment variables");
  }

  await connectDB(mongoUrl);

  // 1) Backfill Guest collection with newly added fields/defaults.
  const guestUpdates = [];
  const pushGuestUpdate = async (field, query, update) => {
    const res = await Guest.updateMany(query, update);
    guestUpdates.push({ field, modified: res.modifiedCount });
  };

  await pushGuestUpdate("date_of_birth", { date_of_birth: { $exists: false } }, { $set: { date_of_birth: null } });
  await pushGuestUpdate("registration_fee", { registration_fee: { $exists: false } }, { $set: { registration_fee: 0 } });
  await pushGuestUpdate("advance_deposit", { advance_deposit: { $exists: false } }, { $set: { advance_deposit: 0 } });
  await pushGuestUpdate("meal_plan", { meal_plan: { $exists: false } }, { $set: { meal_plan: [] } });
  await pushGuestUpdate("checkoutReminderSent", { checkoutReminderSent: { $exists: false } }, { $set: { checkoutReminderSent: false } });
  await pushGuestUpdate("GSTAmount", { GSTAmount: { $exists: false } }, { $set: { GSTAmount: 0 } });
  await pushGuestUpdate("totalRoomRent", { totalRoomRent: { $exists: false } }, { $set: { totalRoomRent: 0 } });
  await pushGuestUpdate("grand_total", { grand_total: { $exists: false } }, { $set: { grand_total: 0 } });

  // 2) Upsert/refresh WhatsApp templates added recently.
  const templatesToSync = [
    {
      name: "Checkout Confirmation",
      category: "checkout",
      body: `Dear {{guest_name}},\n\nThank you for staying at Mantri In! 🙏\n\nWe hope to see you again soon. Have a safe journey!\n\nWarm regards,\nTeam Mantri In`,
      isActive: true,
    },
    {
      name: "Birthday Wish(1 day before)",
      category: "reminder",
      body: `Dear {{guest_name}},\n\nYour special day is almost here! 🎂\n\nWishing you joy and happiness in advance from all of us at {{hotel_name}}.\n\nWarm wishes,\nTeam {{hotel_name}}`,
      isActive: true,
    },
    {
      name: "Birthday wish(on the day)",
      category: "reminder",
      body: `Dear {{guest_name}},\n\nHappy Birthday! 🎉🎂\n\nMay your day be filled with happiness and wonderful moments.\n\nBest wishes from\nTeam {{hotel_name}}`,
      isActive: true,
    },
  ];

  const templateResults = [];
  for (const tpl of templatesToSync) {
    const saved = await upsertTemplate(tpl);
    templateResults.push(saved.name);
  }

  // 3) Access-control role cleanup: merge deprecated salonfrontoffice into semi admin.
  const roleCleanup = await User.updateMany(
    { role: "salonfrontoffice" },
    { $set: { role: "semi admin" } }
  );

  console.log("✅ Sync complete for recent DB changes");
  console.log("\nGuest field backfill:");
  guestUpdates.forEach((item) => {
    console.log(`- ${item.field}: ${item.modified} document(s) updated`);
  });

  console.log("\nTemplates upserted:");
  templateResults.forEach((name) => {
    console.log(`- ${name}`);
  });

  console.log("\nRole cleanup:");
  console.log(`- salonfrontoffice -> semi admin: ${roleCleanup.modifiedCount} user(s) updated`);
};

runMigration()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Migration failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  });
