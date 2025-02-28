import mongoose, {Document} from "mongoose";
const Schema = mongoose.Schema;

export interface ITag extends Document {
    name: string;
    color: string; // hex code
}

// Define the schema for tags
const tagSchema = new Schema<ITag>({

  name: {
    type: String,
    required: [true, "Tag is required"],
  },
  color: {
    type: String,
    required: true,
    match: /^#([0-9A-Fa-f]{6})$/,
  },
}, {_id: true});

const Tag = mongoose.model<ITag>("Tag", tagSchema);
export default Tag;
