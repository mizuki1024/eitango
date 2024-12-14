import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './QuestionPage.css';
const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function QuestionPage() {
    const { level } = useParams();
    const location = useLocation();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [usedQuestions, setUsedQuestions] = useState(location.state?.usedQuestions || []);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const navigate = useNavigate();

    // 次の質問をランダムに選択
    const pickRandomQuestion = useCallback(() => {
        const availableQuestions = questions.filter((q) => !usedQuestions.includes(q.id));
        if (availableQuestions.length === 0 || usedQuestions.length >= 20) {
            return null; // 質問がない場合は null を返す
        }
        const randomQuestion =
            availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        setUsedQuestions((prevUsed) => [...prevUsed, randomQuestion.id]); // 使用済み質問を更新
        return randomQuestion;
    }, [questions, usedQuestions]);

    // データを取得
    useEffect(() => {
        fetch(`${REACT_APP_API_BASE_URL}/words/${level}`)
            .then((response) => response.json())
            .then((data) => {
                setQuestions(data);
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, [level]);

    // 進捗状況を更新
    useEffect(() => {
        setProgressPercentage((usedQuestions.length / 20) * 100);
    }, [usedQuestions]);

    // 初回の質問を設定
    useEffect(() => {
        if (questions.length > 0 && !currentQuestion) {
            setCurrentQuestion(pickRandomQuestion());
        }
    }, [questions, currentQuestion, pickRandomQuestion]);

    // 解答を処理
    const handleAnswer = (selectedOption) => {
        const isCorrect =
            currentQuestion.options[currentQuestion.correctOption].word === selectedOption.word;

        // 次の質問を取得
        const nextQuestion = pickRandomQuestion();

        navigate('/answer', {
            state: {
                selectedOption,
                result: isCorrect ? '正解！' : '不正解...',
                word: currentQuestion.word,
                correctOption: currentQuestion.options[currentQuestion.correctOption],
                usedQuestionsLength: usedQuestions.length,
                level,
                nextQuestion, // 次の質問を渡す
                options: currentQuestion.options,
                wordId: currentQuestion.id, // 必要な wordId を追加
                userId: 1, // ユーザーIDを固定または適切に設定
            },
        });
    };

    // ホームに戻る
    const handleBackToHome = () => {
        navigate('/home');
    };

    // 質問がない場合の処理
    if (!currentQuestion) {
        return <div className="loading">問題をロード中...</div>;
    }

    return (
        <div className="question-page">
            <h1>レベル{level} クイズ</h1>
            <div className="progress-bar">
                <div className="progress" style={{ width: `${progressPercentage}%` }}></div>
            </div>
            <h2>{currentQuestion.word}</h2>
            <div className="options">
                {currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        className="option-button"
                        onClick={() => handleAnswer(option)}
                    >
                        {option.meaning}
                    </button>
                ))}
            </div>
            <p>{usedQuestions.length}/20 問完了</p>
            <button className="back-to-home-button" onClick={handleBackToHome}>
                トップページに戻る
            </button>
        </div>
    );
}

export default QuestionPage;
