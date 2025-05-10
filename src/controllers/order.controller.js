import Order from "../models/order.model.js";
import MenuItem from "../models/menuItem.model.js";
import { respondSuccess, respondError } from "../utils/response.util.js";

export const placeOrder = async (req, res) => {
  try {
    const { sessionId, tableId, items } = req.body;
    if (!sessionId || !Array.isArray(items) || items.length === 0 || !tableId) {
      return respondError(
        res,
        { message: "sessionId and items are required" },
        400
      );
    }

    const menuItems = await MenuItem.find({
      _id: { $in: items.map((item) => item.menuItemId) },
    });

    const menuItemsMap = {};
    menuItems.forEach((menuItem) => {
      menuItemsMap[menuItem._id.toString()] = menuItem;
    });

    const processedItems = items.map((item) => {
      const menuItem = menuItemsMap[item.menuItemId];
      if (!menuItem) {
        throw new Error(`Menu item not found: ${item.menuItemId}`);
      }

      let price;

      if (menuItem.sizeOptions?.length > 0) {
        if (!item.size) {
          throw new Error(`Size is required for item: ${menuItem.name}`);
        }

        const sizeOption = menuItem.sizeOptions.find(
          (s) => s.size === item.size
        );
        if (!sizeOption) {
          throw new Error(
            `Invalid size "${item.size}" for item: ${menuItem.name}`
          );
        }

        price = sizeOption.price;
      } else {
        price = menuItem.price;
      }

      return {
        _id: item.menuItemId,
        name: menuItem.name,
        size: item.size || null,
        quantity: item.quantity,
        price,
        totalPrice: price * item.quantity,
      };
    });

    // const newOrder = await Order.create({
    //   sessionId,
    //   tableId: tableId || null,
    //   items: processedItems,
    //   amount: processedItems.reduce(
    //     (total, item) => total + item.totalPrice,
    //     0
    //   ),
    //   createdAt: new Date(),
    // });

    // return respondSuccess(res, "Order placed successfully", newOrder, 201);
    const existingOrder = await Order.findOne({ sessionId, tableId });

if (existingOrder) {
  existingOrder.items.push(...processedItems);
  existingOrder.amount += processedItems.reduce(
    (total, item) => total + item.totalPrice,
    0
  );
  await existingOrder.save();

  return respondSuccess(res, "Order updated successfully", existingOrder, 200);
} else {
  const newOrder = await Order.create({
    sessionId,
    tableId: tableId || null,
    items: processedItems,
    amount: processedItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    ),
    createdAt: new Date(),
  });

  return respondSuccess(res, "Order placed successfully", newOrder, 201);
}
  } catch (err) {
    console.error("Error placing order:", err);
    return respondError(res, err, 500);
  }
};

export const markOrderAsInProgress = async (req, res) => {
  const { id: orderId } = req.params;
  if (!orderId) {
    return respondError(res, { message: "orderId is required" }, 400);
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return respondError(res, { message: "Order not found" }, 404);
    }
    order.status = "in-progress";
    await order.save();
    return respondSuccess(res, "Order marked as in-progress", order, 200);
  } catch (err) {
    console.error("Error marking order as in-progress:", err);
    return respondError(res, err, 500);
  }
};

export const markItemStatus = async (req, res) => {
  const { orderId, itemId, mark } = req.body;

  const validStatuses = ["pending", "in-progress", "completed", "cancelled"];
  const transitions = {
    pending: ["in-progress"],
    "in-progress": ["completed"],
    completed: [],
    cancelled: [],
  };

  if (!orderId || !itemId || !mark) {
    return respondError(
      res,
      { message: "orderId, itemId, and mark are required" },
      400
    );
  }

  if (!validStatuses.includes(mark)) {
    return respondError(
      res,
      {
        message: `Invalid mark value. Must be one of: ${validStatuses.join(
          ", "
        )}`,
      },
      400
    );
  }

  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return respondError(res, { message: "Order not found" }, 404);
    }

    const item = order.items.id(itemId);
    if (!item) {
      return respondError(res, { message: "Item not found in order" }, 404);
    }

    const currentStatus = item.status;
    const allowedTransitions = transitions[currentStatus];

    if (currentStatus === mark) {
      return respondError(
        res,
        { message: `Item is already marked as ${mark}` },
        400
      );
    }

    if (!allowedTransitions.includes(mark)) {
      return respondError(
        res,
        {
          message: `Invalid status transition from '${currentStatus}' to '${mark}'`,
        },
        400
      );
    }

    item.status = mark;
    await order.save();

    return respondSuccess(
      res,
      `Item status updated from '${currentStatus}' to '${mark}'`,
      order,
      200
    );
  } catch (err) {
    console.error("Error updating item status:", err);
    return respondError(res, err, 500);
  }
};

