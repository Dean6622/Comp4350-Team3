import {Request, Response} from "express";
import {addUserController, getSingleUserController, editUserController, deleteUserController} from "../../src/controller/userController";
import {addUser, getUsersByUsername, editUser, deleteUser} from "../../src/db/userService";

// Mock userService
jest.mock("../../src/db/userService");
const mockAddUser = addUser as jest.Mock;
const mockGetUsersByUsername = getUsersByUsername as jest.Mock;
const mockEditUser = editUser as jest.Mock;
const mockDeleteUser = deleteUser as jest.Mock;

describe("User Controller", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("addUserController", () => {
    it("should create a user successfully", async () => {
      const newUser = {username: "testuser", password: "password123"};
      const mockUser = {_id: "1", username: "testuser", password: "password123"};

      mockAddUser.mockResolvedValue(mockUser);

      req.body = newUser;

      await addUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User created successfully",
        user: {id: mockUser._id, username: mockUser.username},
      });
    });

    it("should return an error if user creation fails", async () => {
      const newUser = {username: "testuser", password: "password123"};
      const error = new Error("Error creating user");
      mockAddUser.mockRejectedValue(error);

      req.body = newUser;

      await addUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: "Error creating user"});
    });
  });

  describe("getSingleUserController", () => {
    it("should return a single user by username", async () => {
      const username = "testuser";
      const mockUser = [{_id: "1", username: "testuser", password: "password123"}];

      mockGetUsersByUsername.mockResolvedValue(mockUser);

      req.params = {username};

      await getSingleUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        id: mockUser[0]._id,
        username: mockUser[0].username,
      });
    });

    it("should handle errors during retrieval", async () => {
      const username = "testuser";
      const error = new Error("Error retrieving user");
      mockGetUsersByUsername.mockRejectedValue(error);

      req.params = {username};

      await getSingleUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: "Error retrieving user"});
    });
  });

  describe("editUserController", () => {
    it("should update user successfully", async () => {
      const id = "1";
      const updatedData = {username: "newusername", password: "newpassword123"};
      const updatedUser = {_id: id, username: "newusername", password: "newpassword123"};

      mockEditUser.mockResolvedValue(updatedUser);

      req.params = {id};
      req.body = updatedData;

      await editUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User updated successfully",
        user: {id: updatedUser._id, username: updatedUser.username},
      });
    });

    it("should return an error if user update fails", async () => {
      const id = "1";
      const updatedData = {username: "newusername", password: "newpassword123"};
      const error = new Error("Error updating user");
      mockEditUser.mockRejectedValue(error);

      req.params = {id};
      req.body = updatedData;

      await editUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: "Error updating user"});
    });

    it("should return not found if user does not exist", async () => {
      const id = "1";
      const updatedData = {username: "newusername", password: "newpassword123"};
      mockEditUser.mockResolvedValue(null);

      req.params = {id};
      req.body = updatedData;

      await editUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({message: "User not found"});
    });
  });

  describe("deleteUserController", () => {
    it("should delete user successfully", async () => {
      const id = "1";
      const result = {deletedCount: 1};
      mockDeleteUser.mockResolvedValue(result);

      req.params = {id};

      await deleteUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({message: "User deleted successfully"});
    });

    it("should return not found if user does not exist", async () => {
      const id = "1";
      const result = {deletedCount: 0};
      mockDeleteUser.mockResolvedValue(result);

      req.params = {id};

      await deleteUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({message: "User not found"});
    });

    it("should return error if deletion fails", async () => {
      const id = "1";
      const error = new Error("Error deleting user");
      mockDeleteUser.mockRejectedValue(error);

      req.params = {id};

      await deleteUserController(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({error: "Error deleting user"});
    });
  });
});
