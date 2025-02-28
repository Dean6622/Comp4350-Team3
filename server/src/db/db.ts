import mongoose from 'mongoose';

const dbURI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@simplefinance.sjbyl.mongodb.net/SimpleFinance?retryWrites=true&w=majority&appName=SimpleFinance`;

const connectDB = async () => {
    try {
        await mongoose.connect(dbURI);
    } catch (err) {
        console.error('Database connection error:', err);
        process.exit(1); // Exit process on failure
    }
};


export default connectDB;
