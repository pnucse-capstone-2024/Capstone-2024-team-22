import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';  // 새롭게 수정된 CSS 파일

const MainPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const response = await fetch('/api/me');
        const data = await response.json();
        if (data.loggedIn) {
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching login status:', error);
      }
    }
    checkLoginStatus();
  }, []);

  const logout = async () => {
    try {
      await fetch('/api/logout', { method: 'POST' });
      window.location.reload();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="main-container">
      <div className="right-section">
        <h1>Data Collection System</h1>
        {user ? (
          <div className="user-info">
            <div>Logged in as {user.id}, {user.organization}</div>
            <button className="button logout-btn" onClick={logout}>로그아웃</button>
          </div>
        ) : (
          <div className="auth-buttons">
            <button className="button login-btn" onClick={() => navigate('/login')}>로그인</button>
            <button className="button register-btn" onClick={() => navigate('/register')}>회원가입</button>
          </div>
        )}
        {user && user.isAdmin && (
          <div className="admin-buttons">
            <button className="button" onClick={() => navigate('/create-template')}>스마트 컨트랙트 템플릿 생성</button>
            <button className="button" onClick={() => navigate('/template-list')}>스마트 컨트랙트 업데이트</button>
            <button className="button" onClick={() => navigate('/view-feedback')}>사용자 피드백 조회</button>
          </div>
        )}
        {user && !user.isAdmin && user.organization === "org1" && (
          <div className="user-buttons">
            <button className="button" onClick={() => navigate('/deploy-smart-contract')}>데이터 수집하기</button>
            <button className="button" onClick={() => navigate('/mychaincode')}>나의 데이터 수집</button>
            <button className="button" onClick={() => navigate('/feedback')}>피드백</button>
          </div>
        )}
        {user && !user.isAdmin && user.organization === "org2" && (
          <div className="user-buttons">
            <button className="button" onClick={() => navigate('/deployed-chaincodes')}>데이터 수집에 참여하기</button>
            <button className="button" onClick={() => navigate('/feedback')}>피드백</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
