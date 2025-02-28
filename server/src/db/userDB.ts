import mongoose, {Document} from "mongoose";
const Schema = mongoose.Schema;

// Define the interface for the User document
export interface IUser extends Document {
    username: string;
    password: string;
}

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
});

const User = mongoose.model<IUser>("User", userSchema);
export default User;
