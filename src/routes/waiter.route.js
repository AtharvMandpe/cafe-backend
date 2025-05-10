import { Router } from "express";

import { requestWaiter, checkWaiterStatus, clearWaiterRequest,getAllTablesRequestingWaiter} from "../controllers/waiter.controller.js";

const router = Router();

router.post("/request", requestWaiter);
router.get("/status/:tableId", checkWaiterStatus);
router.delete("/clear/:tableId", clearWaiterRequest);
router.get("/all", getAllTablesRequestingWaiter);

export default router;