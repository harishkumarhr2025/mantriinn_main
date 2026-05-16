import express from "express";
const router = express.Router();

import { AuthMiddleware } from "../middlewares/AuthMiddleware.js";
import { guestLogin, getGuestPortalDetails } from "../controllers/GuestAuthController.js";

router.route("/api/guest/login").post(guestLogin);
router.route("/api/guest/portal/details").get(AuthMiddleware, getGuestPortalDetails);

export default router;
