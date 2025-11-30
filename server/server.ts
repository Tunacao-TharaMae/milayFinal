import express from "express";
import cors from "cors";
import mysql from "mysql2/promise";

const app = express();

// ===============================
// ✅ CORS SETUP
// ===============================
// Allow only your Vercel frontend to access the API
app.use(cors({
  origin: "https://milay-final.vercel.app", // only your frontend
  methods: ["GET","POST","PUT","DELETE"],
  allowedHeaders: ["Content-Type"],
  credentials: true
}));


// Enable JSON parsing
app.use(express.json());

// ===============================
// ✅ DATABASE CONNECTION
// ===============================
const db = mysql.createPool({
  host: process.env.MYSQLHOST || "mysql.railway.internal",
  user: process.env.MYSQLUSER || "root",
  password: process.env.MYSQLPASSWORD || "password",
  database: process.env.MYSQLDATABASE || "railway",
  port: Number(process.env.MYSQLPORT) || 3306,
});

// ===============================
// ✅ INITIALIZE TABLE
// ===============================
async function initDB() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INT AUTO_INCREMENT PRIMARY KEY,
        description VARCHAR(255) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ tasks table ready");
  } catch (err) {
    console.error("❌ Failed to initialize tasks table:", err);
  }
}

initDB();

// ===============================
// ✅ TEST DATABASE CONNECTION
// ===============================
app.get("/api/test-db", async (_req, res) => {
  try {
    const [tables] = await db.query("SHOW TABLES");
    res.json({ connected: true, tables });
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

// CREATE a task
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

// UPDATE a task
app.put("/api/tasks/:id", async (req, res) => {
  const { id } = req.params;
  const { description, is_completed } = req.body;

  try {
    await db.query(
      "UPDATE tasks SET description = ?, is_completed = ? WHERE id = ?",
      [description, is_completed, id]
    );

    const [rows]: any = await db.query("SELECT * FROM tasks WHERE id = ?", [id]);
    res.json(rows[0]);
  } catch (error) {
    console.error("PUT /api/tasks error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE a task
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
// ✅ START SERVER
// ===============================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
