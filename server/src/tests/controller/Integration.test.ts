import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import {loginController, createAccountController, resetPasswordController, logoutController} from "../../controller/loginController";
import {addTagController, getAllTagsController, editTagController, deleteTagController} from "../../controller/tagController";
import {addTransactionController, getAllTransactionController, editTransactionController, deleteTransactionController} from "../../controller/transactionController";
import {addTransaction, getAllTransactions, editTransaction, deleteTransaction} from "../../db/transactionService";
import {addReminderController, getAllRemindersController, editReminderController, deleteReminderController} from "../../controller/reminderController";
import {addReminder, getAllReminders, editReminder, deleteReminder} from "../../db/reminderService";
import {addGoalController, getAllGoalsController, editGoalController, deleteGoalController} from "../../controller/goalsController";
import {addGoal, getAllGoals, editGoal, deleteGoal, findGoalById} from "../../db/goalsService";
import {addUser, getUsersByUsername, editUser, findUserById} from "../../db/userService";
import {addTag, getAllTags, editTag, deleteTag} from "../../db/tagService";

jest.mock("../../db/userService");
jest.mock("../../db/transactionService");
jest.mock("../../db/tagService");
jest.mock("../../db/transactionService");
jest.mock("../../db/reminderService");
jest.mock("../../db/goalsService");
jest.mock("jsonwebtoken");
jest.mock("../../db/userService");
(findUserById as jest.Mock).mockResolvedValue({
  _id: "123",
  username: "testuser",
  balance: 1000
});

const app = express();
app.use(bodyParser.json());

// Mock routes (without running a server)
app.post("/login", loginController);
app.post("/signup", createAccountController);
app.post("/reset-password", resetPasswordController);
app.post("/logout", logoutController);

app.post("/tags", addTagController);
app.get("/tags", getAllTagsController);
app.put("/tags/:id", editTagController);
app.delete("/tags/:id", deleteTagController);

app.post("/transactions", addTransactionController);
app.get("/transactions/:userId", getAllTransactionController);
app.put("/transactions/:id", editTransactionController);
app.delete("/transactions/:id", deleteTransactionController);

app.post("/reminders", addReminderController);
app.get("/reminders/:userId", getAllRemindersController);
app.put("/reminders/:id", editReminderController);
app.delete("/reminders/:id", deleteReminderController);

app.post("/goals", addGoalController);
app.get("/goals/:userId", getAllGoalsController);
app.put("/goals/:id", editGoalController);
app.delete("/goals/:id", deleteGoalController);

// loginController Integration tests

