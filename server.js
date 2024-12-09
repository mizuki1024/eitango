const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
const PORT = 3001;

// CORSを許可
app.use(cors());

// SQLiteデータベース接続
const db = new sqlite3.Database('C:\\Users\\shinr\\eitango\\tango-v3_fixed.db');

// API: 単語を取得する
app.get('/api/words', (req, res) => {
    const query = 'SELECT id, word, jword, type, level FROM word';
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});