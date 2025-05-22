import express from "express";
import { getSummary } from "../controllers/summaryController";

const router = express.Router();

// Route to fetch summary data based on the period
router.get("/", getSummary);

export default router;
