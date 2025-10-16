// server/src/routes/expenses.js
import express from "express";
import { body, validationResult } from "express-validator";
import Expense from "../models/Expense.js";
import RecurringExpense from "../models/RecurringExpense.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const { startDate, endDate, category, paidBy } = req.query;
    const filter = {};
    if (startDate && endDate)
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    if (category) filter.category = category;
    if (paidBy) filter.paidBy = paidBy;

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    next(error);
  }
});

router.post(
  "/",
  [
    body("amount").isFloat({ min: 0 }),
    body("paidBy").notEmpty(),
    body("description").trim().notEmpty(),
    body("date").isISO8601(),
  ],
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty())
        return res.status(400).json({ success: false, errors: errors.array() });

      const expense = await Expense.create({
        ...req.body,
        addedBy: req.username, // depuis header
      });

      // gestion récurrente inchangée
      if (req.body.isRecurring && req.body.recurrence) {
        const recurringExpense = await RecurringExpense.create({
          ...req.body,
          paidBy: req.body.paidBy,
          startDate: req.body.date,
          lastGenerated: req.body.date,
        });
        expense.recurringId = recurringExpense._id;
        await expense.save();
      }

      res.status(201).json({ success: true, data: expense });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense)
      return res
        .status(404)
        .json({ success: false, message: "Dépense non trouvée" });
    await expense.deleteOne();
    res.json({ success: true, message: "Dépense supprimée" });
  } catch (error) {
    next(error);
  }
});

router.get("/balance/monthly", async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = month ? parseInt(month) : new Date().getMonth();
    const y = year ? parseInt(year) : new Date().getFullYear();

    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({ date: { $gte: start, $lte: end } });
    const summary = { totalExpenses: 0, byPerson: {} };

    expenses.forEach((e) => {
      summary.totalExpenses += e.amount;
      summary.byPerson[e.paidBy] = (summary.byPerson[e.paidBy] || 0) + e.amount;
    });

    const people = Object.keys(summary.byPerson);
    if (people.length === 2) {
      const half = summary.totalExpenses / 2;
      const diff = summary.byPerson[people[0]] - half;
      summary.balance = {
        owedBy: diff < 0 ? people[0] : people[1],
        owedTo: diff < 0 ? people[1] : people[0],
        amount: Math.abs(diff),
      };
    }

    res.json({ success: true, data: summary });
  } catch (e) {
    next(e);
  }
});

export default router;
