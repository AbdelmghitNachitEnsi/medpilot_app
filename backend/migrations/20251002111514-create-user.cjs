'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
     await queryInterface.createTable("users", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        username: { type: Sequelize.STRING, allowNull: false },
        email: { type: Sequelize.STRING, allowNull: false, unique: true },
        password: { type: Sequelize.STRING, allowNull: false },
        role: { type: Sequelize.ENUM("patient", "doctor"), allowNull: false },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") }
      });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable("users");
  }
};
