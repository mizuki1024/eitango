const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || "./tango-v3_fixed_all.db";

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || "*", // 必要に応じてドメインを制限
    methods: ["GET", "POST"],
}));
app.use(express.json());
app.use(compression());
app.use(morgan("combined"));

// Database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Root endpoint
app.get("/", (req, res) => {
    res.send("Welcome to the API! Use /words/:level to fetch words or /words/select to record selections.");
});

// Get words for a specific level, excluding today's selected words
app.get("/words/:level", (req, res) => {
    const level = parseInt(req.params.level, 10);
    const userId = req.query.userId; // Assuming user ID is sent as query parameter

    const query = `
        SELECT id, word, jword 
        FROM word 
        WHERE level = ?
          AND id NOT IN (
              SELECT word_id 
              FROM history 
              WHERE user_id = ? AND date = date('now')
          )
        LIMIT 100
    `;

    db.all(query, [level, userId], (err, rows) => {
        if (err) {
            console.error("Error fetching words:", err.message);
            res.status(500).json({ error: "Failed to fetch words." });
            return;
        }

        // Generate options for each word
        const allOptions = rows.map((row) => row.jword);
        const formattedRows = rows.map((row) => {
            const incorrectOptions = allOptions
                .filter((opt) => opt !== row.jword)
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);

            const options = [row.jword, ...incorrectOptions].sort(() => Math.random() - 0.5);

            return {
                id: row.id,
                word: row.word,
                options,
                correctOption: options.indexOf(row.jword),
            };
        });

        res.json(formattedRows);
    });
});

// Record selected word
app.post("/words/select", (req, res) => {
    const { userId, wordId } = req.body;

    const query = `
        INSERT INTO history (user_id, word_id, date)
        VALUES (?, ?, date('now'))
    `;

    db.run(query, [userId, wordId], (err) => {
        if (err) {
            console.error("Error recording word selection:", err.message);
            res.status(500).json({ error: "Failed to record selection." });
            return;
        }
        res.sendStatus(200);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: "Internal Server Error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
