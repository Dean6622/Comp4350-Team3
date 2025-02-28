import Transaction, { ITransaction } from './transactionDB';
import User from './userDB'
import Tag from './tagDB'
import mongoose from 'mongoose';

export const addTransaction = async (userId: string, name: string, date: string, amount: number, currency: string, tags?: string[]) => {
    try {

        // 🔹 Validate if user exists before proceeding
        const userExists = await User.findById(userId);
        if (!userExists) {
            throw new Error('User does not exist');
        }

         // 🔹 Validate and filter out invalid tag IDs
         const validTags = tags?.filter(tagId => mongoose.Types.ObjectId.isValid(tagId)) || [];

         // 🔹 Ensure all provided tags exist in the database
        const existingTags = await Tag.find({ _id: { $in: validTags } });

        if (existingTags.length !== validTags.length) {
            throw new Error('One or more tags do not exist.');
        }

        const newTransaction = new Transaction({
            user: userId,
            name,
            date: new Date(date), 
            amount,
            currency,
            tags: validTags 
        });

        await newTransaction.save();
        return newTransaction;
    } catch (err) {
        if (err.name === 'ValidationError') {
            throw new Error(`Validation Error: ${Object.values(err.errors).map(e => (e as mongoose.Error.ValidationError).message).join(', ')}`);
        }
        console.error('Error adding transaction:', err);
        throw err;
    }
};

// get all transactions for a user
export const getAllTransactions = async (userId: string): Promise<ITransaction[]> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            throw new Error('Invalid user ID format');
        }

        const transactions = await Transaction.find({user: userId}).populate('tags').populate('user');
        return transactions;
    } catch (err) {
        if (err.name === 'ValidationError') {
            throw new Error(`Validation Error: ${Object.values(err.errors).map(e => (e as mongoose.Error.ValidationError).message).join(', ')}`);
        }
        console.error('Error retrieving transactions:', err);
        throw err;
    }
};

//To edit, need to enter in the body, all the fields again, even ones that you didn't intend to replace. If you don't enter tag, it deletes it and sets it to default.
export const editTransaction = async (id: string, name?: string, date?: string, amount?: number, currency?: string, tags?: string[]): Promise<ITransaction | null> => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid transaction ID format');
        }
        const updatedTransaction = await Transaction.findById(id);

        if (!updatedTransaction) {
            return null;
        }

        if (date) updatedTransaction.date = new Date(date); 
        if (name) updatedTransaction.name = name;
        if (amount) updatedTransaction.amount = amount;
        if (currency) updatedTransaction.currency = currency;

         if (tags !== undefined) {
            if (tags.length > 0) {
                const validTags = tags
                    .filter(tagId => mongoose.Types.ObjectId.isValid(tagId))
                    .map(tagId => new mongoose.Types.ObjectId(tagId));

                const existingTags = await Tag.find({ _id: { $in: validTags } });

                if (existingTags.length !== validTags.length) {
                    throw new Error('One or more tags do not exist.');
                }

                updatedTransaction.tags = existingTags;
            } else {
                updatedTransaction.tags = [];
            }
        }

        await updatedTransaction.save();

        return updatedTransaction;
    } 
    catch (err) {
        if (err.name === 'ValidationError') {
            const errorMessages = Object.values(err.errors).map((e: mongoose.Error.ValidationError) => e.message).join(', ');
            console.error('Validation failed:', errorMessages);
            throw new Error(`Validation Error: ${errorMessages}`);
        }
        console.error('Error updating transaction:', err);
        throw err;
    }
};



// Delete by entering just the id in the body
export const deleteTransaction = async (id: string) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error('Invalid user ID format');
        }
        const result = await Transaction.deleteOne({_id: id});
        return result;
    } catch (err) {
        if (err.name === 'ValidationError') {
            throw new Error(`Validation Error: ${Object.values(err.errors).map(e => (e as mongoose.Error.ValidationError).message).join(', ')}`);
        }
        console.error('Error deleting user:', err);
        throw err;
    }
};

