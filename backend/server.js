import express from 'express';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

app.get('/api/channels', async (req, res) => {
  const result = await pool.query('SELECT * FROM channels');
  res.json(result.rows);
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
