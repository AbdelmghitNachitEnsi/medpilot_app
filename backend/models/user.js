import { Model, DataTypes } from "sequelize";

export default (sequelize) => {
  class User extends Model {
    static associate(models) {
      this.hasOne(models.Patient, { foreignKey: "userId" });
      this.hasOne(models.Doctor, { foreignKey: "userId" });
    }
  }
  User.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.ENUM("patient", "doctor"),
  }, {
    sequelize,
    modelName: "User",
    tableName: "users"
  });
  return User;
};
