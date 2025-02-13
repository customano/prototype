"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import AddNewTask from "./AddNewTask";

const API_URL = "https://customato-prototype-backend.vercel.app/tasks";

interface Tasks {
    todo: string[];
    inProgress: string[];
    done: string[];
    hold: string[];
}

const DEFAULT_TASKS: Tasks = {
    todo: [],
    inProgress: [],
    done: [],
    hold: [],
};

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Tasks>(DEFAULT_TASKS);
    const [isEditing, setIsEditing] = useState<{ [key: string]: string | null }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const fetchTasks = async () => {
        try {
            const response = await fetch(API_URL);
            const data = await response.json();
            console.log("📥 Fetched tasks:", data);
            if (data && typeof data === "object") {
                setTasks({ ...DEFAULT_TASKS, ...data });
            } else {
                console.error("❌ Invalid API response:", data);
                setTasks(DEFAULT_TASKS);
            }
        } catch (error) {
            console.error("❌ Failed to fetch tasks:", error);
            setTasks(DEFAULT_TASKS);
            setHasError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const saveTasks = async (updatedTasks: Tasks) => {
        console.log("📤 Saving tasks:", updatedTasks);
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTasks),
            });
            if (!response.ok) {
                console.error("❌ Failed to save tasks", await response.json());
            } else {
                console.log("✅ Tasks saved successfully");
            }
        } catch (err) {
            console.error("❌ Failed to save tasks:", err);
        }
    };

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceColumn = source.droppableId as keyof Tasks;
        const destColumn = destination.droppableId as keyof Tasks;

        if (!tasks[sourceColumn] || !tasks[destColumn]) {
            console.error("❌ Invalid drag source or destination:", sourceColumn, destColumn);
            return;
        }

        const updatedTasks = { ...tasks };
        const movedTasks = [...updatedTasks[sourceColumn]];
        const [movedTask] = movedTasks.splice(source.index, 1);

        if (movedTask) {
            updatedTasks[sourceColumn] = movedTasks;
            updatedTasks[destColumn] = [...updatedTasks[destColumn], movedTask];
        }

        setTasks(updatedTasks);
        saveTasks(updatedTasks);
    };

    const addTask = async (task: string) => {
        console.log("➕ Adding new task:", task);
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: task, status: "todo" }),
            });

            if (response.ok) {
                console.log("✅ Task added successfully");
                fetchTasks(); // Refresh task list after adding
            } else {
                console.error("❌ Failed to add task", await response.json());
            }
        } catch (error) {
            console.error("❌ Error adding task:", error);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-gray-100 overflow-hidden">
            {isLoading ? (
                <p className="text-center text-lg text-gray-600">Loading...</p>
            ) : hasError ? (
                <p className="text-center text-lg text-red-500">Failed to load tasks.</p>
            ) : (
                <div className="flex w-full h-[80%] px-[3%] space-x-[2%]">
                    <DragDropContext onDragEnd={onDragEnd}>
                        {[
                            { id: "todo", title: "TODO", color: "bg-gray-500" },
                            { id: "inProgress", title: "WIP", color: "bg-blue-500" },
                            { id: "done", title: "DONE", color: "bg-green-500" },
                            { id: "hold", title: "HOLD", color: "bg-red-500" },
                        ].map(({ id, title, color }) => (
                            <Droppable key={id} droppableId={id}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="w-[22%] bg-white p-4 rounded-lg shadow-md flex flex-col overflow-hidden"
                                    >
                                        <h2 className={`text-lg font-semibold mb-4 text-center text-white p-2 rounded-md ${color}`}>
                                            {title}
                                        </h2>
                                        <div className="space-y-3 flex-grow overflow-auto">
                                            {/* Add New Task Component at the top */}
                                            {id === "todo" && <AddNewTask onTaskAdded={fetchTasks} />}

                                            {tasks[id as keyof Tasks]?.length > 0 ? (
                                                tasks[id as keyof Tasks].map((task, index) => (
                                                    <Draggable key={task} draggableId={task} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="bg-blue-100 p-3 rounded-md shadow cursor-pointer text-center border border-blue-300"
                                                            >
                                                                {task}
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            ) : (
                                                <p className="text-gray-500 text-center">No tasks</p>
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </DragDropContext>
                </div>
            )}
        </div>
    );
}