import { redisClient } from "../db/redis.js";
import { respondSuccess, respondError } from "../utils/response.util.js";

const PREFIX = "waiter_request";

export const requestWaiter = async (req, res) => {
  try {
    const { tableId } = req.body;

    if (!tableId) {
      return respondError(res, new Error("tableId is required"), 400);
    }

    const key = `${PREFIX}:${tableId}`;
    await redisClient.set(key, "true");

    return respondSuccess(res, `Waiter requested for table ${tableId}`);
  } catch (err) {
    return respondError(res, err);
  }
};

export const checkWaiterStatus = async (req, res) => {
  try {
    const { tableId } = req.params;

    const key = `${PREFIX}:${tableId}`;
    const isRequested = await redisClient.get(key);

    return respondSuccess(res, "Waiter request status", { requested: isRequested === "true" });
  } catch (err) {
    return respondError(res, err);
  }
};

export const clearWaiterRequest = async (req, res) => {
  try {
    const { tableId } = req.params;

    const key = `${PREFIX}:${tableId}`;
    await redisClient.del(key);

    return respondSuccess(res, `Waiter request cleared for table ${tableId}`);
  } catch (err) {
    return respondError(res, err);
  }
};
export const getAllTablesRequestingWaiter = async (_req, res) => {
    try {
      const pattern = "waiter_request:*";
      const keys = await redisClient.keys(pattern);
  
      if (!keys.length) {
        return respondSuccess(res, "No tables have requested waiter", { tables: [] });
      }
  
      const values = await redisClient.mGet(keys);
  
      const tablesWithWaiterRequest = keys
        .map((key, index) => ({
          key,
          value: values[index],
        }))
        .filter(item => item.value === "true")
        .map(item => item.key.split(":")[1]); // extract tableId from key
  
      return respondSuccess(res, "Tables requesting waiter", { tables: tablesWithWaiterRequest });
    } catch (err) {
      return respondError(res, err);
    }
  };
  
