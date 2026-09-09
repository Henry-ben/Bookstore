import express from "express";
import { addOrder, getMyOrder, deleteOrder, getAllOrders, updateOrderStatus } from "../controllers/orderController.js";
import { authenticateToken, allowAdmin, allowAdminAndStaff } from "../middleware/authMiddleware.js";

const orderRouter = express.Router();

orderRouter.post("/add",authenticateToken,  addOrder);
orderRouter.get("/", authenticateToken, getMyOrder);
orderRouter.get("/admin-orders", authenticateToken, allowAdminAndStaff, getAllOrders);
orderRouter.delete("/:id", authenticateToken, allowAdmin, deleteOrder);
orderRouter.put("/:id/status", authenticateToken, allowAdmin, updateOrderStatus);

export default orderRouter;