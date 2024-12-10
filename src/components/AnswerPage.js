import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./AnswerPage.css";

function AnswerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        selectedOption,
        result,
        word,
        correctOption,
        usedQuestionsLength,
        level,
        nextQuestion,
    } = location.state || {};

    const handleNextQuestion = () => {
        if (nextQuestion) {
            navigate(`/level/${level}`, {
                state: {
                    usedQuestions: [...Array(usedQuestionsLength).fill(null)], // 使用済み問題を保持
                    nextQuestion, // 次の質問を渡す
                },
            });
        } else {
            navigate("/score"); // 質問がない場合はスコアページへ
        }
    };

    if (!word) {
        return <div>エラー: 問題データが見つかりません。</div>;
    }

    return (
        <div className="answer-page">
            <h1>解答結果</h1>
            <h2>問題: {word}</h2>
            <p>選択肢: {selectedOption}</p>
            <p>正解: {correctOption}</p>
            <p>結果: {result}</p>
            <h3>進捗: {usedQuestionsLength}/20</h3>
            <button onClick={handleNextQuestion} className="next-button">
                次の問題へ
            </button>
        </div>
    );
}

export default AnswerPage;
