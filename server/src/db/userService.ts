import User, {IUser} from "./userDB"; // Import the User model
import mongoose from "mongoose";
import {dbLog} from "./dbLog";

// adds a new user to the database
export const addUser = async (username: string, password: string, balance: number): Promise<IUser> => {
  try {
    // Ensure balance is provided and positive
    if (balance === undefined || balance <= 0) {
      throw new Error("Balance must be a positive number");
    }

    const newUser = new User({username, password, balance});
    await newUser.save();
    return newUser;
  } catch (err) {
    // duplicate key error mongoDB
    if (err.code === 11000) {
      console.error("Duplicate username:", err.message);
      throw new Error("Username already exists");
    }
    console.error("Error adding user:", err);
    throw err;
  }
};

// Retrieves all users
export const getAllUsers = async () => {
  try {
    const users = await User.find({}); // Fetch all users
    return users;
  } catch (err) {
    console.error("Error retrieving users:", err);
    throw err;
  }
};

// Retrieves a user by their username
export const getUsersByUsername = async (username: string) => {
  try {
    // Finds user matching provided username
    const users = await User.find({username});
    if (users.length === 0) {
      dbLog("no users found with username:", username);
    }
    return users;
  } catch (err) {
    console.error("Error retrieving users:", err);
    throw err;
  }
};


// Updates a user
export const editUser = async (id: string, username?: string, password?: string, balance?: number): Promise<IUser | null> => {
  try {
    // validate userID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID format");
    }

    const updatedFields: Partial<IUser> = {};

    // Allows user to update only the fields provided
    if (username) updatedFields.username = username;
    if (password) updatedFields.password = password;
    if (balance) updatedFields.balance = balance;

    const updatedUser = await User.findByIdAndUpdate(id, updatedFields, {new: true});

    if (!updatedUser) {
      dbLog(`No user with the ID ${id} found.`);
      return null;
    }

    return updatedUser;
  } catch (err) {
    // duplicate key error mongoDB
    if (err.code === 11000) {
      console.error("Duplicate username:", err.message);
      throw new Error("Username already exists");
    }
    console.error("Error updating user:", err);
    throw err;
  }
};

// delete existing user
export const deleteUser = async (id: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }
    const result = await User.deleteOne({_id: id});
    if (result.deletedCount > 0) {
      dbLog(`User ${id} deleted successfully.`);
    } else {
      dbLog(`User ${id} not found.`);
    }
    return result;
  } catch (err) {
    console.error("Error deleting user:", err);
    throw err;
  }
};
