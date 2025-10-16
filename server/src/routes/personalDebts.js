import express from "express";
import { body, validationResult } from "express-validator";
import PersonalDebt from "../models/PersonalDebt.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const { isPaid } = req.query;
    let filter = {};
    if (isPaid !== undefined) {
      filter.isPaid = isPaid === "true";
    }

    const personalDebts = await PersonalDebt.find(filter)
      .populate("paidBy", "username")
      .populate("owedBy", "username")
      .populate("addedBy", "username")
      .sort({ date: -1 });

    res.json({
      success: true,
      count: personalDebts.length,
      data: personalDebts,
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("amount").isFloat({ min: 0 }),
    body("paidBy").notEmpty(),
    body("owedBy").notEmpty(),
    body("description").trim().notEmpty(),
    body("date").isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { paidBy, owedBy } = req.body;

      if (paidBy === owedBy) {
        return res
          .status(400)
          .json({
            success: false,
            message: "Le créancier et le débiteur doivent être différents",
          });
      }

      const personalDebt = await PersonalDebt.create({
        ...req.body,
        addedBy: req.user._id,
      });

      const populatedDebt = await PersonalDebt.findById(personalDebt._id)
        .populate("paidBy", "username")
        .populate("owedBy", "username")
        .populate("addedBy", "username");

      res.status(201).json({ success: true, data: populatedDebt });
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id/mark-paid", async (req, res, next) => {
  try {
    const personalDebt = await PersonalDebt.findById(req.params.id);

    if (!personalDebt) {
      return res
        .status(404)
        .json({ success: false, message: "Avance personnelle non trouvée" });
    }

    if (personalDebt.isPaid) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Cette avance a déjà été remboursée",
        });
    }

    personalDebt.isPaid = true;
    personalDebt.paidAt = new Date();
    await personalDebt.save();

    const populatedDebt = await PersonalDebt.findById(personalDebt._id)
      .populate("paidBy", "username")
      .populate("owedBy", "username")
      .populate("addedBy", "username");

    res.json({ success: true, data: populatedDebt });
  } catch (error) {
    next(error);
  }
});

router.get("/summary", async (req, res, next) => {
  try {
    const unpaidDebts = await PersonalDebt.find({ isPaid: false })
      .populate("paidBy", "username")
      .populate("owedBy", "username");

    const summary = {};

    unpaidDebts.forEach((debt) => {
      const owedByUsername = debt.owedBy.username;
      if (!summary[owedByUsername]) {
        summary[owedByUsername] = 0;
      }
      summary[owedByUsername] += debt.amount;
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const personalDebt = await PersonalDebt.findById(req.params.id);

    if (!personalDebt) {
      return res
        .status(404)
        .json({ success: false, message: "Avance personnelle non trouvée" });
    }

    await personalDebt.deleteOne();
    res.json({ success: true, message: "Avance personnelle supprimée" });
  } catch (error) {
    next(error);
  }
});

export default router;
