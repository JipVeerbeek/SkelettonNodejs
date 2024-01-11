import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_APP_PASS,
  },
});

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
  //
  //
  //
  //
  //
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
  //
  //
  //
  //
  //
  async forgotPassword(req, res) {
    const { email } = req.body;

    try {
      // Zoek de gebruiker op basis van het e-mailadres
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return res.status(404).json({ message: "Gebruiker niet gevonden" });
      }

      // Genereer een resettoken met een verloopdatum van bijvoorbeeld 1 uur
      const resetToken = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, {
        expiresIn: "1h",
      });

      // Update de gebruiker met het resettoken en de verloopdatum
      user.resetToken = resetToken;
      user.resetTokenExpiration = new Date(
        new Date().getTime() + 60 * 60 * 1000,
      ); // 1 uur in milliseconden
      await user.save();

      const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Wachtwoord Reset",
        text: `Klik op de volgende link om je wachtwoord te resetten: http://localhost:3000/api/auth/reset-password?token=${resetToken}`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending email:", error);
        }
      });

      return res
        .status(200)
        .json({ message: "Resetlink verzonden naar het ingevulde mailadres" });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Fout bij het aanvragen van wachtwoordreset",
          error: error.message,
        });
    }
  },
  //
  //
  //
  //
  //
  async resetPassword(req, res) {
    const { token: resetToken } = req.query;
    const { newPassword } = req.body;

    try {
      const user = await User.findOne({
        where: {
          resetToken,
          resetTokenExpiration: {
            [Op.gt]: new Date(),
          },
        },
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Ongeldig of verlopen resettoken" });
      }

      // Update het wachtwoord van de gebruiker
      const saltRounds = 10;
      user.password = await bcrypt.hash(newPassword, saltRounds);
      user.resetToken = null;
      user.resetTokenExpiration = null;
      await user.save();

      return res.status(200).json({ message: "Wachtwoord gereset" });
    } catch (error) {
      return res
        .status(500)
        .json({
          message: "Fout bij het resetten van het wachtwoord",
          error: error.message,
        });
    }
  },
  //
  //
  //
  //
  //
  async profileUser(req, res) {
    try {
      const userId = req.userId;

      // Find the user by ID
      const user = await User.findByPk(userId, {
        attributes: ["id", "name", "email"],
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.status(200).json({ message: "User profile retrieved", user });
    } catch (error) {
      return res.status(500).json({
        message: "Error retrieving user profile",
        error: error.message,
      });
    }
  },
};

export default AuthController;
