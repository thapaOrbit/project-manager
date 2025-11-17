import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import routes from "./routes/index.js";
import DueDateScheduler from './services/due-date-scheduler.js';

dotenv.config();

const app = express()

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(morgan("dev"));

// increased payload limits:
app.use(express.json({ limit: '10mb' })); // Increase from default 100kb to 10MB
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// db connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("DB Connected successfully."))
  .catch((err) => console.log("Failed to connect to DB:", err));


mongoose.connection.once('open', () => {
  DueDateScheduler.start();
});

const PORT = process.env.PORT || 5000;

app.get("/", async (req, res) => {
  res.status(200).json({
    message: "Welcome to TaskHive API",
  });
});

// http:localhost:5000/api-v1/
app.use("/api-v1", routes)

// error middleware
app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// not found middleware
app.use((req, res) => {
  res.status(404).json({
    message: "Not found",
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});