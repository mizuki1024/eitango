import React, { useState, useEffect } from "react";
import "./IncorrectWords.css"; // 上記CSSを保存したファイルをインポート
const REACT_APP_BASE_URL = process.env.REACT_APP_BASE_URL;

const IncorrectWords = ({ userId }) => {
    const [incorrectWords, setIncorrectWords] = useState([]);
    const [selectedDate, setSelectedDate] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchIncorrectWords = async () => {
        if (!selectedDate) return;
        setLoading(true);

        try {
            const response = await fetch(
                `${REACT_APP_BASE_URL}/history/incorrect?userId=${userId}&date=${selectedDate}`
            );
            if (!response.ok) {
                throw new Error(`HTTPエラー: ${response.status}`);
            }

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new TypeError("受信したレスポンスが JSON 形式ではありません");
            }

            const data = await response.json();

            // 重複削除
            const filteredWords = data.filter((word) => {
                const wordDate = new Date(word.date).toISOString().split("T")[0];
                return wordDate === selectedDate;
            });

            const uniqueWords = Array.from(
                new Map(filteredWords.map((word) => [word.wordId, word])).values()
            );

            setIncorrectWords(uniqueWords);
        } catch (error) {
            console.error("Error fetching incorrect words:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedDate) {
            fetchIncorrectWords();
        }
    }, [selectedDate]);

    return (
        <div className="incorrect-words-container">
            <h2>間違えた単語</h2>
            <label>
                フィルタ日付:
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                />
            </label>
            {loading ? (
                <p className="loading">読み込み中...</p>
            ) : incorrectWords.length > 0 ? (
                <ul className="incorrect-words-list">
                    {incorrectWords.map((word) => (
                        <li key={word.wordId}>
                            {word.word} ({word.jword}){" "}
                            <span className="date">
                                -{" "}
                                {new Date(word.date).toLocaleDateString("ja-JP", {
                                    year: "numeric",
                                    month: "2-digit",
                                    day: "2-digit",
                                })}
                            </span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="no-words">間違えた単語はありません。</p>
            )}
        </div>
    );
};

export default IncorrectWords;
