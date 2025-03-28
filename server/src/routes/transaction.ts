
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
// {
//     "name": "Bush Ranger",
//     "date": "Wed, Feb 26, 2025",
//     "amount": 225.33,
//     "currency": "USD",
//     "type": "Saving",
//     "tags": ["67db62353b97cd313c187c44", "67db57be0f728ceeaa64f4f0"]
// }
// Tags are optional
router.post("/", authenticateToken, validateTransactionRequest, addTransactionController);

// http://localhost:3000/api/transaction/id
// Same as addTransaction body except no userId
router.put("/:id", authenticateToken, validateTransactionRequest, validateParams("id"), editTransactionController);

// http://localhost:3000/api/transaction/id
router.delete("/:id", authenticateToken, validateTransactionRequest, validateParams("id"), deleteTransactionController);

export default router;
