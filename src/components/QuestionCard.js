import React from "react";
import "./QuestionCard.css";

const QuestionCard = ({ word, options, correctOption, onAnswer }) => {
    return (
        <div className="question-card">
            <h2>{word}</h2>
            <ul>
                {options.map((option, index) => (
                    <li key={index}>
                        <button
                            onClick={() => onAnswer(index === correctOption)}
                        >
                            {option}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default QuestionCard;
