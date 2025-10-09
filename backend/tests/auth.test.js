const request = require('supertest');
const { app } = require('../app.js');
const { User, Patient, Doctor } = require('../models/index.js');

describe('Authentication API', () => {
    describe('POST /auth/signup', () => {
        it('should create a new patient user', async () => {
            const userData = {
                username: 'testpatient',
                email: 'patient@test.com',
                password: 'password123',
                role: 'patient'
            };

            const response = await request(app)
                .post('/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'User created');

            // Vérifier que l'utilisateur a été créé
            const user = await User.findOne({ where: { email: userData.email } });
            expect(user).toBeTruthy();
            expect(user.role).toBe('patient');

            // Vérifier que le patient a été créé
            const patient = await Patient.findOne({ where: { userId: user.id } });
            expect(patient).toBeTruthy();
        });

        it('should create a new doctor user', async () => {
            const userData = {
                username: 'testdoctor',
                email: 'doctor@test.com',
                password: 'password123',
                role: 'doctor',
                specialty: 'Cardiology'
            };

            const response = await request(app)
                .post('/auth/signup')
                .send(userData)
                .expect(201);

            expect(response.body).toHaveProperty('message', 'User created');

            // Vérifier que l'utilisateur a été créé
            const user = await User.findOne({ where: { email: userData.email } });
            expect(user).toBeTruthy();
            expect(user.role).toBe('doctor');

            // Vérifier que le doctor a été créé
            const doctor = await Doctor.findOne({ where: { userId: user.id } });
            expect(doctor).toBeTruthy();
            expect(doctor.specialty).toBe('Cardiology');
        });

        it('should return 400 for duplicate email', async () => {
            const userData = {
                username: 'testuser',
                email: 'duplicate@test.com',
                password: 'password123',
                role: 'patient'
            };

            // Premier enregistrement
            await request(app)
                .post('/auth/signup')
                .send(userData)
                .expect(201);

            // Deuxième enregistrement avec le même email
            const response = await request(app)
                .post('/auth/signup')
                .send(userData)
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Email already exists');
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Créer un utilisateur de test pour les tests de login
            await request(app)
                .post('/auth/signup')
                .send({
                    username: 'logintest',
                    email: 'login@test.com',
                    password: 'password123',
                    role: 'patient'
                });
        });

        it('should login successfully with correct credentials', async () => {
            const loginData = {
                email: 'login@test.com',
                password: 'password123'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('role', 'patient');
            expect(response.body).toHaveProperty('username', 'logintest');
        });

        it('should return 401 for wrong password', async () => {
            const loginData = {
                email: 'login@test.com',
                password: 'wrongpassword'
            };

            const response = await request(app)
                .post('/auth/login')
                .send(loginData)
                .expect(401);

            expect(response.body).toHaveProperty('error', 'Wrong password');
        });
    });
});