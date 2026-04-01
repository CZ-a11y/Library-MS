import express from "express";
import {
  getAllMembers,
  getMember,
  addMember,
  updateMember,
  deleteMember,
  searchMembers,
} from "../controllers/membersController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, searchMembers); // This handles both regular and search requests
router.get("/:id", auth, getMember);
router.post("/", auth, addMember);
router.put("/:id", auth, updateMember);
router.delete("/:id", auth, deleteMember);

export default router;
