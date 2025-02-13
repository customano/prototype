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

    useEffect(() => {
        fetch(API_URL)
            .then((res) => res.json())
            .then((data) => {
                console.log("Fetched tasks:", data);
                if (data && typeof data === "object") {
                    setTasks({ ...DEFAULT_TASKS, ...data });
                } else {
                    console.error("Invalid API response:", data);
                    setTasks(DEFAULT_TASKS);
                }
            })
            .catch((err) => {
                console.error("Failed to fetch tasks:", err);
                setTasks(DEFAULT_TASKS);
                setHasError(true);
            })
            .finally(() => setIsLoading(false));
    }, []);

    const onDragEnd = (result: DropResult) => {
        const { source, destination } = result;
        if (!destination) return;

        const sourceColumn = source.droppableId as keyof Tasks;
        const destColumn = destination.droppableId as keyof Tasks;

        if (!tasks[sourceColumn] || !tasks[destColumn]) {
            console.error("Invalid drag source or destination:", sourceColumn, destColumn);
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

    const addTask = (title: string) => {
        if (!title.trim()) return;
        setTasks((prev) => {
            const updatedTasks = { ...prev, todo: [title, ...prev.todo] };
            saveTasks(updatedTasks);
            return updatedTasks;
        });
    };

    const handleDoubleClick = (columnId: keyof Tasks, task: string) => {
        setIsEditing({ ...isEditing, [`${columnId}-${task}`]: task });
    };

    const handleChange = (columnId: keyof Tasks, oldTask: string, newTask: string) => {
        const updatedTasks = { ...tasks };
        const taskIndex = updatedTasks[columnId].indexOf(oldTask);
        if (taskIndex !== -1) {
            updatedTasks[columnId][taskIndex] = newTask;
            setTasks(updatedTasks);
            saveTasks(updatedTasks);
        }
        setIsEditing({ ...isEditing, [`${columnId}-${oldTask}`]: null });
    };

    const handleBlur = (columnId: keyof Tasks, oldTask: string, newTask: string) => {
        if (newTask.trim() === "") return;
        handleChange(columnId, oldTask, newTask);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>, columnId: keyof Tasks, oldTask: string) => {
        if (event.key === "Enter") {
            handleChange(columnId, oldTask, event.currentTarget.value);
        } else if (event.key === "Escape") {
            setIsEditing({ ...isEditing, [`${columnId}-${oldTask}`]: null });
        }
    };

    const saveTasks = (updatedTasks: Tasks) => {
        fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedTasks),
        }).catch((err) => console.error("Failed to save tasks:", err));
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
                                            {id === "todo" && <AddNewTask onAdd={addTask} />}
                                            
                                            {tasks[id as keyof Tasks]?.length > 0 ? (
                                                tasks[id as keyof Tasks].map((task, index) => (
                                                    <Draggable key={task} draggableId={task} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className="bg-blue-100 p-3 rounded-md shadow cursor-pointer text-center border border-blue-300"
                                                                onDoubleClick={() => handleDoubleClick(id as keyof Tasks, task)}
                                                            >
                                                                {isEditing[`${id}-${task}`] !== undefined ? (
                                                                    <input
                                                                        type="text"
                                                                        className="w-full p-1 rounded border border-blue-300"
                                                                        defaultValue={task}
                                                                        onBlur={(e) => handleBlur(id as keyof Tasks, task, e.target.value)}
                                                                        onKeyDown={(e) => handleKeyDown(e, id as keyof Tasks, task)}
                                                                        autoFocus
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
            )}
        </div>
    );
}