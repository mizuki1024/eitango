const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json()); // POSTデータを受け取るため

// データベース接続
const db = new sqlite3.Database("./tango-v3_fixed_all.db");

// レベルに応じた単語を取得するエンドポイント (今日選ばれた単語を除外)
app.get("/words/:level", (req, res) => {
    const level = parseInt(req.params.level, 10);
    const userId = req.query.userId; // クライアントから渡されるユーザーID (仮に利用)

    // 今日選ばれた単語を除外するクエリ
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
            res.status(500).json({ error: err.message });
            return;
        }

        // 不正解オプションを作成
        const allOptions = rows.map((row) => row.jword);
        const formattedRows = rows.map((row) => {
            // 他の単語からランダムに不正解を選択
            const incorrectOptions = allOptions
                .filter((opt) => opt !== row.jword)
                .sort(() => Math.random() - 0.5)
                .slice(0, 2);

            // 正解を含めた選択肢をランダム化
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

// 選択された単語を記録するエンドポイント
app.post("/words/select", (req, res) => {
    const { userId, wordId } = req.body;

    const query = `
        INSERT INTO history (user_id, word_id, date)
        VALUES (?, ?, date('now'))
    `;

    db.run(query, [userId, wordId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.sendStatus(200);
    });
});

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
