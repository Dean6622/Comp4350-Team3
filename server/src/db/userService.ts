import User, {IUser} from './userDB.js'; // Import the User model
import mongoose from 'mongoose';

// Function to add a new user
export const addUser = async (username: string, password: string): Promise<IUser> => {
    try {
        const newUser = new User({ username, password });
        await newUser.save();
        console.log('User added successfully:', newUser);
        return newUser;
    } catch (err) {
        console.error('Error adding user:', err);
        throw err;
    }
};

export const getAllUsers = async () => {
    try {
        const users = await User.find({}); // Fetch all users
        console.log('Users retrieved:', users);
        return users;
    } catch (err) {
        console.error('Error retrieving users:', err);
        throw err;
    }
};

// Function to edit a user
export const editUser = async (id: string, username?: string, password?: string): Promise<IUser | null> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID format');
        }

        const updatedFields: Partial<IUser> = {};
        
        //Ensures only username and password are updated, not some other field
        if (username) updatedFields.username = username;
        if (password) updatedFields.password = password;

        const updatedUser = await User.findByIdAndUpdate(id, updatedFields, { new: true });

        if (!updatedUser) {
            console.log('No user with the ID found.');
            return null;
        }

        console.log('User updated successfully:', updatedUser);
        return updatedUser;
    } catch (err) {
        console.error('Error updating user:', err);
        throw err;
    }
};

export const deleteUser = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID');
        }
        const result = await User.deleteOne({_id: id});
        if (result.deletedCount > 0) {
            console.log('User deleted successfully.');
        } else {
            console.log('No user found.');
        }
        return result;
    } catch (err) {
        console.error('Error deleting user:', err);
        throw err;
    }
};
