import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import doctorsRoutes from "./routes/doctors.js";
import rendezvousRoutes from "./routes/rendezvous.js";

import dotenv from 'dotenv';
dotenv.config();

console.log('Environment variables:', {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_NAME: process.env.DB_NAME,
  NODE_ENV: process.env.NODE_ENV
});

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/doctors", doctorsRoutes);
app.get("/", (req, res) => res.send("API Running"));


app.use(rendezvousRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
  }
});
