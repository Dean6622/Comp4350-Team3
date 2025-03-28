import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import Tag from "../../db/tagDB";
import {addTag, getAllTags, editTag, deleteTag} from "../../db/tagService";
import "../../db/userDB";

// Test settings assisted by AI
beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
afterEach(() => {
  jest.restoreAllMocks();
});

describe("Tag Service Tests", () => {
  let mongoServer: MongoMemoryServer;
  let userId: string;

  beforeAll(async () => {
    mongoose.set('strictQuery', true);
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await Tag.deleteMany({});
    userId = new mongoose.Types.ObjectId().toString();
  });

  test("should add a valid tag", async () => {
    const tag = await addTag(userId, "Tag1", "#FF5733");
    expect(tag.name).toBe("Tag1");
    expect(tag.color).toBe("#FF5733");
    expect(tag.user.toString()).toBe(userId);
  });

  test("should not add a tag without a name", async () => {
    await expect(addTag(userId, "", "#FF5733")).rejects.toThrow("Tag validation failed: name: Tag is required");
  });

  test("should not add a tag with an invalid color", async () => {
    await expect(addTag(userId, "Invalid Tag", "invalid-color")).rejects.toThrow("Tag validation failed: color: Path `color` is invalid (invalid-color).");
  });

  test("should get all tags for a user", async () => {
    await addTag(userId, "Tag1", "#FF5733");
    await addTag(userId, "Tag2", "#33FF57");

    const tags = await getAllTags(userId.toString());
    expect(tags.length).toBe(2);
    expect(tags[0].name).toBe("Tag1");
    expect(tags[1].name).toBe("Tag2");
  });

  test("should not get tags for an invalid user ID", async () => {
    await expect(getAllTags("invalid-user-id")).rejects.toThrow("Invalid user ID format");
  });

  // Example test case generated by AI
  test("should edit a tag name", async () => {
    const tag = await addTag(userId, "Tag1", "#FF5733");
    const updatedTag = await editTag(tag._id.toString(), "Updated Tag");

    expect(updatedTag).not.toBeNull();
    expect(updatedTag?.name).toBe("Updated Tag");
    expect(updatedTag?.color).toBe("#FF5733");
  });

  test("should edit a tag color", async () => {
    const tag = await addTag(userId, "Tag1", "#FF5733");
    const updatedTag = await editTag(tag._id.toString(), undefined, "#33FF57");

    expect(updatedTag).not.toBeNull();
    expect(updatedTag?.name).toBe("Tag1");
    expect(updatedTag?.color).toBe("#33FF57");
  });

  test("should not edit a tag with an invalid ID", async () => {
    await expect(editTag("invalid-id", "Updated Tag", "#33FF57")).rejects.toThrow("Invalid tag ID format");
  });

  test("should return null if tag not found", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const updatedTag = await editTag(nonExistentId, "Updated Tag", "#33FF57");
    expect(updatedTag).toBeNull();
  });

  test("should delete a tag", async () => {
    const tag = await addTag(userId, "Tag1", "#FF5733");
    await deleteTag(tag._id.toString());
    const tags = await getAllTags(userId);
    expect(tags.length).toBe(0);
  });

  test("should not delete a tag with an invalid ID", async () => {
    await expect(deleteTag("invalid-id")).rejects.toThrow("Invalid tag ID");
  });

  test("should not delete a non-existent tag", async () => {
    const nonExistentId = new mongoose.Types.ObjectId().toString();
    const result = await deleteTag(nonExistentId);
    expect(result.deletedCount).toBe(0);
  });

  test("should update the message if provided", async () => {
    const tag = await addTag(userId, "Tag1", "#FF5733");
    
    // Assume we have a field `message` and update it
    const updatedTag = await editTag(tag._id.toString(), "Updated Tag", "#33FF57", "New message");
    
    expect(updatedTag).not.toBeNull();
    expect(updatedTag?.message).toBe("New message");
    expect(updatedTag?.name).toBe("Updated Tag");
    expect(updatedTag?.color).toBe("#33FF57");
  });
});
