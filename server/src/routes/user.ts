
// GET user profile page.

import express from "express";
import {addUserController, getSingleUserController, editUserController, deleteUserController} from "../controller/userController";
import {authenticateToken} from "../middleware/authenticator";
import {validateUserRequest, validateParams} from "../middleware/dbValidation";

const router = express.Router();

// http://localhost:portNum/api/user

router.get("/:username", authenticateToken, validateUserRequest, getSingleUserController);

// example body for post:
// { 'username': 'someUser', 'password': 'somePass'}

router.post("/", authenticateToken, validateUserRequest, addUserController);

// http://localhost:portNum/api/user/someID  (probably a better way of doing it that im not thinking about)
// example body for put:
// { 'username': 'someUser', 'password': 'somePass'}
router.put("/:id", authenticateToken, validateUserRequest, validateParams("id"), editUserController);

// example for delete:
// http://localhost:portNum/api/user/someID (same as the put path)
router.delete("/:id", authenticateToken, validateUserRequest, validateParams("id"), deleteUserController);

export default router;
