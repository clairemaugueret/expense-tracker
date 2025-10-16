import express from "express";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

router.post(
  "/register",
  [
    body("username").trim().notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { username, email, password } = req.body;
      const user = await User.create({ username, email, password });
      const token = generateToken(user._id);

      res.status(201).json({
        success: true,
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  "/login",
  [body("email").isEmail(), body("password").notEmpty()],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { email, password } = req.body;
      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePassword(password))) {
        return res
          .status(401)
          .json({ success: false, message: "Identifiants invalides" });
      }

      const token = generateToken(user._id);

      res.json({
        success: true,
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get("/users", protect, async (req, res, next) => {
  try {
    const users = await User.find().select("-password");
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
