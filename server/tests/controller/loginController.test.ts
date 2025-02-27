import request from 'supertest';
import express from 'express';
import { loginController, createAccountController, resetPasswordController, logoutController } from '../../src/controller/loginController';
import { addUser, getUsersByUsername, editUser } from '../../src/db/userService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
app.use(express.json());
app.post('/login', loginController);
app.post('/register', createAccountController);
app.post('/reset-password', resetPasswordController);
app.post('/logout', logoutController);

jest.mock('../../src/db/userService');
jest.mock('jsonwebtoken');

const mockUser = {
    id: '1',
    username: 'testUser',
    password: bcrypt.hashSync('password123', 10),
};

describe('Login Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should login successfully with correct credentials', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([mockUser]);
        (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

        const response = await request(app)
            .post('/login')
            .send({ username: 'testUser', password: 'password123' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Login successfuly!');
    });

    test('should return 401 for invalid credentials', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([mockUser]);

        const response = await request(app)
            .post('/login')
            .send({ username: 'testUser', password: 'wrongPassword' });

        expect(response.status).toBe(401);
    });

    test('should return 404 if user does not exist', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([]);

        const response = await request(app)
            .post('/login')
            .send({ username: 'nonExistentUser', password: 'password123' });

        expect(response.status).toBe(404);
    });
});

describe('Account Creation Controller', () => {
    test('should create a new account successfully', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([]);
        (addUser as jest.Mock).mockResolvedValue(mockUser);

        const response = await request(app)
            .post('/register')
            .send({ username: 'newUser', password: 'newPassword' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Account created successfully!');
    });

    test('should return 403 if username already exists', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([mockUser]);

        const response = await request(app)
            .post('/register')
            .send({ username: 'testUser', password: 'password123' });

        expect(response.status).toBe(403);
    });
});

describe('Password Reset Controller', () => {
    test('should reset password successfully', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([mockUser]);
        (editUser as jest.Mock).mockResolvedValue({ ...mockUser, password: bcrypt.hashSync('newPassword', 10) });

        const response = await request(app)
            .post('/reset-password')
            .send({ username: 'testUser', newPassword: 'newPassword' });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Password changed successfully!');
    });

    test('should return 401 if user is not found', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([]);

        const response = await request(app)
            .post('/reset-password')
            .send({ username: 'nonExistentUser', newPassword: 'newPassword' });

        expect(response.status).toBe(401);
    });
});

describe('Logout Controller', () => {
    test('should clear cookie and logout successfully', async () => {
        const response = await request(app).post('/logout');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Logged out successfully');
    });
});
