// server/src/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/database.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { startRecurringExpensesJob } from "./jobs/recurringExpenses.js";

// Routes
import authRoutes from "./routes/auth.js";
import expenseRoutes from "./routes/expenses.js";
import reimbursementRoutes from "./routes/reimbursements.js";
import recurringRoutes from "./routes/recurring.js";
import personalDebtRoutes from "./routes/personalDebts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Tu peux commenter la ligne suivante si tu veux lancer sans Mongo :
connectDB();

// Sécurité et CORS
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "x-username"],
  })
);

// Limiteur de requêtes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/reimbursements", reimbursementRoutes);
app.use("/api/recurring", recurringRoutes);
app.use("/api/personal-debts", personalDebtRoutes);

// Route test
app.get("/api/health", (_, res) =>
  res.json({
    success: true,
    message: "API OK",
    timestamp: new Date().toISOString(),
  })
);

// Gestion des erreurs
app.use((_, res) =>
  res.status(404).json({ success: false, message: "Route non trouvée" })
);
app.use(errorHandler);

// Lancement du serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur le port ${PORT}`);
  startRecurringExpensesJob();
});

export default app;
