import mongoose, { Schema } from "mongoose";
import Payment from "./payment.model.js";

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

const OrderSchema = new Schema(
  {
    tableId: { type: Number, required: true },
    sessionId: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },
    amount: { type: Number, required: true },
    // paymentMethod: { type: String, required: true }, // ✅ Add this line
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled"],
      default: "pending",
    },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
  },
  { timestamps: true }
);

OrderSchema.index({ sessionId: 1, tableId: 1 }, { unique: true });

OrderSchema.pre("save", function (next) {
  const allFinalized = this.items.every(
    (item) => item.status === "completed" || item.status === "cancelled"
  );

  if (allFinalized && this.status !== "completed") {
    this.status = "completed";
    this.completedAt = new Date();
  }

  next();
});

OrderSchema.post("save", async function (doc) {
  if (doc.status !== "completed") return;

  try {
    const existingPayment = await Payment.findOne({ sessionId: doc.sessionId });

    if (existingPayment) {
      // Create a map using a composite key of _id + size
      const itemMap = new Map();
      existingPayment.items.forEach((item) => {
        const key = `${item._id.toString()}-${item.size || ""}`;
        itemMap.set(key, { ...item.toObject() });
      });

      doc.items.forEach((newItem) => {
        const key = `${newItem._id.toString()}-${newItem.size || ""}`;
        if (itemMap.has(key)) {
          itemMap.get(key).quantity += newItem.quantity;
        } else {
          itemMap.set(key, newItem.toObject());
        }
      });

      existingPayment.items = Array.from(itemMap.values());
      existingPayment.amount += doc.amount;

      await existingPayment.save();
    } else {
      await Payment.create({
        sessionId: doc.sessionId,
        items: doc.items,
        amount: doc.amount,
        tableId: doc.tableId,
      });
    }
  } catch (error) {
    console.error("Error in order post-save hook:", error);
  }
});

const Order = mongoose.model("Order", OrderSchema);
export default Order;
