import { Request, Response } from 'express';
import { ITag } from '../db/tagDB.js';
import { addTag, getAllTags, editTag, deleteTag } from '../db/tagService.js'; 

const formatTag = (tag: ITag) => ({
    id: tag._id.toString(), 
    name: tag.name, 
    color: tag.color,
});

export const addTagController = async (req: Request, res: Response) => {
    const { transactionId, name, color } = req.body;
    try {
        const tag = await addTag(transactionId, name, color);
        const formattedTag = formatTag(tag);

        console.log('Formatted Tag:', formattedTag);

        res.status(201).json({ message: 'Tag created successfully', tag: formattedTag });
    } 
    catch (err) {
        console.error('Error creating tag:', err.message || err); 
        return res.status(500).json({ error: err.message || 'Error creating tag' });
    }
};

export const getAllTagsController = async (req: Request, res: Response) => {
    const { transactionId } = req.params;

    try {
        const tags = await getAllTags(transactionId);
        const formattedTags = tags.map(formatTag);

        console.log('Formatted Tags:', formattedTags);

        res.status(200).json({ tags: formattedTags });
    } 
    catch (err) {
        console.error('Error retrieving tags:', err.message || err); 
        return res.status(500).json({ error: err.message || 'Error retrieving tags' });
    }
};

export const editTagController = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, color } = req.body;

    try {
        const updatedTag = await editTag(id, name, color);
        const formattedTag = formatTag(updatedTag);

        console.log('Formatted Tag:', formattedTag);
        if (updatedTag) {
            res.status(200).json({ message: 'Tag updated successfully', tag: formattedTag });
        } 
        else {
            res.status(404).json({ message: 'Tag not found' });
        }
    } 
    catch (err) {
        console.error('Error updating tag:', err.message || err); 
        return res.status(500).json({ error: err.message || 'Error updating tag' });
    }
};

export const deleteTagController = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const result = await deleteTag(id);
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Tag deleted successfully' });
        } 
        else {
            res.status(404).json({ message: 'Tag not found' });
        }
    } 
    catch (err) {
        console.error('Error deleting tag:', err.message || err);
        return res.status(500).json({ error: err.message || 'Error deleting tag' });
    }
};
