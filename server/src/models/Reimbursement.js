import mongoose from "mongoose";

const reimbursementSchema = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: [true, "Le montant est requis"],
      min: [0, "Le montant doit être positif"],
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "L'émetteur est requis"],
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Le destinataire est requis"],
    },
    date: {
      type: Date,
      required: [true, "La date est requise"],
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

reimbursementSchema.pre("save", function (next) {
  if (this.from.equals(this.to)) {
    next(
      new Error("Le remboursement doit être entre deux personnes différentes")
    );
  }
  next();
});

reimbursementSchema.index({ date: -1 });

export default mongoose.model("Reimbursement", reimbursementSchema);
