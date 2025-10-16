import mongoose from "mongoose";

const recurringExpenseSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Le montant est requis"],
      min: [0, "Le montant doit être positif"],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le payeur est requis"],
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
    recurrence: {
      type: String,
      enum: ["hebdomadaire", "mensuelle", "trimestrielle", "annuelle"],
      required: [true, "La récurrence est requise"],
    },
    startDate: {
      type: Date,
      required: [true, "La date de début est requise"],
      default: Date.now,
    },
    lastGenerated: {
      type: Date,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("RecurringExpense", recurringExpenseSchema);
