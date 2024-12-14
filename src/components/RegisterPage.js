import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';
const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
function RegisterPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('パスワードが一致しません。');
            return;
        }

        try {
            const response = await fetch(`${REACT_APP_API_BASE_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || '登録に失敗しました。');
            }

            console.log('登録成功');
            navigate('/');
        } catch (error) {
            console.error('登録エラー:', error.message);
            setError('登録に失敗しました。');
        }
    };

    return (
        <div className="register-page">
            <h1>登録</h1>
            <form onSubmit={handleRegister}>
                <label>メールアドレス</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <label>パスワード</label>
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <label>パスワード確認</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                {error && <p className="error">{error}</p>}
                <button type="submit">登録</button>
            </form>
            <p>
                既にアカウントをお持ちですか？{' '}
                <button className="link-button" onClick={() => navigate('/')}>ログイン</button>
            </p>
        </div>
    );
}

export default RegisterPage;
