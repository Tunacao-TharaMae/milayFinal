import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();
app.use(cors());
app.use(express.json());

// DB Connection
const db = mysql.createPool(
  process.env.MYSQL_URL || "mysql://root:password@localhost:3306/railway"
);


// ===============================
// ✅ CRUD API FOR TASKS
// ===============================

// GET all tasks
app.get("/api/tasks", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM tasks ORDER BY id DESC");
    res.json(rows);
  } catch (error) {
    console.error("GET /api/tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// CREATE task
app.post("/api/tasks", async (req, res) => {
  const { description, is_completed } = req.body;

  try {
    const [result]: any = await db.query(
      "INSERT INTO tasks (description, is_completed, created_at) VALUES (?, ?, NOW())",
      [description, is_completed]
    );

    res.json({
      id: result.insertId,
      description,
      is_completed,
      created_at: new Date(),
    });
  } catch (error) {
    console.error("POST /api/tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// UPDATE task
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { description, is_completed } = req.body;

  try {
    await db.query(
      "UPDATE tasks SET description = ?, is_completed = ? WHERE id = ?",
      [description, is_completed, id]
    );

    const [rows]: any = await db.query("SELECT * FROM tasks WHERE id = ?", [
      id,
    ]);

    res.json(rows[0]);
  } catch (error) {
    console.error("PUT /api/tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE task
app.delete("/api/tasks/:id", async (_req, res) => {
  const { id } = _req.params;

  try {
    await db.query("DELETE FROM tasks WHERE id = ?", [id]);
    res.json({ success: true, message: "Task deleted" });
  } catch (error) {
    console.error("DELETE /api/tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
