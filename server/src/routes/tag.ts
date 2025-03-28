
import express from "express";
import {addTagController, getAllTagsController, editTagController, deleteTagController} from "../controller/tagController.js";
import {authenticateToken} from "../middleware/authenticator.js";
import {validateTagRequest, validateParams} from "../middleware/dbValidation.js";

const router = express.Router();

// Request params for get all tags for a user
// http://localhost:3000/api/tag/someUserId
router.get("/:userId", authenticateToken, validateTagRequest, getAllTagsController);

// http://localhost:3000/api/tag
// Sample body for creating a tag
// {
//     "userId": "67da0903e15887ab7db2e9e3",
//     "name": "car",
//     "color": "#332255"
// }
router.post("/", authenticateToken, validateTagRequest, addTagController);

// http://localhost:portNum/api/user/someID
// example body for put:
// { 'name': 'someTag', 'color': 'someHexcode'} doesen't have to include both but at least 1
router.put("/:id", authenticateToken, validateTagRequest, validateParams("id"), editTagController);

// example for delete:
// http://localhost:portNum/api/tag/someID
router.delete("/:id", authenticateToken, validateTagRequest, validateParams("id"), deleteTagController);

export default router;
