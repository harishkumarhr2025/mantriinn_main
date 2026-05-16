import FoodService from "../models/FoodServiceModel.js";
import FoodMenu from "../models/FoodMenuModel.js";
import Guest from "../models/GuestModel.js";
import sendGlobal91Whatsapp from "../utils/sendGlobal91WhatsApp.js";

// Guest: Get today's menu
const getTodaysMenu = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const menu = await FoodMenu.findOne({ date: today, isActive: true });

    if (!menu) {
      return res.status(404).json({
        success: false,
        message: "No menu available for today",
      });
    }

    return res.status(200).json({
      success: true,
      menu,
    });
  } catch (error) {
    console.error("Error fetching today's menu:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
      error: error.message,
    });
  }
};

// Guest: Create food service request
const createFoodRequest = async (req, res) => {
  try {
    const { breakfast, lunch, dinner, specialInstructions } = req.body;
    const guestUser = req.user;

    if (!guestUser || guestUser.userType !== "guest") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Guest login required.",
      });
    }

    const guest = await Guest.findById(guestUser.guestId);
    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest details not found",
      });
    }

    // Calculate total price
    let totalPrice = 0;
    if (breakfast?.selected) totalPrice += breakfast.price || 0;
    if (lunch?.selected) totalPrice += lunch.price || 0;
    if (dinner?.selected) totalPrice += dinner.price || 0;

    const foodRequest = new FoodService({
      guestId: guest._id,
      guestName: guest.Guest_name,
      roomNo: guest.Room_no,
      contactNumber: guest.Contact_number,
      breakfast,
      lunch,
      dinner,
      totalPrice,
      specialInstructions,
    });

    await foodRequest.save();

    // Send WhatsApp notifications
    const adminNumber = "9900064325";
    const guestNumber = String(guest.Contact_number).replace(/\D/g, "");

    const meals = [];
    if (breakfast?.selected) meals.push(`Breakfast (${breakfast.items.join(', ')})`);
    if (lunch?.selected) meals.push(`Lunch (${lunch.items.join(', ')})`);
    if (dinner?.selected) meals.push(`Dinner (${dinner.items.join(', ')})`);

    // Admin notification
    const adminMessage = `🍽️ New Food Service Request\n\n` +
      `Guest: ${guest.Guest_name}\n` +
      `Room: ${guest.Room_no}\n` +
      `Contact: ${guest.Contact_number}\n` +
      `Date: ${new Date().toLocaleDateString('en-IN')}\n` +
      `Meals: ${meals.join(', ')}\n` +
      `Total: ₹${totalPrice}\n` +
      `${specialInstructions ? `Instructions: ${specialInstructions}\n` : ''}` +
      `\nPlease process this request.`;

    // Guest notification
    const guestMessage = `🍽️ Food Service Request Confirmed\n\n` +
      `Dear ${guest.Guest_name},\n\n` +
      `Your food service request has been received!\n\n` +
      `Meals: ${meals.join(', ')}\n` +
      `Total: ₹${totalPrice}\n` +
      `Room: ${guest.Room_no}\n\n` +
      `We'll deliver your meals on time.\n\n` +
      `Thank you!\nMantri Inn`;

    try {
      await sendGlobal91Whatsapp({ to: adminNumber, body: adminMessage });
      if (guestNumber.length >= 10) {
        await sendGlobal91Whatsapp({ to: guestNumber, body: guestMessage });
      }
    } catch (error) {
      console.error(`WhatsApp notification failed: ${error.message}`);
    }

    return res.status(201).json({
      success: true,
      message: "Food service request submitted successfully",
      foodRequest,
    });
  } catch (error) {
    console.error("Error creating food request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create food request",
      error: error.message,
    });
  }
};

// Guest: Get own food requests
const getGuestFoodRequests = async (req, res) => {
  try {
    const guestUser = req.user;

    if (!guestUser || guestUser.userType !== "guest") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Guest login required.",
      });
    }

    const requests = await FoodService.find({
      guestId: guestUser.guestId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error("Error fetching food requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch food requests",
      error: error.message,
    });
  }
};

// Guest: Update meal completion status
const updateMealCompletion = async (req, res) => {
  try {
    const { requestId, mealType, completed } = req.body;
    const guestUser = req.user;

    if (!guestUser || guestUser.userType !== "guest") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Guest login required.",
      });
    }

    const updateField = `${mealType}.completed`;
    const request = await FoodService.findOneAndUpdate(
      { _id: requestId, guestId: guestUser.guestId },
      { $set: { [updateField]: completed } },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Meal status updated",
      request,
    });
  } catch (error) {
    console.error("Error updating meal completion:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update meal status",
      error: error.message,
    });
  }
};

export {
  getTodaysMenu,
  createFoodRequest,
  getGuestFoodRequests,
  updateMealCompletion,
};
