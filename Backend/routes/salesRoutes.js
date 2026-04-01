import express from "express";
import {
  getSalesStats,
  addSale,
  getAllSales,
  searchSales,
} from "../controllers/salesController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/stats", auth, getSalesStats);
router.post("/", auth, addSale);
router.get("/", auth, searchSales); // Handles both regular and search requests
router.get("/all", auth, getAllSales);

export default router;
