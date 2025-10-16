// server/src/routes/personalDebts.js
import express from "express";
import { body, validationResult } from "express-validator";
import PersonalDebt from "../models/PersonalDebt.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const { isPaid } = req.query;
    const filter = {};
    if (isPaid !== undefined) filter.isPaid = isPaid === "true";
    const personalDebts = await PersonalDebt.find(filter).sort({ date: -1 });
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
      if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

      const { paidBy, owedBy } = req.body;
      if (paidBy === owedBy)
        return res.status(400).json({
          success: false,
          message: "Le créancier et le débiteur doivent être différents",
        });

      const personalDebt = await PersonalDebt.create({
        ...req.body,
        addedBy: req.username,
      });

      res.status(201).json({ success: true, data: personalDebt });
    } catch (error) {
      next(error);
    }
  }
);

router.put("/:id/mark-paid", async (req, res, next) => {
  try {
    const personalDebt = await PersonalDebt.findById(req.params.id);
    if (!personalDebt)
      return res
        .status(404)
        .json({ success: false, message: "Avance non trouvée" });
    if (personalDebt.isPaid)
      return res
        .status(400)
        .json({ success: false, message: "Déjà remboursée" });

    personalDebt.isPaid = true;
    personalDebt.paidAt = new Date();
    await personalDebt.save();

    res.json({ success: true, data: personalDebt });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const personalDebt = await PersonalDebt.findById(req.params.id);
    if (!personalDebt)
      return res
        .status(404)
        .json({ success: false, message: "Avance non trouvée" });
    await personalDebt.deleteOne();
    res.json({ success: true, message: "Avance supprimée" });
  } catch (error) {
    next(error);
  }
});

export default router;
