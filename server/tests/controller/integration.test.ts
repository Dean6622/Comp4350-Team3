import request from 'supertest';
import express from 'express';
import bodyParser from 'body-parser';
import { loginController, createAccountController, resetPasswordController, logoutController } from '../../src/controller/loginController';
import { addUser, getUsersByUsername, editUser } from '../../src/db/userService';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

jest.mock('../../src/db/userService');
jest.mock('../../src/db/transactionService');
jest.mock('jsonwebtoken');

const app = express();
app.use(bodyParser.json());

// Mock routes (without running a server)
app.post('/login', loginController);
app.post('/signup', createAccountController);
app.post('/reset-password', resetPasswordController);
app.post('/logout', logoutController);
const LOGIN_KEY = "test_secret"; // Mock secret key

describe('Auth Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    /** ✅ Test Account Creation */
    it('should create a new account', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([]); // No existing user
        (addUser as jest.Mock).mockResolvedValue({ id: 1, username: 'testuser' });

        const res = await request(app).post('/signup').send({
            username: 'testuser',
            password: 'password123'
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Account created successfully!');
    });

    /** ❌ Test Duplicate Account */
    it('should fail if username already exists', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([{ id: 1, username: 'testuser' }]);

        const res = await request(app).post('/signup').send({
            username: 'testuser',
            password: 'password123'
        });

        expect(res.status).toBe(403);
        expect(res.body.message).toBe('username already exists.');
    });

    /** ✅ Test Password Reset */
    it('should reset password successfully', async () => {
        (getUsersByUsername as jest.Mock).mockResolvedValue([{ id: 1, username: 'testuser' }]);
        (editUser as jest.Mock).mockResolvedValue({});

        const res = await request(app).post('/reset-password').send({
            username: 'testuser',
            newPassword: 'newpassword123'
        });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Password changed successfully!');
    });

    /** ✅ Test Logout */
    it('should log out successfully', async () => {
        const res = await request(app).post('/logout');
        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Logged out successfully');
        expect(res.headers['set-cookie']).toBeDefined();
    });
});
