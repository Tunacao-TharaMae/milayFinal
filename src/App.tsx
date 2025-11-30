import { useState, useEffect, type FormEvent } from "react";
import "./App.css";

const API_URL = "https://milayfinal-production.up.railway.app/api/tasks";

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
    const res = await fetch(API_URL);
    const data = await res.json();
    setTasks(data);
  };

  const resetForm = () => {
    setNewTask("");
    setEditingTask(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    if (editingTask) {
      const res = await fetch(`${API_URL}/${editingTask.id}`, {
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
        body: JSON.stringify({
          description: newTask,
          is_completed: false,
        }),
      });

      const newT = await res.json();
      setTasks([...tasks, newT]);
    }

    resetForm();
  };

  const toggleCompleted = async (task: Task) => {
    const res = await fetch(`${API_URL}/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description: task.description,
        is_completed: !task.is_completed,
      }),
    });

    const updated = await res.json();
    setTasks(tasks.map(t => (t.id === updated.id ? updated : t)));
  };

  const deleteTask = async (id: number) => {
    if (!confirm("Delete task?")) return;

    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    setTasks(tasks.filter(t => t.id !== id));
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
          <button type="submit">
            {editingTask ? "Update" : "Add"} Task
          </button>
        </form>

        <ul>
          {tasks.length === 0 ? (
            <p>No tasks yet.</p>
          ) : (
            tasks.map((task) => (
              <li key={task.id} className={task.is_completed ? "completed" : ""}>
                <span onClick={() => toggleCompleted(task)} className="task-checkmark">
                  {task.is_completed ? "✅" : "⬜"}
                </span>

                <span className="task-text">{task.description}</span>

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

      <img
        src="/anime-figure.jpg"
        alt="Anime Figure"
        className="anime-background-figure"
      />
    </div>
  );
}

export default App;
