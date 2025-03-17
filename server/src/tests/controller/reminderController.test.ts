import express from 'express';
import request from 'supertest';
import { addReminder, getAllReminders, editReminder, deleteReminder } from '../../db/reminderService';
import { addReminderController, getAllRemindersController, editReminderController, deleteReminderController } from '../../controller/reminderController';

jest.mock('../../db/reminderService');
jest.mock('../../controller/controlLog');

const fakeReminder = {
    _id: 'reminder123',
    name: 'Test Reminder',
    text: 'This is a test reminder',
    time: '2025-02-17T12:00:00Z',
    viewed: false,
};

const app = express();
app.use(express.json());

app.post('/api/reminder', addReminderController);
app.get('/api/reminder/:userId', getAllRemindersController);
app.put('/api/reminder/:id', editReminderController);
app.delete('/api/reminder/:id', deleteReminderController);

describe('Reminder Controller', () => {
    describe('addReminderController', () => {
        const addReminderMock = addReminder as jest.Mock;
        
        it('should add a reminder successfully', async () => {
            addReminderMock.mockResolvedValue(fakeReminder);

            const response = await request(app)
                .post('/api/reminder')
                .send({
                    userId: 'user123',
                    name: 'Test Reminder',
                    text: 'This is a test reminder',
                    time: '2025-02-17T12:00:00Z',
                });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Reminder added successfully');
            expect(response.body.reminder).toEqual({
                id: 'reminder123',
                name: 'Test Reminder',
                text: 'This is a test reminder',
                time: expect.any(String),
                viewed: false,
            });
        });

        it('should return error if adding reminder fails', async () => {
            addReminderMock.mockRejectedValue(new Error('Error creating reminder'));

            const response = await request(app)
                .post('/api/reminder')
                .send({
                    userId: 'user123',
                    name: 'Test Reminder',
                    text: 'This is a test reminder',
                    time: '2025-02-17T12:00:00Z',
                });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error creating reminder');
        });
    });

    describe('getAllRemindersController', () => {
        const getAllRemindersMock = getAllReminders as jest.Mock;

        it('should get all reminders successfully', async () => {
            getAllRemindersMock.mockResolvedValue([fakeReminder]);

            const response = await request(app)
                .get('/api/reminder/user123');

            expect(response.status).toBe(200);
            expect(response.body).toHaveLength(1);
            expect(response.body[0]).toEqual({
                id: 'reminder123',
                name: 'Test Reminder',
                text: 'This is a test reminder',
                time: expect.any(String),
                viewed: false,
            });
        });

        it('should return error if retrieving reminders fails', async () => {
            getAllRemindersMock.mockRejectedValue(new Error('Error retrieving reminders'));

            const response = await request(app)
                .get('/api/reminder/user123');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error retrieving reminders');
        });
    });

    describe('editReminderController', () => {
        const editReminderMock = editReminder as jest.Mock;

        it('should update a reminder successfully', async () => {
            const updatedReminder = {
                ...fakeReminder,
                name: 'Updated Reminder',
                text: 'This is an updated reminder',
                viewed: true,
            };

            editReminderMock.mockResolvedValue(updatedReminder);

            const response = await request(app)
                .put('/api/reminder/reminder123')
                .send({
                    name: 'Updated Reminder',
                    text: 'This is an updated reminder',
                    time: '2025-02-18T12:00:00Z',
                    viewed: true,
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Reminder updated successfully');
            expect(response.body.reminder).toEqual({
                id: 'reminder123',
                name: 'Updated Reminder',
                text: 'This is an updated reminder',
                time: expect.any(String),
                viewed: true,
            });
        });

        it('should return error if updating reminder fails', async () => {
            editReminderMock.mockRejectedValue(new Error('Error updating reminder'));

            const response = await request(app)
                .put('/api/reminder/reminder123')
                .send({
                    name: 'Updated Reminder',
                    text: 'This is an updated reminder',
                    time: '2025-02-18T12:00:00Z',
                    viewed: true,
                });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error updating reminder');
        });

        it('should return 404 if reminder not found', async () => {
            editReminderMock.mockResolvedValue(null);

            const response = await request(app)
                .put('/api/reminder/reminder123')
                .send({
                    name: 'Updated Reminder',
                    text: 'This is an updated reminder',
                    time: '2025-02-18T12:00:00Z',
                    viewed: true,
                });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Reminder not found');
        });
    });

    describe('deleteReminderController', () => {
        const deleteReminderMock = deleteReminder as jest.Mock;

        it('should delete a reminder successfully', async () => {
            deleteReminderMock.mockResolvedValue({ deletedCount: 1 });

            const response = await request(app).delete('/api/reminder/reminder123');

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Reminder deleted successfully');
        });

        it('should return 404 if reminder not found', async () => {
            deleteReminderMock.mockResolvedValue({ deletedCount: 0 });

            const response = await request(app).delete('/api/reminder/reminder123');

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Reminder not found');
        });

        it('should return error if deleting reminder fails', async () => {
            deleteReminderMock.mockRejectedValue(new Error('Error deleting reminder'));

            const response = await request(app).delete('/api/reminder/reminder123');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Error deleting reminder');
        });
    });
});
