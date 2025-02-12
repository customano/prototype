"use client";

import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";

const API_URL = "https://customato-prototype-my38.vercel.app/tasks";

interface Tasks {
    [key: string]: string[];
}

export default function KanbanBoard() {
    const [tasks, setTasks] = useState<Tasks>({ todo: [], inProgress: [], done: [] });
    const [editingTask, setEditingTask] = useState<{ column: string; index: number } | null>(null);
    const [taskText, setTaskText] = useState<string>("");

    // Fetch tasks from backend on load
    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => setTasks(data))
            .catch((err) => console.error("Failed to fetch tasks:", err));
    }, []);

    // Handle Drag & Drop
    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceColumn = source.droppableId;
        const destColumn = destination.droppableId;

        // Clone tasks to avoid mutating state directly
        const updatedTasks = { ...tasks };
        const movedTasks = [...updatedTasks[sourceColumn]];
        const [movedTask] = movedTasks.splice(source.index, 1);

        if (movedTask) {
            updatedTasks[sourceColumn] = movedTasks;
            updatedTasks[destColumn] = [...updatedTasks[destColumn], movedTask];
        }

        setTasks(updatedTasks);

        // Save updated tasks to backend
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTasks)
        }).catch((err) => console.error("Failed to save tasks:", err));
    };

    // Handle task editing
    const startEditing = (column: string, index: number, text: string) => {
        setEditingTask({ column, index });
        setTaskText(text);
    };

    const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTaskText(e.target.value);
    };

    const finishEditing = () => {
        if (editingTask) {
            const { column, index } = editingTask;
            const updatedTasks = { ...tasks };
            updatedTasks[column][index] = taskText;
            setTasks(updatedTasks);

            // Save updated task to backend
            fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedTasks)
            }).catch((err) => console.error("Failed to update task:", err));

            setEditingTask(null);
        }
    };

    return (
        <div className="flex flex-col items-center p-8 bg-gray-100 min-h-screen">
            <div className="flex justify-center space-x-6 w-full max-w-5xl">
                <DragDropContext onDragEnd={onDragEnd}>
                    {Object.entries(tasks).map(([columnId, taskList]) => (
                        <Droppable key={columnId} droppableId={columnId}>
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="w-1/3 bg-white p-4 rounded-lg shadow-md min-h-[400px] flex flex-col"
                                >
                                    <h2 className="text-lg font-semibold mb-4 text-center capitalize bg-blue-500 text-white p-2 rounded-md">
                                        {columnId}
                                    </h2>
                                    <div className="space-y-3 flex-grow overflow-auto">
                                        {taskList.length > 0 ? (
                                            taskList.map((task, index) => (
                                                <Draggable key={task} draggableId={task} index={index}>
                                                    {(provided) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            className="bg-blue-100 p-3 rounded-md shadow cursor-pointer text-center border border-blue-300"
                                                            onDoubleClick={() => startEditing(columnId, index, task)}
                                                        >
                                                            {editingTask && editingTask.column === columnId && editingTask.index === index ? (
                                                                <input
                                                                    type="text"
                                                                    value={taskText}
                                                                    onChange={handleEditChange}
                                                                    onBlur={finishEditing}
                                                                    onKeyDown={(e) => e.key === "Enter" && finishEditing()}
                                                                    autoFocus
                                                                    className="w-full p-2 border border-blue-500 rounded-md"
                                                                />
                                                            ) : (
                                                                task
                                                            )}
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
        </div>
    );
}