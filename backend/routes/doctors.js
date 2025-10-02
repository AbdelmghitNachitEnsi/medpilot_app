import express from "express";
import { Doctor, User } from "../models/index.js";

const router = express.Router();

// GET all doctors
router.get("/", async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [{ model: User, attributes: ["email"] }]
    });
    const list = doctors.map(d => ({
      id: d.id,
      username: d.username,
      email: d.User.email,
      specialty: d.specialty
    }));
    res.json(list);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE doctor
router.delete("/:id", async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    // Supprimer User associé
    await User.destroy({ where: { id: doctor.userId } });
    await doctor.destroy();

    res.json({ message: "Doctor supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
