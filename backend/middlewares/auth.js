import jwt from "jsonwebtoken";
import { User, Patient, Doctor } from "../models/index.js";

const JWT_SECRET = "your_strong_secret_here";

export const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: "Utilisateur introuvable" });

    if (user.role === "patient") {
      const patient = await Patient.findOne({ where: { userId: user.id } });
      if (!patient) return res.status(403).json({ error: "Pas un patient" });
      req.patient = patient;
    } else if (user.role === "doctor") {
      const doctor = await Doctor.findOne({ where: { userId: user.id } });
      if (!doctor) return res.status(403).json({ error: "Pas un docteur" });
      req.doctor = doctor;
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: "Token invalide" });
  }
};
