// server/src/routes/recurring.js
import express from "express";
import mongoose from "mongoose";
import RecurringExpense from "../models/RecurringExpense.js";
import Expense from "../models/Expense.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

router.get("/", async (req, res, next) => {
  try {
    const recurringExpenses = await RecurringExpense.find({
      isActive: true,
    }).sort({ createdAt: -1 });
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
    if (!recurringExpense)
      return res.status(404).json({ success: false, message: "Non trouvée" });
    res.json({ success: true, data: recurringExpense });
  } catch (error) {
    next(error);
  }
});

// Modifier une récurrente ET refléter la modif sur les Expense du mois en cours
router.put("/:id", async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const existing = await RecurringExpense.findById(req.params.id).session(
      session
    );
    if (!existing) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Non trouvée" });
    }

    // 1) Mettre à jour la récurrente (validation Mongoose)
    const updated = await RecurringExpense.findByIdAndUpdate(
      existing._id,
      req.body,
      { new: true, runValidators: true, session }
    );

    // 2) Propager les champs pertinents vers les Expense du MOIS EN COURS
    //    (on ne touche PAS à la date des dépenses existantes)
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // Champs autorisés à être propagés
    const fieldsToPropagate = [
      "amount",
      "paidBy",
      "description",
      "paymentMethod",
      "bankAccount",
      "category",
      // "recurrence" n'est PAS propagée dans les occurrences déjà créées
    ];

    const expenseUpdate = {};
    for (const key of fieldsToPropagate) {
      if (key in req.body) expenseUpdate[key] = req.body[key];
    }
    // optionnel : garder "addedBy" aligné si le payeur change
    if ("paidBy" in expenseUpdate) {
      expenseUpdate.addedBy =
        expenseUpdate.paidBy || updated.paidBy || "Inconnu";
    }

    let modifiedCount = 0;
    if (Object.keys(expenseUpdate).length > 0) {
      const resUpdate = await Expense.updateMany(
        {
          isRecurring: true,
          recurringId: existing._id,
          date: { $gte: monthStart, $lte: monthEnd },
        },
        { $set: expenseUpdate },
        { session }
      );
      // suivant la version de Mongoose : acknowledged/matchedCount/modifiedCount
      modifiedCount = resUpdate.modifiedCount ?? resUpdate.nModified ?? 0;
    }

    await session.commitTransaction();
    session.endSession();

    return res.json({
      success: true,
      data: updated,
      propagatedThisMonth: modifiedCount,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

// Supprimer une dépense récurrente + ses Expense du mois en cours
router.delete("/:id", async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const recurring = await RecurringExpense.findById(req.params.id).session(
      session
    );
    if (!recurring) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: "Non trouvée" });
    }

    // bornes du mois en cours (heure locale serveur)
    const now = new Date();
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1,
      0,
      0,
      0,
      0
    );
    const monthEnd = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999
    );

    // supprimer les Expense liées à cette récurrente pour le mois en cours
    const delRes = await Expense.deleteMany(
      {
        isRecurring: true,
        recurringId: recurring._id,
        date: { $gte: monthStart, $lte: monthEnd },
      },
      { session }
    );

    // supprimer la récurrente
    await RecurringExpense.findByIdAndDelete(recurring._id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Dépense récurrente supprimée",
      removedExpensesThisMonth: delRes.deletedCount || 0,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

export default router;
