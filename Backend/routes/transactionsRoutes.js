import express from "express";
import {
  getAllTransactions,
  createTransaction,
  searchTransactions,
  loadDropdownData,
} from "../controllers/transactionsController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, searchTransactions); // Handles both regular and search requests
router.post("/", auth, createTransaction);
router.get("/dropdown-data", auth, loadDropdownData); // New endpoint for dropdown data

export default router;
