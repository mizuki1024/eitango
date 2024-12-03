import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import QuestionCard from "./QuestionCard";
import Footer from "./Footer";
import "./QuestionPage.css";

const QuestionPage = () => {
    const { level } = useParams(); // URLからlevelを取得
    const [words, setWords] = useState([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        fetch(`http://localhost:3001/words/${level}`)
            .then((response) => response.json())
            .then((data) => {
                setWords(data);
                setProgress(0);
                setCorrectCount(0);
            })
            .catch((error) => console.error("Error fetching words:", error));
    }, [level]);

    const handleAnswer = (isCorrect) => {
        if (isCorrect) {
            setCorrectCount((prev) => prev + 1);
        }
        if (currentWordIndex + 1 < words.length) {
            setCurrentWordIndex((prev) => prev + 1);
            setProgress(((currentWordIndex + 1) / words.length) * 100);
        } else {
            alert(`学習完了！正解数: ${correctCount}/${words.length}`);
        }
    };

    if (words.length === 0) {
        return <div className="loading">単語をロード中...</div>;
    }

    const currentWord = words[currentWordIndex];

    return (
        <div className="question-page">
            <h1>レベル{level} 学習中</h1>
            <ProgressBar progress={progress} />
            <QuestionCard
                word={currentWord.word}
                options={currentWord.options}
                correctOption={currentWord.correctOption}
                onAnswer={handleAnswer}
            />
            <Footer currentIndex={currentWordIndex} total={words.length} />
        </div>
    );
};

export default QuestionPage;
