// goalsController.test.ts
import request from "supertest";
import express from "express";
import {addGoal, getAllGoals, editGoal, deleteGoal} from "../../db/goalsService";
import {addGoalController, getAllGoalsController, editGoalController, deleteGoalController} from "../../controller/goalsController";

jest.mock("../../db/goalsService", () => ({
  addGoal: jest.fn(),
  getAllGoals: jest.fn(),
  editGoal: jest.fn(),
  deleteGoal: jest.fn(),
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
