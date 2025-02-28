
import express from "express";
import {addTransactionController, getAllTransactionController, editTransactionController, deleteTransactionController} from "../controller/transactionController";
import {authenticateToken} from "../middleware/authenticator";
import {validateTransactionRequest, validateParams} from "../middleware/dbValidation";

const router = express.Router();

// just a test message for now

// example parameter for getAllTransaction
// http://localhost:3000/api/transaction/userId
router.get("/:userId", authenticateToken, validateTransactionRequest, validateParams("userId"), getAllTransactionController);

// Example body for addTransaction
// {"userId": "67ae9db31873ddf7e7e06a8d",
//   "name": "xxxx"
//   "date": "2025-02-17T12:00:00Z",
//   "amount": 100.50,
//   "currency": "USD",
//   }
router.post("/", authenticateToken, validateTransactionRequest, addTransactionController);

// http://localhost:3000/api/transaction/id
// Same as post body except no userId
router.put("/:id", authenticateToken, validateTransactionRequest, validateParams("id"), editTransactionController);

// http://localhost:3000/api/transaction/id
router.delete("/:id", authenticateToken, validateTransactionRequest, validateParams("id"), deleteTransactionController);

export default router;
