// server/src/routes/reimbursements.js
import express from "express";
import { body, validationResult } from "express-validator";
import Reimbursement from "../models/Reimbursement.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const reimbursements = await Reimbursement.find()
      .populate("from", "username")
      .populate("to", "username")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: reimbursements.length,
      data: reimbursements,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("amount").isFloat({ min: 0 }),
    body("from").notEmpty(),
    body("to").notEmpty(),
    body("date").isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const reimbursement = await Reimbursement.create(req.body);

      const populatedReimbursement = await Reimbursement.findById(
        reimbursement._id
      )
        .populate("from", "username")
        .populate("to", "username");

      res.status(201).json({ success: true, data: populatedReimbursement });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
