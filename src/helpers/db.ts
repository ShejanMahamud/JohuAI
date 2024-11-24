import mongoose from "mongoose";
export const connectDB = async (url: string) => {
  if (!url) {
    console.log("Please provide a database URI string");
    process.exit(1);
  }
  try {
    await mongoose.connect(url);
    console.log("Database connection established!");
  } catch (error) {
    console.error(
      `Database Connection Failed: ${
        (error as Error).message || "An Unknown Error Occurred!"
      }`
    );
    process.exit(1);
  }
};
