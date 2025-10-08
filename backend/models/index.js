import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
import userModel from "./user.js";
import patientModel from "./patient.js";
import doctorModel from "./doctor.js";


dotenv.config();

const sequelize = new Sequelize(
    process.env.DB_NAME || "MedPilot",
    process.env.DB_USER || "postgres",
    process.env.DB_PASSWORD || "123456",
    {
        host: process.env.DB_HOST || "database",
        dialect: "postgres",
        port: process.env.DB_PORT || 5432,
        logging: console.log
    }
);

// Add connection test
console.log('Database connection config:', {
    host: process.env.DB_HOST || "database",
    database: process.env.DB_NAME || "MedPilot",
    user: process.env.DB_USER || "postgres"
});

const User = userModel(sequelize, Sequelize.DataTypes);
const Patient = patientModel(sequelize, Sequelize.DataTypes);
const Doctor = doctorModel(sequelize, Sequelize.DataTypes);

// associations
User.hasOne(Patient, { foreignKey: "userId" });
User.hasOne(Doctor, { foreignKey: "userId" });
Patient.belongsTo(User, { foreignKey: "userId" });
Doctor.belongsTo(User, { foreignKey: "userId" });

export { sequelize, User, Patient, Doctor };