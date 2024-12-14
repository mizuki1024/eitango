const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const bcrypt = require("bcrypt"); // パスワードのハッシュ化
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || "./tango-v3_fixed_all.db";

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", methods: ["GET", "POST"] }));
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

// Create users table if it doesn't exist
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
`);

// **ユーザー登録エンドポイント**
app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "メールアドレスとパスワードは必須です。" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // パスワードをハッシュ化
        const query = "INSERT INTO users (email, password) VALUES (?, ?)";

        db.run(query, [email, hashedPassword], (err) => {
            if (err) {
                if (err.code === "SQLITE_CONSTRAINT") {
                    return res.status(400).json({ error: "このメールアドレスは既に登録されています。" });
                }
                return res.status(500).json({ error: "登録中にエラーが発生しました。" });
            }
            res.status(201).json({ message: "登録成功！" });
        });
    } catch (error) {
        console.error("登録エラー:", error.message);
        res.status(500).json({ error: "サーバーエラーが発生しました。" });
    }
});

// **ユーザーログインエンドポイント**
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "メールアドレスとパスワードは必須です。" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.get(query, [email], async (err, user) => {
        if (err) {
            console.error("ログイン中のデータベースエラー:", err.message);
            return res.status(500).json({ error: "サーバーエラーが発生しました。" });
        }

        if (!user) {
            return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています。" });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています。" });
            }

            res.status(200).json({ message: "ログイン成功！", userId: user.id });
        } catch (error) {
            console.error("ログインエラー:", error.message);
            res.status(500).json({ error: "サーバーエラーが発生しました。" });
        }
    });
});

// **単語取得エンドポイント**
app.get("/words/:level", (req, res) => {
    const level = parseInt(req.params.level, 10);
    const userId = req.query.userId || 1; // デフォルトのユーザーID

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

        const formattedRows = rows.map((row) => {
            const correctOption = { word: row.word, meaning: row.jword };

            const incorrectOptions = rows
                .filter((r) => r.id !== row.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 2)
                .map((r) => ({ word: r.word, meaning: r.jword }));

            const options = [correctOption, ...incorrectOptions].sort(() => Math.random() - 0.5);

            return {
                id: row.id,
                word: row.word,
                options,
                correctOption: options.indexOf(correctOption),
            };
        });

        res.json(formattedRows);
    });
});

// **履歴取得エンドポイント**
app.get("/history", (req, res) => {
    const userId = req.query.userId || 1;

    const query = `
        SELECT h.id, h.word_id, h.date, h.state, w.word, w.jword
        FROM history h
        JOIN word w ON h.word_id = w.id
        WHERE h.user_id = ?
        ORDER BY h.date DESC, h.id DESC
    `;

    db.all(query, [userId], (err, rows) => {
        if (err) {
            console.error("Error fetching history:", err.message);
            res.status(500).json({ error: "Failed to fetch history." });
            return;
        }

        const formattedRows = rows.map((row) => ({
            id: row.id,
            wordId: row.word_id,
            word: row.word,
            jword: row.jword,
            date: row.date,
            state: row.state,
        }));

        res.json(formattedRows);
    });
});

// **履歴保存エンドポイント**
app.post("/history", (req, res) => {
    const { wordId, userId = 1, state, date } = req.body;

    if (!wordId || !state || !date) {
        return res.status(400).json({ error: "必要なデータが不足しています。" });
    }

    const query = `
        INSERT INTO history (word_id, user_id, state, date)
        VALUES (?, ?, ?, ?)
    `;

    db.run(query, [wordId, userId, state, date], (err) => {
        if (err) {
            console.error("履歴保存エラー:", err.message);
            return res.status(500).json({ error: "履歴の保存中にエラーが発生しました。" });
        }
        res.status(201).json({ message: "履歴が正常に保存されました。" });
    });
});


// **間違えた履歴取得エンドポイント**
app.get("/history/incorrect", (req, res) => {
    const userId = req.query.userId;
    const date = req.query.date || "1970-01-01";

    if (!userId) {
        return res.status(400).json({ error: "userId is required." });
    }

    const query = `
        SELECT DISTINCT h.word_id, w.word, w.jword, h.date
        FROM history h
        JOIN word w ON h.word_id = w.id
        WHERE h.user_id = ? AND h.state = 2 AND h.date >= ?
        ORDER BY h.date DESC
    `;

    db.all(query, [userId, date], (err, rows) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Failed to fetch data." });
        }

        res.json(
            rows.map((row) => ({
                wordId: row.word_id,
                word: row.word,
                jword: row.jword,
                date: row.date,
            }))
        );
    });
});

// ユーザーテーブルを初期化
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lineUserId TEXT UNIQUE NOT NULL,
            displayName TEXT NOT NULL,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('テーブル作成エラー:', err.message);
        } else {
            console.log('usersテーブルを初期化しました。');
        }
    });
});

// LINE認証のコールバックエンドポイント
app.get('/api/auth/line/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // LINEアクセストークンを取得
        const tokenResponse = await axios.post(
            'https://api.line.me/oauth2/v2.1/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: process.env.LINE_CALLBACK_URL, // コールバックURL
                client_id: process.env.LINE_CHANNEL_ID, // LINEチャネルID
                client_secret: process.env.LINE_CHANNEL_SECRET, // LINEチャネルシークレット
            })
        );

        const { access_token } = tokenResponse.data;

        // LINEユーザープロフィールを取得
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { userId, displayName } = profileResponse.data;

        // データベースに保存または更新
        db.serialize(() => {
            db.run(
                `
                INSERT INTO users (lineUserId, displayName)
                VALUES (?, ?)
                ON CONFLICT(lineUserId) DO UPDATE SET
                    displayName = excluded.displayName
                `,
                [userId, displayName],
                (err) => {
                    if (err) {
                        console.error('データベース保存エラー:', err.message);
                        return res.status(500).send('データベース保存中にエラーが発生しました。');
                    }
                    console.log('ユーザー情報が保存されました:', { userId, displayName });
                    res.redirect(`/home?userId=${userId}`); // フロントエンドにリダイレクト
                }
            );
        });
    } catch (error) {
        console.error('LINE認証エラー:', error.message);
        res.status(500).send('認証に失敗しました。');
    }
});

// React静的ファイルの提供
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
