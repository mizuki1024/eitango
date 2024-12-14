import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './AnswerPage.css';
const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

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
        userId, // ユーザーIDを受け取る
        wordId, // 単語のIDを受け取る
        options = [], // 選択肢を受け取る
    } = location.state || {};

    const saveResultToHistory = async () => {
        if (!userId || !wordId || !result) {
            console.error("保存データが不足しています。", { userId, wordId, result });
            return;
        }
    
        try {
            const state = result === '正解！' ? 1 : 2; // 正解なら1、間違いなら2
            const bodyData = {
                wordId: wordId,
                word: word,
                jword: correctOption.meaning,                                
                date: new Date().toISOString().split("T")[0], // YYYY-MM-DD フォーマット
                state: state,                
            };
            
            
            const response = await fetch(`${REACT_APP_API_BASE_URL}/history`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(bodyData),
            });
    
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`履歴保存に失敗しました: ${response.status} ${errorText}`);
            } else {
                console.log("履歴保存成功:", bodyData);
            }
        } catch (error) {
            console.error("履歴保存中のエラー:", error);
        }
    };
    

    useEffect(() => {
        console.log("履歴保存データ:", { userId, wordId, result });
        if (userId && wordId && result) {
            saveResultToHistory();
        }
    }, [userId, wordId, result]);

    const handleNextQuestion = () => {
        if (nextQuestion) {
            navigate(`/level/${level}`, {
                state: {
                    usedQuestions: [...Array(usedQuestionsLength).fill(null)], // 使用済み問題を保持
                },
            });
        } else {
            navigate('/score'); // 質問がない場合はスコアページへ
        }
    };
    

    if (!word || options.length === 0) {
        return <div>エラー: 必要なデータが不足しています。</div>;
    }

    return (
        <div className="answer-page">
            <h1>解答結果</h1>
            <h2>問題: {word}</h2>
            <div className="options">
                {options.map((option, index) => (
                    <div key={index} className="option">
                        <p>
                            <strong>{option.word}</strong>: {option.meaning}
                        </p>
                    </div>
                ))}
            </div>
            <p>選択肢: {selectedOption.word}</p>
            <p>正解: {correctOption.word}</p>
            <p>結果: {result}</p>
            <h3>進捗: {usedQuestionsLength}/20</h3>
            <button onClick={handleNextQuestion} className="next-button">
                次の問題へ
            </button>
        </div>
    );
}

export default AnswerPage;
