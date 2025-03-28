import {Request, Response, NextFunction} from "express";
import {getUsersByUsername} from "../db/userService.js";
import mongoose from "mongoose";

// Validate request body contains only allowed fields for transactions
export const validateTransactionRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["userId", "name", "date", "amount", "currency", "type", "tags"];
  const bodyKeys = Object.keys(req.body);

  // Find unexpected fields
  const unexpectedFields = bodyKeys.filter((key) => !allowedFields.includes(key));

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      error: `Unexpected field(s): ${unexpectedFields.join(", ")}`,
    });
  }

  next();
};

// Validate format of request parameters
export const validateParams = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    // check if ID is a valid MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: `Invalid ${paramName} format`});
    }

    next();
  };
};

// Validate request body contains only allowed fields for user
export const validateUserRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["id", "username", "password", "newPassword", "balance"];
  const bodyKeys = Object.keys(req.body);

  // Find unexpected fields
  const unexpectedFields = bodyKeys.filter((key) => !allowedFields.includes(key));

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      error: `Unexpected field(s): ${unexpectedFields.join(", ")}`,
    });
  }

  next();
};

// Validate format of request parameters for user
export const validateParamsUser = async (req: Request, res: Response, next: NextFunction) => {
  const {username} = req.params;

  try {
    // Check if the user exists in the database
    const users = await getUsersByUsername(username);

    if (users.length === 0) {
      return res.status(404).json({
        error: `User with username "${username}" not found.`,
      });
    }

    // If user exists, proceed to the next middleware/controller
    next();
  } catch (err) {
    console.error("Error checking username in database:", err);
    return res.status(500).json({error: "Error checking username in database"});
  }
};

// Validate request body contains only allowed fields for tags
export const validateTagRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["userId", "name", "color", "message"];
  const bodyKeys = Object.keys(req.body);

  // Find unexpected fields
  const unexpectedFields = bodyKeys.filter((key) => !allowedFields.includes(key));

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      error: `Unexpected field(s): ${unexpectedFields.join(", ")}`,
    });
  }

  next();
};

// Validate request body contains only allowed fields for goals
export const validateGoalRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["userId", "name", "time", "currAmount", "goalAmount", "category"];
  const bodyKeys = Object.keys(req.body);

  // Find unexpected fields
  const unexpectedFields = bodyKeys.filter((key) => !allowedFields.includes(key));

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      error: `Unexpected field(s): ${unexpectedFields.join(", ")}`,
    });
  }

  // Validate category field (must be one of the predefined options)
  if (req.body.category) {
    const validCategories = ["Saving", "Investment", "Debt Payment", "Other"];
    if (!validCategories.includes(req.body.category)) {
      return res.status(400).json({
        error: `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      });
    }
  }

  next();
};

// Validate request body contains only allowed fields for reminders
export const validateReminderRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["userId", "name", "text", "time", "viewed"];
  const bodyKeys = Object.keys(req.body);
  const unexpectedFields = bodyKeys.filter((key) => !allowedFields.includes(key));

  if (unexpectedFields.length > 0) {
    return res.status(400).json({
      error: `Unexpected field(s): ${unexpectedFields.join(", ")}`,
    });
  }
  next();
};
