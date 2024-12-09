import React from 'react';
import { useLocation, Link } from 'react-router-dom';

function ScorePage() {
    const location = useLocation();
    const { score } = location.state || {};

    return (
        <div className="score-page">
            <h1>クイズ終了！</h1>
            <p>あなたのスコア: {score}/20</p>
            <Link to="/" className="home-button">ホーム画面へ</Link>
        </div>
    );
}

export default ScorePage;
