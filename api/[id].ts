import mysql from 'mysql2/promise';

// DB pool (reuse same connection settings)
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: Number(process.env.MYSQLPORT) || 3306,
});

export default async function handler(req: any, res: any) {
  const { id } = req.query;

  try {
    if (req.method === 'PUT') {
      const { description, is_completed } = req.body;
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
