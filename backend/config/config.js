import dotenv from 'dotenv';
dotenv.config();

export default {
    development: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'rimarima',
        database: process.env.DB_NAME || 'MedPilot',
        host: process.env.DB_HOST || 'database',
        dialect: 'postgres',
    },
    test: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'rimarima',
        database: process.env.DB_NAME || 'MedPilot_test',
        host: process.env.DB_HOST || 'database',
        dialect: 'postgres',
    },
    production: {
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'rimarima',
        database: process.env.DB_NAME || 'MedPilot_prod',
        host: process.env.DB_HOST || 'database',
        dialect: 'postgres',
    },
};