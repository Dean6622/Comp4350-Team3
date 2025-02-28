import mongoose from 'mongoose';
import Tag, { ITag } from './tagDB'; // Import the Tag model

// Function to add a new tag
export const addTag = async (name: string, color: string): Promise<ITag> => {
    try {
        const newTag = new Tag({ name, color });
        await newTag.save();
        return newTag;
    } 
    catch (err) {
        console.error('Error adding tag:', err);
        throw err;
    }
};

// Function to get all tags
export const getAllTags = async (): Promise<ITag[]> => {
    try {
   
        const tags = await Tag.find(); // Fetch all tags
        return tags;
    } 
    catch (err) {
        console.error('Error retrieving tags:', err);
        throw err;
    }
};

// Function to edit a tag
export const editTag = async (id: string, name?: string, color?: string): Promise<ITag | null> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid tag ID format');
        }

        const updatedFields: Partial<ITag> = {};
        
        if (name) updatedFields.name = name;
        if (color) updatedFields.color = color;

        const updatedTag = await Tag.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedTag) {
            return null;
        }

        return updatedTag;
    } 
    catch (err) {
        console.error('Error updating tag:', err);
        throw err;
    }
};

// Function to delete a tag
export const deleteTag = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid tag ID');
        }
        const result = await Tag.deleteOne({ _id: id });
        return result;
    } 
    catch (err) {
        console.error('Error deleting tag:', err);
        throw err;
    }
};
