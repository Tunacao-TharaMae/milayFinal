// api/[id].ts
import mysql from 'mysql2/promise';

// Create DB connection pool
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 3306,
});

export default async function handler(req: any, res: any) {
  // ✅ Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*'); // allow any frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ✅ Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query; // dynamic id from URL

  if (!id) return res.status(400).json({ message: 'ID is required' });

  try {
    if (req.method === 'GET') {
      const [rows]: any = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
      if (rows.length === 0) return res.status(404).json({ message: 'Task not found' });
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'PUT') {
      const { description, is_completed } = req.body;
      if (!description) return res.status(400).json({ message: 'Description required' });

      await db.query(
        'UPDATE tasks SET description = ?, is_completed = ? WHERE id = ?',
        [description, is_completed, id]
      );

      const [rows]: any = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
      return res.status(200).json(rows[0]);
    }

    if (req.method === 'DELETE') {
      await db.query('DELETE FROM tasks WHERE id = ?', [id]);
      return res.status(200).json({ success: true, message: 'Task deleted' });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
