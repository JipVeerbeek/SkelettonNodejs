import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

router.post("/login", AuthController.loginUser);
router.post("/signup", AuthController.signupUser);

export default router;
