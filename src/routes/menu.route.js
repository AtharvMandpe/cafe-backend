import express from "express";
import {
  getAllMenuItems,
  getMenuItemsByCategory,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  getFeaturedItems,
  getHealthyItems,
} from "../controllers/menu.controller.js";
import { upload } from "../middlewares/mutler.middleware.js";

const router = express.Router();

// Base routes from original file
router.get("/", getAllMenuItems);
router.post("/add", upload.single("image"), addMenuItem);
router.put("/update/:id", upload.single("image"), updateMenuItem);
router.delete("/delete/:id", deleteMenuItem);

// New routes for additional controller methods
router.get("/category/:category", getMenuItemsByCategory);
router.get("/featured", getFeaturedItems);
router.get("/healthy", getHealthyItems);

export default router;