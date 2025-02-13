require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3001;

// Debug: Log the MongoDB URI to confirm it's loaded
console.log("MONGO_URI from ENV:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 10000 })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
  });

app.use(cors());
app.use(express.json());

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  status: { type: String, enum: ["todo", "inProgress", "done", "hold"], required: true },
});

const Task = mongoose.model("Task", taskSchema);

// Debug Route for Checking DB Connection
app.get("/debug/db", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    res.json({ message: "✅ MongoDB Connected Successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ MongoDB Connection Failed", details: error.message });
  }
});

// Fetch Tasks
app.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    const groupedTasks = {
      todo: tasks.filter((task) => task.status === "todo").map((t) => t.title),
      inProgress: tasks.filter((task) => task.status === "inProgress").map((t) => t.title),
      done: tasks.filter((task) => task.status === "done").map((t) => t.title),
      hold: tasks.filter((task) => task.status === "hold").map((t) => t.title),
    };
    res.json(groupedTasks);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tasks", details: error.message });
  }
});

// Add a New Task
app.post("/tasks", async (req, res) => {
  try {
    const { title, status } = req.body;
    if (!title || !status) return res.status(400).json({ error: "Title and status are required" });

    const newTask = new Task({ title, status });
    await newTask.save();

    res.status(201).json({ message: "Task added successfully", task: newTask });
  } catch (error) {
    res.status(500).json({ error: "Failed to add task", details: error.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});