import { Router } from "express";
import {
  placeOrder,
  markItemStatus,
  markOrderAsInProgress,
  cancelOrder,
  cancelItem,
  getOrdersByStatus,
  getOrdersBySession,
  getPendingOrdersTableIdWise,
  getActiveItemsTableIdWise
  // cancelOrder,
  // completeOrder,
  // getPendingOrders,
  // getCompletedOrders,
} from "../controllers/order.controller.js";
import { get } from "mongoose";
// import { getOrdersBySession } from "../controllers/order.controller.js";

const router = Router();

router.post("/order", placeOrder);
router.post("/order/mark-in-progress/:id", markOrderAsInProgress);
router.post("/order/mark-item", markItemStatus);
router.post("/order/cancel/:orderId", cancelOrder);
router.post("/order/cancel-items",cancelItem);
router.get("/order/status/:status", getOrdersByStatus);
// router.get("/orders/pending", getPendingOrders);
// router.post("/order/:orderId/complete", completeOrder);
router.get("/orders/kitchen", getActiveItemsTableIdWise);
router.get("/orders/:sessionId", getOrdersBySession);

export default router;
