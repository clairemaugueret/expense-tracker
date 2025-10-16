// server/src/routes/reimbursements.js
import express from "express";
import mongoose from "mongoose";
import { body, validationResult } from "express-validator";
import Reimbursement from "../models/Reimbursement.js";
import PersonalDebt from "../models/PersonalDebt.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();
router.use(protect);

// Récupérer tous les remboursements
router.get("/", async (req, res, next) => {
  try {
    const reimbursements = await Reimbursement.find()
      .populate("personalDebtIds")
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

// Créer un remboursement avec gestion optionnelle des avances
router.post(
  "/",
  [
    body("amount").isFloat({ min: 0 }),
    body("from").notEmpty(),
    body("to").notEmpty(),
    body("date").isISO8601(),
    body("settlesPersonalDebts").optional().isBoolean(),
    body("personalDebtIds").optional().isArray(),
  ],
  async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const {
        amount,
        from,
        to,
        date,
        settlesPersonalDebts,
        personalDebtIds,
        notes,
      } = req.body;

      // Créer le remboursement
      const reimbursement = await Reimbursement.create(
        [
          {
            amount,
            from,
            to,
            date,
            settlesPersonalDebts: settlesPersonalDebts || false,
            personalDebtIds: personalDebtIds || [],
            notes: notes || "",
          },
        ],
        { session }
      );

      // Si on règle des avances personnelles, les marquer comme payées
      if (
        settlesPersonalDebts &&
        personalDebtIds &&
        personalDebtIds.length > 0
      ) {
        await PersonalDebt.updateMany(
          {
            _id: { $in: personalDebtIds },
            isPaid: false,
          },
          {
            isPaid: true,
            paidAt: new Date(date),
          },
          { session }
        );
      }

      await session.commitTransaction();
      session.endSession();

      const populatedReimbursement = await Reimbursement.findById(
        reimbursement[0]._id
      ).populate("personalDebtIds");

      res.status(201).json({
        success: true,
        data: populatedReimbursement,
        settledDebtsCount: personalDebtIds?.length || 0,
      });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      next(error);
    }
  }
);

// Supprimer un remboursement (et annuler les avances associées si nécessaire)
router.delete("/:id", async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const reimbursement = await Reimbursement.findById(req.params.id).session(
      session
    );

    if (!reimbursement) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Remboursement non trouvé",
      });
    }

    // Si ce remboursement avait marqué des avances comme payées, les remettre à non-payées
    if (
      reimbursement.settlesPersonalDebts &&
      reimbursement.personalDebtIds.length > 0
    ) {
      await PersonalDebt.updateMany(
        { _id: { $in: reimbursement.personalDebtIds } },
        {
          isPaid: false,
          paidAt: null,
        },
        { session }
      );
    }

    await Reimbursement.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      message: "Remboursement supprimé",
      unsettledDebtsCount: reimbursement.personalDebtIds.length,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});

export default router;
