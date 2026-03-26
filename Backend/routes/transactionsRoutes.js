import { Router } from "express";
const router = Router();
import { getAllTransactions, addTransaction } from "../controllers/transactionsController.js";
import auth from "../middleware/auth.js";

router.get("/", auth, getAllTransactions);
router.post("/", auth, addTransaction);

export default router;
