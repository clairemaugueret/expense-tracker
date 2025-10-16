// server/src/models/PersonalDebt.js
import mongoose from "mongoose";

const personalDebtSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    paidBy: {
      type: String,
      required: [true, "Le créancier est requis"],
      trim: true,
    },
    owedBy: {
      type: String,
      required: [true, "Le débiteur est requis"],
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    date: { type: Date, required: true, default: Date.now },
    addedBy: {
      type: String,
      required: [true, "L'ajouteur est requis"],
      trim: true,
    },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Validation : créancier ≠ débiteur
personalDebtSchema.pre("save", function (next) {
  if (this.paidBy === this.owedBy) {
    return next(
      new Error("Le créancier et le débiteur doivent être différents")
    );
  }
  next();
});

personalDebtSchema.index({ isPaid: 1 });
personalDebtSchema.index({ owedBy: 1 });
personalDebtSchema.index({ paidBy: 1 });

export default mongoose.model("PersonalDebt", personalDebtSchema);
