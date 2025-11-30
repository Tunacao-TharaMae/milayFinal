import { useState, useEffect, type FormEvent } from "react";
import "./App.css";

const API_URL = "https://milay-final2.vercel.app/api/tasks";
const API_ID_URL = (id: number) => `https://milay-final2.vercel.app/api/${id}`;

interface Task {
  id: number;
  description: string;
  is_completed: boolean;
  created_at: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error("API returned non-array:", data);
        setTasks([]);
        return;
      }
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
      setTasks([]);
    }
  };

  const resetForm = () => {
    setNewTask("");
    setEditingTask(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      if (editingTask) {
        const res = await fetch(API_ID_URL(editingTask.id), {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            description: newTask,
            is_completed: editingTask.is_completed,
          }),
        });
        const updated = await res.json();
        setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
      } else {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description: newTask, is_completed: false }),
        });
        const newT = await res.json();
        setTasks([newT, ...tasks]);
      }
    } catch (err) {
      console.error("Failed to save task:", err);
    }

    resetForm();
  };

  const toggleCompleted = async (task: Task) => {
    try {
      const res = await fetch(API_ID_URL(task.id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: task.description,
          is_completed: !task.is_completed,
        }),
      });
      const updated = await res.json();
      setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
    } catch (err) {
      console.error("Failed to toggle task:", err);
    }
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Delete task?")) return;
    try {
      await fetch(API_ID_URL(id), { method: "DELETE" });
      setTasks(tasks.filter(t => t.id !== id));
    } catch (err) {
      console.error("Failed to delete task:", err);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setNewTask(task.description);
  };

  return (
    <div className="container-wrapper">
      <div className="container">
        <h1>Task Manager</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Enter task"
          />
          <button type="submit">{editingTask ? "Update" : "Add"} Task</button>
        </form>

        <ul>
          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className={task.is_completed ? "completed" : ""}>
                <span
                  onClick={() => toggleCompleted(task)}
                  className="task-checkmark"
                >
                  {task.is_completed ? "✅" : "⬜"}
                </span>
                <div className="task-content">
                  <span className="task-text">{task.description}</span>
                  <span className="task-date">
                    {new Date(task.created_at).toLocaleString()}
                  </span>
                </div>
                <div className="button-group">
                  <button onClick={() => editTask(task)} className="button-edit">
                    Edit
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="button-delete">
                    Delete
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

export default App;
