import mongoose, {Document} from "mongoose";
import {ITag} from "./tagDB.js";
const Schema = mongoose.Schema;

// Define the interface for the Transaction
export interface ITransaction extends Document {
    user: mongoose.Schema.Types.ObjectId; // ID of the user for their transactions
    name: string; // name of the transaction
    date: Date; // date the transaction occurred
    amount: number; // the amount on the transaction
    currency: string; // the currency
    type: string; // Is it Spending or Saving
    tags?: ITag[]; // List of tags for the user


}

/**
 * Mongoose schema for transactions
 * message = error message for invalid formatting
 */
const transactionSchema = new Schema<ITransaction>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    validate: {
      validator: (id: string) => mongoose.Types.ObjectId.isValid(id),
      message: "Invalid user ID format",
    },

  },
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    validate: {
      validator: (value: Date) => value instanceof Date && !isNaN(value.getTime()),
      message: "Invalid date format",
    },
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be a positive number"],
  },
  currency: {
    type: String,
    required: true,
    match: [/^[A-Z]{3}$/, "Invalid currency format (e.g., CAD)"],
  },
  type: {
    type: String,
    required: true,
    enum: ["Saving", "Spending"],
    message: "Invalid type",
  },
  tags: [{
    type: mongoose.Types.ObjectId, ref: "Tag", default: [],
  }],


},
{strict: "throw"},

);

// Create the Mongoose model for transactions
const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
export default Transaction;

