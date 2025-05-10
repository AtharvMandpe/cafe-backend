import { Router } from "express";

import { getPendingPayments,completePayment } from "../controllers/payment.controller.js";

const router = Router();

router.get("/pending", getPendingPayments);
router.post("/complete/:sessionId/:method", completePayment);

export default router;