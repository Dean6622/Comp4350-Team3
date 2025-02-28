import request from 'supertest';
import express from 'express';
import { getIndex, postIndex } from '../../controller/indexController';

const app = express();
app.use(express.json());

app.get('/', getIndex);
app.post('/', postIndex);

describe('Index Controller', () => {
    test('GET / should return a test JSON response', async () => {
        const response = await request(app).get('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ test: "This is a test" });
    });

    test('POST / should return a test JSON response', async () => {
        const response = await request(app).post('/');
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ test: "This is a test" });
    });
});
