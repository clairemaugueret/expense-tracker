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
    let filter = {};

    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    if (category) filter.category = category;
    if (paidBy) filter.paidBy = paidBy;

    const expenses = await Expense.find(filter)
      .populate("paidBy", "username")
      .sort({ date: -1 });

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
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const expense = await Expense.create(req.body);

      if (req.body.isRecurring && req.body.recurrence) {
        const recurringExpense = await RecurringExpense.create({
          amount: req.body.amount,
          paidBy: req.body.paidBy,
          description: req.body.description,
          paymentMethod: req.body.paymentMethod,
          bankAccount: req.body.bankAccount,
          category: req.body.category,
          recurrence: req.body.recurrence,
          startDate: req.body.date,
          lastGenerated: req.body.date,
        });

        expense.recurringId = recurringExpense._id;
        await expense.save();
      }

      const populatedExpense = await Expense.findById(expense._id).populate(
        "paidBy",
        "username"
      );

      res.status(201).json({ success: true, data: populatedExpense });
    } catch (error) {
      next(error);
    }
  }
);

router.delete("/:id", async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res
        .status(404)
        .json({ success: false, message: "Dépense non trouvée" });
    }
    await expense.deleteOne();
    res.json({ success: true, message: "Dépense supprimée" });
  } catch (error) {
    next(error);
  }
});

router.get("/balance/monthly", async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const targetMonth = month ? parseInt(month) : new Date().getMonth();
    const targetYear = year ? parseInt(year) : new Date().getFullYear();

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

    const expenses = await Expense.find({
      date: { $gte: startDate, $lte: endDate },
    }).populate("paidBy", "username");

    const summary = { totalExpenses: 0, byPerson: {} };

    expenses.forEach((expense) => {
      const person = expense.paidBy.username;
      summary.totalExpenses += expense.amount;
      summary.byPerson[person] =
        (summary.byPerson[person] || 0) + expense.amount;
    });

    const people = Object.keys(summary.byPerson);
    if (people.length === 2) {
      const half = summary.totalExpenses / 2;
      const difference = summary.byPerson[people[0]] - half;

      summary.balance = {
        owedBy: difference < 0 ? people[0] : people[1],
        owedTo: difference < 0 ? people[1] : people[0],
        amount: Math.abs(difference),
      };
    }

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
});

export default router;
