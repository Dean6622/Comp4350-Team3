import Reminder, {IReminder} from "./reminderDB";
import User from "./userDB";
import mongoose from "mongoose";

// Create a new reminder
export const addReminder = async (userId: string, name: string, text: string, time: string) => {
  try {
    // check if user exists
    const userExists = await User.findById(userId);
    if (!userExists) {
      throw new Error("User does not exist");
    }

    const newReminder = new Reminder({
      userId: userId,
      name,
      text,
      time: new Date(time),
      viewed: false,
    });

    await newReminder.save();
    return newReminder;
  } catch (err) {
    if (err.name === "ValidationError") {
      throw new Error(`Validation Error: ${Object.values(err.errors).map((e) => (e as mongoose.Error.ValidationError).message).join(", ")}`);
    }
    console.error("Error adding reminder:", err);
    throw err;
  }
};

// Retrieves all reminders for a given user
export const getAllReminders = async (userId: string): Promise<IReminder[]> => {
  try {
    // validate userId is in the correct format
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }

    // Retrieve all reminders linked to the user, including user details
    const reminders = await Reminder.find({userId: userId}).populate("userId");
    return reminders;
  } catch (err) {
    console.error("Error retrieving reminders:", err);
    throw err;
  }
};

// Updates an existing reminder by ID
export const editReminder = async (id: string, name?: string, text?: string, time?: string, viewed?: boolean): Promise<IReminder | null> => {
  try {
    // Validates reminder ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid reminder ID format");
    }

    // retrieve the specific reminder that needs editing
    const updatedReminder = await Reminder.findById(id);
    if (!updatedReminder) {
      // console.log('No reminder found with the given ID.');
      return null;
    }

    // apply updates if provided
    if (name) updatedReminder.name = name;
    if (text) updatedReminder.text = text;
    if (time) updatedReminder.time = new Date(time);
    if (typeof viewed !== "undefined") updatedReminder.viewed = viewed;

    await updatedReminder.save();
    return updatedReminder;
  } catch (err) {
    console.error("Error updating reminder:", err);
    throw err;
  }
};

// Deletes a reminder by ID
export const deleteReminder = async (id: string) => {
  try {
    // Validates reminder ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid reminder ID format");
    }

    const result = await Reminder.deleteOne({_id: id});
    if (result.deletedCount > 0) {
      // console.log('Reminder deleted successfully.');
    } else {
      // console.log('No reminder found.');
    }
    return result;
  } catch (err) {
    console.error("Error deleting reminder:", err);
    throw err;
  }
};
