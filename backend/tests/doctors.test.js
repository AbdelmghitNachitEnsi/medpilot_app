import request from 'supertest';
import { app } from '../app.js';
import { Doctor, User } from '../models/index.js';

describe('Doctors API', () => {
    let testDoctorId;
    let testUserId;

    beforeEach(async () => {
        // Créer un utilisateur docteur pour les tests
        const user = await User.create({
            username: 'testdoctor',
            email: 'doctor@test.com',
            password: 'password123',
            role: 'doctor'
        });

        const doctor = await Doctor.create({
            username: 'testdoctor',
            specialty: 'Cardiology',
            userId: user.id
        });

        testDoctorId = doctor.id;
        testUserId = user.id;
    });

    afterEach(async () => {
        // Nettoyer après chaque test
        await Doctor.destroy({ where: {} });
        await User.destroy({ where: {} });
    });

    describe('GET /doctors', () => {
        it('should return all doctors with user email', async () => {
            const response = await request(app)
                .get('/doctors')
                .expect(200);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            const doctor = response.body[0];
            expect(doctor).toHaveProperty('id');
            expect(doctor).toHaveProperty('username');
            expect(doctor).toHaveProperty('email');
            expect(doctor).toHaveProperty('specialty');
        });
    });

    describe('DELETE /doctors/:id', () => {
        it('should delete doctor and associated user', async () => {
            const response = await request(app)
                .delete(`/doctors/${testDoctorId}`)
                .expect(200);

            expect(response.body).toHaveProperty('message', 'Doctor supprimé');

            // Vérifier que le docteur a été supprimé
            const doctor = await Doctor.findByPk(testDoctorId);
            expect(doctor).toBeNull();

            // Vérifier que l'utilisateur a été supprimé
            const user = await User.findByPk(testUserId);
            expect(user).toBeNull();
        });

        it('should return 404 for non-existent doctor', async () => {
            const response = await request(app)
                .delete('/doctors/9999')
                .expect(404);

            expect(response.body).toHaveProperty('error', 'Doctor not found');
        });
    });
});