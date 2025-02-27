import { Request, Response } from 'express';
import { 
    addTagController, 
    getAllTagsController, 
    editTagController, 
    deleteTagController 
} from '../../src/controller/tagController';

import { 
    addTag, 
    getAllTags, 
    editTag, 
    deleteTag 
} from '../../src/db/tagService';

// Mock tagService
jest.mock('../../src/db/tagService');

describe('Tag Controller', () => {
    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        mockRes = {
            status: statusMock,
            json: jsonMock,
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addTagController', () => {
        it('should return 201 and tag data when successful', async () => {
            mockReq = { body: { name: 'Test Tag', color: '#FFFFFF' } };
            const mockTag = { _id: '1', ...mockReq.body };

            (addTag as jest.Mock).mockResolvedValue(mockTag);

            await addTagController(mockReq as Request, mockRes as Response);

            expect(addTag).toHaveBeenCalledWith('Test Tag', '#FFFFFF');
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Tag created successfully',
                tag: expect.objectContaining({ id: '1', name: 'Test Tag', color: '#FFFFFF' }),
            });
        });

        it('should return 500 if tag creation fails', async () => {
            mockReq = { body: { name: 'Test Tag', color: '#FFFFFF' } };

            (addTag as jest.Mock).mockRejectedValue(new Error('Database error'));

            await addTagController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });

    describe('getAllTagsController', () => {
        it('should return 200 and a list of tags', async () => {
            const mockTags = [{ _id: '1', name: 'Test Tag', color: '#FFFFFF' }];

            (getAllTags as jest.Mock).mockResolvedValue(mockTags);

            await getAllTagsController(mockReq as Request, mockRes as Response);

            expect(getAllTags).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                tags: [expect.objectContaining({ id: '1', name: 'Test Tag', color: '#FFFFFF' })],
            });
        });

        it('should return 500 if retrieval fails', async () => {
            (getAllTags as jest.Mock).mockRejectedValue(new Error('Database error'));

            await getAllTagsController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ error: 'Database error' });
        });

        it('should return 200 and an empty array when no tags exist', async () => {
            (getAllTags as jest.Mock).mockResolvedValue([]); // No tags in DB
    
            await getAllTagsController(mockReq as Request, mockRes as Response);
    
            expect(getAllTags).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ tags: [] });
        });
    });

    describe('editTagController', () => {
        it('should return 200 and updated tag data if tag exists', async () => {
            mockReq = { params: { id: '1' }, body: { name: 'Updated Tag' } };
            const mockTag = { _id: '1', name: 'Updated Tag', color: '#FFFFFF' };

            (editTag as jest.Mock).mockResolvedValue(mockTag);

            await editTagController(mockReq as Request, mockRes as Response);

            expect(editTag).toHaveBeenCalledWith('1', 'Updated Tag', undefined);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Tag updated successfully',
                tag: expect.objectContaining({ id: '1', name: 'Updated Tag', color: '#FFFFFF' }),
            });
        });

        it('should return 404 if tag does not exist', async () => {
            mockReq = { params: { id: '1' }, body: { name: 'Updated Tag' } };

            (editTag as jest.Mock).mockResolvedValue(null);

            await editTagController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Tag not found' });
        });

        it('should update only the provided fields', async () => {
            mockReq = { params: { id: '1' }, body: { name: 'Partially Updated Tag' } };
            const mockTag = { _id: '1', name: 'Partially Updated Tag', color: '#FFFFFF' };
    
            (editTag as jest.Mock).mockResolvedValue(mockTag);
    
            await editTagController(mockReq as Request, mockRes as Response);
    
            expect(editTag).toHaveBeenCalledWith('1', 'Partially Updated Tag', undefined);
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Tag updated successfully',
                tag: expect.objectContaining({ id: '1', name: 'Partially Updated Tag', color: '#FFFFFF' }),
            });
        });
    });

    describe('deleteTagController', () => {
        it('should return 200 if tag is deleted', async () => {
            mockReq = { params: { id: '1' } };
            (deleteTag as jest.Mock).mockResolvedValue({ deletedCount: 1 });

            await deleteTagController(mockReq as Request, mockRes as Response);

            expect(deleteTag).toHaveBeenCalledWith('1');
            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Tag deleted successfully' });
        });

        it('should return 404 if tag is not found', async () => {
            mockReq = { params: { id: '1' } };
            (deleteTag as jest.Mock).mockResolvedValue({ deletedCount: 0 });

            await deleteTagController(mockReq as Request, mockRes as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Tag not found' });
        });
    });
});
