import Goal, {IGoal} from "./goalsDB";
import User from "./userDB";
import mongoose from "mongoose";
import {dbLog} from "./dbLog";

// adds a new financial goal for the user
export const addGoal = async (userId: string, name: string, time: string, currAmount: number, goalAmount: number, category: string) => {
  try {
    // check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new Error("User does not exist");
    }

    // check if the category is valid
    if (category) {
      const validCategories = ["Saving", "Investment", "Debt Payment", "Other"];
      if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
      }
    }

    // create the new goal
    const newGoal = new Goal({
      user: userId,
      name,
      time: new Date(time),
      currAmount,
      goalAmount,
      category,
    });

    await newGoal.save();
    return newGoal;
  } catch (err) {
    if (err.name === "ValidationError") {
      throw new Error(`Validation Error: ${Object.values(err.errors).map((e) => (e as mongoose.Error.ValidationError).message).join(", ")}`);
    }
    console.error("Error adding goal:", err);
    throw err;
  }
};

// retrieves all goals for the given user
export const getAllGoals = async (userId: string): Promise<IGoal[]> => {
  try {
    // check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    const goals = await Goal.find({user: userId}).populate("user");
    return goals;
  } catch (err) {
    console.error("Error retrieving goals:", err);
    throw err;
  }
};

// Edit the goal
export const editGoal = async (id: string, name?: string, time?: string, currAmount?: number, goalAmount?: number, category?: string): Promise<IGoal | null> => {
  try {
    // check if goalId is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid goal ID format");
    }

    // retrieve the specific goal
    const updatedGoal = await Goal.findById(id);
    if (!updatedGoal) {
      dbLog("No goal found with the given ID.");
      return null;
    }

    // ensure current amount doesen't exceed goal amount
    const numCurrAmount = parseFloat(currAmount as unknown as string);
    const numGoalAmount = parseFloat(goalAmount as unknown as string);
    if (numCurrAmount > numGoalAmount) {
      currAmount = goalAmount;
    }

    // update the field if provided
    if (time) updatedGoal.time = new Date(time);
    if (name) updatedGoal.name = name;
    if (currAmount) updatedGoal.currAmount = currAmount;
    if (goalAmount) updatedGoal.goalAmount = goalAmount;

    // validate and update category if provided
    if (category) {
      const validCategories = ["Saving", "Investment", "Debt Payment", "Other"];
      if (!validCategories.includes(category)) {
        throw new Error(`Invalid category. Must be one of: ${validCategories.join(", ")}`);
      }
      updatedGoal.category = category;
    }

    await updatedGoal.save();
    return updatedGoal;
  } catch (err) {
    console.error("Error updating goal:", err);
    throw err;
  }
};

// delete given goal
export const deleteGoal = async (id: string) => {
  try {
    // check if user exists
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid goal ID format");
    }

    const result = await Goal.deleteOne({_id: id});
    if (result.deletedCount > 0) {
      dbLog("Goal deleted successfully.");
    } else {
      dbLog("No goal found.");
    }
    return result;
  } catch (err) {
    console.error("Error deleting goal:", err);
    throw err;
  }
};
