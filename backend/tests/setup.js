import { sequelize } from '../models/index.js';

// Créer toutes les tables avant les tests
beforeAll(async () => {
    await sequelize.sync({ force: true });
});

// Fermer la connexion après les tests
afterAll(async () => {
    await sequelize.close();
});