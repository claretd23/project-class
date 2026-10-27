const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const User = require('../models/user');

// NOTA: Para las pruebas de integración con rutas, exporta app desde tu archivo principal:
// module.exports = app;

let mongoServer;

// 1. Configuración de la base de datos temporal antes de ejecutar los tests
beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
});

// 2. Limpieza de colecciones entre cada prueba
afterEach(async () => {
    await User.deleteMany({});
});

// 3. Cerrar conexión al terminar
afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

// -------------------------------------------------------------
// PRUEBAS UNITARIAS: Modelo de Usuario (Métodos internos)
// -------------------------------------------------------------
describe('Pruebas Unitarias: Modelo User', () => {

    test('Debe hashear/encriptar la contraseña al guardar un usuario', async () => {
        const userData = { email: 'test@example.com', password: 'password123' };
        const user = new User(userData);
        await user.save();

        expect(user.password).not.toBe('password123');
        expect(user.password.length).toBeGreaterThan(20);
    });

    test('comparepassword() debe retornar true para contraseñas correctas', (done) => {
        const user = new User({ email: 'test@example.com', password: 'password123' });
        
        user.save((err, savedUser) => {
            savedUser.comparepassword('password123', (err, isMatch) => {
                expect(err).toBeNull();
                expect(isMatch).toBe(true);
                done();
            });
        });
    });

    test('comparepassword() debe retornar false para contraseñas incorrectas', (done) => {
        const user = new User({ email: 'test@example.com', password: 'password123' });

        user.save((err, savedUser) => {
            savedUser.comparepassword('wrongpassword', (err, isMatch) => {
                expect(isMatch).toBe(false);
                done();
            });
        });
    });

    test('generateToken() debe adjuntar un JWT al usuario', (done) => {
        const user = new User({ email: 'jwt@example.com', password: 'password123' });

        user.save((err, savedUser) => {
            savedUser.generateToken((err, userWithToken) => {
                expect(err).toBeNull();
                expect(userWithToken.token).toBeDefined();
                expect(typeof userWithToken.token).toBe('string');
                done();
            });
        });
    });
});