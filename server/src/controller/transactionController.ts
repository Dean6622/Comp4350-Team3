import {Request, Response} from "express";
import {ITransaction} from "../db/transactionDB";
import {addTransaction, deleteTransaction, editTransaction, getAllTransactions} from "../db/transactionService";
import {controlLog} from "./controlLog";

// Format transactions into a neater structure
const formatTransaction = (transaction: ITransaction) => ({
  id: transaction._id.toString(), // Convert _id to id
  name: transaction.name,
  date: new Date(transaction.date).toLocaleDateString("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
  amount: transaction.amount,
  currency: transaction.currency,
  type: transaction.type,
  tags: transaction.tags?.map((tag) => ({
    id: tag._id.toString(),
    name: tag.name,
    color: tag.color,
  })) || [], // If no tags, default to an empty array


});

// Controller to add a new transaction
export const addTransactionController = async (req: Request, res: Response) => {
  const {userId, name, date, amount, currency, type, tags}= req.body;

  try {
    const transaction = await addTransaction(userId, name, date, amount, currency, type, tags);
    res.status(201).json({message: "Transaction added successfully", transaction: formatTransaction(transaction)});
  } catch (err) {
    console.error("Error creating transaction:", err.message || err); // Log to terminal
    return res.status(500).json({error: err.message || "Error creating transaction"});
  }
};

// Controller to retrieve all transactions for a user
export const getAllTransactionController = async (req: Request, res: Response) => {
  const {userId} = req.params;
  controlLog(`Fetching transactions for user: ${userId}`);

  try {
    const transactions = await getAllTransactions(userId);
    res.status(200).json(transactions.map(formatTransaction));
  } catch (err) {
    console.error("Error retrieving transaction:", err.message || err); // Log to terminal
    return res.status(500).json({error: err.message || "Error retrieving transaction"});
  }
};

// Controller to update an existing transaction
export const editTransactionController = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {name, date, amount, currency, tags, type} = req.body;

  try {
    const updatedTransaction = await editTransaction(id, name, date, amount, currency, type, tags);
    if (updatedTransaction) {
      res.status(200).json({message: "Transaction updated successfully", transaction: formatTransaction(updatedTransaction)});
    } else {
      res.status(404).json({message: "Transaction not found"});
    }
  } catch (err) {
    console.error("Error updating transaction:", err.message || err); // Log to terminal
    return res.status(500).json({error: err.message || "Error updating transaction"});
  }
};

// Controller to delete an existing transaction
export const deleteTransactionController = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const result = await deleteTransaction(id);
    if (result.deletedCount > 0) {
      res.status(200).json({message: "Transaction deleted successfully"});
    } else {
      res.status(404).json({message: "Transaction not found"});
    }
  } catch (err) {
    console.error("Error deleting transaction:", err.message || err); // Log to terminal
    return res.status(500).json({error: err.message || "Error deleting transaction"});
  }
};

