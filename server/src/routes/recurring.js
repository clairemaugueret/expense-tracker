// server/src/routes/recurring.js
import express from "express";
import RecurringExpense from "../models/RecurringExpense.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const recurringExpenses = await RecurringExpense.find({ isActive: true })
      .populate("paidBy", "username")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: recurringExpenses.length,
      data: recurringExpenses,
    });
  } catch (error) {
    next(error);
  }
});

router.put("/:id/deactivate", async (req, res, next) => {
  try {
    const recurringExpense = await RecurringExpense.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!recurringExpense) {
      return res
        .status(404)
        .json({ success: false, message: "Dépense récurrente non trouvée" });
    }

    res.json({ success: true, data: recurringExpense });
  } catch (error) {
    next(error);
  }
});

export default router;
