import mongoose, {Document} from "mongoose";
const Schema = mongoose.Schema;

export interface ITransaction extends Document {
    user: mongoose.Schema.Types.ObjectId;
    name: string;
    date: Date;
    amount: number;
    currency: string;
    tags?: mongoose.Types.ObjectId[];

}

// Define the schema for the transaction
const transactionSchema = new Schema<ITransaction>({
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
  date: {
    type: Date,
    required: true,
    validate: {
      validator: (value: Date) => value instanceof Date && !isNaN(value.getTime()),
      message: "Invalid date format",
    },
  },
  amount: {
    type: Number,
    required: true,
    min: [0, "Amount must be a positive number"],
  },
  currency: {
    type: String,
    required: true,
    match: [/^[A-Z]{3}$/, "Invalid currency format (e.g., CAD)"],
  },
  tags: [{
    type: [mongoose.Types.ObjectId], ref: "Tag", default: [],
  }],
},
{strict: "throw"},

);

// Create the Mongoose model for transactions
const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
export default Transaction;

