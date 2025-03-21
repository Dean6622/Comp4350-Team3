import { Request, Response } from 'express';
import { addUserController, getSingleUserController, editUserController, deleteUserController } from '../../controller/userController';
import { addUser, getUsersByUsername, editUser, deleteUser } from '../../db/userService';

jest.mock('../../db/userService');

beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
    jest.restoreAllMocks();
});

describe('User Controller', () => {
    //Test settings assisted by AI
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        req = {};
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
    });

    describe('addUserController', () => {
        // example test case generated by AI
        it('should create a user successfully', async () => {
            const newUser = { username: 'testuser', password: 'password123' };
            const mockUser = { _id: '1', username: 'testuser', password: 'password123' };

            (addUser as jest.Mock).mockResolvedValue(mockUser);

            req.body = newUser;

            await addUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({
                message: "User created successfully",
                user: { id: mockUser._id, username: mockUser.username },
            });
        });

        it('should return an error if user creation fails', async () => {
            const newUser = { username: 'testuser', password: 'password123' };
            const error = new Error('Error creating user');
            (addUser as jest.Mock).mockRejectedValue(error);

            req.body = newUser;

            await addUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error creating user' });
        });
    });

    describe('getSingleUserController', () => {
        it('should return a single user by username', async () => {
            const username = 'testuser';
            const mockUser = [{ _id: '1', username: 'testuser', password: 'password123' }];

            (getUsersByUsername as jest.Mock).mockResolvedValue(mockUser);

            req.params = { username };

            await getSingleUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                id: mockUser[0]._id,
                username: mockUser[0].username,
            });
        });

        it('should return an error if user is not found', async () => {
            const username = 'nonexistentuser';

            (getUsersByUsername as jest.Mock).mockResolvedValue([]);

            req.params = { username };

            await getSingleUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: "User not found" });
        });

        it('should handle errors during retrieval', async () => {
            const username = 'testuser';
            const error = new Error('Error retrieving user');
            (getUsersByUsername as jest.Mock).mockRejectedValue(error);

            req.params = { username };

            await getSingleUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error retrieving user' });
        });
    });

    describe('editUserController', () => {
        it('should update user successfully', async () => {
            const id = '1';
            const updatedData = { username: 'newusername', password: 'newpassword123' };
            const updatedUser = { _id: id, username: 'newusername', password: 'newpassword123' };

            (editUser as jest.Mock).mockResolvedValue(updatedUser);

            req.params = { id };
            req.body = updatedData;

            await editUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'User updated successfully',
                user: { id: updatedUser._id, username: updatedUser.username },
            });
        });

        it('should return an error if user update fails', async () => {
            const id = '1';
            const updatedData = { username: 'newusername', password: 'newpassword123' };
            const error = new Error('Error updating user');
            (editUser as jest.Mock).mockRejectedValue(error);

            req.params = { id };
            req.body = updatedData;

            await editUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error updating user' });
        });

        it('should return not found if user does not exist', async () => {
            const id = '1';
            const updatedData = { username: 'newusername', password: 'newpassword123' };
            (editUser as jest.Mock).mockResolvedValue(null);

            req.params = { id };
            req.body = updatedData;

            await editUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });
    });

    describe('deleteUserController', () => {
        it('should delete user successfully', async () => {
            const id = '1';
            const result = { deletedCount: 1 };
            (deleteUser as jest.Mock).mockResolvedValue(result);

            req.params = { id };

            await deleteUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({ message: 'User deleted successfully' });
        });

        it('should return not found if user does not exist', async () => {
            const id = '1';
            const result = { deletedCount: 0 };
            (deleteUser as jest.Mock).mockResolvedValue(result);

            req.params = { id };

            await deleteUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'User not found' });
        });

        it('should return error if deletion fails', async () => {
            const id = '1';
            const error = new Error('Error deleting user');
            (deleteUser as jest.Mock).mockRejectedValue(error);

            req.params = { id };

            await deleteUserController(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ error: 'Error deleting user' });
        });
    });
});
