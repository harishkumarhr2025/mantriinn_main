import Guest from "../models/GuestModel.js";
import sendGlobal91Whatsapp from "../utils/sendGlobal91WhatsApp.js";

const sendServiceNotification = async (req, res) => {
  try {
    const { serviceName } = req.body;
    const guestUser = req.user;

    if (!guestUser || guestUser.userType !== "guest") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Guest login required.",
      });
    }

    // Get guest details
    const guest = await Guest.findById(guestUser.guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest details not found",
      });
    }

    const adminNumber = "9900064325";
    const guestNumber = String(guest.Contact_number).replace(/\D/g, "");
    const currentTime = new Date().toLocaleString('en-IN');

    // Admin notification
    const adminMessage = `🔔 Service Request: ${serviceName}\n\n` +
      `Guest: ${guest.Guest_name}\n` +
      `Room: ${guest.Room_no}\n` +
      `Contact: ${guest.Contact_number}\n` +
      `Time: ${currentTime}\n\n` +
      `Please attend to this request.`;

    // Guest confirmation
    const guestMessage = `✅ Service Request Confirmed\n\n` +
      `Dear ${guest.Guest_name},\n\n` +
      `Your request for ${serviceName} has been received.\n` +
      `Room: ${guest.Room_no}\n` +
      `Time: ${currentTime}\n\n` +
      `Our staff will attend to your request shortly.\n\n` +
      `Thank you!\nMantri Inn`;

    try {
      // Send to admin
      await sendGlobal91Whatsapp({ to: adminNumber, body: adminMessage });
      console.log(`[Service] WhatsApp sent to admin ${adminNumber} for ${serviceName}`);
      
      // Send to guest
      if (guestNumber.length >= 10) {
        await sendGlobal91Whatsapp({ to: guestNumber, body: guestMessage });
        console.log(`[Service] WhatsApp sent to guest ${guestNumber} for ${serviceName}`);
      }
    } catch (error) {
      console.error(`[Service] WhatsApp failed: ${error.message}`);
    }

    return res.status(200).json({
      success: true,
      message: "Service notification sent successfully",
    });
  } catch (error) {
    console.error("Error sending service notification:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send service notification",
      error: error.message,
    });
  }
};

export { sendServiceNotification };
