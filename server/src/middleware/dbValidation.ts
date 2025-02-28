import {Request, Response, NextFunction} from "express";
import mongoose from "mongoose";

export const validateTransactionRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["userId", "name", "date", "amount", "currency", "tags"];
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

export const validateParams = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const id = req.params[paramName];

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({error: `Invalid ${paramName} format`});
    }

    next();
  };
};

export const validateUserRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["id", "username", "password", "newPassword"];
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

export const validateTagRequest = (req: Request, res: Response, next: NextFunction) => {
  const allowedFields = ["id", "name", "color"];
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


