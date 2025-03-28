import {Request, Response} from "express";
import {addReminder, getAllReminders, editReminder, deleteReminder} from "../db/reminderService";
import {IReminder} from "../db/reminderDB";

// Helps format reminders to be in a neater format
const formatReminder = (reminder: IReminder) => ({
  id: reminder._id.toString(),
  name: reminder.name,
  text: reminder.text,
  time: new Date(reminder.time).toISOString(),
  viewed: reminder.viewed,
});

// Controller to handle adding a new Reminder
export const addReminderController = async (req: Request, res: Response) => {
  const {userId, name, text, time} = req.body;

  try {
    const reminder = await addReminder(userId, name, text, time);
    res.status(201).json({message: "Reminder added successfully", reminder: formatReminder(reminder)});
  } catch (err) {
    console.error("Error creating reminder:", err.message || err);
    return res.status(500).json({error: err.message || "Error creating reminder"});
  }
};

// Controller to fetch all reminders for a specific user
export const getAllRemindersController = async (req: Request, res: Response) => {
  const {userId} = req.params;

  try {
    const reminders = await getAllReminders(userId);
    res.status(200).json(reminders.map(formatReminder));
  } catch (err) {
    console.error("Error retrieving reminders:", err.message || err);
    return res.status(500).json({error: err.message || "Error retrieving reminders"});
  }
};

// Controller to handle editing an existing reminder
export const editReminderController = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {name, text, time, viewed} = req.body;

  try {
    const updatedReminder = await editReminder(id, name, text, time, viewed);
    if (updatedReminder) {
      res.status(200).json({message: "Reminder updated successfully", reminder: formatReminder(updatedReminder)});
    } else {
      res.status(404).json({message: "Reminder not found"});
    }
  } catch (err) {
    console.error("Error updating reminder:", err.message || err);
    return res.status(500).json({error: err.message || "Error updating reminder"});
  }
};

// Controller to handle deleting a reminder
export const deleteReminderController = async (req: Request, res: Response) => {
  const {id} = req.params;

  try {
    const result = await deleteReminder(id);
    if (result.deletedCount > 0) {
      res.status(200).json({message: "Reminder deleted successfully"});
    } else {
      res.status(404).json({message: "Reminder not found"});
    }
  } catch (err) {
    console.error("Error deleting reminder:", err.message || err);
    return res.status(500).json({error: err.message || "Error deleting reminder"});
  }
};
