import express from "express";
import {
  getAllBooks,
  getBook,
  addBook,
  updateBook,
  deleteBook,
  searchBooks,
} from "../controllers/booksController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getAllBooks);
router.get("/:id", auth, getBook);
router.post("/", auth, addBook);
router.put("/:id", auth, updateBook);
router.delete("/:id", auth, deleteBook);
router.get("/", auth, searchBooks); // This will handle both regular and search requests
export default router;
