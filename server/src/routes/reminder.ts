import express from "express";
import {
  addReminderController,
  getAllRemindersController,
  editReminderController,
  deleteReminderController,
} from "../controller/reminderController";
import {authenticateToken} from "../middleware/authenticator";
import {validateReminderRequest, validateParams} from "../middleware/dbValidation";

const router = express.Router();

// http://localhost:8000/api/reminder/userId
// Do not include body
router.get("/:userId", authenticateToken, validateReminderRequest, validateParams("userId"), getAllRemindersController);

// example body：
// {
//    "userId": "67c27af37862793900fc11b9",
//    "name": "Pay Reminder",
//    "text": "You have to pay at 3 PM",
//    "time": "2025-03-10T15:00:00Z"
//    "viewed": "true"
//  }
router.post("/", authenticateToken, validateReminderRequest, addReminderController);

// http://localhost:8000/api/reminder/id
// example body：
// {
//    "name": "Change Payment",
//    "text": "You have to pay at 1 PM",
//    "time": "2025-03-10T15:00:00Z"
//    "viewed": "false"
//  }
router.put("/:id", authenticateToken, validateReminderRequest, validateParams("id"), editReminderController);

// http://localhost:8000/api/reminder/id
// Do not include body
router.delete("/:id", authenticateToken, validateReminderRequest, validateParams("id"), deleteReminderController);

export default router;
