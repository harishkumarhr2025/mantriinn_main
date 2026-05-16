import LaundryRequest from "../models/LaundryRequestModel.js";
import sendGlobal91Whatsapp from "../utils/sendGlobal91WhatsApp.js";

// Get all laundry requests with filters
const getAllLaundryRequests = async (req, res) => {
  try {
    const { status, search, startDate, endDate, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};

    // Status filter
    if (status && status !== 'all') {
      query.status = status;
    }

    // Search filter
    if (search) {
      query.$or = [
        { guestName: { $regex: search, $options: 'i' } },
        { roomNo: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const laundryRequests = await LaundryRequest.find(query).sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: laundryRequests.length,
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

// Get open/pending requests
const getOpenRequests = async (req, res) => {
  try {
    const openRequests = await LaundryRequest.find({
      status: { $in: ['Pending', 'In Progress'] }
    })
      .sort({ createdAt: -1 })
      .limit(6);

    return res.status(200).json({
      success: true,
      count: openRequests.length,
      openRequests,
    });
  } catch (error) {
    console.error("Error fetching open requests:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch open requests",
      error: error.message,
    });
  }
};

// Update laundry request status
const updateLaundryStatus = async (req, res) => {
  try {
    const { requestIds, status, customMessage } = req.body;

    if (!requestIds || !Array.isArray(requestIds) || requestIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request IDs are required",
      });
    }

    const updates = await LaundryRequest.updateMany(
      { _id: { $in: requestIds } },
      { $set: { status } }
    );

    // Send WhatsApp notifications
    const requests = await LaundryRequest.find({ _id: { $in: requestIds } });

    for (const request of requests) {
      const adminNumber = "9900064325";
      const guestNumber = String(request.contactNumber).replace(/\D/g, "");

      let statusMessage = status;
      if (customMessage) {
        statusMessage = customMessage;
      }

      // Admin notification
      const adminMessage = `🧺 Laundry Status Update\n\n` +
        `Guest: ${request.guestName}\n` +
        `Room: ${request.roomNo}\n` +
        `Status: ${statusMessage}\n` +
        `Updated: ${new Date().toLocaleString('en-IN')}`;

      // Guest notification
      const guestMessage = `🧺 Laundry Status Update\n\n` +
        `Dear ${request.guestName},\n\n` +
        `Your laundry service status has been updated to: ${statusMessage}\n` +
        `Room: ${request.roomNo}\n` +
        `${status === 'Delivered' ? 'Your laundry has been delivered to your room.\n' : ''}` +
        `\nThank you!\nMantri Inn`;

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
      message: `${updates.modifiedCount} request(s) updated successfully`,
      updatedCount: updates.modifiedCount,
    });
  } catch (error) {
    console.error("Error updating laundry status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update laundry status",
      error: error.message,
    });
  }
};

// Export laundry report
const exportLaundryReport = async (req, res) => {
  try {
    const { reportType, startDate, endDate, inchargeName, shiftDuration } = req.body;

    let query = {};
    let dateRange = '';

    // Determine date range based on report type
    const now = new Date();
    if (reportType === 'daily') {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      query.createdAt = { $gte: today };
      dateRange = today.toLocaleDateString('en-IN');
    } else if (reportType === 'monthly') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      query.createdAt = { $gte: firstDay };
      dateRange = `${firstDay.toLocaleDateString('en-IN')} to ${now.toLocaleDateString('en-IN')}`;
    } else if (reportType === 'custom' && startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
      dateRange = `${start.toLocaleDateString('en-IN')} to ${end.toLocaleDateString('en-IN')}`;
    }

    const requests = await LaundryRequest.find(query).sort({ createdAt: -1 });

    // Format data for export
    const reportData = {
      metadata: {
        reportType,
        dateRange,
        inchargeName: inchargeName || 'N/A',
        shiftDuration: shiftDuration || 'N/A',
        generatedAt: new Date().toLocaleString('en-IN'),
        totalRequests: requests.length,
      },
      requests: requests.map(req => ({
        guestId: req.guestId,
        guestName: req.guestName,
        roomNo: req.roomNo,
        contactNumber: req.contactNumber,
        clothTypes: Array.isArray(req.clothType) ? req.clothType.join(', ') : req.clothType,
        numberOfItems: req.numberOfItems,
        washType: req.washType,
        isEmergency: req.isEmergency ? 'Yes' : 'No',
        emergencyCharge: req.emergencyCharge || 0,
        takenTime: new Date(req.takenTime).toLocaleString('en-IN'),
        deliveryTime: new Date(req.deliveryTime).toLocaleString('en-IN'),
        status: req.status,
        specialInstructions: req.specialInstructions || 'N/A',
        createdAt: new Date(req.createdAt).toLocaleString('en-IN'),
      })),
    };

    return res.status(200).json({
      success: true,
      reportData,
    });
  } catch (error) {
    console.error("Error exporting laundry report:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export laundry report",
      error: error.message,
    });
  }
};

export {
  getAllLaundryRequests,
  getOpenRequests,
  updateLaundryStatus,
  exportLaundryReport,
};
