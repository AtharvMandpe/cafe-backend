import connectDB from "./db/mongodb.js";
import { connectRedis } from "./db/redis.js";
import dotenv from "dotenv";
import app from "./app.js";
dotenv.config();

Promise.all([connectDB(), connectRedis()])
  .then(() => {
    app
      .listen(process.env.PORT || 8000, () => {
        console.log(`Server is running at ${process.env.PORT}`);
      })
      .on("error", (error) => {
        console.error(`Error while starting the server: ${error.message}`);
        process.exit(1); // Exit the process if there's an error starting the server
      });
  })
  .catch((error) => {
    console.log(`MongoDB connection failed ${error}`);
  });
