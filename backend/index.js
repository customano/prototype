import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const MONGO_URI = process.env.MONGO_URI;

// Connect to MongoDB Atlas
mongoose.connect(MONGO_URI, {
    dbName: "customatoDB", // Ensure database name is set
    serverSelectionTimeoutMS: 10000, // Increase timeout
})
.then(() => console.log("✅ MongoDB Connected Successfully"))
.catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Define Task Schema
const taskSchema = new mongoose.Schema({
    title: String,
    status: { type: String, enum: ["todo", "inProgress", "done", "hold"], default: "todo" },
});

const Task = mongoose.model("Task", taskSchema);

// GET: Fetch all tasks
app.get("/tasks", async (req, res) => {
    try {
        const tasks = await Task.find();
        const formattedTasks = { todo: [], inProgress: [], done: [], hold: [] };
        tasks.forEach((task) => formattedTasks[task.status].push(task.title));
        res.json(formattedTasks);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch tasks", details: err.message });
    }
});

// POST: Add a new task
app.post("/tasks", async (req, res) => {
    try {
        const { title, status } = req.body;
        const newTask = new Task({ title, status: status || "todo" });
        await newTask.save();
        res.json(newTask);
    } catch (err) {
        res.status(500).json({ error: "Failed to create task", details: err.message });
    }
});

// PUT: Update a task's status
app.put("/tasks/:title", async (req, res) => {
    try {
        const { status } = req.body;
        await Task.findOneAndUpdate({ title: req.params.title }, { status });
        res.json({ message: "Task updated" });
    } catch (err) {
        res.status(500).json({ error: "Failed to update task", details: err.message });
    }
});

// DELETE: Remove a task
app.delete("/tasks/:title", async (req, res) => {
    try {
        await Task.findOneAndDelete({ title: req.params.title });
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete task", details: err.message });
    }
});

// DEBUG: Test MongoDB Connection
app.get("/debug/db", async (req, res) => {
    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000, // Increase timeout
        });
        res.json({ message: "✅ MongoDB Connected Successfully" });
    } catch (err) {
        res.status(500).json({ error: "❌ MongoDB Connection Error", details: err.message });
    }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));