import express from "express";
import { loginUser, registerUser } from "../controllers/user.controller";
import authenticateToken from "../middlewares/auth.middleware";

const router = express.Router();

router.post("/register", authenticateToken, registerUser);
router.post("/login", authenticateToken, loginUser);

export default router;
