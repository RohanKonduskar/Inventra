import express from "express";
import { getRestocks } from "../controllers/restocksController"; // Ensure correct import path

const router = express.Router();

// Define the /restocks route
router.get("/", getRestocks);

export default router;
