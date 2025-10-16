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

// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connexion à la base de données
connectDB();

// Middleware de sécurité
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limite de 100 requêtes par fenêtre
});
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

// Route de test
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API fonctionne correctement",
    timestamp: new Date().toISOString(),
  });
});

// Gestion des erreurs 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route non trouvée",
  });
});

// Middleware de gestion des erreurs
app.use(errorHandler);

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
  console.log(`📱 Environnement: ${process.env.NODE_ENV}`);

  // Démarrer le job des dépenses récurrentes
  startRecurringExpensesJob();
});

export default app;
