const express = require("express");
const session = require("express-session");
const RedisStore = require("connect-redis").default; // RedisStore を定義
const redis = require("redis");
const crypto = require("crypto");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

// Redis クライアントの作成
const redisClient = redis.createClient();

redisClient.on("error", (err) => console.error("Redis Client Error", err));

// 非同期で Redis に接続
(async () => {
    await redisClient.connect();
    console.log("Connected to Redis");
})();

// セッション設定
app.use(
    session({
        store: new RedisStore({ client: redisClient }), // Redisストアを設定
        secret: "your-secret-key", // セッションを保護する秘密鍵
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, maxAge: 60000 }, // HTTPS環境では secure: true
    })
);

// **LINEログインリクエスト**
app.get("/api/auth/line/login", (req, res) => {
    const state = crypto.randomBytes(16).toString("hex");
    req.session.state = state;

    console.log("Generated state:", state);

    const redirectUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${process.env.LINE_CHANNEL_ID}&redirect_uri=${encodeURIComponent(
        process.env.LINE_CALLBACK_URL
    )}&state=${state}&scope=profile%20openid`;

    console.log("Redirecting to LINE login:", redirectUrl);
    res.redirect(redirectUrl);
});

// **LINEログインCallback**
app.get("/api/auth/line/callback", async (req, res) => {
    const { code, state } = req.query;

    console.log("Received state from LINE:", state);
    console.log("Session state:", req.session.state);

    if (!state || state !== req.session.state) {
        console.error("State mismatch:", { received: state, expected: req.session.state });
        return res.status(400).send("不正なリクエストです (CSRF検証失敗)。");
    }

    try {
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

        const profileResponse = await axios.get("https://api.line.me/v2/profile", {
            headers: { Authorization: `Bearer ${access_token}` },
        });

        const { userId, displayName } = profileResponse.data;
        console.log("User Profile:", { userId, displayName });

        res.status(200).send("認証成功！");
    } catch (error) {
        console.error("LINE認証エラー:", error.response?.data || error.message);
        res.status(500).send("認証に失敗しました。");
    }
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
