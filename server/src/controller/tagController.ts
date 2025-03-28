import {Request, Response} from "express";
import {ITag} from "../db/tagDB";
import {addTag, getAllTags, editTag, deleteTag} from "../db/tagService";
import {controlLog} from "./controlLog";

// helps format tags to be in a neater format
const formatTag = (tag: ITag) => ({
  id: tag._id.toString(),
  name: tag.name,
  color: tag.color,
  message: tag.message || "",
});

// Controller to create a new tag
export const addTagController = async (req: Request, res: Response) => {
  const {userId, name, color, message} = req.body;
  try {
    const tag = await addTag(userId, name, color, message);
    const formattedTag = formatTag(tag);

    controlLog("Formatted Tag:", formattedTag);

    res.status(201).json({message: "Tag created successfully", tag: formattedTag});
  } catch (err) {
    console.error("Error creating tag:", err.message || err);
    return res.status(500).json({error: err.message || "Error creating tag"});
  }
};

// Controller to fetch all tags for a given user
export const getAllTagsController = async (req: Request, res: Response) => {
  const {userId} = req.params;

  try {
    const tags = await getAllTags(userId);
    const formattedTags = tags.map(formatTag);

    res.status(200).json(formattedTags);
  } catch (err) {
    console.error("Error retrieving tags:", err.message || err);
    return res.status(500).json({error: err.message || "Error retrieving tags"});
  }
};

// Controller to handle updating an existing tag
export const editTagController = async (req: Request, res: Response) => {
  const {id} = req.params;
  const {name, color, message} = req.body;

  try {
    const updatedTag = await editTag(id, name, color, message);
    if (updatedTag) {
      const formattedTag = formatTag(updatedTag);
      controlLog("Formatted Tag:", formattedTag);
      res.status(200).json({message: "Tag updated successfully", tag: formattedTag});
    } else {
      res.status(404).json({message: "Tag not found"});
    }
  } catch (err) {
    console.error("Error updating tag:", err.message || err);
    return res.status(500).json({error: err.message || "Error updating tag"});
  }
};

// Controller to handle deleting a tag
export const deleteTagController = async (req: Request, res: Response) => {
  const {id} = req.params;
  try {
    const result = await deleteTag(id);
    if (result.deletedCount > 0) {
      res.status(200).json({message: "Tag deleted successfully"});
    } else {
      res.status(404).json({message: "Tag not found"});
    }
  } catch (err) {
    console.error("Error deleting tag:", err.message || err);
    return res.status(500).json({error: err.message || "Error deleting tag"});
  }
};
