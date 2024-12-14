import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
const REACT_APP_API_BASE_URL = process.env.REACT_APP_API_BASE_URL;
function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 通常ログイン処理
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${REACT_APP_API_BASE_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'ログインに失敗しました。');
            }

            const data = await response.json();
            console.log('ログイン成功:', data);

            // トークンをローカルストレージに保存
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // ホーム画面に遷移
            navigate('/home');
        } catch (error) {
            console.error('ログインエラー:', error.message);
            setError('ログインに失敗しました。メールアドレスまたはパスワードを確認してください。');
        } finally {
            setLoading(false);
        }
    };

    // LINEログイン処理
    const handleLineLogin = () => {
        const clientId = '2006672186';
        const redirectUri = ' https://eitango.com/api/auth/line/callback'; // サーバーのLINEコールバックURL
        const state = 'random_csrf_protection_string'; // CSRF保護用のランダム文字列
        const lineLoginUrl = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=2006672186&redirect_uri=https://eitango-8eda.onrender.com/api/auth/line/callback&state=random_csrf_protection_string&scope=profile%20openid`;
        console.log('Generated LINE Login URL:', lineLoginUrl);

        // LINEログインページにリダイレクト
        window.location.href = lineLoginUrl;
    };

    return (
        <div className="login-page">
            <h1>ログイン</h1>
            <form onSubmit={handleLogin}>
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
                {error && <p className="error">{error}</p>}
                <button type="submit" disabled={loading}>
                    {loading ? 'ログイン中...' : 'ログイン'}
                </button>
            </form>

            {/* LINEログインボタン */}
            <div className="line-login">
                <p>または</p>
                <button className="line-login-button" onClick={handleLineLogin}>
                    LINEでログイン
                </button>
            </div>

            <p>
                アカウントが必要ですか？{' '}
                <button className="link-button" onClick={() => navigate('/register')}>
                    登録
                </button>
            </p>
        </div>
    );
}

export default LoginPage;