describe("Auth Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Account Creation */
  it("should create a new account", async () => {
    (getUsersByUsername as jest.Mock).mockResolvedValue([]); // No existing user
    (addUser as jest.Mock).mockResolvedValue({id: 1, username: "testuser"});

    const res = await request(app).post("/signup").send({
      username: "testuser",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Account created successfully!");
  });

  /** ❌ Test Duplicate Account */
  it("should fail if username already exists", async () => {
    (getUsersByUsername as jest.Mock).mockResolvedValue([{id: 1, username: "testuser"}]);

    const res = await request(app).post("/signup").send({
      username: "testuser",
      password: "password123",
    });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("username already exists.");
  });

  /** ✅ Test Password Reset */
  it("should reset password successfully", async () => {
    (getUsersByUsername as jest.Mock).mockResolvedValue([{id: 1, username: "testuser"}]);
    (editUser as jest.Mock).mockResolvedValue({});

    const res = await request(app).post("/reset-password").send({
      username: "testuser",
      newPassword: "newpassword123",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password changed successfully!");
  });

  /** ✅ Test Logout */
  it("should log out successfully", async () => {
    const res = await request(app).post("/logout");
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
    expect(res.headers["set-cookie"]).toBeDefined();
  });
});

// tagController Integration tests

describe("Tag Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Create Tag */
  it("should create a new tag", async () => {
    (addTag as jest.Mock).mockResolvedValue({_id: "123", name: "Urgent", color: "#ff0000"});

    const res = await request(app).post("/tags").send({name: "Urgent", color: "#ff0000"});

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Tag created successfully");
    expect(res.body.tag).toEqual({id: "123", name: "Urgent", color: "#ff0000", message: ""});
  });

  /** ✅ Get All Tags */
  it("should retrieve all tags", async () => {
    (getAllTags as jest.Mock).mockResolvedValue([
      {_id: "123", name: "Urgent", color: "#ff0000"},
      {_id: "456", name: "Important", color: "#00ff00"},
    ]);

    const res = await request(app).get("/tags");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([
      {id: "123", name: "Urgent", color: "#ff0000", message: ""},
      {id: "456", name: "Important", color: "#00ff00", message: ""},
    ]);
  });

  /** ✅ Update Tag */
  it("should update a tag successfully", async () => {
    (editTag as jest.Mock).mockResolvedValue({_id: "123", name: "Updated", color: "#123456"});

    const res = await request(app).put("/tags/123").send({name: "Updated", color: "#123456"});

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Tag updated successfully");
  });

  /** ❌ Fail Update (Tag Not Found) */
  it("should return 404 if tag does not exist", async () => {
    (editTag as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put("/tags/999").send({name: "Updated"});

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Tag not found");
  });

  /** ✅ Delete Tag */
  it("should delete a tag successfully", async () => {
    (deleteTag as jest.Mock).mockResolvedValue({deletedCount: 1});

    const res = await request(app).delete("/tags/123");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Tag deleted successfully");
  });

  /** ❌ Fail Delete (Tag Not Found) */
  it("should return 404 if tag does not exist", async () => {
    (deleteTag as jest.Mock).mockResolvedValue({deletedCount: 0});

    const res = await request(app).delete("/tags/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Tag not found");
  });
});

// Transaction Integration tests

describe("Transaction Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Create Transaction */
  it("should create a new transaction", async () => {
    (addTransaction as jest.Mock).mockResolvedValue({_id: "123", name: "Groceries", date: "2023-12-01", amount: 50, currency: "USD", tags: []});

    const res = await request(app).post("/transactions").send({
      userId: "user1",
      name: "Groceries",
      date: "2023-12-01",
      amount: 50,
      currency: "USD",
      tags: [],
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Transaction added successfully");
    expect(res.body.transaction.name).toBe("Groceries");
  });

  /** ✅ Get All Transactions */
  it("should retrieve all transactions for a user", async () => {
    (getAllTransactions as jest.Mock).mockResolvedValue([
      {_id: "123", name: "Groceries", date: "2023-12-01", amount: 50, currency: "USD", tags: []},
      {_id: "456", name: "Rent", date: "2023-12-01", amount: 1000, currency: "USD", tags: []},
    ]);

    const res = await request(app).get("/transactions/user1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  /** ✅ Update Transaction */
  it("should update a transaction successfully", async () => {
    (editTransaction as jest.Mock).mockResolvedValue({_id: "123", name: "Updated", date: "2023-12-02", amount: 60, currency: "USD", tags: []});

    const res = await request(app).put("/transactions/123").send({name: "Updated", amount: 60});

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Transaction updated successfully");
  });

  /** ❌ Fail Update (Transaction Not Found) */
  it("should return 404 if transaction does not exist", async () => {
    (editTransaction as jest.Mock).mockResolvedValue(null);

    const res = await request(app).put("/transactions/999").send({name: "Updated"});

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Transaction not found");
  });

  /** ✅ Delete Transaction */
  it("should delete a transaction successfully", async () => {
    (deleteTransaction as jest.Mock).mockResolvedValue({deletedCount: 1});

    const res = await request(app).delete("/transactions/123");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Transaction deleted successfully");
  });

  /** ❌ Fail Delete (Transaction Not Found) */
  it("should return 404 if transaction does not exist", async () => {
    (deleteTransaction as jest.Mock).mockResolvedValue({deletedCount: 0});

    const res = await request(app).delete("/transactions/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Transaction not found");
  });
});

// Reminder Integration tests

describe("Reminder Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Adding a Reminder */
  it("should add a new reminder", async () => {
    (addReminder as jest.Mock).mockResolvedValue({
      _id: "1",
      name: "Test Reminder",
      text: "Don't forget this",
      time: "2024-06-15T10:00:00.000Z",
      viewed: false,
    });

    const res = await request(app).post("/reminders").send({
      userId: "123",
      name: "Test Reminder",
      text: "Don't forget this",
      time: "2024-06-15T10:00:00.000Z",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Reminder added successfully");
    expect(res.body.reminder.name).toBe("Test Reminder");
  });

  /** ✅ Test Getting All Reminders */
  it("should get all reminders for a user", async () => {
    (getAllReminders as jest.Mock).mockResolvedValue([
      {_id: "1", name: "Test Reminder 1", text: "First reminder", time: "2024-06-15T10:00:00.000Z", viewed: false},
      {_id: "2", name: "Test Reminder 2", text: "Second reminder", time: "2024-06-16T11:00:00.000Z", viewed: true},
    ]);

    const res = await request(app).get("/reminders/123");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe("Test Reminder 1");
  });

  /** ✅ Test Editing a Reminder */
  it("should edit a reminder", async () => {
    (editReminder as jest.Mock).mockResolvedValue({
      _id: "1",
      name: "Updated Reminder",
      text: "Updated text",
      time: "2024-06-17T12:00:00.000Z",
      viewed: true,
    });

    const res = await request(app).put("/reminders/1").send({
      name: "Updated Reminder",
      text: "Updated text",
      time: "2024-06-17T12:00:00.000Z",
      viewed: true,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reminder updated successfully");
    expect(res.body.reminder.viewed).toBe(true);
  });

  /** ✅ Test Deleting a Reminder */
  it("should delete a reminder", async () => {
    (deleteReminder as jest.Mock).mockResolvedValue({deletedCount: 1});

    const res = await request(app).delete("/reminders/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Reminder deleted successfully");
  });
});

// Goals Integration tests

describe("Goal Integration Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** ✅ Test Adding a Goal */
  it("should add a new goal", async () => {
    (addGoal as jest.Mock).mockResolvedValue({
      _id: "1",
      user: "123",
      name: "Save for Vacation",
      time: "2024-12-31",
      currAmount: 500,
      goalAmount: 1000,
      category: "Travel",
    });

    const res = await request(app).post("/goals").send({
      userId: "123",
      name: "Save for Vacation",
      time: "2024-12-31",
      currAmount: 500,
      goalAmount: 1000,
      category: "Travel",
    });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Goal added successfully");
    expect(res.body.goal.name).toBe("Save for Vacation");
  });

  /** ✅ Test Getting All Goals */
  it("should get all goals for a user", async () => {
    (getAllGoals as jest.Mock).mockResolvedValue([
      {_id: "1", name: "Save for Vacation", time: "2024-12-31", currAmount: 500, goalAmount: 1000, category: "Travel"},
      {_id: "2", name: "New Laptop", time: "2024-09-01", currAmount: 300, goalAmount: 1500, category: "Electronics"},
    ]);

    const res = await request(app).get("/goals/123");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(res.body[0].name).toBe("Save for Vacation");
  });

  /** ✅ Test Editing a Goal */
  it("should edit a goal", async () => {
    (editGoal as jest.Mock).mockResolvedValue({
      _id: "1",
      user: "123",
      name: "Save for Car",
      time: "2025-06-01",
      currAmount: 1000,
      goalAmount: 5000,
      category: "Automobile",
    });

    // And mock findGoalById for the edit test:
    (findGoalById as jest.Mock).mockResolvedValue({
      _id: "1",
      user: "123",
      name: "Initial Goal",
      time: "2025-06-01",
      currAmount: 300,
      goalAmount: 800,
      category: "Saving"
    });

    const res = await request(app).put("/goals/1").send({
      name: "Save for Car",
      time: "2025-06-01",
      currAmount: 1000,
      goalAmount: 5000,
      category: "Automobile",
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Goal updated successfully");
    expect(res.body.goal.currAmount).toBe(1000);
  });

  /** ✅ Test Deleting a Goal */
  it("should delete a goal", async () => {
    (deleteGoal as jest.Mock).mockResolvedValue({deletedCount: 1});

    const res = await request(app).delete("/goals/1");

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Goal deleted successfully");
  });

  /** ❌ Test Deleting a Nonexistent Goal */
  it("should return 404 if goal not found", async () => {
    (deleteGoal as jest.Mock).mockResolvedValue({deletedCount: 0});

    const res = await request(app).delete("/goals/999");

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Goal not found");
  });
});
