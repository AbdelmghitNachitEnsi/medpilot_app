import request from 'supertest';
import { app } from '../app.js';
import { User, Patient, Doctor, RendezVous } from '../models/index.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = "your_strong_secret_here";

describe('RendezVous API', () => {
    let patientToken, doctorToken;
    let patientId, doctorId;

    beforeEach(async () => {
        // Créer un patient et un docteur pour les tests
        const patientUser = await User.create({
            username: 'testpatient',
            email: 'patient@test.com',
            password: 'password123',
            role: 'patient'
        });

        const patient = await Patient.create({
            username: 'testpatient',
            userId: patientUser.id
        });

        const doctorUser = await User.create({
            username: 'testdoctor',
            email: 'doctor@test.com',
            password: 'password123',
            role: 'doctor'
        });

        const doctor = await Doctor.create({
            username: 'testdoctor',
            specialty: 'Cardiology',
            userId: doctorUser.id
        });

        patientId = patient.id;
        doctorId = doctor.id;

        // Générer les tokens
        patientToken = jwt.sign({ id: patientUser.id, role: 'patient' }, JWT_SECRET);
        doctorToken = jwt.sign({ id: doctorUser.id, role: 'doctor' }, JWT_SECRET);
    });

    afterEach(async () => {
        await RendezVous.destroy({ where: {} });
        await Patient.destroy({ where: {} });
        await Doctor.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    describe('POST /rendezvous', () => {
        it('should create a rendezvous for authenticated patient', async () => {
            const rdvData = {
                doctorId: doctorId,
                date: '2024-12-25',
                heure: '10:00'
            };

            const response = await request(app)
                .post('/rendezvous')
                .set('Authorization', `Bearer ${patientToken}`)
                .send(rdvData)
                .expect(200);

            expect(response.body).toHaveProperty('success', true);
            expect(response.body.rendezvous).toHaveProperty('id');
        });

        it('should return 400 for missing data', async () => {
            const response = await request(app)
                .post('/rendezvous')
                .set('Authorization', `Bearer ${patientToken}`)
                .send({})
                .expect(400);

            expect(response.body).toHaveProperty('error', 'Données manquantes');
        });

        it('should return 401 without token', async () => {
            const response = await request(app)
                .post('/rendezvous')
                .send({ doctorId: 1, date: '2024-12-25', heure: '10:00' })
                .expect(401);
        });
    });

    describe('GET /rendezvous/available/:doctorId', () => {
        it('should return available slots for doctor', async () => {
            const response = await request(app)
                .get(`/rendezvous/available/${doctorId}?date=2024-12-25`)
                .expect(200);

            expect(response.body).toHaveProperty('available');
            expect(Array.isArray(response.body.available)).toBe(true);
        });
    });

    describe('GET /rendezvous/mypatient', () => {
        it('should return patient appointments', async () => {
            // Créer un rendez-vous d'abord
            await RendezVous.create({
                patientId: patientId,
                doctorId: doctorId,
                date: '2024-12-25',
                heure: '10:00'
            });

            const response = await request(app)
                .get('/rendezvous/mypatient')
                .set('Authorization', `Bearer ${patientToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('rendezvous');
            expect(Array.isArray(response.body.rendezvous)).toBe(true);
        });
    });

    describe('GET /rendezvous/mydoctor', () => {
        it('should return doctor appointments', async () => {
            // Créer un rendez-vous d'abord
            await RendezVous.create({
                patientId: patientId,
                doctorId: doctorId,
                date: '2024-12-25',
                heure: '10:00'
            });

            const response = await request(app)
                .get('/rendezvous/mydoctor')
                .set('Authorization', `Bearer ${doctorToken}`)
                .expect(200);

            expect(response.body).toHaveProperty('rendezvous');
            expect(Array.isArray(response.body.rendezvous)).toBe(true);
        });

        it('should return 403 for non-doctor', async () => {
            const response = await request(app)
                .get('/rendezvous/mydoctor')
                .set('Authorization', `Bearer ${patientToken}`)
                .expect(403);

            expect(response.body).toHaveProperty('error', 'Pas un docteur');
        });
    });
});