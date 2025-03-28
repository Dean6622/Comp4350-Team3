import mongoose, {Document} from "mongoose";
const Schema = mongoose.Schema;

// Define the interface for the User
export interface IUser extends Document {
    username: string; // username of the user
    password: string; // password of the user
    balance: number; // balance of the user
}

/**
 * Mongoose schema for user
 */
const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
