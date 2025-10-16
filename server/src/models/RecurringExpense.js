// server/src/models/RecurringExpense.js
import mongoose from "mongoose";

const recurringExpenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    paidBy: {
      type: String,
      required: [true, "Le payeur est requis"],
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    paymentMethod: {
      type: String,
      enum: ["CB", "Prélèvement", "Espèces", "Virement", ""],
      default: "",
    },
    bankAccount: { type: String, default: "" },
    category: {
      type: String,
      enum: [
        "Loyer",
        "Charges",
        "Repas",
        "Courses",
        "Animal",
        "Abonnements",
        "Loisirs",
        "Santé",
        "Transport",
        "Autre",
        "",
      ],
      default: "",
    },
    recurrence: {
      type: String,
      enum: ["hebdomadaire", "mensuelle", "trimestrielle", "annuelle"],
      required: true,
    },
    startDate: { type: Date, required: true, default: Date.now },
    lastGenerated: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("RecurringExpense", recurringExpenseSchema);
