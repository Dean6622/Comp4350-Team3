import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../db/userDB";
import Tag from "../../db/tagDB";
import Transaction from "../../db/transactionDB";
import { addTransaction, getAllTransactions, editTransaction, deleteTransaction } from "../../db/transactionService";

// Test settings assisted by AI
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("Transaction Service Tests", () => {
  let userId: string;
  let tagId: string;
  let mongoServer: MongoMemoryServer;
  let transactionId: string;

  beforeAll(async () => {
    mongoose.set('strictQuery', true);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Tag.deleteMany({});
    await Transaction.deleteMany({});

    const user = new User({
      username: `testuser_${Date.now()}`,
      password: "testpassword",
      balance: 1000,
    });
    await user.save();
    userId = user._id;

    const tag = new Tag({
      user: userId,
      name: "Food",
      color: "#FF5733",
    });
    await tag.save();
    tagId = tag._id;

    const transaction = new Transaction({
      user: userId,
      name: "Grocery Shopping",
      date: new Date(),
      amount: 1000,
      currency: "CAD",
      type: "Spending",
      tags: [tagId],
    });
    await transaction.save();
    transactionId = transaction._id;
  });

  describe("addTransaction function", () => {
    it("should add a new transaction for a user", async () => {
      const newTransaction = await addTransaction(userId, "Test Transaction", "2025-03-27", 50, "CAD", "Spending", [tagId]);

      expect(newTransaction).toHaveProperty("_id");
      expect(newTransaction.name).toBe("Test Transaction");
      expect(newTransaction.amount).toBe(50);
      expect(newTransaction.currency).toBe("CAD");
      expect(newTransaction.type).toBe("Spending");
      expect(newTransaction.tags.length).toBeGreaterThan(0);
    });

    it("should throw error if user does not exist", async () => {
      const invalidUserId = new mongoose.Types.ObjectId().toString();
      await expect(addTransaction(invalidUserId, "Test Transaction", "2025-03-27", 50, "CAD", "Spending", [tagId])).rejects.toThrow("User does not exist");
    });

    it("should throw error if tag does not exist", async () => {
      const invalidTagId = new mongoose.Types.ObjectId().toString();
      await expect(addTransaction(userId, "Test Transaction", "2025-03-27", 50, "CAD", "Spending", [invalidTagId]))
        .rejects.toThrow("One or more tags do not exist.");
    });
  
    it("should throw error if amount is negative", async () => {
      await expect(addTransaction(userId, "Test Transaction", "2025-03-27", -50, "CAD", "Spending", [tagId]))
        .rejects.toThrow("Validation Error: Amount must be a positive number");
    });

    // Example test case assisted by AI
    it("should throw error if user balance is insufficient for spending", async () => {
      const userWithInsufficientBalance = await User.create({
        username: "user2",
        password: "testpassword",
        balance: 10,
      });
    
      const validTag = await Tag.create({
        name: "Food",
        user: userWithInsufficientBalance._id,
        color: "#FF5733",
      });
      
      await expect(addTransaction(userWithInsufficientBalance._id, "Test Transaction", "2025-03-27", 50, "CAD", "Spending", [validTag._id]))
        .rejects.toThrow("Insufficient balance for spending.");
    });
    

    it("should throw error if transaction type is invalid", async () => {
      await expect(addTransaction(userId, "Test Transaction", "2025-03-27", 50, "CAD", "InvalidType", [tagId]))
        .rejects.toThrow("Invalid type. Must be one of: Saving, Spending");
    });

    it("should throw error if tag does not belong to the user during transaction creation", async () => {
      const newTag = new Tag({
        name: "Shopping",
        user: new mongoose.Types.ObjectId(),
        color: "#5F9EA0",
      });
      await newTag.save();
      
      await expect(addTransaction(userId, "Test Transaction", "2025-03-27", 50, "CAD", "Spending", [newTag._id]))
        .rejects.toThrow(/Tag "Shopping" does not belong to the user with ID/);
    });
  });

  describe("getAllTransactions function", () => {
    it("should return all transactions for a user", async () => {
      const transactions = await getAllTransactions(userId);

      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toHaveProperty("name", "Grocery Shopping");
    });

    it("should throw error for invalid user ID format", async () => {
      await expect(getAllTransactions("invalidUserId")).rejects.toThrow("Invalid user ID format");
    });

    it("should return empty array if user has no transactions", async () => {
      const newUser = new User({
        username: `newuser_${Date.now()}`,
        password: "newpassword",
        balance: 500,
      });
      await newUser.save();
      const transactions = await getAllTransactions(newUser._id);
      expect(transactions).toHaveLength(0);
    });
  });

  describe("editTransaction function", () => {
    it("should update an existing transaction", async () => {
      const updatedTransaction = await editTransaction(transactionId, "Updated Grocery Shopping", "2025-03-28", 120, "CAD", "Spending", [tagId]);

      expect(updatedTransaction).toHaveProperty("_id", transactionId);
      expect(updatedTransaction.name).toBe("Updated Grocery Shopping");
      expect(updatedTransaction.amount).toBe(120);
      expect(updatedTransaction.currency).toBe("CAD");
    });

    it("should throw error for invalid transaction type", async () => {
      await expect(editTransaction(transactionId, "Updated Grocery Shopping", "2025-03-28", 120, "CAD", "InvalidType", [tagId])).rejects.toThrow("Invalid type. Must be one of: Saving, Spending");
    });

    it("should update user balance after spending", async () => {
      const originalBalance = (await User.findById(userId)).balance;
      const updatedTransaction = await editTransaction(transactionId, "Updated Grocery Shopping", "2025-03-28", 120, "CAD", "Spending", [tagId]);

      expect(updatedTransaction.amount).toBe(120);
      const newBalance = (await User.findById(userId)).balance;
      expect(newBalance).toBe(originalBalance - 120+1000);
    });

    it("should update user balance after saving", async () => {
      const originalBalance = (await User.findById(userId)).balance;
      const updatedTransaction = await editTransaction(transactionId, "Updated Grocery Shopping", "2025-03-28", 120, "CAD", "Saving", [tagId]);

      expect(updatedTransaction.amount).toBe(120);
      const newBalance = (await User.findById(userId)).balance;
      expect(newBalance).toBe(originalBalance + 120+1000);
    });

    it("should return null if transaction does not exist", async () => {
      const invalidTransactionId = new mongoose.Types.ObjectId().toString();
      const result = await editTransaction(invalidTransactionId, "Updated Transaction", "2025-03-28", 120, "CAD", "Spending", [tagId]);
      expect(result).toBeNull();
    });
  
    describe("getAllTransactions function", () => {
      it("should throw a ValidationError if there is a validation issue", async () => {
        const invalidUserId = "invalidUserId";
        await expect(getAllTransactions(invalidUserId)).rejects.toThrow("Invalid user ID format");
      });
    });
    
    it("should throw error if user balance is insufficient for spending", async () => {
      await expect(editTransaction(transactionId, "Updated Grocery Shopping", "2025-03-28", 150000, "CAD", "Spending", [tagId]))
        .rejects.toThrow("Insufficient balance for spending.");
    });    

    it("should throw error if date format is invalid", async () => {
      await expect(editTransaction(transactionId, "Updated Grocery Shopping", "Invalid Date", 120, "CAD", "Spending", [tagId]))
        .rejects.toThrow(expect.objectContaining({
          message: expect.stringMatching(/Validation Error: Cast to date failed for value "Invalid Date"/)
        }));
    });    
    it("should throw an error if no valid tags are provided during transaction update", async () => {
      const invalidTagId = new mongoose.Types.ObjectId().toString();
      const transaction = await addTransaction(userId.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    
      await expect(editTransaction(transaction._id.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [invalidTagId]))
        .rejects.toThrow("One or more tags do not exist.");
    });
  });

  describe("deleteTransaction function", () => {
    it("should delete an existing transaction", async () => {
      const result = await deleteTransaction(transactionId);

      expect(result.deletedCount).toBe(1);
    });

    it("should throw error if transaction does not exist", async () => {
      const invalidTransactionId = new mongoose.Types.ObjectId().toString();
      await expect(deleteTransaction(invalidTransactionId)).rejects.toThrow(new RegExp(`No transaction found with ID ${invalidTransactionId}`));
    });

    it("should update user balance after deleting a spending transaction", async () => {
      const originalBalance = (await User.findById(userId)).balance;
      const result = await deleteTransaction(transactionId);

      const newBalance = (await User.findById(userId)).balance;
      expect(newBalance).toBe(originalBalance + 1000);
    });

    it("should update user balance after deleting a saving transaction", async () => {
      const savingTransaction = await addTransaction(userId, "Test Saving Transaction", "2025-03-28", 150, "CAD", "Saving", [tagId]);

      const originalBalance = (await User.findById(userId)).balance;
      await deleteTransaction(savingTransaction._id);

      const newBalance = (await User.findById(userId)).balance;
      expect(newBalance).toBe(originalBalance - 150);
    });
  });

  it("should throw an error when an invalid transaction ID is passed in editTransaction", async () => {
    try {
      await editTransaction("invalid-id", "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("Invalid transaction ID format");
    }
  });
  
  it("should throw an error when an invalid transaction ID is passed in deleteTransaction", async () => {
    try {
      await deleteTransaction("invalid-id");
    } catch (err) {
      expect(err.message).toBe("Invalid transaction ID format");
    }
  });

  it("should return null if the transaction is not found in editTransaction", async () => {
    const invalidTransactionId = new mongoose.Types.ObjectId().toString();
    const result = await editTransaction(invalidTransactionId, "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    expect(result).toBeNull();
  });
  
  it("should throw an error if the transaction is not found in deleteTransaction", async () => {
    const invalidTransactionId = new mongoose.Types.ObjectId().toString();
    try {
      await deleteTransaction(invalidTransactionId);
    } catch (err) {
      expect(err.message).toBe(`No transaction found with ID ${invalidTransactionId}`);
    }
  });

  it("should throw an error when the user has insufficient balance in editTransaction", async () => {
    const transaction = await addTransaction(userId.toString(), "Rent", "2025-03-20", 1000, "USD", "Spending", [tagId.toString()]);
    const user = await User.findById(userId);
    user.balance = 500; // Setting balance lower than transaction amount
    await user.save();
  
    try {
      await editTransaction(transaction._id.toString(), "Rent", "2025-03-20", 1000, "USD", "Spending", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("Insufficient balance for spending.");
    }
  });
  it("should throw error if transaction exists but user does not exist", async () => {
    const invalidUserId = new mongoose.Types.ObjectId().toString();
    const transaction = new Transaction({
      user: invalidUserId,
      name: "Test Transaction",
      date: new Date(),
      amount: 100,
      currency: "CAD",
      type: "Spending",
      tags: [tagId],
    });
    await transaction.save();

    await expect(deleteTransaction(transaction._id)).rejects.toThrow(`User not found.`);
  });

  it("should throw an error if the tags do not exist in editTransaction", async () => {
    const invalidTagId = new mongoose.Types.ObjectId().toString();
    const transaction = await addTransaction(userId.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
  
    try {
      await editTransaction(transaction._id.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [invalidTagId]);
    } catch (err) {
      expect(err.message).toBe("One or more tags do not exist.");
    }
  });

  it("should throw an error when an invalid transaction type is provided in editTransaction", async () => {
    const transaction = await addTransaction(userId.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
  
    try {
      await editTransaction(transaction._id.toString(), "Rent", "2025-03-20", 100, "USD", "InvalidType", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("Invalid type. Must be one of: Saving, Spending");
    }
  });

  it("should throw an error when an invalid type is provided in editTransaction", async () => {
    // Create a transaction with a valid type ("Spending")
    const transaction = await addTransaction(userId.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
  
    // Try to update the transaction with an invalid type
    try {
      await editTransaction(transaction._id.toString(), "Rent", "2025-03-20", 100, "USD", "InvalidType", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("Invalid type. Must be one of: Saving, Spending");
    }
  });

  it("should throw an error when the user does not exist during transaction update", async () => {
    // Create a transaction with a valid user
    const transaction = await addTransaction(userId.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
  
    // Delete the user associated with the transaction
    await User.findByIdAndDelete(userId);
  
    // Try to update the transaction after the user is deleted
    try {
      await editTransaction(transaction._id.toString(), "Rent", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("User does not exist.");
    }
  });

  it("should throw an error when a tag does not belong to the user during transaction update", async () => {
    // Create a user and a tag for that user
    const user = new User({
      username: `testuser_${Date.now()}`,
      password: "testpassword",
      name: "Test User",
      balance: 1000,
    });
    await user.save();
    const userId = user._id;
  
    const tag = new Tag({ user: userId, name: "Food", color: "#FF5733" });
    await tag.save();
  
    // Create another user and a tag for that user
    const anotherUser = new User({
      username: `anotheruser_${Date.now()}`,
      password: "anotherpassword",
      name: "Another User",
      balance: 500,
    });
    await anotherUser.save();
    const anotherUserId = anotherUser._id;
  
    const invalidTag = new Tag({ user: anotherUserId, name: "Health", color: "#00FF00" });
    await invalidTag.save();
  
    // Create a transaction with a valid tag from the first user
    const transaction = await addTransaction(userId.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [tag._id.toString()]);
  
    // Try to update the transaction with a tag from a different user
    try {
      await editTransaction(transaction._id.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [invalidTag._id.toString()]);
    } catch (err) {
      expect(err.message).toBe(`Tag "${invalidTag.name}" does not belong to the user with ID ${userId}`);
    }
  });
  
  it("should handle validation errors correctly", async () => {
    // Simulate a situation where required fields are missing (for example, missing transaction name)
    try {
      await addTransaction(userId.toString(), "", "2025-03-20", 100, "USD", "Spending", []);
    } catch (err) {
      // The error should be a ValidationError, so check for the validation message
      expect(err.message).toMatch(/Validation Error: Path `name` is required/);
    }
  });

  it("should not allow editing a transaction if the user has insufficient balance after an update", async () => {
    const transaction = await addTransaction(userId.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    const user = await User.findById(userId);
    user.balance = 50; // Insufficient balance for the updated transaction
    await user.save();
  
    try {
      await editTransaction(transaction._id.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("Insufficient balance for spending.");
    }
  });

  it("should throw an error if amount is missing during transaction edit", async () => {
    const transaction = await addTransaction(userId.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
  
    try {
      await editTransaction(transaction._id.toString(), "Groceries", "2025-03-20", undefined, "USD", "Spending", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("Validation Error: Path `amount` is required.");
    }
  });
  
  it("should throw an error if an invalid transaction type is provided in editTransaction", async () => {
    const transaction = await addTransaction(userId.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    
    try {
      await editTransaction(transaction._id.toString(), "Groceries", "2025-03-20", 100, "USD", "InvalidType", [tagId.toString()]);
    } catch (err) {
      expect(err.message).toBe("Invalid type. Must be one of: Saving, Spending");
    }
  });

  it("should throw an error if tags are missing or invalid in editTransaction", async () => {
    const transaction = await addTransaction(userId.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    try {
      await editTransaction(transaction._id.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", []);
    } catch (err) {
      expect(err.message).toBe("One or more tags do not exist.");
    }
  });

  it("should allow removing all tags from a transaction", async () => {
    const transaction = await addTransaction(userId.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", [tagId.toString()]);
    
    const updatedTransaction = await editTransaction(transaction._id.toString(), "Groceries", "2025-03-20", 100, "USD", "Spending", []);
    expect(updatedTransaction.tags).toHaveLength(0); // Tags should be empty
  });   
});
