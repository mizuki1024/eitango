import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './QuestionPage.css';

function QuestionPage() {
    const [questions, setQuestions] = useState([]); // 全質問データ
    const [currentQuestion, setCurrentQuestion] = useState(null); // 現在の質問
    const [usedQuestions, setUsedQuestions] = useState([]); // 使用済み質問IDリスト
    const navigate = useNavigate();

    // 新しい質問を選択する関数（useCallbackでラップ）
    const pickRandomQuestion = useCallback((questionsList, usedIds) => {
        const availableQuestions = questionsList.filter((q) => !usedIds.includes(q.id));
        if (availableQuestions.length === 0 || usedIds.length >= 20) {
            navigate('/score', { state: { score: usedIds.length } }); // 全20問終了
            return;
        }
        const randomQuestion =
            availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        setCurrentQuestion(randomQuestion);
        setUsedQuestions((prevUsed) => [...prevUsed, randomQuestion.id]); // 状態を確実に更新
    }, [navigate]);

    // クイズデータを取得
    useEffect(() => {
        fetch('http://localhost:3001/api/words')
            .then((response) => response.json())
            .then((data) => {
                setQuestions(data);
                pickRandomQuestion(data, []); // 初回の質問を選択
            })
            .catch((error) => console.error('Error fetching data:', error));
    }, [pickRandomQuestion]); // 初回データ取得時にpickRandomQuestionを呼び出す

    // 現在の質問がない場合、または質問データが空の場合の表示
    if (!currentQuestion || questions.length === 0) return <p>Loading...</p>;

    // 選択肢を生成
    const randomChoices = questions
        .filter((q) => q.id !== currentQuestion.id)
        .map((q) => q.jword);
    const options = [
        currentQuestion.jword,
        ...randomChoices.sort(() => Math.random() - 0.5).slice(0, 3),
    ].sort(() => Math.random() - 0.5);

    // 解答を処理
    const handleAnswer = (selectedOption) => {
        const isCorrect = selectedOption === currentQuestion.jword;
        setTimeout(() => {
            navigate('/answer', {
                state: {
                    selectedOption,
                    result: isCorrect ? '正解！' : '不正解...',
                    currentQuestion,
                    options,
                    questions,
                    usedQuestionsLength: usedQuestions.length, // 進捗状況を渡す
                },
            });
            // 解答後に次の質問を選択
            pickRandomQuestion(questions, usedQuestions);
        }, 1000);
    };

    // 進捗率を計算
    const progressPercentage = (usedQuestions.length / 20) * 100;

    return (
        <div className="question-page">
            <h1>英単語クイズ</h1>
            {/* 進捗バー */}
            <div className="progress-bar">
                <div
                    className="progress"
                    style={{ width: `${progressPercentage}%` }}
                ></div>
            </div>
            {/* 進捗状況 */}
            <p>{usedQuestions.length}/20</p>
            <h2>{currentQuestion.word}</h2>
            <div className="options">
                {options.map((option, index) => (
                    <button
                        key={index}
                        className="option-button"
                        onClick={() => handleAnswer(option)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
}

export default QuestionPage;
