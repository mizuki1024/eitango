const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const bcrypt = require("bcrypt");
require("dotenv").config();
const SECRET_KEY = "your_secret_key"; // JWTの秘密鍵
const jwt = require("jsonwebtoken"); // JWTのため
const cookieParser = require("cookie-parser");

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || "./tango-v3_fixed_all.db";

// Middleware
const corsOptions = {
    origin: "http://localhost:3002", // フロントエンドのURL
    methods: ["POST", "GET"],
    credentials: true, // クッキーや認証情報を含める場合
};

app.use(cors(corsOptions));
app.use(cookieParser()); // クッキーをパースするミドルウェア
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));
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

// ユーザーテーブルを作成するSQL文
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        username TEXT NOT NULL,  
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`, (err) => {
    if (err) {
        console.error("usersテーブル作成エラー:", err.message);
    } else {
        console.log("usersテーブルが作成されました。");
    }
});

// time_spent テーブルを作成するSQL文
db.run(`
    CREATE TABLE IF NOT EXISTS time_spent (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        date DATETIME NOT NULL,  -- 時間も含む日付型に変更
        time_spent INTEGER NOT NULL, -- 滞在時間（秒単位）
        FOREIGN KEY (user_id) REFERENCES users(id)
    );
`, (err) => {
    if (err) {
        console.error("time_spentテーブル作成エラー:", err.message);
    } else {
        console.log("time_spentテーブルが作成されました。");
    }
});
// ルート
app.get("/", (req, res) => {
    res.send("サーバーが正常に起動しています");
});

app.post("/register", async (req, res) => {
    const { email, password, username } = req.body;

    if (!email || !password || !username) {
        return res.status(400).json({ error: "メールアドレス、パスワード、ユーザー名は必須です。" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (email, password, username) VALUES (?, ?, ?)";

        db.run(query, [email, hashedPassword, username], function (err) {
            if (err) {
                console.error("データベースエラー:", err.message); // エラー詳細をログに出力
                return res.status(500).json({ error: "登録中にエラーが発生しました。" });
            }
            res.status(201).json({ message: "登録成功！", userId: this.lastID });
        });
    } catch (error) {
        console.error("登録エラー:", error.message); // サーバーエラーの詳細をログに出力
        res.status(500).json({ error: "サーバーエラーが発生しました。" });
    }
});

// ログインエンドポイント
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "メールアドレスとパスワードは必須です。" });
    }

    const query = "SELECT * FROM users WHERE email = ?";
    db.get(query, [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています。" });
        }

        try {
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: "メールアドレスまたはパスワードが間違っています。" });
            }

            // JWTトークンを生成
            const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);

            // クッキーにトークンを保存
            res.cookie("token", token, { httpOnly: true , sameSite: "lax", secure: false});

            return res.status(200).json({ message: "ログイン成功！", userId: user.id });
        } catch (error) {
            console.error("ログインエラー:", error.message);
            return res.status(500).json({ error: "サーバーエラーが発生しました。" });
        }
    });
});

// 認証ミドルウェア
function authenticateToken(req, res, next) {
    
    const token = req.cookies.token;
    console.log("Cookies:", req.cookies); // クッキーの内容をログに出力

    if (!token) {
        return res.status(401).json({ error: "未認証のユーザーです。" });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ error: "トークンが無効です。" });
        req.user = user;
        next();
    });
}

// 認証状態を確認するエンドポイント
app.get("/profile", authenticateToken,(req, res) => {
    res.json({ message: "認証済みユーザーです。", user: req.user });
});

// 単語取得エンドポイント
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

// 履歴取得エンドポイント
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

// 履歴保存エンドポイント
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

// 間違えた履歴取得エンドポイント
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

app.get("/save-time", (req, res) => {
    const { user_id, time_spent } = req.query; // クエリパラメータを取得

    if (!user_id || !time_spent) {
        return res.status(400).json({ error: "必要なパラメータが不足しています。" });
    }

    const date = new Date().toISOString().split('T')[0]; // 今日の日付を取得

    const query = `
        INSERT INTO time_spent (user_id, date, time_spent)
        VALUES (?, ?, ?)
    `;
    
    db.run(query, [user_id, date, time_spent], function (err) {
        if (err) {
            console.error("Error saving time:", err.message);
            return res.status(500).json({ error: "時間の保存に失敗しました。" });
        }
        res.status(200).json({ message: "時間が保存されました。" });
    });
});

// 総学習時間を取得するエンドポイント
app.get("/total-time", (req, res) => {
    const userId = req.query.userId || 1; // クエリパラメータからuserIdを取得、デフォルトは1

    const query = `
        SELECT SUM(time_spent) AS totalTime
        FROM time_spent
        WHERE user_id = ?
    `;

    db.get(query, [userId], (err, row) => {
        if (err) {
            console.error("Error fetching total time:", err.message);
            return res.status(500).json({ error: "学習時間の取得に失敗しました。" });
        }
        res.json({ totalTime: row.totalTime || 0 }); // 学習時間が0の場合でも0を返す
    });
});



app.get('/api/auth/line/callback', async (req, res) => {
    const { code } = req.query;
    console.log('Request Query:', req.query);

    // 認証リクエスト時に生成
    const state = crypto.randomBytes(16).toString('hex');
    req.session.state = state; // セッションに保存

    // Callback時に検証
    if (state !== req.session.state) {
        console.error('State mismatch:', { received: state, expected: req.session.state });
        return res.status(400).send('不正なリクエストです (CSRF検証失敗)。');
    }

    // デバッグログを追加
    console.log('Received Code:', code);
    console.log('Received State:', state);

    if (!code) {
        return res.status(400).send('認証コードが見つかりません。');
    }

    if (state !== 'random_csrf_protection_string') { // 事前に生成したstateをここで検証
        return res.status(400).send('不正なリクエストです (CSRF検証失敗)。');
    }

    console.log('Authorization Code:', code);
    console.log('State Verified:', state);

    try {
        // LINEアクセストークンを取得
        const tokenResponse = await axios.post(
            'https://api.line.me/oauth2/v2.1/token',
            new URLSearchParams({
                grant_type: 'authorization_code',
                code,
                redirect_uri: 'http://localhost:3001/api/auth/line/callback',
                client_id: '2006672186',
                client_secret: '065bb5646ff9d6eb39adb7baaaa0235b',
            })
        );

        const { access_token } = tokenResponse.data;
        console.log('Access Token:', access_token);

        // LINEユーザープロフィールを取得
        const profileResponse = await axios.get('https://api.line.me/v2/profile', {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { userId, displayName } = profileResponse.data;
        console.log('User Profile:', { userId, displayName });

        // データベースに保存
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
        console.error('LINE認証エラー:', error.response?.data || error.message);
        res.status(500).send('認証に失敗しました。');
    }
});

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
