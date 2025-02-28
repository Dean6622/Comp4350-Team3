/*
 * POST Allow user to login with username and password, return a token for future interaction after login.
 */


// Some of the early entries in the database that were created without the hashing may not work for login (because not encoded properly)
import express from "express";
import {loginController, createAccountController, resetPasswordController, logoutController} from "../controller/loginController";
import {validateUserRequest} from "../middleware/dbValidation";


const router = express.Router();

router.post("/", validateUserRequest, loginController);
router.post("/signup", validateUserRequest, createAccountController);
// For testing the login and signup you need username and password
router.put("/reset-password", validateUserRequest, resetPasswordController);
// For testing the reset-password you need id, username and newPassword as the body
router.post("/logout", logoutController);

export default router;


