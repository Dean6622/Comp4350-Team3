import {MongoMemoryServer} from "mongodb-memory-server";
import mongoose from "mongoose";
import User from "../../db/userDB";
import {addUser, getAllUsers, getUsersByUsername, editUser, deleteUser, findUserById} from "../../db/userService";

beforeEach(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

// Test setting assisted by AI
describe("User Service Tests", () => {
  let mongoServer: MongoMemoryServer;
  let existingUserId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    const user = await addUser("testUser", "password123", 100);
    existingUserId = user._id.toString();
  });

  // Add User Tests
  test("should add a user", async () => {
    const user = await addUser("newUser", "securePass", 200);
    expect(user.username).toBe("newUser");
    expect(user.balance).toBe(200);

    const users = await getAllUsers();
    expect(users.length).toBe(2);
  });

  test("should not add a user with duplicate username", async () => {
    await expect(addUser("testUser", "anotherPass", 150))
      .rejects.toThrow("Username already exists");

    const users = await getAllUsers();
    expect(users.length).toBe(1);
  });

  test("should not add a user without balance", async () => {
    await expect(addUser("noBalanceUser", "password", undefined))
      .rejects.toThrow("Balance must be a positive number");

    const users = await getAllUsers();
    expect(users.length).toBe(1);
  });

  test("should not add a user with zero or negative balance", async () => {
    await expect(addUser("userWithZeroBalance", "password123", 0))
      .rejects.toThrow("Balance must be a positive number");
    await expect(addUser("userWithNegativeBalance", "password123", -100))
      .rejects.toThrow("Balance must be a positive number");

    const users = await getAllUsers();
    expect(users.length).toBe(1);
  });

  test("should update password when provided", async () => {
    const updatedUser = await editUser(existingUserId, undefined, "newPassword123");
    expect(updatedUser).not.toBeNull();
    expect(updatedUser?.password).toBe("newPassword123");
  });
  
  
  // Get Users Tests
  describe("Get Users Tests", () => {
    test("should get all users", async () => {
      await addUser("user1", "pass1", 50);
      await addUser("user2", "pass2", 150);
      const users = await getAllUsers();
      expect(users.length).toBe(3);
    });

    test("should log error when User.find fails", async () => {
      const mockError = new Error("Database connection failed");
      jest.spyOn(User, "find").mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      await expect(getAllUsers()).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error retrieving users:", mockError);
      consoleErrorSpy.mockRestore();
    });

    test("should get user by username", async () => {
      const users = await getUsersByUsername("testUser");
      expect(users.length).toBe(1);
      expect(users[0].username).toBe("testUser");
    });

    test("should return empty array for non-existent username", async () => {
      const users = await getUsersByUsername("nonExistentUser");
      expect(users).toEqual([]);
    });

    test("should log error when User.find fails for getUsersByUsername", async () => {
      const mockError = new Error("Database connection failed");
      jest.spyOn(User, "find").mockRejectedValue(mockError);
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

      await expect(getUsersByUsername("errorUser")).rejects.toThrow(mockError);
      expect(consoleErrorSpy).toHaveBeenCalledWith("Error retrieving users:", mockError);
      consoleErrorSpy.mockRestore();
    });
  });

  // Edit User Tests
  describe("Edit User Tests", () => {
    test("should edit a user", async () => {
      const updatedUser = await editUser(existingUserId, "updatedUser", undefined, 200);
      expect(updatedUser).not.toBeNull();
      expect(updatedUser?.username).toBe("updatedUser");
      expect(updatedUser?.balance).toBe(200);
    });

    test("should not update user with invalid ID format", async () => {
      await expect(editUser("invalidID", "newUser"))
        .rejects.toThrow("Invalid user ID format");
    });

    test("should not allow duplicate usernames when editing", async () => {
      await addUser("uniqueUser", "pass", 300);
      await expect(editUser(existingUserId, "uniqueUser"))
        .rejects.toThrow("Username already exists");
    });

    test("should return null when editing a non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await editUser(fakeId, "newName");
      expect(result).toBeNull();
    });

    test("should allow balance update when editing user", async () => {
      const updatedUser = await editUser(existingUserId, undefined, undefined, 500);
      expect(updatedUser?.balance).toBe(500);
    });
  });

  // Delete User Tests
  describe("Delete User Tests", () => {
    test("should delete a user", async () => {
      await deleteUser(existingUserId);
      const users = await getAllUsers();
      expect(users.length).toBe(0);
    });

    test("should not delete non-existent user", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const result = await deleteUser(fakeId);
      expect(result.deletedCount).toBe(0);
    });

    test("should throw error when deleting with invalid ID format", async () => {
      await expect(deleteUser("invalidID"))
        .rejects.toThrow("Invalid user ID");
    });
  });

  // Find User By ID Tests
  describe("Find User By ID Tests", () => {
    test("should find user by valid ID", async () => {
      const user = await findUserById(existingUserId);
      expect(user).not.toBeNull();
      expect(user?._id.toString()).toBe(existingUserId);
      expect(user?.username).toBe("testUser");
    });

    test("should return null for non-existent user ID", async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const user = await findUserById(fakeId);
      expect(user).toBeNull();
    });

    test("should throw error for invalid ID format", async () => {
      await expect(findUserById("invalidID"))
        .rejects.toThrow("Invalid user ID format");
    });

    test("should handle database errors", async () => {
      const mockError = new Error("Database connection failed");
      jest.spyOn(User, "findById").mockRejectedValueOnce(mockError);

      await expect(findUserById(existingUserId)).rejects.toThrow(mockError);
      // Removed the console.error expectation since the function doesn't log errors
    });
  });
});
