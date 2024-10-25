import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, password }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('Login successful');
        navigate('/'); // 로그인 성공 시 메인 페이지로 리디렉션
      } else {
        setErrorMessage('Failed to login: ' + result.error);
      }
    } catch (error) {
      setErrorMessage('An error occurred: ' + error.message);
    }
  };

  return (
    <div className="page">
      <div className="titleWrap">Login</div>
      <form className="contentWrap" id="loginForm" onSubmit={handleSubmit}>
        <div className="inputWrap">
          <div className="inputTitle">ID</div>
          <input
            className="input"
            type="text"
            id="id"
            name="id"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div className="inputWrap">
          <div className="inputTitle">Password</div>
          <input
            className="input"
            type="password"
            id="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && (
          <div className="errorMessageWrap">{errorMessage}</div>
        )}
        <button className="bottomButton" type="submit">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
