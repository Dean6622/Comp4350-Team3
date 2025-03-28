import {Request, Response} from "express";
import {IUser} from "../db/userDB";
import {
  addUser,
  getUsersByUsername,
  editUser,
  deleteUser,
} from "../db/userService";
import {controlLog} from "./controlLog";

// helps format user to be in a neater format
const formatUser = (user: IUser) => ({
  id: user._id.toString(),
  username: user.username,
  balance: user.balance,
});

// controller to add a new user
export const addUserController = async (req: Request, res: Response) => {
  const {username, password, balance} = req.body;
  try {
    const user = await addUser(username, password, balance);
    res.status(201).json({
      message: "User created successfully",
      user: formatUser(user),
    });
  } catch (err) {
    console.error("Error creating user:", err.message || err); // Log to terminal
    return res
      .status(500)
      .json({error: err.message || "Error creating user"});
  }
};

// Controller to fetch a user by username
export const getSingleUserController = async (req: Request, res: Response) => {
  try {
    const {username} = req.params;
    controlLog(`get user: ${username}`);
    const users = await getUsersByUsername(username);

    if (users.length === 0) {
      res.status(404).json({message: "User not found"});
    } else {
      res.status(200).json(users.map(formatUser)[0]);
    }
  } catch (err) {
    console.error("Error retrieving user:", err.message || err); // Log to terminal
    return res
      .status(500)
      .json({error: err.message || "Error retrieving user"});
  }
};

// Controller to edit an existing user
export const editUserController = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {username, password, balance} = req.body;

  try {
    const updatedUser = await editUser(id, username, password, balance);
    if (updatedUser) {
      res.status(200).json({
        message: "User updated successfully",
        user: formatUser(updatedUser),
      });
    } else {
      res.status(404).json({message: "User not found"});
    }
  } catch (err) {
    console.error("Error updating user:", err.message || err); // Log to terminal
    return res
      .status(500)
      .json({error: err.message || "Error updating user"});
  }
};

// Controller to delete a user by ID
export const deleteUserController = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const result = await deleteUser(id);
    if (result.deletedCount > 0) {
      res.status(200).json({message: "User deleted successfully"});
    } else {
      res.status(404).json({message: "User not found"});
    }
  } catch (err) {
    console.error("Error deleting user:", err.message || err); // Log to terminal
    return res
      .status(500)
      .json({error: err.message || "Error deleting user"});
  }
};
