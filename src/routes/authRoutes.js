import express from "express";
import AuthController from "../controllers/authController.js";
import verifyToken from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", AuthController.loginUser);
router.post("/signup", AuthController.signupUser);
router.post("/forgot-password", AuthController.forgotPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get("/profile", verifyToken, AuthController.profileUser);

export default router;
