import { Router } from "express";
const router = Router();
import { getAllBooks, addBook } from "../controllers/booksController.js";
import auth from "../middleware/auth.js";

router.get("/", auth, getAllBooks);
router.post("/", auth, addBook);

export default router;
