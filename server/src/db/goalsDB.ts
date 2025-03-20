import mongoose, {Document} from "mongoose";
const Schema = mongoose.Schema;

// Define the interface for the Goals
export interface IGoal extends Document {
    user: mongoose.Schema.Types.ObjectId; // ID of user creating the goal
    name: string; // name of the goal
    time: Date; // Target date for achiving the goal
    currAmount: number; // current amount saved toward the goal
    goalAmount: number; // target amount for the goal
    category: string; // category for the goal (Saving, Investment, Debt Payment, Other)
}

/**
 * Mongoose schema for goals
 * message = error message for invalid formatting
 */
const goalSchema = new Schema<IGoal>({
  user: {
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
  time: {
    type: Date,
    required: true,
    validate: {
      validator: (value: Date) => value instanceof Date && !isNaN(value.getTime()),
      message: "Invalid date format",
    },
  },
  currAmount: {
    type: Number,
    required: true,
    min: [0, "Amount must be a positive number"],
  },
  goalAmount: {
    type: Number,
    required: true,
    min: [0, "Amount must be a positive number"],
  },
  category: {
    type: String,
    required: true,
    enum: ["Saving", "Investment", "Debt Payment", "Other"],
    message: "Invalid category",
  },
},
{strict: "throw"});

const Goal = mongoose.model<IGoal>("Goal", goalSchema);
export default Goal;
