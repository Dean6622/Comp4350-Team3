import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Goal from '../../db/goalsDB';
import User from '../../db/userDB';
import { addGoal, getAllGoals, editGoal, deleteGoal } from '../../db/goalsService';
import { addUser } from '../../db/userService';

describe('Goals Service Tests', () => {
    let mongoServer: MongoMemoryServer;
    let userId: string;

    beforeAll(async () => {
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri);
    });

    afterAll(async () => {
        await mongoose.disconnect();
        await mongoServer.stop();
    });

    beforeEach(async () => {
        await Goal.deleteMany({});
        await User.deleteMany({});
        const user = await addUser('goalUser', 'password123', 500);
        userId = user._id.toString();
    });

    test('should add a goal', async () => {
        const goal = await addGoal(userId, 'Save for Laptop', '2025-12-31', 200, 1000, 'Saving');
        expect(goal.name).toBe('Save for Laptop');
        expect(goal.goalAmount).toBe(1000);
    });

    test('should not add a goal with an invalid category', async () => {
        await expect(addGoal(userId, 'Invalid Goal', '2025-12-31', 100, 500, 'InvalidCategory'))
            .rejects.toThrow('Invalid category. Must be one of: Saving, Investment, Debt Payment, Other');
    });

    test('should not add a goal with invalid date format', async () => {
        await expect(addGoal(userId, 'Invalid Date Goal', 'invalid-date', 100, 500, 'Saving'))
            .rejects.toThrow();
    });

    test('should not add a goal with negative currAmount or goalAmount', async () => {
        await expect(addGoal(userId, 'Negative Amount Goal', '2025-12-31', -100, 500, 'Saving'))
            .rejects.toThrow();
        await expect(addGoal(userId, 'Negative GoalAmount', '2025-12-31', 100, -500, 'Saving'))
            .rejects.toThrow();
    });

    test('should retrieve all goals for a user', async () => {
        await addGoal(userId, 'Goal1', '2025-12-31', 200, 1000, 'Saving');
        await addGoal(userId, 'Goal2', '2026-06-30', 500, 1500, 'Investment');
        const goals = await getAllGoals(userId);
        expect(goals.length).toBe(2);
    });

    test('should return empty array if user has no goals', async () => {
        const goals = await getAllGoals(userId);
        expect(goals.length).toBe(0);
    });

    test('should not get goals with invalid user ID', async () => {
        await expect(getAllGoals('invalid-user-id')).rejects.toThrow();
    });

    test('should edit a goal', async () => {
        const goal = await addGoal(userId, 'Edit Goal', '2025-12-31', 300, 800, 'Saving');
        const updatedGoal = await editGoal(goal._id.toString(), 'Updated Goal', undefined, 400, 1200);
        expect(updatedGoal).not.toBeNull();
        expect(updatedGoal?.name).toBe('Updated Goal');
        expect(updatedGoal?.goalAmount).toBe(1200);
    });

    test('should not edit a non-existent goal', async () => {
        await expect(editGoal(new mongoose.Types.ObjectId().toString(), 'New Name')).resolves.toBeNull();
    });

    test('should not edit a goal with invalid ID', async () => {
        await expect(editGoal('invalid-id', 'New Name')).rejects.toThrow();
    });

    test('should delete a goal', async () => {
        const goal = await addGoal(userId, 'Delete Goal', '2025-12-31', 100, 500, 'Saving');
        await deleteGoal(goal._id.toString());
        const goals = await getAllGoals(userId);
        expect(goals.length).toBe(0);
    });

    test('should not delete a non-existent goal', async () => {
        const result = await deleteGoal(new mongoose.Types.ObjectId().toString());
        expect(result.deletedCount).toBe(0);
    });

    test('should not delete a goal with invalid ID', async () => {
        await expect(deleteGoal('invalid-id')).rejects.toThrow();
    });
});
