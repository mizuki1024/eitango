import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestionPage from './components/QuestionPage';
import AnswerPage from './components/AnswerPage';
import ScorePage from './components/ScorePage';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<QuestionPage />} />
                <Route path="/answer" element={<AnswerPage />} />
                <Route path="/score" element={<ScorePage />} />
            </Routes>
        </Router>
    );
}

export default App;
