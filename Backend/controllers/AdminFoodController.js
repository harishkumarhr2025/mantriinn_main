import FoodService from "../models/FoodServiceModel.js";
import FoodMenu from "../models/FoodMenuModel.js";
import FoodStock from "../models/FoodStockModel.js";
import sendGlobal91Whatsapp from "../utils/sendGlobal91WhatsApp.js";

// Admin: Get all food requests with filters
const getAllFoodRequests = async (req, res) => {
  try {
    const { status, search, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { guestName: { $regex: search, $options: 'i' } },
        { roomNo: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const requests = await FoodService.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: requests.length,
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

// Admin: Update food request status
const updateFoodStatus = async (req, res) => {
  try {
    const { requestIds, status, customMessage } = req.body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request IDs are required",
      });
    }

    await FoodService.updateMany(
      { _id: { $in: requestIds } },
      { $set: { status } }
    );

    const requests = await FoodService.find({ _id: { $in: requestIds } });

    for (const request of requests) {
      const adminNumber = "9900064325";
      const guestNumber = String(request.contactNumber).replace(/\D/g, "");

      let statusMessage = status;
      if (customMessage) {
        statusMessage = customMessage;
      }

      const adminMessage = `🍽️ Food Service Status Update\n\n` +
        `Guest: ${request.guestName}\n` +
        `Room: ${request.roomNo}\n` +
        `Status: ${statusMessage}\n` +
        `Updated: ${new Date().toLocaleString('en-IN')}`;

      const guestMessage = `🍽️ Food Service Status Update\n\n` +
        `Dear ${request.guestName},\n\n` +
        `Your food service status has been updated to: ${statusMessage}\n` +
        `Room: ${request.roomNo}\n\n` +
        `Thank you!\nMantri Inn`;

      try {
        await sendGlobal91Whatsapp({ to: adminNumber, body: adminMessage });
        if (guestNumber.length >= 10) {
          await sendGlobal91Whatsapp({ to: guestNumber, body: guestMessage });
        }
      } catch (error) {
        console.error(`WhatsApp notification failed: ${error.message}`);
      }
    }

    return res.status(200).json({
      success: true,
      message: `${requestIds.length} request(s) updated successfully`,
    });
  } catch (error) {
    console.error("Error updating food status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update food status",
      error: error.message,
    });
  }
};

// Admin: Export food report (matching PDF format)
const exportFoodReport = async (req, res) => {
  try {
    const { reportDate } = req.body;

    let query = {};
    let dateStr = '';

    if (reportDate) {
      const date = new Date(reportDate);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      query.date = { $gte: date, $lt: nextDay };
      dateStr = date.toLocaleDateString('en-IN');
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = { $gte: today, $lt: tomorrow };
      dateStr = today.toLocaleDateString('en-IN');
    }

    const requests = await FoodService.find(query).sort({ roomNo: 1 });

    // Calculate summary
    let totalBreakfast = 0;
    let totalLunch = 0;
    let totalDinner = 0;

    const reportData = requests.map((req, index) => {
      if (req.breakfast?.selected) totalBreakfast++;
      if (req.lunch?.selected) totalLunch++;
      if (req.dinner?.selected) totalDinner++;

      return {
        slNo: index + 1,
        roomNo: req.roomNo,
        name: req.guestName,
        stiffen: req.contactNumber,
        breakfast: req.breakfast?.selected ? '✓' : '',
        lunch: req.lunch?.selected ? '✓' : '',
        dinner: req.dinner?.selected ? '✓' : '',
      };
    });

    return res.status(200).json({
      success: true,
      reportData: {
        date: dateStr,
        requests: reportData,
        summary: {
          totalBreakfast,
          totalLunch,
          totalDinner,
        },
      },
    });
  } catch (error) {
    console.error("Error exporting food report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export food report",
      error: error.message,
    });
  }
};

// Admin: Create/Update today's menu
const createOrUpdateMenu = async (req, res) => {
  try {
    const { date, breakfast, lunch, dinner } = req.body;

    const menuDate = date ? new Date(date) : new Date();
    menuDate.setHours(0, 0, 0, 0);

    const menu = await FoodMenu.findOneAndUpdate(
      { date: menuDate },
      {
        date: menuDate,
        breakfast,
        lunch,
        dinner,
        isActive: true,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Menu updated successfully",
      menu,
    });
  } catch (error) {
    console.error("Error creating/updating menu:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update menu",
      error: error.message,
    });
  }
};

// Admin: Get menu for a specific date
const getMenuByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const menuDate = date ? new Date(date) : new Date();
    menuDate.setHours(0, 0, 0, 0);

    const menu = await FoodMenu.findOne({ date: menuDate });

    return res.status(200).json({
      success: true,
      menu: menu || null,
    });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch menu",
      error: error.message,
    });
  }
};

// Admin: Create/Update daily food stock
const createOrUpdateStock = async (req, res) => {
  try {
    const { date, stocks } = req.body;

    const stockDate = date ? new Date(date) : new Date();
    stockDate.setHours(0, 0, 0, 0);

    const stock = await FoodStock.findOneAndUpdate(
      { date: stockDate },
      {
        date: stockDate,
        stocks,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Stock updated successfully",
      stock,
    });
  } catch (error) {
    console.error("Error creating/updating stock:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update stock",
      error: error.message,
    });
  }
};

// Admin: Get stock for a specific date
const getStockByDate = async (req, res) => {
  try {
    const { date } = req.query;
    const stockDate = date ? new Date(date) : new Date();
    stockDate.setHours(0, 0, 0, 0);

    const stock = await FoodStock.findOne({ date: stockDate });

    return res.status(200).json({
      success: true,
      stock: stock || null,
    });
  } catch (error) {
    console.error("Error fetching stock:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock",
      error: error.message,
    });
  }
};

export {
  getAllFoodRequests,
  updateFoodStatus,
  exportFoodReport,
  createOrUpdateMenu,
  getMenuByDate,
  createOrUpdateStock,
  getStockByDate,
};
