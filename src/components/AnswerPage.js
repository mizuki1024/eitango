import React from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';

function AnswerPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const {
        selectedOption = null,
        result = null,
        currentQuestion = null,
        options = [],
        questions = [],
        usedQuestionsLength = 0,
    } = location.state || {};

    // データが存在しない場合はホームにリダイレクト
    if (!currentQuestion || !questions || questions.length === 0) {
        navigate('/');
        return null;
    }

    const otherChoices = options
        .filter((option) => option !== currentQuestion.jword)
        .map((jword) => {
            const correspondingWord = questions.find((q) => q.jword === jword);
            return { jword, word: correspondingWord ? correspondingWord.word : '不明' };
        });

    return (
        <div className="answer-page">
            <h1>解答</h1>
            <h2>問題: {currentQuestion.word}</h2>
            <p>あなたが選んだ選択肢: {selectedOption}</p>
            <p>結果: {result}</p>
            <h3>その他の選択肢:</h3>
            <ul>
                {otherChoices.map((choice, index) => (
                    <li key={index}>
                        {choice.jword}：{choice.word}
                    </li>
                ))}
            </ul>
            <p>進捗: {usedQuestionsLength}/20</p>
            <Link to="/" className="next-button">
                次の問題へ
            </Link>
        </div>
    );
}

export default AnswerPage;
