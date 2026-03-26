import { Router } from "express";
const router = Router();
import { getAllMembers, addMember } from "../controllers/membersController.js";
import auth from "../middleware/auth.js";

router.get("/", auth, getAllMembers);
router.post("/", auth, addMember);

export default router;
