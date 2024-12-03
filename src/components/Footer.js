import React from "react";
import { useNavigate } from "react-router-dom";
import "./Footer.css";

const Footer = ({ currentIndex, total }) => {
    const navigate = useNavigate(); // React Router のナビゲート関数

    return (
        <footer className="footer">
            <p>
                問題 {currentIndex + 1}/{total}
            </p>
            {/* トップページへ遷移 */}
            <button onClick={() => navigate("/")}>トップページ</button>
            {/* ログアウト */}
            <button onClick={() => alert("ログアウトします")}>ログアウト</button>
        </footer>
    );
};

export default Footer;
