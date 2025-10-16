import mongoose from "mongoose";

const personalDebtSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Le montant est requis"],
      min: [0, "Le montant doit être positif"],
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le créancier est requis"],
    },
    owedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le débiteur est requis"],
    },
    description: {
      type: String,
      required: [true, "La description est requise"],
      trim: true,
    },
    date: {
      type: Date,
      required: [true, "La date est requise"],
      default: Date.now,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'ajouteur est requis"],
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

personalDebtSchema.pre("save", function (next) {
  if (this.paidBy.equals(this.owedBy)) {
    next(new Error("Le créancier et le débiteur doivent être différents"));
  }
  next();
});

personalDebtSchema.index({ isPaid: 1 });
personalDebtSchema.index({ owedBy: 1 });
personalDebtSchema.index({ paidBy: 1 });

export default mongoose.model("PersonalDebt", personalDebtSchema);
