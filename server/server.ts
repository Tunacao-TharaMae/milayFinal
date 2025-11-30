import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();

// CORS: allow all origins for testing (can restrict later)
app.use(cors({ origin: "*" }));
app.use(express.json());

// DB Connection using Railway MYSQL_URL
const db = mysql.createPool(
  process.env.MYSQL_URL || "mysql://root:password@localhost:3306/railway"
);

// ===============================
// ✅ TEST DATABASE CONNECTION
// ===============================
// ✅ TEST DATABASE CONNECTION
app.get("/api/test-db", async (_req, res) => {
  try {
    const [rows] = await db.query("SELECT DATABASE() AS db_name") as [ { db_name: string }[], any ];
    res.json({ connected: true, database: rows[0].db_name });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({ connected: false, error: (err as Error).message });
  }
});


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
app.delete("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;

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
