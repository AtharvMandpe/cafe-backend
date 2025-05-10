import { redisClient } from "../db/redis.js";
import Payment from "../models/payment.model.js";
import { respondError, respondSuccess } from "../utils/response.util.js";

export const getPendingPayments = async (_req, res) => {
  try {
    // const payments = await Payment.find({ status: "pending" });
    const payments = await Payment.find({});
    respondSuccess(res, payments);
  } catch (error) {
    respondError(res, error);
  }
};

export const completePayment = async (req, res) => {
  try {
    const { sessionId, method } = req.params;
    const payment = await Payment.findOneAndUpdate(
      { sessionId },
      { status: "paid", paymentMethod: method, paidAt: new Date() },
      { new: true }
    );
    if (!payment) {
      return respondError(res, { message: "Payment not found" }, 404);
    }
    respondSuccess(res, payment);
  } catch (error) {
    console.error("Error completing payment:", error);
    return respondError(res, error, 500);
  }
};
