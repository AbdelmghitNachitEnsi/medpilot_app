const { sequelize } = require('../models/index.js');

// Nettoyer la base de données avant chaque test
beforeEach(async () => {
    await sequelize.sync({ force: false });
});

// Fermer la connexion après tous les tests
afterAll(async () => {
    await sequelize.close();
});