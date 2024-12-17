import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import './ScorePage.css';

function ScorePage() {
    const location = useLocation();
    const { score, correctAnswers = 0 } = location.state || { score: 0, correctAnswers: 0 };

    return (
        <div className="score-page">
            <div className="score-container">
                <h1>スコア結果</h1>
                <div className="score-circle">
                    <p>{score}/20</p>
                </div>
                <p className="correct-answers">
                    <strong>正解数:</strong> {correctAnswers}/20
                </p>
                <p className="score-comment">
                    {score === 20
                        ? '素晴らしい！全問正解です！'
                        : score >= 15
                        ? 'とても良い結果です！'
                        : score >= 10
                        ? 'よくできました！次回はさらに高得点を目指しましょう！'
                        : 'もう少し頑張りましょう！'}
                </p>
                <div className="button-container">
                    <Link to="/" className="home-button">ホーム画面に戻る</Link>
                    <Link to={`/level/${location.state?.level || 1}`} className="retry-button">再挑戦する</Link>
                </div>
            </div>
        </div>
    );
}

export default ScorePage;
