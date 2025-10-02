import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Patient extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Patient.init({
    username: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: "Patient",
    tableName: "patients"
  });
  return Patient;
};
