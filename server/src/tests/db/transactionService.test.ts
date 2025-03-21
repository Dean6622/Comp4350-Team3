import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../../db/userDB';
import Tag from '../../db/tagDB';
import { addTransaction, getAllTransactions, editTransaction, deleteTransaction } from '../../db/transactionService';

//Test settings assisted by AI
beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
});
afterEach(() => {
    jest.restoreAllMocks();
});

describe('Transaction Service Tests', () => {
    let userId:string;
    let tagId:string;
    let mongoServer:MongoMemoryServer;

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
            await addTransaction(userId.toString(), '', '2025-03-20', 100, 'USD', '', [tagId.toString()]);
        } catch (err) {
            expect(err.message).toBe('Validation Error: Path `name` is required., Path `type` is required.');
        }
    });
    
    //Example test case generated by AI
    it('should retrieve all transactions for a user', async () => {
        await addTransaction(userId.toString(), 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [tagId.toString()]);
        await addTransaction(userId.toString(), 'Salary', '2025-03-21', 2000, 'USD', 'Saving', []);

        const transactions = await getAllTransactions(userId.toString());
        expect(transactions).toHaveLength(2);
        expect(transactions[0]).toHaveProperty('name', 'Groceries');
        expect(transactions[1]).toHaveProperty('name', 'Salary');
    });

    it('should not add a transaction with invalid date format', async () => {
        try {
            await addTransaction(userId.toString(), 'Groceries', '2025-20-03', 100, 'USD', 'Spending', [tagId.toString()]);
        } catch (err) {
            expect(err.message).toMatch(
                /Validation Error: Cast to date failed for value "Invalid Date" \(type Date\) at path "date"/
            );
        }
    });
    
    //Example test case generated by AI
    it('should handle multiple tags for a transaction', async () => {
        const tag2 = new Tag({ user: userId, name: 'Health', color: '#00FF00' });
        await tag2.save();

        const transaction = await addTransaction(userId.toString(), 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [tagId.toString(), tag2._id.toString()]);

        expect(transaction).toHaveProperty('_id');
        expect(transaction.tags).toHaveLength(2);
    });

    it('should not allow a transaction to have tags that do not exist', async () => {
        const invalidTagId = new mongoose.Types.ObjectId();
        try {
            await addTransaction(userId.toString(), 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [invalidTagId.toString()]);
        } catch (err) {
            expect(err.message).toMatch('One or more tags do not exist.');
        }
    });

    it('should update transaction with invalid data', async () => {
        const transaction = await addTransaction(userId.toString(), 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [tagId.toString()]);
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
            expect(err.message).toMatch(/Path `color` is invalid/);
        }
    });

    it('should not add a transaction if user balance is insufficient', async () => {
        const user = await User.findById(userId);
        user.balance = 50;
        await user.save();

        try {
            await addTransaction(userId.toString(), 'Groceries', '2025-03-20', 100, 'USD', 'Spending', [tagId.toString()]);
        } catch (err) {
            expect(err.message).toBe('Insufficient balance for spending.');
        }
    });
});
