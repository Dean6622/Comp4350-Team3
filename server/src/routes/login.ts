/*
 * POST Allow user to login with username and password, return a token for future interaction after login.
 */


// Some of the early entries in the database that were created without the hashing may not work for login (because not encoded properly)
import express from "express";
import {loginController, createAccountController, resetPasswordController, logoutController} from "../controller/loginController";
import {validateUserRequest} from "../middleware/dbValidation";


const router = express.Router();
// http://localhost:3000/api/login
// Used for login
// example body
// {
//     "username": "ned",
//     "password": "kelly"
// }
router.post("/", validateUserRequest, loginController);
// http://localhost:3000/api/login/signup
// example body for signup
// {
//     "username": "comment",
//     "password": "a",
//     "balance": "1"
// }
router.post("/signup", validateUserRequest, createAccountController);
// http://localhost:3000/api/login/reset-password
// example body for reset-password
// {
//     "username": "comment",
//     "newPassword": "b"
// }
router.put("/reset-password", validateUserRequest, resetPasswordController);
// http://localhost:3000/api/login/logout
// no body required for logout
router.post("/logout", logoutController);
export default router;


