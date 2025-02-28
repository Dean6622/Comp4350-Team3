
import express from "express";
import {addTagController, getAllTagsController, editTagController, deleteTagController} from "../controller/tagController.js";
import {authenticateToken} from "../middleware/authenticator.js";
import {validateTagRequest, validateParams} from "../middleware/dbValidation.js";

const router = express.Router();

// http://localhost:portNum/api/tag

router.get("/", authenticateToken, validateTagRequest, getAllTagsController);


router.post("/", authenticateToken, validateTagRequest, addTagController);

// http://localhost:portNum/api/user/someID  (probably a better way of doing it that im not thinking about)
// example body for put:
// { 'name': 'someTag', 'color': 'someHexcode'}
router.put("/:id", authenticateToken, validateTagRequest, validateParams("id"), editTagController);

// example for delete:
// http://localhost:portNum/api/tag/someID (same as the put path)
router.delete("/:id", authenticateToken, validateTagRequest, validateParams("id"), deleteTagController);

export default router;
