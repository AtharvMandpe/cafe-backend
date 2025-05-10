import mongoose, { Schema } from "mongoose";

export const OrderItemSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String },
  category: { type: String },
  status: {
    type: String,
    enum: ["pending", "completed", "in-progress", "cancelled"],
    default: "pending",
    required: true,
  },
});

const PaymentSchema = new Schema(
  {
    sessionId: {
      type: String,
      required: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
    },
    tableId: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi"],
      required: true,
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
