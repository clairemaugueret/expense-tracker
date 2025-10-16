// server/src/routes/auth.js
import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth désactivée — tout passe par x-username",
  });
});

export default router;
