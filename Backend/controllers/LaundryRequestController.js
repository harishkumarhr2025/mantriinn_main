import LaundryRequest from "../models/LaundryRequestModel.js";
import Guest from "../models/GuestModel.js";
import sendGlobal91Whatsapp from "../utils/sendGlobal91WhatsApp.js";

const createLaundryRequest = async (req, res) => {
  try {
    const { clothType, numberOfItems, washType, specialInstructions, isEmergency } = req.body;
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

    // Calculate delivery time and emergency charge
    const deliveryTime = new Date();
    let emergencyCharge = 0;
    
    if (isEmergency) {
      deliveryTime.setHours(deliveryTime.getHours() + 4); // 4 hours for emergency
      emergencyCharge = 200; // ₹200 extra charge
    } else {
      deliveryTime.setHours(deliveryTime.getHours() + 24); // 24 hours normal
    }

    // Create laundry request
    const laundryRequest = new LaundryRequest({
      guestId: guest._id,
      guestName: guest.Guest_name,
      roomNo: guest.Room_no,
      contactNumber: guest.Contact_number,
      clothType,
      numberOfItems,
      washType,
      specialInstructions,
      deliveryTime,
      isEmergency,
      emergencyCharge,
    });

    await laundryRequest.save();

    const clothTypes = Array.isArray(clothType) ? clothType.join(', ') : clothType;
    
    // Send WhatsApp notification to admin
    const adminNumber = "9900064325";
    const adminMessage = `🧺 New Laundry Request ${isEmergency ? '⚡ EMERGENCY' : ''}\n\n` +
      `Guest: ${guest.Guest_name}\n` +
      `Room: ${guest.Room_no}\n` +
      `Contact: ${guest.Contact_number}\n` +
      `Cloth Types: ${clothTypes}\n` +
      `Items: ${numberOfItems}\n` +
      `Wash Type: ${washType}\n` +
      `Taken Time: ${new Date().toLocaleString('en-IN')}\n` +
      `Expected Delivery: ${deliveryTime.toLocaleString('en-IN')}\n` +
      `${isEmergency ? `Emergency Charge: ₹${emergencyCharge}\n` : ''}` +
      `${specialInstructions ? `Instructions: ${specialInstructions}\n` : ''}` +
      `\nPlease process this request.`;

    // Send WhatsApp notification to guest
    const guestNumber = String(guest.Contact_number).replace(/\D/g, "");
    const guestMessage = `🧺 Laundry Request Confirmed ${isEmergency ? '⚡' : ''}\n\n` +
      `Dear ${guest.Guest_name},\n\n` +
      `Your laundry request has been received!\n\n` +
      `Cloth Types: ${clothTypes}\n` +
      `Items: ${numberOfItems}\n` +
      `Wash Type: ${washType}\n` +
      `Pickup Time: ${new Date().toLocaleString('en-IN')}\n` +
      `Expected Delivery: ${deliveryTime.toLocaleString('en-IN')}\n` +
      `${isEmergency ? `\n⚡ Emergency Service\nExtra Charge: ₹${emergencyCharge}\n` : ''}` +
      `\nWe'll deliver your laundry to Room ${guest.Room_no}.\n\n` +
      `Thank you!\nMantri Inn`;

    try {
      await sendGlobal91Whatsapp({ to: adminNumber, body: adminMessage });
      console.log(`[Laundry] WhatsApp sent to admin ${adminNumber}`);
      
      if (guestNumber.length >= 10) {
        await sendGlobal91Whatsapp({ to: guestNumber, body: guestMessage });
        console.log(`[Laundry] WhatsApp sent to guest ${guestNumber}`);
      }
    } catch (error) {
      console.error(`[Laundry] WhatsApp failed: ${error.message}`);
    }

    return res.status(201).json({
      success: true,
      message: "Laundry request submitted successfully",
      laundryRequest,
    });
  } catch (error) {
    console.error("Error creating laundry request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create laundry request",
      error: error.message,
    });
  }
};

const getGuestLaundryRequests = async (req, res) => {
  try {
    const guestUser = req.user;

    if (!guestUser || guestUser.userType !== "guest") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Guest login required.",
      });
    }

    const laundryRequests = await LaundryRequest.find({
      guestId: guestUser.guestId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      laundryRequests,
    });
  } catch (error) {
    console.error("Error fetching laundry requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch laundry requests",
      error: error.message,
    });
  }
};

export { createLaundryRequest, getGuestLaundryRequests };
