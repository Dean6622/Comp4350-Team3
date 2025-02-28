/**
 * The logic to login a user with username and password
 */

import {Request, Response} from "express";
import webToken from "jsonwebtoken";
import bcrypt from "bcrypt";
import {getUsersByUsername, addUser, editUser} from "../db/userService";

interface AuthError extends Error {
    status?: number;
}

// stub database
export const users = [{id: 1, username: "user", password: bcrypt.hashSync("password", 10)}];
// stay in the code for now, need to move it to environment variables later
export const LOGIN_KEY = process.env.LOGIN_KEY;

// logic to verify if the password is correct
export const loginController = async (req: Request, res: Response, next) => {
  const {username, password} = req.body;
  try {
    const users = await getUsersByUsername(username);
    if (users.length === 0) {
      const error: AuthError = new Error("User not found");
      error.status = 404;
      return next(error); // Handle case when no user is found
    }
    // const userFound = users.find(user => user.username === username);

    const userFound = users[0]; // assuming usernames are unique
    // if the password is correct, return with a valid token for future use
    if (bcrypt.compareSync(password, userFound.password)) {
      const token = webToken.sign({id: userFound.id, username: userFound.username}, LOGIN_KEY, {expiresIn: "1h"});
      res.cookie("token", token, {
        httpOnly: true,
        secure: false,
        maxAge: 3600000, // 1 hour
      }).json({user: {username: userFound.username, id: userFound._id}, message: "Login successfuly!"});
    } else { // if the password is wrong, throw out the error for error handler
      const error:AuthError = new Error("Invalid credentials");
      error.status = 401;
      return next(error);
    }
  } catch (err) {
    console.error("Error logging in:", err.message || err); // Log to terminal
    return res.status(500).json({error: err.message || "Error logging in"});
    // next(err);
  }
};

// logic to create account
export const createAccountController = async (req: Request, res: Response) => {
  const {username, password} = req.body;
  try {
    const existingUser = await getUsersByUsername(username);
    // if the username already exists, reject the account creation
    if (existingUser.length > 0) {
      res.status(403).json({message: "username already exists."});
    } else {// otherwise, create the account and return a successful message // will be replaced by mongodb integration once its set up
      await addUser(username, bcrypt.hashSync(password, 10));
      res.status(200).json({message: "Account created successfully!"});
    }
  } catch (err) {
    console.error("Error creating account:", err.message || err); // Log to terminal
    return res.status(500).json({error: err.message || "Error creating account"});
    // next(err);
  }
};

// logic to reset password
export const resetPasswordController = async (req: Request, res: Response, next) => {
  const {username, newPassword} = req.body;
  try {
    const users = await getUsersByUsername(username);
    // if the old password is correct, reset the password in the database
    if (users.length > 0) {
      const user = users[0];
      await editUser(user.id, username, bcrypt.hashSync(newPassword, 10));
      res.status(200).json({message: "Password changed successfully!"});
    } else {// if the password is wrong, throw out the error for error handler
      const error:AuthError = new Error("User not found.");
      error.status = 401;
      next(error);
    }
  } catch (err) {
    console.error("Error resetting password:", err.message || err); // Log to terminal
    return res.status(500).json({error: err.message || "Error resetting password"});
  }
};

// logic to log out (clean httponly cookie)
export const logoutController = (req, res) => {
  res.clearCookie("token", {httpOnly: true, secure: false, sameSite: "Strict"});
  res.status(200).json({message: "Logged out successfully"});
};
