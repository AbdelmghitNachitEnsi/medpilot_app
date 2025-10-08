import express from "express";
import { Doctor,Patient,User, RendezVous } from "../models/index.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

const availableSlots = ["08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30","1:00"];

// Créer rendez-vous (patient connecté)
router.post("/rendezvous", authMiddleware, async (req, res) => {
  const { doctorId, date, heure } = req.body;
  const patientId = req.patient.id; // récupéré depuis le middleware

  if (!doctorId || !date || !heure) 
    return res.status(400).json({ error: "Données manquantes" });

  const exists = await RendezVous.findOne({ where: { doctorId, date, heure } });
  if (exists) return res.status(400).json({ error: "Créneau déjà pris" });

  const rdv = await RendezVous.create({ patientId, doctorId, date, heure });
  res.json({ success: true, rendezvous: rdv });
});


// Obtenir créneaux disponibles pour un médecin
router.get("/rendezvous/available/:doctorId", async (req, res) => {
  const { doctorId } = req.params;
  const { date } = req.query;

  const takenSlots = (await RendezVous.findAll({ where: { doctorId, date } }))
    .map(r => r.heure);

  const available = availableSlots.filter(s => !takenSlots.includes(s));
  res.json({ available });
});
// Obtenir les rendez-vous du patient connecté
router.get("/rendezvous/mypatient", authMiddleware, async (req, res) => {
  try {
    const patientId = req.patient.id;

    const rendezvous = await RendezVous.findAll({
      where: { patientId },
      include: [
        {
          model: Doctor,
          attributes: ["id", "username", "specialty"],
        }
      ],
      order: [["date", "ASC"], ["heure", "ASC"]]
    });

    res.json({ rendezvous });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.get("/rendezvous/mydoctor", authMiddleware, async (req, res) => {
  try {
    const doctorId = req.doctor?.id;
    if (!doctorId) return res.status(403).json({ error: "Pas un docteur" });

    const rendezvous = await RendezVous.findAll({
      where: { doctorId },
      include: [
        {
          model: Patient,
          include: [
            { model: User, attributes: ["username", "email"] }
          ],
          attributes: ["id"]
        }
      ],
      order: [["date", "ASC"], ["heure", "ASC"]]
    });

    const list = rendezvous.map(r => ({
      id: r.id,
      date: r.date,
      heure: r.heure,
      patient: r.Patient && r.Patient.User ? {
        id: r.Patient.id,
        username: r.Patient.User.username,
        email: r.Patient.User.email
      } : null
    }));

    res.json({ rendezvous: list });
  } catch (err) {
    console.error(err); // ← important pour voir la vraie erreur
    res.status(500).json({ error: "Erreur serveur" });
  }
});


export default router;
