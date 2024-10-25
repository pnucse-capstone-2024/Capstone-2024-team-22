import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [message, setMessage] = useState('');
  const [chaincodeName, setChaincodename] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chaincodeName, feedback }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('피드백 제출이 완료되었습니다.');
        setMessage('Feedback submitted successfully');
        navigate('/');  // 메인 페이지로 이동
      } else {
        setMessage('Failed to submit feedback: ' + result.error);
      }
    } catch (error) {
      setMessage('Failed to submit feedback: ' + error.message);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.container}>
        <h2>피드백 제출하기</h2>
        <form onSubmit={handleSubmit}>
          <select
            value={chaincodeName}
            onChange={(e) => setChaincodename(e.target.value)}
            style={styles.select}
          >
            <option value="">-- 피드백할 데이터 수집 종류 선택 --</option>
            <option value="airQuality">대기질 데이터</option>
            <option value="waterQuality">수질 데이터</option>
            <option value="weatherData">날씨 데이터</option>
          </select>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Enter your feedback"
            required
            style={styles.textarea}
          />
          <button type="submit" style={styles.button}>제출</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  )};
  
  const styles = {
    body: {
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f4f6f9',
    },
    container: {
      height: '90vh',
      width: '185vh',
      textAlign: 'center',
      backgroundColor: '#fff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    },
    select: {
      float: 'left',

      height: '20%',
      padding: '1px',
      fontSize: '14px',
      borderRadius: '4px',
      border: '1px solid #ccc',
      backgroundColor: '#f9f9f9',
      color: '#333',
      outline: 'none',
      cursor: 'pointer',
      marginBottom: '15px',
      marginLeft: '10px'
    },
    textarea: {
      display: 'block',
      width: '98%',
      height: '50vh',
      padding: '10px',
      margin: '0px',
      fontSize: '16px',
    },
    button: {
      padding: '10px 20px',
      fontSize: '16px',
      cursor: 'pointer',
      border: 'none',
      borderRadius: '4px',
      backgroundColor: '#007bff',
      color: 'white',
      margin: '10px 10px',
    },
  };
  
  export default Feedback;
  