import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import './QuestionPage.css';

function QuestionPage() {
    const { level } = useParams();
    const location = useLocation();
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [usedQuestions, setUsedQuestions] = useState(location.state?.usedQuestions || []);
    const [progressPercentage, setProgressPercentage] = useState(0);
    const navigate = useNavigate();

    const pickRandomQuestion = useCallback(() => {
        const availableQuestions = questions.filter((q) => !usedQuestions.includes(q.id));
        if (availableQuestions.length === 0 || usedQuestions.length >= 20) {
            navigate('/score', { state: { score: usedQuestions.length } });
            return null;
        }
        const randomQuestion =
            availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
        setUsedQuestions((prevUsed) => [...prevUsed, randomQuestion.id]);
        return randomQuestion;
    }, [questions, usedQuestions, navigate]);

    useEffect(() => {
        fetch(`http://localhost:3001/words/${level}`)
            .then((response) => response.json())
            .then((data) => setQuestions(data))
            .catch((error) => console.error('Error fetching data:', error));
    }, [level]);

    useEffect(() => {
        setProgressPercentage((usedQuestions.length / 20) * 100);
    }, [usedQuestions]);

    useEffect(() => {
        if (questions.length > 0 && !currentQuestion) {
            setCurrentQuestion(pickRandomQuestion());
        }
    }, [questions, currentQuestion, pickRandomQuestion]);

    const handleAnswer = (selectedOption) => {
        const isCorrect = currentQuestion.options[currentQuestion.correctOption] === selectedOption;
        const nextQuestion = pickRandomQuestion(); // 次の質問を事前に取得

        navigate('/answer', {
            state: {
                selectedOption,
                result: isCorrect ? '正解！' : '不正解...',
                word: currentQuestion.word,
                correctOption: currentQuestion.options[currentQuestion.correctOption],
                usedQuestionsLength: usedQuestions.length,
                level,
                nextQuestion, // 次の質問を渡す
            },
        });
    };

    const handleBackToHome = () => {
        navigate('/'); // トップページに遷移
    };

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
                    <button key={index} className="option-button" onClick={() => handleAnswer(option)}>
                        {option}
                    </button>
                ))}
            </div>
            <p>{usedQuestions.length}/20 問完了</p>
            {/* トップページに戻るボタンを追加 */}
            <button className="back-to-home-button" onClick={handleBackToHome}>
                トップページに戻る
            </button>
        </div>
    );
}

export default QuestionPage;
