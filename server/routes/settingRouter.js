import express from "express";
import { getSettings, updateSettings } from "../controllers/settingsController.js";
import {authenticateToken, allowAdmin } from "../middleware/authMiddleware.js";

const settingRouter = express.Router();

settingRouter.get("/", authenticateToken, allowAdmin, getSettings);
settingRouter.put("/", authenticateToken, allowAdmin, updateSettings);

export default settingRouter;