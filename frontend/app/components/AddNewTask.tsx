// app/components/AddNewTask.tsx
import { useState } from "react";

type AddNewTaskProps = {
  onAdd: (title: string) => void;
};

export default function AddNewTask({ onAdd }: AddNewTaskProps) {
  const [taskTitle, setTaskTitle] = useState("NEW TASK");
  const [isEditing, setIsEditing] = useState(false);

  const handleBlur = () => {
    if (taskTitle.trim() !== "" && taskTitle !== "NEW TASK") {
      onAdd(taskTitle);
    }
    setTaskTitle("NEW TASK");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  return (
    <div
      className="bg-gray-200 p-2 rounded-md mb-2 cursor-pointer text-gray-500 hover:bg-gray-300"
      onDoubleClick={() => setIsEditing(true)}
    >
      {isEditing ? (
        <input
          autoFocus
          className="w-full bg-white border rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={taskTitle}
          onChange={(e) => setTaskTitle(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <p>{taskTitle}</p>
      )}
    </div>
  );
}