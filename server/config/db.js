import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Server is connected to the database");
    } catch (e) {
        console.error("Something went wrong connecting to the database:", e);
    }
};

export default connectDB;

