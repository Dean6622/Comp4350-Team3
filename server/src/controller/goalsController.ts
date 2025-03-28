import {Request, Response} from "express";
import {IGoal} from "../db/goalsDB";
import {addGoal, deleteGoal, editGoal, getAllGoals} from "../db/goalsService";
import {controlLog} from "./controlLog";

// format the goal data in a neater way
const formatGoal = (goal: IGoal) => ({
  id: goal._id.toString(),
  name: goal.name,
  time: new Date(goal.time).toLocaleDateString("en-CA", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  }),
  currAmount: goal.currAmount,
  goalAmount: goal.goalAmount,
  category: goal.category,
});

// Controller to handle adding new goal
export const addGoalController = async (req: Request, res: Response) => {
  const {userId, name, time, currAmount, goalAmount, category} = req.body;

  // ensure current amount is not greater than goal amount
  const numCurrAmount = parseFloat(currAmount);
  const numGoalAmount = parseFloat(goalAmount);
  if (numCurrAmount > numGoalAmount) {
    return res.status(400).json({
      error: "Current amount cannot be greater than goal amount.",
    });
  }

  try {
    const goal = await addGoal(userId, name, time, currAmount, goalAmount, category);
    res.status(201).json({message: "Goal added successfully", goal: formatGoal(goal)});
  } catch (err) {
    console.error("Error creating goal:", err.message || err);
    return res.status(500).json({error: err.message || "Error creating goal"});
  }
};

// Controller to retrieve all goals for a specific user
export const getAllGoalsController = async (req: Request, res: Response) => {
  const {userId} = req.params;
  controlLog(`Fetching goals for user: ${userId}`);

  try {
    const goals = await getAllGoals(userId);
    res.status(200).json(goals.map(formatGoal));
  } catch (err) {
    console.error("Error retrieving goals:", err.message || err);
    return res.status(500).json({error: err.message || "Error retrieving goals"});
  }
};

// controller to edit an existing goal
export const editGoalController = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {name, time, currAmount, goalAmount, category} = req.body;

  try {
    const updatedGoal = await editGoal(id, name, time, currAmount, goalAmount, category);
    if (updatedGoal) {
      res.status(200).json({message: "Goal updated successfully", goal: formatGoal(updatedGoal)});
    } else {
      res.status(404).json({message: "Goal not found"});
    }
  } catch (err) {
    console.error("Error updating goal:", err.message || err);
    return res.status(500).json({error: err.message || "Error updating goal"});
  }
};

// controller to delete a goal
export const deleteGoalController = async (req: Request, res: Response) => {
  const {id} = req.params;

  try {
    const result = await deleteGoal(id);
    if (result.deletedCount > 0) {
      res.status(200).json({message: "Goal deleted successfully"});
    } else {
      res.status(404).json({message: "Goal not found"});
    }
  } catch (err) {
    console.error("Error deleting goal:", err.message || err);
    return res.status(500).json({error: err.message || "Error deleting goal"});
  }
};
