// server/src/models/Reimbursement.js
import mongoose from "mongoose";

const reimbursementSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    from: {
      type: String,
      required: [true, "L'émetteur est requis"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "Le destinataire est requis"],
      trim: true,
    },
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

reimbursementSchema.pre("save", function (next) {
  if (this.from === this.to) {
    return next(
      new Error("Le remboursement doit être entre deux personnes différentes")
    );
  }
  next();
});

reimbursementSchema.index({ date: -1 });

export default mongoose.model("Reimbursement", reimbursementSchema);
