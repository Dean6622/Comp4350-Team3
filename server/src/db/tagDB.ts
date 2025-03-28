import mongoose, {Document} from "mongoose";
const Schema = mongoose.Schema;

// Define the interface for the Tags
export interface ITag extends Document {
    user: mongoose.Schema.Types.ObjectId; // ID of the user
    name: string; // name of the tag
    color: string; // hex code
    message?: string; // optional message
}

/**
 * Mongoose schema for tags
 */
const tagSchema = new Schema<ITag>({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Reference to the User model
    required: true,
  },
  name: {
    type: String,
    required: [true, "Tag is required"],
  },
  color: {
    type: String,
    required: true,
    match: /^#([0-9A-Fa-f]{6})$/,
  },
  message: {
    type: String,
    required: false,
    maxlength: 500, // limit to 500 characters
    default: "",
  },
}, {_id: true});

const Tag = mongoose.model<ITag>("Tag", tagSchema);
export default Tag;
