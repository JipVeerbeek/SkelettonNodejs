import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
dotenv.config();

const AuthController = {
  async loginUser(req, res) {
    const { name, email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

      if (!user || !(await user.isValidPassword(password))) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      const expiresInInSeconds = 3600;

      return res.status(200).json({
        message: "Login successful",
        token,
        expiresIn: expiresInInSeconds,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error logging in", error: error.message });
    }
  },
  async signupUser(req, res) {
    const { name, email, password } = req.body;

    try {
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = await User.create({
        name,
        email,
        password: hashedPassword,
      });

      const token = jwt.sign({ userId: newUser.id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });
      const expiresInInSeconds = 3600;

      return res.status(201).json({
        message: "Signup successful",
        userId: newUser.id,
        token,
        expiresIn: expiresInInSeconds,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error signing up", error: error.message });
    }
  },
};

export default AuthController;