export const cancelOrder = async (req, res) => {
  const { orderId } = req.params;
  if (!orderId) {
    return respondError(res, { message: "orderId is required" }, 400);
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return respondError(res, { message: "Order not found" }, 404);
    }
    if (order.items.some((item) => item.status === "in-progress")) {
      return respondError(
        res,
        { message: "Cannot cancel order with in-progress items" },
        400
      );
    }
    order.status = "cancelled";
    order.cancelledAt = new Date();
    await order.save();
    return respondSuccess(res, "Order cancelled successfully", order, 200);
  } catch (err) {
    console.error("Error cancelling order:", err);
    return respondError(res, err, 500);
  }
};

export const cancelItem = async (req, res) => {
  const { orderId, itemId } = req.body;
  if (!orderId || !itemId) {
    return respondError(
      res,
      { message: "orderId and itemId are required" },
      400
    );
  }
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      return respondError(res, { message: "Order not found" }, 404);
    }
    const item = order.items.id(itemId);
    if (!item) {
      return respondError(res, { message: "Item not found" }, 404);
    }
    if (item.status === "completed" || item.status === "in-progress") {
      return respondError(
        res,
        { message: "Cannot cancel completed or in progress item" },
        400
      );
    }
    if (item.status === "cancelled") {
      return respondError(res, { message: "Item is already cancelled" }, 400);
    }
    item.status = "cancelled";
    order.amount -= item.price * item.quantity;
    await order.save();
    return respondSuccess(res, "Item cancelled successfully", order, 200);
  } catch (err) {
    console.error("Error cancelling item:", err);
    return respondError(res, err, 500);
  }
};

export const getOrdersByStatus = async (req, res) => {
  const { status } = req.params;
  if (!status) {
    return respondError(res, { message: "status is required" }, 400);
  }
  try {
    const orders = await Order.find({ status });
    if (orders.length === 0) {
      return respondError(res, { message: "No orders found" }, 404);
    }
    return respondSuccess(res, "Orders retrieved successfully", orders, 200);
  } catch (err) {
    console.error("Error retrieving orders:", err);
    return respondError(res, err, 500);
  }
};

export const getPendingOrdersTableIdWise = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: { status: "pending" || "in-progress" },
      },
      {
        $group: {
          _id: "$tableId",
          orders: { $push: "$$ROOT" },
        },
      },
    ]);
    return respondSuccess(
      res,
      "Pending orders grouped by tableId",
      orders,
      200
    );
  } catch (err) {
    console.error("Error retrieving pending orders:", err);
    return respondError(res, err, 500);
  }
};

export const getOrdersBySession = async (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    return respondError(res, { message: "sessionId is required" }, 400);
  }
  try {
    const orders = await Order.find({ sessionId });
    if (orders.length === 0) {
      return respondError(res, { message: "No orders found" }, 404);
    }
    return respondSuccess(res, "Orders retrieved successfully", orders, 200);
  } catch (err) {
    console.error("Error retrieving orders:", err);
    return respondError(res, err, 500);
  }
}
export const getActiveItemsTableIdWise = async (req, res) => {
  try {
    const orders = await Order.aggregate([
      {
        $match: { status: { $in: ["pending", "in-progress"] } },
      },
      {
        $unwind: "$items",
      },
      {
        $match: {
          "items.status": { $in: ["pending", "in-progress"] },
        },
      },
      {
        $group: {
          _id: "$tableId",
          items: { $push: "$items" },
        },
      },
      {
        $project: {
          tableId: "$_id",
          items: 1,
          _id: 0,
        },
      },
    ]);

    return respondSuccess(
      res,
      "Pending/in-progress items grouped by tableId",
      orders,
      200
    );
  } catch (err) {
    console.error("Error retrieving active items:", err);
    return respondError(res, err, 500);
  }
};
