// server/src/middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  console.error("❌ Erreur:", err.message);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: "Erreur de validation",
      errors,
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: "Cette valeur existe déjà",
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "ID invalide",
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erreur serveur",
  });
};
