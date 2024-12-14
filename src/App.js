import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import QuestionPage from './components/QuestionPage';
import AnswerPage from './components/AnswerPage';
import ScorePage from './components/ScorePage';
import LoginPage from './components/LoginPage'; // ログインページの追加
import RegisterPage from './components/RegisterPage'; // 登録ページの追加
import IncorrectWords from "./components/IncorrectWords";
import './App.css';

const HomePage = () => {
  return (
    <div className="app">
      <main className="content">
        {/* ヘッダーセクション */}
        <div className="header">
          <h1>単語master</h1>
          <p className="star-text">
            <Star className="star-icon" />
            めざせ習得8,000単語！
            <Star className="star-icon" />
          </p>
          <div>
            <p>こんにちは。</p>
            <p>学習レベルを選択してください。</p>
          </div>
        </div>

        {/* レベルカード */}
        <div className="level-cards">
          {[
            { level: 1, title: "レベル1 (初級)", desc: "基本的な単語", progress: 30, color: "orange" },
            { level: 2, title: "レベル2 (中級)", desc: "大学受験の単語", progress: 0, color: "blue" },
            { level: 3, title: "レベル3 (上級)", desc: "TOEFLやTOEIC", progress: 0, color: "purple" },
            { level: 4, title: "レベル4 (至難)", desc: "辞書なしで新聞を", progress: 0, color: "red" },
          ].map((level) => (
            <div key={level.level} className={`level-card ${level.color}`}>
              <h2>{level.title}</h2>
              <p>{level.desc}</p>
              <div className="progress-bar">
                <div className="progress" style={{ width: `${level.progress}%` }}></div>
              </div>
              <p className="progress-text">{level.progress}[%]</p>
              <Link to={`/level/${level.level}`} className="start-button">
                このレベルを始める
              </Link>
            </div>
          ))}
        </div>

        {/* フッターノート */}
        <p className="footer-note">※各レベル2,000単語ずつです。</p>

        {/* フッターリンク */}
        <div className="footer-links">
          <Link to="/about" className="footer-button">内容紹介</Link>
          <Link to="/links" className="footer-button">リンク</Link>
          <Link to="/incorrect-words" className="footer-button">間違えた単語</Link> {/* 新規追加 */}
          <Link to="/logout" className="footer-button">ログアウト</Link>
        </div>

        {/* 最終学習日 */}
        <div className="last-study-date">
          [最終学習日：2024/11/08]
        </div>

        {/* コース情報 */}
        <div className="course-info">
          機械工学コース・エネルギー環境工学コース 2010-2023
        </div>
      </main>
    </div>
  );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LoginPage />} /> {/* トップページをログインページに設定 */}
                <Route path="/login" element={<LoginPage />} /> {/* トップページをログインページに設定 */}
                <Route path="/register" element={<RegisterPage />} /> {/* 登録ページ */}
                <Route path="/home" element={<HomePage />} /> {/* ホームページ */}
                <Route path="/level/:level" element={<QuestionPage />} />
                <Route path="/answer" element={<AnswerPage />} />
                <Route path="/score" element={<ScorePage />} />
                <Route path="/incorrect-words" element={<IncorrectWords userId={1} />} />
                <Route path="*" element={<div>404: ページが見つかりません。</div>} />
            </Routes>
        </Router>
    );
};

export default App;
