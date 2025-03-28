import Transaction, {ITransaction} from "./transactionDB";
import User from "./userDB";
import Tag from "./tagDB";
import mongoose from "mongoose";
import {dbLog} from "./dbLog";

// add a new transaction to the database
export const addTransaction = async (userId: string, name: string, date: string, amount: number, currency: string, type: string, tags?: string[]) => {
  try {
    // Validate if user exists before proceeding
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new Error("User does not exist");
    }

    // Validate and filter out invalid tag IDs
    const validTags = tags?.filter((tagId) => mongoose.Types.ObjectId.isValid(tagId)) || [];

    if (type) {
      const validType = ["Saving", "Spending"];
      if (!validType.includes(type)) {
        throw new Error(`Invalid type. Must be one of: ${validType.join(", ")}`);
      }
    }

    // check if user exists or not
    const user = await User.findById(userId);

    // Ensure all provided tags exist in the database
    const existingTags = await Tag.find({_id: {$in: validTags}});

    // Check if each tag has the same userId as the given userId
    for (const tag of existingTags) {
      if (!tag.user || tag.user.toString() !== user._id.toString()) {
        throw new Error(`Tag "${tag.name}" does not belong to the user with ID ${userId}`);
      }
    }

    if (existingTags.length !== validTags.length) {
      throw new Error("One or more tags do not exist.");
    }

    // Adjust balance based on transaction type
    if (type === "Spending") {
      if (user.balance < amount) {
        throw new Error("Insufficient balance for spending.");
      }
      user.balance -= amount;
    } else if (type === "Saving") {
      user.balance += amount;
    }

    const newTransaction = new Transaction({
      user: userId,
      name,
      date: new Date(date),
      amount,
      currency,
      type,
      tags: validTags,
    });

    await newTransaction.save();
    await user.save();
    return newTransaction;
  } catch (err) {
    if (err.name === "ValidationError") {
      throw new Error(`Validation Error: ${Object.values(err.errors).map((e) => (e as mongoose.Error.ValidationError).message).join(", ")}`);
    }
    console.error("Error adding transaction:", err);
    throw err;
  }
};

// get all transactions for a user
export const getAllTransactions = async (userId: string): Promise<ITransaction[]> => {
  try {
    // Validate userID is in the correct format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    const transactions = await Transaction.find({user: userId}).populate("tags").populate("user");
    return transactions;
  } catch (err) {
    if (err.name === "ValidationError") {
      throw new Error(`Validation Error: ${Object.values(err.errors).map((e) => (e as mongoose.Error.ValidationError).message).join(", ")}`);
    }
    console.error("Error retrieving transactions:", err);
    throw err;
  }
};

// To edit, need to enter in the body, all the fields again, even ones that you didn't intend to replace. If you don't select a tag, it removes existing tags and sets it to default.
export const editTransaction = async (id: string, name?: string, date?: string, amount?: number, currency?: string, type?: string, tags?: string[]): Promise<ITransaction | null> => {
  try {
    // validate transactionID is in correct format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid transaction ID format");
    }
    const updatedTransaction = await Transaction.findById(id);

    // find the existing transaction
    if (!updatedTransaction) {
      dbLog(`No transaction found with the ID ${id}`);
      return null;
    }

    // find associated user
    const user = await User.findById(updatedTransaction.user);
    if (!user) {
      throw new Error("User does not exist.");
    }

    // Reverse the effect of the old transaction on the balance
    if (updatedTransaction.type === "Spending") {
      user.balance += updatedTransaction.amount; // Refund spending
    } else if (updatedTransaction.type === "Saving") {
      user.balance -= updatedTransaction.amount; // Remove saved amount
    }

    // update fields if new values are provided
    if (date) updatedTransaction.date = new Date(date);
    if (name) updatedTransaction.name = name;
    if (amount) updatedTransaction.amount = amount;
    if (currency) updatedTransaction.currency = currency;
    if (type) {
      const validType = ["Saving", "Spending"];
      if (!validType.includes(type)) {
        throw new Error(`Invalid type. Must be one of: ${validType.join(", ")}`);
      }
      updatedTransaction.type = type;
    }
    // update tags if provided
    if (tags !== undefined) {
      if (tags.length > 0) {
        const validTags = tags
          .filter((tagId) => mongoose.Types.ObjectId.isValid(tagId))
          .map((tagId) => new mongoose.Types.ObjectId(tagId));

        const existingTags = await Tag.find({_id: {$in: validTags}});

        // Check if the tags belong to the same user
        for (const tag of existingTags) {
          if (!tag.user || tag.user.toString() !== user._id.toString()) {
            throw new Error(`Tag "${tag.name}" does not belong to the user with ID ${user._id}`);
          }
        }

        if (existingTags.length !== validTags.length) {
          throw new Error("One or more tags do not exist.");
        }

        updatedTransaction.tags = existingTags;
      } else {
        updatedTransaction.tags = [];
      }
    }

    // Apply the new transaction effect on balance
    if (updatedTransaction.type === "Spending") {
      if (user.balance < updatedTransaction.amount) {
        throw new Error("Insufficient balance for spending.");
      }
      user.balance -= updatedTransaction.amount;
    } else if (updatedTransaction.type === "Saving") {
      user.balance += updatedTransaction.amount;
    }

    await updatedTransaction.save();
    await user.save();

    return updatedTransaction;
  } catch (err) {
    if (err.name === "ValidationError") {
      const errorMessages = Object.values(err.errors).map((e: mongoose.Error.ValidationError) => e.message).join(", ");
      console.error("Validation failed:", errorMessages);
      throw new Error(`Validation Error: ${errorMessages}`);
    }
    console.error("Error updating transaction:", err);
    throw err;
  }
};


// Delete by entering just the id in the body
export const deleteTransaction = async (id: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid transaction ID format");
    }

    // Retrieve the transaction before deleting
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      throw new Error(`No transaction found with ID ${id}`);
    }

    // Retrieve the user
    const user = await User.findById(transaction.user);
    if (!user) {
      throw new Error("User not found.");
    }
    // reverse transaction effect on user balance
    if (transaction.type === "Spending") {
      user.balance += transaction.amount;
    } else if (transaction.type === "Saving") {
      user.balance -= transaction.amount;
    }

    await user.save();

    const result = await Transaction.deleteOne({_id: id});
    if (result.deletedCount > 0) {
      dbLog(`User ${id} deleted successfully.`);
    } else {
      dbLog(`No user found with the username ${id}.`);
    }
    return result;
  } catch (err) {
    if (err.name === "ValidationError") {
      throw new Error(`Validation Error: ${Object.values(err.errors).map((e) => (e as mongoose.Error.ValidationError).message).join(", ")}`);
    }
    console.error("Error deleting user:", err);
    throw err;
  }
};

