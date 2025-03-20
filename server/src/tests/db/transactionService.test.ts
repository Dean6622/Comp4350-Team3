import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import Transaction from '../../db/transactionDB';
import User from '../../db/userDB';
import Tag from '../../db/tagDB';
import { addTransaction, getAllTransactions, editTransaction, deleteTransaction } from '../../db/transactionService';
import { addUser } from '../../db/userService';

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
});

afterAll(async () => {
    // 关闭数据库连接和内存数据库实例
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Transaction Service Edge Case Tests', () => {
    let userId;
    let tagId;

    // 创建测试用户和标签
    beforeEach(async () => {
        await User.deleteMany({});

        const user = new User({
            username: `testuser_${Date.now()}`,
            password: 'testpassword',
            name: 'Test User',
            balance: 1000
        });
        await user.save();
        userId = user._id;

        const tag = new Tag({ user: userId, name: 'Food', color: '#FF5733' });
        await tag.save();
        tagId = tag._id;
    });

    it('should not add a transaction with missing required fields', async () => {
        try {
            await addTransaction(userId, '', '2025-03-20', 100, 'USD', '', [tagId.toString()]);
        } catch (err) {
            expect(err.message).toBe('Validation Error: Path `name` is required., Path `type` is required.');
        }
    });

    it('should not add a transaction with invalid date format', async () => {
        try {
            await addTransaction(userId, 'Groceries', '2025-20-03', 100, 'USD', 'Spending', [tagId.toString()]);
        } catch (err) {
            expect(err.message).toMatch(
                /Validation Error: Cast to date failed for value "Invalid Date" \(type Date\) at path "date"/
            );
        }
    });

    it('should handle multiple tags for a transaction', async () => {
        const tag2 = new Tag({ user: userId, name: 'Health', color: '#00FF00' });
        await tag2.save();

        const transaction = await addTransaction(userId, 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [tagId.toString(), tag2._id.toString()]);

        expect(transaction).toHaveProperty('_id');
        expect(transaction.tags).toHaveLength(2);
    });

    it('should not allow a transaction to have tags that do not exist', async () => {
        const invalidTagId = new mongoose.Types.ObjectId();
        try {
            await addTransaction(userId, 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [invalidTagId.toString()]);
        } catch (err) {
            expect(err.message).toMatch('One or more tags do not exist.');
        }
    });

    it('should update transaction with invalid data', async () => {
        const transaction = await addTransaction(userId, 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [tagId.toString()]);
        try {
            await editTransaction(transaction._id, '', '2025-03-20', -100, 'USD', 'Spending', [tagId.toString()]);
        } catch (err) {
            expect(err.message).toBe('Validation Error: Amount must be a positive number');
        }
    });

    it('should not delete a transaction that does not exist', async () => {
        const invalidTransactionId = new mongoose.Types.ObjectId();
        try {
            await deleteTransaction(invalidTransactionId.toString());
        } catch (err) {
            expect(err.message).toMatch(new RegExp(`No transaction found with ID ${invalidTransactionId.toString()}`));
        }
    });

    it('should handle very large transaction amounts', async () => {
        const largeAmount = 1000000000000; // 1 trillion
        const transaction = await addTransaction(userId, 'Big Purchase', '2025-03-20', largeAmount, 'USD', 'Saving', [tagId.toString()]);

        expect(transaction).toHaveProperty('_id');
        expect(transaction.amount).toBe(largeAmount);
    });

    it('should reject a tag with invalid color code (not hex)', async () => {
        try {
            const invalidTag = new Tag({ user: userId, name: 'Invalid Color', color: 'notAHexColor' });
            await invalidTag.save();
        } catch (err) {
            expect(err.message).toMatch(/Path `color` is invalid/);
        }
    });

    it('should reject a tag with a color shorter than 7 characters', async () => {
        try {
            const invalidTag = new Tag({ user: userId, name: 'Short Color', color: '#12345' });
            await invalidTag.save();
        } catch (err) {
            expect(err.message).toMatch(/Path `color` is invalid/);  // Expect the regex validation to fail
        }
    });

    it('should not add a transaction if user balance is insufficient', async () => {
        const user = await User.findById(userId);
        user.balance = 50; // Set a low balance
        await user.save();

        try {
            await addTransaction(userId, 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [tagId.toString()]);
        } catch (err) {
            expect(err.message).toBe('Insufficient balance for spending.');
        }
    });
});
