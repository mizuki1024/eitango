import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './LearningPage.css';

const LearningPage = () => {
  const { level } = useParams(); // URLからレベルを取得
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);

  useEffect(() => {
    // 仮のデータ取得
    fetch(`http://localhost:3001/words/${level}`)
      .then((response) => response.json())
      .then((data) => setWords(data))
      .catch((error) => console.error('Error fetching data:', error));
  }, [level]);

  const handleAnswer = (isCorrect) => {
    if (isCorrect) setScore((prev) => prev + 1);
    setCurrentIndex((prev) => prev + 1);
  };

  if (words.length === 0) {
    return <div>単語をロード中...</div>;
  }

  if (currentIndex >= words.length) {
    return (
      <div className="result">
        学習完了！<br />
        正解数: {score} / {words.length}
      </div>
    );
  }

  const currentWord = words[currentIndex];

  return (
    <div className="learning-page">
      <h1>レベル {level} - 学習中</h1>
      <p>問題 {currentIndex + 1} / {words.length}</p>
      <div className="question">
        <h2>{currentWord.word}</h2>
        {currentWord.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleAnswer(index === currentWord.correctOption)}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LearningPage;
