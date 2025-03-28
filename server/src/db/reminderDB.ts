import mongoose, {Document} from "mongoose";

const Schema = mongoose.Schema;

// Define the interface for the Reminder
export interface IReminder extends Document {
    userId: mongoose.Schema.Types.ObjectId; // ID of the user setting the reminder
    name: string; // name of the reminder
    text: string; // reminder description
    time: Date; // scheduled time for the reminder
    viewed: boolean; // whether the reminder has been viewed by the user or not
}

/**
 * Mongoose schema for reminders
 * message = error message for invalid formatting
 */
const reminderSchema = new Schema<IReminder>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: (id: string) => mongoose.Types.ObjectId.isValid(id),
        message: "Invalid user ID format",
      },
    },
    name: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    time: {
      type: Date,
      required: true,
      validate: {
        validator: (value: Date) => value instanceof Date && !isNaN(value.getTime()),
        message: "Invalid date format",
      },
    },
    viewed: {
      type: Boolean,
      default: false,
    },
  },
  {strict: "throw"},
);

const Reminder = mongoose.model<IReminder>("Reminder", reminderSchema);
export default Reminder;
