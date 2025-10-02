import express from "express";
import cors from "cors";
import { sequelize } from "./models/index.js";
import authRoutes from "./routes/auth.js";
import doctorsRoutes from "./routes/doctors.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.use("/doctors", doctorsRoutes);
app.get("/", (req, res) => res.send("API Running"));

const PORT = 4000;
app.listen(PORT, async () => {
  await sequelize.authenticate();
  console.log("DB connected");
  console.log(`Server running on http://localhost:${PORT}`);
});
