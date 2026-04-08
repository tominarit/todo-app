import { Router } from "express";
import { sync, getMe, updateMe, deleteMe } from "../controllers/userController";

const router = Router()

router.post("/sync", sync);
router.get("/me", getMe);
router.patch("/me", updateMe);
router.delete("/me", deleteMe);

export default router;