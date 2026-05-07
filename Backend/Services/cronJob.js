import cron from "node-cron";
import moment from "moment";
import {
  sendDailyReportEmail,
  generateSalonDailyReport,
} from "../controllers/ReportController.js";
import ScheduledWhatsApp from "../models/ScheduledWhatsAppModel.js";
import sendGlobal91Whatsapp from "../utils/sendGlobal91WhatsApp.js";
import Guest from "../models/GuestModel.js";

// Process pending scheduled WhatsApp messages every minute
const initScheduledWhatsAppCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      const pending = await ScheduledWhatsApp.find({
        status: "pending",
        scheduledAt: { $lte: now },
      });

      for (const msg of pending) {
        try {
          await sendGlobal91Whatsapp({ to: msg.to, body: msg.body });
          msg.status = "sent";
          msg.sentAt = new Date();
        } catch (err) {
          msg.status = "failed";
          msg.error = err.message;
        }
        await msg.save();
      }

      if (pending.length > 0) {
        console.log(`WhatsApp scheduler: processed ${pending.length} message(s)`);
      }
    } catch (err) {
      console.error("WhatsApp scheduler error:", err.message);
    }
  });
};

export const initDailyReportCron = () => {
  cron.schedule(
    "55 22 * * *", // cron time
    async () => {
      console.log("🕒 Initiating daily report generation...");
      try {
        const timezone = "Asia/Kolkata";
        const today = moment().tz("Asia/Kolkata");
        const fromDate = today.clone().startOf("day").toDate();
        const toDate = today.clone().endOf("day").toDate();
        // const fromDate = moment().tz(timezone).subtract(5, "day");

        const { data: reportData } = await generateSalonDailyReport({
          fromDate,
          toDate,
        });

        if (
          !reportData ||
          !reportData.summary ||
          reportData.summary.totalServices === 0
        ) {
          console.log("⚠️ No services found for report date");
        }
        // }
        await sendDailyReportEmail(reportData);
        console.log("✅ Daily report sent successfully");
      } catch (error) {
        console.error("❌ Daily report failed:", error.message || error);
      }
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
};

export { initScheduledWhatsAppCron };

// Send WhatsApp reminder 1 hour before checkout — runs every minute
export const initCheckoutReminderCron = () => {
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();
      // Window: guests checking out between 60 and 61 minutes from now
      const from = new Date(now.getTime() + 60 * 60 * 1000);       // +60 min
      const to   = new Date(now.getTime() + 61 * 60 * 1000);       // +61 min

      const guests = await Guest.find({
        status: { $ne: "checkout" },          // not already checked out
        checkoutReminderSent: { $ne: true },  // not already reminded
        Checkout_date: { $gte: from, $lt: to },
        Contact_number: { $exists: true, $ne: "" },
      });

      for (const guest of guests) {
        const checkoutStr = guest.Checkout_date
          ? new Date(guest.Checkout_date).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })
          : "today";

        const msg =
          `Dear ${guest.Guest_name},\n\n` +
          `This is a reminder that your checkout at Mantri In is scheduled for today (${checkoutStr})` +
          (guest.Checkout_time ? ` at ${guest.Checkout_time}` : " in approximately 1 hour") +
          `.\n\n` +
          `🏨 Room No : ${guest.Room_no}\n` +
          `📋 GRC No  : ${guest.GRC_No}\n\n` +
          `Please contact us at the reception if you need any assistance or wish to extend your stay.\n\n` +
          `Thank you for staying with us!\nTeam Mantri In`;

        try {
          await sendGlobal91Whatsapp({ to: guest.Contact_number, body: msg });
          guest.checkoutReminderSent = true;
          await guest.save();
          console.log(`Checkout reminder sent to ${guest.Guest_name} (${guest.Contact_number})`);
        } catch (err) {
          console.error(`Checkout reminder failed for guest ${guest._id}:`, err.message);
        }
      }
    } catch (err) {
      console.error("Checkout reminder cron error:", err.message);
    }
  });
};
