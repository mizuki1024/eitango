const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const bcrypt = require("bcrypt");
const session = require("express-session");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || "./tango-v3_fixed_all.db";

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", methods: ["GET", "POST"] }));
app.use(express.json());
app.use(compression());
app.use(morgan("combined"));
app.use(
    session({
        secret: "your-secret-key", // セッションを保護する秘密鍵
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false, maxAge: 60000 }, // HTTPS環境ではsecure: trueに変更
    })
);

// Database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("Connected to SQLite database.");
    }
});

// Create tables if they don't exist
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            lineUserId TEXT UNIQUE NOT NULL,
            displayName TEXT NOT NULL,
            email TEXT UNIQUE,
            password TEXT,
            createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error("Error creating users table:", err.message);
        } else {
            console.log("Users table initialized.");
        }
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            word_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            state INTEGER NOT NULL,
            date DATE NOT NULL
        )
    `, (err) => {
        if (err) {
            console.error("Error creating history table:", err.message);
        } else {
            console.log("History table initialized.");
        }
    });
});

// **LINEログインリクエスト**
app.get("/api/auth/line/login", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex"); // ランダムなstateを生成
    req.session.state = state; // セッションに保存

    const redirectUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(
        process.env.LINE_CALLBACK_URL
    )}&state=${state}&scope=profile%20openid`;

    console.log("Redirecting to LINE login with state:", state);
    res.redirect(redirectUrl);
});

// **LINEログインCallback**
app.get("/api/auth/line/callback", async (req, res) => {
    const { code, state } = req.query;

    console.log("Received Code:", code);
    console.log("Received State:", state);

    if (!code) {
        return res.status(400).send("認証コードが見つかりません。");
    }

    if (!state || state !== req.session.state) {
        console.error("State mismatch:", { received: state, expected: req.session.state });
        return res.status(400).send("不正なリクエストです (CSRF検証失敗)。");
    }

    console.log("State verified:", state);

    try {
        // アクセストークン取得
        const tokenResponse = await axios.post(
            "https://api.line.me/oauth2/v2.1/token",
            new URLSearchParams({
                grant_type: "authorization_code",
                code,
                redirect_uri: process.env.LINE_CALLBACK_URL,
                client_id: process.env.LINE_CHANNEL_ID,
                client_secret: process.env.LINE_CHANNEL_SECRET,
            })
        );

        const { access_token } = tokenResponse.data;
        console.log("Access Token:", access_token);

        // ユーザープロフィール取得
        const profileResponse = await axios.get("https://api.line.me/v2/profile", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { userId, displayName } = profileResponse.data;
        console.log("User Profile:", { userId, displayName });

        // データベースに保存
        db.run(
            `
            INSERT INTO users (lineUserId, displayName)
            VALUES (?, ?)
            ON CONFLICT(lineUserId) DO UPDATE SET displayName = excluded.displayName
            `,
            [userId, displayName],
            (err) => {
                if (err) {
                    console.error("データベース保存エラー:", err.message);
                    return res.status(500).send("データベース保存中にエラーが発生しました。");
                }
                console.log("ユーザー情報が保存されました:", { userId, displayName });
                res.redirect(`/home?userId=${userId}`);
            }
        );
    } catch (error) {
        console.error("LINE認証エラー:", error.response?.data || error.message);
        res.status(500).send("認証に失敗しました。");
    }
});

// **ユーザー登録エンドポイント**
app.post("/register", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "メールアドレスとパスワードは必須です。" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            `
            INSERT INTO users (email, password)
            VALUES (?, ?)
            `,
            [email, hashedPassword],
            (err) => {
                if (err) {
                    if (err.code === "SQLITE_CONSTRAINT") {
                        return res.status(400).json({ error: "このメールアドレスは既に登録されています。" });
                    }
                    return res.status(500).json({ error: "登録中にエラーが発生しました。" });
                }
                res.status(201).json({ message: "登録成功！" });
            }
        );
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

    db.get(
        `
        SELECT * FROM users WHERE email = ?
        `,
        [email],
        async (err, user) => {
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
        }
    );
});

// React静的ファイルの提供
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
