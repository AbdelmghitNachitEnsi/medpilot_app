import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class Doctor extends Model {
    static associate(models) {
      this.belongsTo(models.User, { foreignKey: "userId" });
    }
  }
  Doctor.init({
    username: DataTypes.STRING,
    specialty: DataTypes.STRING,
    userId: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: "Doctor",
    tableName: "doctors"
  });
  return Doctor;
};
