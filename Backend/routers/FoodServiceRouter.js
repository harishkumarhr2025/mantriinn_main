import express from "express";
const router = express.Router();

import { AuthMiddleware } from "../middlewares/AuthMiddleware.js";
import {
  getTodaysMenu,
  createFoodRequest,
  getGuestFoodRequests,
  updateMealCompletion,
} from "../controllers/FoodServiceController.js";
import {
  getAllFoodRequests,
  updateFoodStatus,
  exportFoodReport,
  createOrUpdateMenu,
  getMenuByDate,
  createOrUpdateStock,
  getStockByDate,
} from "../controllers/AdminFoodController.js";

// Guest routes
router.route("/api/guest/food/menu").get(AuthMiddleware, getTodaysMenu);
router.route("/api/guest/food/request").post(AuthMiddleware, createFoodRequest);
router.route("/api/guest/food/requests").get(AuthMiddleware, getGuestFoodRequests);
router.route("/api/guest/food/update-meal").put(AuthMiddleware, updateMealCompletion);

// Admin routes
router.route("/api/admin/food/all").get(AuthMiddleware, getAllFoodRequests);
router.route("/api/admin/food/update-status").put(AuthMiddleware, updateFoodStatus);
router.route("/api/admin/food/export").post(AuthMiddleware, exportFoodReport);
router.route("/api/admin/food/menu").post(AuthMiddleware, createOrUpdateMenu);
router.route("/api/admin/food/menu").get(AuthMiddleware, getMenuByDate);
router.route("/api/admin/food/stock").post(AuthMiddleware, createOrUpdateStock);
router.route("/api/admin/food/stock").get(AuthMiddleware, getStockByDate);

export default router;
