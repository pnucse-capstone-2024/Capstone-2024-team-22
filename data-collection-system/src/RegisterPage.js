import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phonenumber, setPhonenumber] = useState('');
  const [organization, setOrganization] = useState('org2'); // 기본값은 org2(참여자)
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organization, id, password, name, phonenumber }),
      });

      if (response.ok) {
        alert('회원가입이 완료되었습니다.');
        navigate('/');  // 메인 페이지로 이동
      } else {
        const result = await response.json();
        console.error('Error during registration:', result.error);
        setErrorMessage('회원가입에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.erroer('Error during registration request:', error);
      setErrorMessage('회원가입 중 오류가 발생했습니다: ' + error.message);
    }
  };

  return (
    <div className="page">
      <div className="titleWrap">회원가입</div>
      <form className="contentWrap" onSubmit={handleRegister}>
        <div className="inputWrap">
          <div className="inputTitle">조직 선택</div>
          <select
            className="input"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
          >
            <option value="org1">수집자 (Org1)</option>
            <option value="org2">참여자 (Org2)</option>
          </select>
        </div>
        <div className="inputWrap">
          <div className="inputTitle">ID</div>
          <input
            className="input"
            type="text"
            placeholder="ID"
            value={id}
            onChange={(e) => setId(e.target.value)}
            required
          />
        </div>
        <div className="inputWrap">
          <div className="inputTitle">password</div>
          <input
            className="input"
            type="text"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="inputWrap">
          <div className="inputTitle">이름</div>
          <input
            className="input"
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="inputWrap">
          <div className="inputTitle">전화번호</div>
          <input
            className="input"
            type="text"
            placeholder="전화번호"
            value={phonenumber}
            onChange={(e) => setPhonenumber(e.target.value)}
            required
          />
        </div>
        {errorMessage && (
          <div className="errorMessageWrap">{errorMessage}</div>
        )}
        <button className="bottomButton" type="submit">회원가입</button>
      </form>
    </div>
  );
};

export default RegisterPage;
