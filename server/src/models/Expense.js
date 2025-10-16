// server/src/models/Expense.js
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Le montant est requis"],
      min: [0, "Le montant doit être positif"],
    },
    date: {
      type: Date,
      required: [true, "La date est requise"],
      default: Date.now,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le payeur est requis"],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'ajouteur est requis"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["CB", "Prélèvement", "Espèces", "Virement", ""],
      default: "",
    },
    bankAccount: {
      type: String,
      default: "",
    },
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
    isRecurring: {
      type: Boolean,
      default: false,
    },
    recurringId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringExpense",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ addedBy: 1 });
expenseSchema.index({ category: 1 });

export default mongoose.model("Expense", expenseSchema);
