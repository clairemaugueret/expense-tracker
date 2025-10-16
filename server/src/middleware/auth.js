// server/src/middleware/auth.js
export const protect = (req, res, next) => {
  const username = req.headers["x-username"];

  if (!username) {
    return res.status(401).json({
      success: false,
      message: "Non autorisé - Username manquant dans les en-têtes",
    });
  }

  req.username = username;
  next();
};
