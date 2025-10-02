'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("patients", {
    id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: Sequelize.INTEGER,
      references: { model: "users", key: "id" },
      onDelete: "CASCADE"
    },
    username: { type: Sequelize.STRING, allowNull: false },
    createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
    updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") }
  });
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable("patients");
  }
};
