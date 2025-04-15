// goalsController.test.ts
import request from "supertest";
import express from "express";
import {addGoal, getAllGoals, editGoal, deleteGoal} from "../../db/goalsService";
import {addGoalController, getAllGoalsController, editGoalController, deleteGoalController} from "../../controller/goalsController";
import {addTransaction} from "../../db/transactionService";
import { findUserById } from "../../db/userService";

jest.mock("../../db/goalsService", () => ({
  addGoal: jest.fn(),
  getAllGoals: jest.fn(),
  editGoal: jest.fn(),
  deleteGoal: jest.fn(),
}));

jest.mock("../../db/transactionService", () => ({
  addTransaction: jest.fn(),
}));

jest.mock("../../db/userService", () => ({
  findUserById: jest.fn().mockImplementation((userId) => ({
    _id: userId,
    username: "testuser",
    balance: 1000,
    save: jest.fn().mockResolvedValue(true),
  })),
}));

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

const app = express();
app.use(express.json());

app.post("/api/goal", addGoalController);
app.get("/api/goal/:userId", getAllGoalsController);
app.put("/api/goal/:id", editGoalController);
app.delete("/api/goal/:id", deleteGoalController);

describe("Goal Controller", () => {
  const fakeGoal = {
    _id: "goal123",
    user: "user123",
    name: "Save Money",
    time: "2025-02-17T12:00:00Z",
    currAmount: 50,
    goalAmount: 100,
    category: "Finance",
  };

  describe("addGoalController", () => {
    it("should add a goal successfully", async () => {
      (addGoal as jest.Mock).mockResolvedValue(fakeGoal);

      const response = await request(app).post("/api/goal").send({
        userId: "user123",
        name: "Save Money",
        time: "2025-02-17T12:00:00Z",
        currAmount: 50,
        goalAmount: 100,
        category: "Finance",
      });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Goal added successfully");
      expect(response.body.goal).toEqual({
        id: "goal123",
        name: "Save Money",
        time: expect.any(String),
        currAmount: 50,
        goalAmount: 100,
        category: "Finance",
      });
    });

    it("should return 400 if currAmount > goalAmount", async () => {
      const response = await request(app).post("/api/goal").send({
        userId: "user123",
        name: "Invalid Goal",
        time: "2025-02-17T12:00:00Z",
        currAmount: 200,
        goalAmount: 100,
        category: "Finance",
      });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Current amount cannot be greater than goal amount.");
    });

    it("should return 500 if addGoal fails", async () => {
      (addGoal as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app).post("/api/goal").send({
        userId: "user123",
        name: "Save Money",
        time: "2025-02-17T12:00:00Z",
        currAmount: 50,
        goalAmount: 100,
        category: "Finance",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });

    it("should create a transaction when goal is complete", async () => {
      const goalData = {
        userId: "user123",
        name: "Save for car",
        time: "2025-12-31T12:00:00Z",
        currAmount: "1000",
        goalAmount: "1000",
        category: "Finance",
      };

      const goal = {
        ...goalData,
        _id: "goal123",
        user: "user123",
        currAmount: 1000,
        goalAmount: 1000,
      };

      // Test setting assisted by AI
      (addGoal as jest.Mock).mockResolvedValue(goal);

      const addTransactionMock = addTransaction as jest.Mock;
      addTransactionMock.mockClear();

      const response = await request(app)
        .post("/api/goal")
        .send(goalData);

      expect(response.status).toBe(201);

      expect(addTransactionMock).toHaveBeenCalledTimes(1);
      expect(addTransactionMock).toHaveBeenCalledWith(
        "user123",
        "Save for car",
        expect.any(String),
        1000,
        "CAD",
        "Saving",
      );
    });
  });

  describe("getAllGoalsController", () => {
    it("should return all goals for a user", async () => {
      (getAllGoals as jest.Mock).mockResolvedValue([fakeGoal]);

      const response = await request(app).get("/api/goal/user123");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        {
          id: expect.any(String),
          name: "Save Money",
          time: expect.any(String),
          currAmount: 50,
          goalAmount: 100,
          category: "Finance",
        },
      ]);
    });

    it("should return 500 if getAllGoals fails", async () => {
      (getAllGoals as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app).get("/api/goal/user123");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("editGoalController", () => {
    it("should update a goal successfully", async () => {
      const updatedGoal = {
        _id: "goal123",
        name: "Updated Goal",
        time: "2025-03-01T12:00:00Z",
        currAmount: 75,
        goalAmount: 100,
        category: "Finance",
      };

      (editGoal as jest.Mock).mockResolvedValue(updatedGoal);

      const response = await request(app).put("/api/goal/goal123").send({
        name: "Updated Goal",
        time: "2025-03-01T12:00:00Z",
        currAmount: 75,
        goalAmount: 100,
        category: "Finance",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Goal updated successfully");
      expect(response.body.goal).toEqual({
        id: "goal123",
        name: "Updated Goal",
        time: expect.any(String),
        currAmount: 75,
        goalAmount: 100,
        category: "Finance",
      });
    });

    it("should return 404 if goal is not found", async () => {
      (editGoal as jest.Mock).mockResolvedValue(null);

      const response = await request(app).put("/api/goal/goal123").send({
        name: "Updated Goal",
        time: "2025-03-01T12:00:00Z",
        currAmount: 75,
        goalAmount: 100,
        category: "Finance",
      });

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Goal not found");
    });

    it("should return 500 if editGoal fails", async () => {
      (editGoal as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app).put("/api/goal/goal123").send({
        name: "Updated Goal",
        time: "2025-03-01T12:00:00Z",
        currAmount: 75,
        goalAmount: 100,
        category: "Finance",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });

    it("should create a transaction when goal is complete", async () => {
      const completedGoal = {
        _id: "goal123",
        user: "user123",
        name: "Save Money",
        time: "2025-03-01T12:00:00Z",
        currAmount: 500,
        goalAmount: 500,
        category: "Finance",
      };

      // Test setting assisted by AI
      (editGoal as jest.Mock).mockResolvedValue(completedGoal);

      const addTransactionMock = addTransaction as jest.Mock;
      addTransactionMock.mockClear();

      const response = await request(app).put("/api/goal/goal123").send({
        name: "Save Money",
        time: "2025-03-01T12:00:00Z",
        currAmount: 500,
        goalAmount: 500,
        category: "Finance",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Goal updated successfully");

      expect(addTransactionMock).toHaveBeenCalledTimes(1);
      expect(addTransactionMock).toHaveBeenCalledWith(
        "user123",
        "Save Money",
        expect.any(String),
        500,
        "CAD",
        "Saving",
      );
    });

    it("should return 500 if user has insufficient funds when completing goal", async () => {
      const completedGoal = {
        _id: "goal123",
        user: "user123",
        name: "Emergency Fund",
        time: "2025-12-31T12:00:00Z",
        currAmount: 500,
        goalAmount: 500,
        category: "Finance",
      };

      (editGoal as jest.Mock).mockResolvedValue(completedGoal);

      // 👇 Override the mock for this specific test
      (findUserById as jest.Mock).mockResolvedValueOnce({
        _id: "user123",
        username: "testuser",
        balance: 100, // 👈 Insufficient
        save: jest.fn().mockResolvedValue(true),
      });

      const response = await request(app).put("/api/goal/goal123").send({
        name: "Emergency Fund",
        time: "2025-12-31T12:00:00Z",
        currAmount: 500,
        goalAmount: 500,
        category: "Finance",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Insufficient funds to complete goal");
    });

    it("should return 500 if user is not found when completing goal", async () => {
      const completedGoal = {
        _id: "goal123",
        user: "user123",
        name: "Trip Fund",
        time: "2025-12-31T12:00:00Z",
        currAmount: 500,
        goalAmount: 500,
        category: "Finance",
      };

      (editGoal as jest.Mock).mockResolvedValue(completedGoal);

      // 👇 Simulate user not found
      (findUserById as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).put("/api/goal/goal123").send({
        name: "Trip Fund",
        time: "2025-12-31T12:00:00Z",
        currAmount: 500,
        goalAmount: 500,
        category: "Finance",
      });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("User not found");
    });
  });

  describe("deleteGoalController", () => {
    it("should delete a goal successfully", async () => {
      (deleteGoal as jest.Mock).mockResolvedValue({deletedCount: 1});

      const response = await request(app).delete("/api/goal/goal123");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Goal deleted successfully");
    });

    it("should return 404 if goal is not found", async () => {
      (deleteGoal as jest.Mock).mockResolvedValue({deletedCount: 0});

      const response = await request(app).delete("/api/goal/goal123");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Goal not found");
    });

    it("should return 500 if deleteGoal fails", async () => {
      (deleteGoal as jest.Mock).mockRejectedValue(new Error("Database error"));

      const response = await request(app).delete("/api/goal/goal123");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });
});
