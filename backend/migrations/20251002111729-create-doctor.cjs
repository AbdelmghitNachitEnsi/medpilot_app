'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("doctors", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        userId: {
          type: Sequelize.INTEGER,
          references: { model: "users", key: "id" },
          onDelete: "CASCADE"
        },
        username: { type: Sequelize.STRING, allowNull: false },
        specialty: { type: Sequelize.STRING },
        createdAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") },
        updatedAt: { type: Sequelize.DATE, defaultValue: Sequelize.fn("NOW") }
      });
  },

  async down (queryInterface, Sequelize) {
     await queryInterface.dropTable("doctors");
  }
};
