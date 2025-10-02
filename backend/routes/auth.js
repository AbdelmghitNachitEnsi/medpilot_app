import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User, Patient, Doctor } from "../models/index.js";
import { body, validationResult } from "express-validator";

const router = express.Router();
const JWT_SECRET = "your_strong_secret_here";

// SIGNUP
router.post("/signup",
  [
    body("username").notEmpty(),
    body("email").isEmail(),
    body("password").isLength({ min: 6 }),
    body("role").isIn(["patient", "doctor"])
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, email, password, role, specialty } = req.body;

    const existing = await User.findOne({ where: { email }});
    if (existing) return res.status(400).json({ error: "Email already exists" });

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ username, email, password: hash, role });

    if (role === "patient") {
      await Patient.create({ username, userId: user.id });
    } else if (role === "doctor") {
      await Doctor.create({ username, specialty: specialty || "", userId: user.id });
    }

    res.status(201).json({ message: "User created" });
  }
);


// LOGIN
router.post("/login",
  [ body("email").isEmail(), body("password").notEmpty() ],
  async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email }});
    if (!user) return res.status(404).json({ error: "User not found" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Wrong password" });

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    res.json({ token, role: user.role,username: user.username });
  }
);

export default router;
