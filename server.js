const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 3001;

app.use(cors());

// データベース接続
const db = new sqlite3.Database("C:\\Users\\mizuk\\eitango-v2\\tango-v3_fixed.db");

// レベルに応じた単語を取得するエンドポイント
app.get("/words/:level", (req, res) => {
    const level = parseInt(req.params.level, 10);
    const query = "SELECT id, word, jword FROM word WHERE level = ? LIMIT 100";
    db.all(query, [level], (err, rows) => {
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

// サーバー起動
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
