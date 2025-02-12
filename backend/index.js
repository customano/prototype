import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory task storage
let tasks = {
    todo: ["Task 1", "Task 2"],
    inProgress: ["Task 3"],
    done: ["Task 4"]
};

// GET - Fetch tasks
app.get("/tasks", (req, res) => {
    res.json(tasks);
});

// POST - Update tasks
app.post("/tasks", (req, res) => {
    tasks = req.body;
    res.json({ success: true, tasks });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/", (req, res) => {
    res.send("Customato Backend API is running!");
});