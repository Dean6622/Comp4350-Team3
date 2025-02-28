import { Request, Response } from 'express';
import { 
    addTransactionController, 
    getAllTransactionController, 
    editTransactionController, 
    deleteTransactionController 
} from '../../src/controller/transactionController';

import { 
    addTransaction, 
    getAllTransactions, 
    editTransaction, 
    deleteTransaction 
} from '../../src/db/transactionService';

jest.mock('../../src/db/transactionService');

describe('Transaction Controller', () => {
    //Test settings assisted by AI
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRes = {
            status: statusMock,
            json: jsonMock,
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addTransactionController', () => {
        it('should return 201 and transaction data when successful', async () => {
            mockReq = {
                body: {
                    userId: '123',
                    name: 'Test',
                    date: '2025-02-26',
                    amount: 100,
                    currency: 'USD',
                    tags: [
                        { _id: 'tag1', name: 'food', color: '#FF0000' },
                        { _id: 'tag2', name: 'xxx', color: '#00FF00' },
                        { _id: 'tag3', name: 'sixi', color: '#0000FF' }
                    ]
                }
            };

            const mockTransaction = { _id: '1', ...mockReq.body };
            (addTransaction as jest.Mock).mockResolvedValue(mockTransaction);
            await addTransactionController(mockReq as Request, mockRes as Response);
            expect(addTransaction).toHaveBeenCalledWith(
                '123', 'Test', '2025-02-26', 100, 'USD', mockReq.body.tags
            );

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Transaction added successfully',
                transaction: {
                    id: '1',
                    name: 'Test',
                    date: new Date(mockTransaction.date).toLocaleDateString('en-CA', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    amount: 100,
                    currency: 'USD',
                    tags: [
                        { id: 'tag1', name: 'food', color: '#FF0000' },
                        { id: 'tag2', name: 'xxx', color: '#00FF00' },
                        { id: 'tag3', name: 'sixi', color: '#0000FF' }
                    ],
                },
            });
        });

        it('should return 500 if transaction creation fails', async () => {
            mockReq = {
                body: {
                    userId: '123',
                    name: 'Test',
                    date: '2025-02-26',
                    amount: 100,
                    currency: 'USD',
                    tags: [{ _id: 'tag1', name: 'food', color: '#FF0000' }]
                }
            };

            (addTransaction as jest.Mock).mockRejectedValue(new Error('Database error'));
            await addTransactionController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('getAllTransactionController', () => {
        let mockReq: Partial<Request>;
        let mockRes: Partial<Response>;
        let statusMock: jest.Mock;
        let jsonMock: jest.Mock;

        beforeEach(() => {
            statusMock = jest.fn().mockReturnThis();
            jsonMock = jest.fn();
            mockRes = {
                status: statusMock,
                json: jsonMock,
            } as Partial<Response>;
        });

        it('should return 200 and a list of formatted transactions', async () => {
            mockReq = { params: { userId: '123' } };

            const mockTransactions = [
                {
                    _id: '1',
                    name: 'Test',
                    date: '2025-02-26T00:00:00.000Z',
                    amount: 100,
                    currency: 'USD',
                    tags: [
                        { _id: 'tag1', name: 'food', color: '#FF0000' },
                        { _id: 'tag2', name: 'xxx', color: '#00FF00' },
                        { _id: 'tag3', name: 'sixi', color: '#0000FF' }
                    ],
                }
            ];

            (getAllTransactions as jest.Mock).mockResolvedValue(mockTransactions);

            await getAllTransactionController(mockReq as Request, mockRes as Response);

            expect(getAllTransactions).toHaveBeenCalledWith('123');
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith([
                expect.objectContaining({
                    id: '1',
                    name: 'Test',
                    date: new Date('2025-02-26T00:00:00.000Z').toLocaleDateString('en-CA', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    amount: 100,
                    currency: 'USD',
                    tags: [
                        { id: 'tag1', name: 'food', color: '#FF0000' },
                        { id: 'tag2', name: 'xxx', color: '#00FF00' },
                        { id: 'tag3', name: 'sixi', color: '#0000FF' }
                    ],
                }),
            ]);
        });

        it('should return 500 if retrieval fails', async () => {
            mockReq = { params: { userId: '123' } };

            (getAllTransactions as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getAllTransactionController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('editTransactionController', () => {
        let mockReq: Partial<Request>;
        let mockRes: Partial<Response>;
        let statusMock: jest.Mock;
        let jsonMock: jest.Mock;

        beforeEach(() => {
            statusMock = jest.fn().mockReturnThis();
            jsonMock = jest.fn();
            mockRes = {
                status: statusMock,
                json: jsonMock,
            } as Partial<Response>;
        });

        it('should return 200 and updated transaction data if transaction exists', async () => {
            mockReq = {
                params: { id: '1' },
                body: {
                    name: 'Updated Test',
                    date: '2025-02-26',
                    amount: 100,
                    currency: 'USD',
                    tags: [{ _id: 'tag1', name: 'food', color: '#FF0000' }]
                }
            };

            const mockTransaction = {
                _id: '1',
                name: 'Updated Test',
                date: '2025-02-26',
                amount: 100,
                currency: 'USD',
                tags: [{ _id: 'tag1', name: 'food', color: '#FF0000' }]
            };

            (editTransaction as jest.Mock).mockResolvedValue(mockTransaction);

            await editTransactionController(mockReq as Request, mockRes as Response);

            expect(editTransaction).toHaveBeenCalledWith(
                '1', 'Updated Test', '2025-02-26', 100, 'USD', [{ _id: 'tag1', name: 'food', color: '#FF0000' }]
            );

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Transaction updated successfully',
                transaction: expect.objectContaining({
                    id: '1',
                    name: 'Updated Test',
                    date: new Date('2025-02-26').toLocaleDateString('en-CA', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    }),
                    amount: 100,
                    currency: 'USD',
                    tags: [{ id: 'tag1', name: 'food', color: '#FF0000' }]
                }),
            });
        });

        it('should return 404 if transaction does not exist', async () => {
            mockReq = { params: { id: '1' }, body: { name: 'Updated Test' } };

            (editTransaction as jest.Mock).mockResolvedValue(null);

            await editTransactionController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Transaction not found' });
        });

        it('should return 500 if update fails', async () => {
            mockReq = { params: { id: '1' }, body: { name: 'Updated Test' } };

            (editTransaction as jest.Mock).mockRejectedValue(new Error('Database error'));

            await editTransactionController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('deleteTransactionController', () => {
        it('should return 200 if transaction is deleted', async () => {
            mockReq = { params: { id: '1' } };
            (deleteTransaction as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            await deleteTransactionController(mockReq as Request, mockRes as Response);

            expect(deleteTransaction).toHaveBeenCalledWith('1');
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Transaction deleted successfully' });
        });

        it('should return 404 if transaction is not found', async () => {
            mockReq = { params: { id: '1' } };
            (deleteTransaction as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            await deleteTransactionController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Transaction not found' });
        });

        it('should return 500 if deletion fails', async () => {
            mockReq = { params: { id: '1' } };

            (deleteTransaction as jest.Mock).mockRejectedValue(new Error('Database error'));

            await deleteTransactionController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
});
