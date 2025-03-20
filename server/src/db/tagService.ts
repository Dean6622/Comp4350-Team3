import mongoose from "mongoose";
import Tag, {ITag} from "./tagDB"; // Import the Tag model
import {dbLog} from "./dbLog";

// Create a new tag
export const addTag = async (userId: string, name: string, color: string, message?: string): Promise<ITag> => {
  try {
    const newTag = new Tag({user: userId, name, color, message});
    await newTag.save();
    return newTag;
  } catch (err) {
    console.error("Error adding tag:", err);
    throw err;
  }
};

// Retrieve all tags created for given user
export const getAllTags = async (userId: string): Promise<ITag[]> => {
  try {
    // check if userId is valid
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID format");
    }
    const tags = await Tag.find({user: userId}).populate("user"); // Fetch all tags
    return tags;
  } catch (err) {
    console.error("Error retrieving tags:", err);
    throw err;
  }
};

// Edit an existing tag
export const editTag = async (id: string, name?: string, color?: string, message?: string): Promise<ITag | null> => {
  try {
    // validate tagID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid tag ID format");
    }

    // Update tags only with the fields provided
    const updatedFields: Partial<ITag> = {};
    if (name) updatedFields.name = name;
    if (color) updatedFields.color = color;
    if (message !== undefined) updatedFields.message = message;

    const updatedTag = await Tag.findByIdAndUpdate(id, updatedFields, {new: true});

    if (!updatedTag) {
      dbLog(`No tag with the ID ${id} found.`);
      return null;
    }

    dbLog(`Tag ${updatedTag.name} updated successfully`);
    return updatedTag;
  } catch (err) {
    console.error("Error updating tag:", err);
    throw err;
  }
};

// Function to delete a tag
export const deleteTag = async (id: string) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid tag ID");
    }
    const result = await Tag.deleteOne({_id: id});
    if (result.deletedCount > 0) {
      dbLog(`Tag ${id} deleted successfully.`);
    } else {
      dbLog(`No tag with id ${id} found.`);
    }
    return result;
  } catch (err) {
    console.error("Error deleting tag:", err);
    throw err;
  }
};
