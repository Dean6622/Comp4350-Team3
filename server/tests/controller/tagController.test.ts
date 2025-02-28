import request from "supertest";
import express, {Express} from "express";
import mongoose from "mongoose";
import {addTagController, getAllTagsController, editTagController, deleteTagController} from "../../src/controller/tagController";
import {addTag, getAllTags, editTag, deleteTag} from "../../src/db/tagService";

// Mock the tagService methods using jest
jest.mock("../../src/db/tagService");

describe("Tag Controller", () => {
  let app: Express;

  beforeAll(() => {
    // Initialize the Express app and enable JSON parsing
    app = express();
    app.use(express.json());
    // Register the routes for tag operations
    app.post("/tags", addTagController);
    app.get("/tags/:transactionId", getAllTagsController);
    app.put("/tags/:id", editTagController);
    app.delete("/tags/:id", deleteTagController);
  });

  describe("POST /tags", () => {
    it("should successfully create a tag", async () => {
      // Create a mock tag object
      const mockTag = {_id: new mongoose.Types.ObjectId(), name: "testTag", color: "red"};
      // Simulate a successful tag creation
      (addTag as jest.Mock).mockResolvedValue(mockTag);

      // Send a POST request to create a tag
      const response = await request(app)
        .post("/tags")
        .send({transactionId: "trans123", name: "testTag", color: "red"});

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Tag created successfully");
      expect(response.body.tag.id).toBe(mockTag._id.toString());
      expect(response.body.tag.name).toBe("testTag");
      expect(response.body.tag.color).toBe("red");
    });

    it("should return an error when tag creation fails", async () => {
      // Simulate an error during tag creation
      (addTag as jest.Mock).mockRejectedValue(new Error("Error creating tag"));

      // Send a POST request that will trigger an error
      const response = await request(app)
        .post("/tags")
        .send({transactionId: "trans123", name: "testTag", color: "red"});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error creating tag");
    });
  });

  describe("GET /tags/:transactionId", () => {
    it("should successfully retrieve all tags", async () => {
      // Create an array of mock tag objects
      const mockTags = [
        {_id: new mongoose.Types.ObjectId(), name: "tag1", color: "blue"},
        {_id: new mongoose.Types.ObjectId(), name: "tag2", color: "green"},
      ];
      // Simulate a successful retrieval of tags
      (getAllTags as jest.Mock).mockResolvedValue(mockTags);

      // Send a GET request to retrieve tags for a given transaction
      const response = await request(app).get("/tags/trans123");

      expect(response.status).toBe(200);
      expect(response.body.tags.length).toBe(2);
      expect(response.body.tags[0].name).toBe("tag1");
      expect(response.body.tags[0].color).toBe("blue");
    });

    it("should return an error when retrieving tags fails", async () => {
      // Simulate an error during tag retrieval
      (getAllTags as jest.Mock).mockRejectedValue(new Error("Error retrieving tags"));

      // Send a GET request that will trigger an error
      const response = await request(app).get("/tags/trans123");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error retrieving tags");
    });
  });

  describe("PUT /tags/:id", () => {
    it("should successfully update a tag", async () => {
      // Create a mock updated tag object
      const mockTag = {_id: new mongoose.Types.ObjectId(), name: "updatedTag", color: "yellow"};
      // Simulate a successful update of the tag
      (editTag as jest.Mock).mockResolvedValue(mockTag);

      // Send a PUT request to update the tag
      const response = await request(app)
        .put(`/tags/${mockTag._id}`)
        .send({name: "updatedTag", color: "yellow"});

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Tag updated successfully");
      expect(response.body.tag.id).toBe(mockTag._id.toString());
      expect(response.body.tag.name).toBe("updatedTag");
      expect(response.body.tag.color).toBe("yellow");
    });

    it("should return 404 when the tag to update is not found", async () => {
      // Simulate the case where the tag is not found
      (editTag as jest.Mock).mockResolvedValue(null);

      // Send a PUT request for a non-existing tag
      const response = await request(app)
        .put("/tags/someInvalidId")
        .send({name: "updatedTag", color: "yellow"});

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should return an error when updating a tag fails", async () => {
      // Simulate an error during tag update
      (editTag as jest.Mock).mockRejectedValue(new Error("Error updating tag"));

      // Send a PUT request that will trigger an error
      const response = await request(app)
        .put("/tags/someId")
        .send({name: "updatedTag", color: "yellow"});

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error updating tag");
    });
  });

  describe("DELETE /tags/:id", () => {
    it("should successfully delete a tag", async () => {
      // Simulate a successful deletion (deletedCount > 0)
      const mockResult = {deletedCount: 1};
      (deleteTag as jest.Mock).mockResolvedValue(mockResult);

      // Send a DELETE request to remove the tag
      const response = await request(app).delete("/tags/validTagId");

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Tag deleted successfully");
    });

    it("should return 404 when the tag to delete is not found", async () => {
      // Simulate the case where no tag is deleted (deletedCount === 0)
      const mockResult = {deletedCount: 0};
      (deleteTag as jest.Mock).mockResolvedValue(mockResult);

      // Send a DELETE request for a non-existing tag
      const response = await request(app).delete("/tags/nonExistentTagId");

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Tag not found");
    });

    it("should return an error when deleting a tag fails", async () => {
      // Simulate an error during tag deletion
      (deleteTag as jest.Mock).mockRejectedValue(new Error("Error deleting tag"));

      // Send a DELETE request that will trigger an error
      const response = await request(app).delete("/tags/someId");

      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Error deleting tag");
    });
  });

  afterAll(() => {
    // Restore all mocks after tests complete
    jest.restoreAllMocks();
  });
});
