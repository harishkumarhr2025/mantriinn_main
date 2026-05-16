import express from "express";
const router = express.Router();

import { AuthMiddleware } from "../middlewares/AuthMiddleware.js";
import {
  getAllLaundryRequests,
  getOpenRequests,
  updateLaundryStatus,
  exportLaundryReport,
} from "../controllers/AdminLaundryController.js";

router.route("/api/admin/laundry/all").get(AuthMiddleware, getAllLaundryRequests);
router.route("/api/admin/laundry/open").get(AuthMiddleware, getOpenRequests);
router.route("/api/admin/laundry/update-status").put(AuthMiddleware, updateLaundryStatus);
router.route("/api/admin/laundry/export").post(AuthMiddleware, exportLaundryReport);

export default router;
