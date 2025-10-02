import { Sequelize } from "sequelize";
import userModel from "./user.js";
import patientModel from "./patient.js";
import doctorModel from "./doctor.js";
const sequelize = new Sequelize(
  "MedPilot",
  "postgres",
  "12345",
  {
    host: "127.0.0.1",
    dialect: "postgres"
  }
);

const User = userModel(sequelize, Sequelize.DataTypes);
const Patient = patientModel(sequelize, Sequelize.DataTypes);
const Doctor = doctorModel(sequelize, Sequelize.DataTypes);

// associations
User.hasOne(Patient, { foreignKey: "userId" });
User.hasOne(Doctor, { foreignKey: "userId" });
Patient.belongsTo(User, { foreignKey: "userId" });
Doctor.belongsTo(User, { foreignKey: "userId" });

export { sequelize, User, Patient, Doctor };
