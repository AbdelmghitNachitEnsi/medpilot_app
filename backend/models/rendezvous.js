import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class RendezVous extends Model {
    static associate(models) {
      // Relation مع patient
      this.belongsTo(models.User, { foreignKey: "patientId", as: "patient" });
      // Relation مع doctor
      this.belongsTo(models.User, { foreignKey: "doctorId", as: "doctor" });
    }
  }

  RendezVous.init(
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      doctorId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      heure: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "RendezVous",
      tableName: "RendezVous",
    }
  );

  return RendezVous;
};
