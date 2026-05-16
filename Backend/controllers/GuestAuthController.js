import jwt from "jsonwebtoken";
import GuestUser from "../models/GuestUserModel.js";
import Guest from "../models/GuestModel.js";

const guestLogin = async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter username and password",
      });
    }

    // Find guest user by username
    const guestUser = await GuestUser.findOne({ username });
    if (!guestUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
      });
    }

    // Simple password comparison (since passwords are stored as plain text in GuestUser)
    if (guestUser.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password",
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

    // Generate JWT token
    const token = jwt.sign(
      {
        id: guestUser._id,
        guestId: guest._id,
        userType: "guest",
        username: guestUser.username,
      },
      process.env.JWT_SECRET_KEY || "your-secret-key",
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: guestUser._id,
      username: guestUser.username,
      userType: guestUser.userType,
      guestId: guest._id,
      guestName: guest.Guest_name,
    };

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      user: userResponse,
    });
  } catch (error) {
    console.error("Guest login error:", error);
    res.status(500).json({
      success: false,
      message: "Authentication failed. Please try again.",
    });
  }
};

const getGuestPortalDetails = async (req, res) => {
  try {
    // req.user is set by the AuthMiddleware
    const guestUser = req.user;

    if (!guestUser || guestUser.userType !== "guest") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Guest login required.",
      });
    }

    // Get full guest details
    const guest = await Guest.findById(guestUser.guestId).lean();

    if (!guest) {
      return res.status(404).json({
        success: false,
        message: "Guest details not found",
      });
    }

    return res.status(200).json({
      success: true,
      guest,
    });
  } catch (error) {
    console.error("Error fetching guest portal details:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch guest details",
      error: error.message,
    });
  }
};

export { guestLogin, getGuestPortalDetails };
