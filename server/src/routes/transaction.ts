
import express from 'express';
import{ addTransactionController, getAllTransactionController, editTransactionController, deleteTransactionController } from '../controller/transactionController.js'
import { authenticateToken } from '../middleware/authenticator.js';

const router = express.Router();

// just a test message for now

//example parameter for getAllTransaction
// http://localhost:3000/api/transaction/userId
router.get('/:userId', authenticateToken, getAllTransactionController);

//Example body for addTransaction
// {"userId": "67ae9db31873ddf7e7e06a8d",
//   "date": "2025-02-17T12:00:00Z",
//   "amount": 100.50,
//   "currency": "USD",
//   "tag": {
//     "name": "Food",
//     "color": "#FF5733"
//   }}
router.post('/', authenticateToken, addTransactionController);

// http://localhost:3000/api/transaction/id
// Same as post body except no userId
router.put('/:id', authenticateToken, editTransactionController);

// http://localhost:3000/api/transaction/id
router.delete('/:id', authenticateToken, deleteTransactionController);

export default router;