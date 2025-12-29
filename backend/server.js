
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const SECRET = "secret_key";
const db = new sqlite3.Database("database.db");

// إنشاء الجداول
db.run(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password TEXT
)`);

db.run(`
CREATE TABLE IF NOT EXISTS progress (
  user_id INTEGER,
  level INTEGER,
  score INTEGER
)`);

// تسجيل حساب
app.post("/register", async (req, res) => {
  const { email, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);

  db.run(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed],
    err => {
      if (err) return res.status(400).json({ error: "Email exists" });
      res.json({ message: "Account created" });
    }
  );
});

// تسجيل دخول
app.post("/login", (req, res) => {
  const { email, password } = req.body;

  db.get(
    "SELECT * FROM users WHERE email = ?",
    [email],
    async (err, user) => {
      if (!user) return res.status(401).json({ error: "Invalid" });

      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ error: "Invalid" });

      const token = jwt.sign({ id: user.id }, SECRET);
      res.json({ token });
    }
  );
});

// حفظ التقدم
app.post("/progress", (req, res) => {
  const { token, level, score } = req.body;
  const decoded = jwt.verify(token, SECRET);

  db.run(
    "INSERT INTO progress (user_id, level, score) VALUES (?, ?, ?)",
    [decoded.id, level, score],
    () => res.json({ message: "Progress saved" })
  );
});

app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
