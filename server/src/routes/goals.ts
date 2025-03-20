
import express from "express";
import {addGoalController, getAllGoalsController, editGoalController, deleteGoalController} from "../controller/goalsController";
import {authenticateToken} from "../middleware/authenticator";
import {validateGoalRequest, validateParams} from "../middleware/dbValidation";


const router = express.Router();


// example parameter for getAllTransaction
// http://localhost:3000/api/goal/userId
router.get("/:userId", authenticateToken, validateGoalRequest, validateParams("userId"), getAllGoalsController);

// Example body for addGoals
// {"userId": "67ae9db31873ddf7e7e06a8d",
//   "name": "xxxx"
//   "time": "2025-02-17T12:00:00Z",
//   "currAmount": 100.50,
//   "goalAmount": 100.50,  currAmount has to be smaller or equal to goalAmount (in edit if currAmount > goalAmount it will become = to goalAmount)
//   "category": "Saving",
//   }
router.post("/", authenticateToken, validateGoalRequest, addGoalController);

// http://localhost:3000/api/goal/id
// Same as addGoals body except no userId
router.put("/:id", authenticateToken, validateGoalRequest, validateParams("id"), editGoalController);

// http://localhost:3000/api/goal/id
router.delete("/:id", authenticateToken, validateGoalRequest, validateParams("id"), deleteGoalController);

export default router;
