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

  try {
    if (req.method === 'GET') {
      const [rows] = await db.query('SELECT * FROM tasks ORDER BY id DESC');
      return res.status(200).json(rows);
    }

    if (req.method === 'POST') {
      const { description, is_completed } = req.body;
      if (!description) return res.status(400).json({ message: 'Description required' });

      const [result]: any = await db.query(
        'INSERT INTO tasks (description, is_completed, created_at) VALUES (?, ?, NOW())',
        [description, is_completed || false]
      );

      return res.status(201).json({
        id: result.insertId,
        description,
        is_completed: is_completed || false,
        created_at: new Date(),
      });
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
}
