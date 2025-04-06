import {Request, Response} from "express";
import Goal, {IGoal} from "../db/goalsDB";
import User from "../db/userDB";
import {addGoal, deleteGoal, editGoal, findGoalById, getAllGoals} from "../db/goalsService";
import {controlLog} from "./controlLog";
import mongoose from "mongoose";


import {addTransaction} from "../db/transactionService";


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


    // Create a transaction when goal is created
    if(currAmount !== 0) {
      await addTransaction(
        goal.user.toString(),
        goal.name,
        new Date().toISOString(),
        goal.currAmount,
        "CAD",
        "Saving",
      );
  }
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
   
    const existingGoal = await findGoalById(id);
    if (!existingGoal) {
      return res.status(404).json({message: "Goal not found"});
    }


    const oldAmount = existingGoal.currAmount;
    const updatedGoal = await editGoal(id, name, time, currAmount, goalAmount, category);
    if (!updatedGoal) {
      return res.status(404).json({message: "Goal not found"});
    }


    const amountDiff = updatedGoal.currAmount - oldAmount;


    //make sure that the balance is greater than the amount being spent on the goals
    if (amountDiff < 0) {
      const user = await User.findById(existingGoal.user);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }


      if (user.balance < Math.abs(amountDiff)) {
        return res.status(400).json({
          error: "Insufficient balance for this spending transaction.",
        });
      }
    }


    // If goal is edited, create a transaction based on the changes


    if (amountDiff !== 0) {
      await addTransaction(
        updatedGoal.user.toString(),
        updatedGoal.name,
        new Date().toISOString(),
        Math.abs(amountDiff),
        "CAD",
        amountDiff > 0 ? "Saving" : "Spending"
      );
    }

    res.status(200).json({
      message: "Goal updated successfully", 
      goal: formatGoal(updatedGoal)
    });


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
