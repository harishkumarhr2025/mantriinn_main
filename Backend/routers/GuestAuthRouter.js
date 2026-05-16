import express from "express";
const router = express.Router();

import { AuthMiddleware } from "../middlewares/AuthMiddleware.js";
import { guestLogin, getGuestPortalDetails } from "../controllers/GuestAuthController.js";
import { createLaundryRequest, getGuestLaundryRequests } from "../controllers/LaundryRequestController.js";
import { sendServiceNotification } from "../controllers/ServiceNotificationController.js";

router.route("/api/guest/login").post(guestLogin);
router.route("/api/guest/portal/details").get(AuthMiddleware, getGuestPortalDetails);
router.route("/api/guest/laundry-request").post(AuthMiddleware, createLaundryRequest);
router.route("/api/guest/laundry-requests").get(AuthMiddleware, getGuestLaundryRequests);
router.route("/api/guest/service-notification").post(AuthMiddleware, sendServiceNotification);

export default router;
