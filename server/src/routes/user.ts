
// GET user profile page.

import express from "express";
import {addUserController, getSingleUserController, editUserController, deleteUserController} from "../controller/userController.js";
import {authenticateToken} from "../middleware/authenticator.js";
import {validateUserRequest, validateParams, validateParamsUser} from "../middleware/dbValidation.js";

const router = express.Router();

// http://localhost:portNum/api/user/someUsername

router.get("/:username", authenticateToken, validateUserRequest, validateParamsUser, getSingleUserController);

// http://localhost:portNum/api/user
// example body for post:
// { 'username': 'someUser', 'password': 'somePass', 'balance: '1'}

router.post("/", authenticateToken, validateUserRequest, addUserController);

// http://localhost:portNum/api/user/someID
// example body for put:
// { 'username': 'someUser', 'password': 'somePass'}
router.put("/:id", authenticateToken, validateUserRequest, validateParams("id"), editUserController);

// example for delete:
// http://localhost:portNum/api/user/someID (same as the put path)
router.delete("/:id", authenticateToken, validateUserRequest, validateParams("id"), deleteUserController);

export default router;
