import React, { useState } from 'react';
import './ViewFeedbackPage.css'; // 스타일링 파일

function ViewFeedbackPage() {
  const [chaincodeName, setChaincodeName] = useState('');
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchFeedback = async () => {
    if (!chaincodeName) {
      setError('피드백을 조회하고자 하는 데이터 수집 종류를 선택해 주세요.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/view-feedback/${chaincodeName}`);
      if (!response.ok) {
        throw new Error(`Error fetching feedback: ${response.statusText}`);
      }
      const data = await response.json();
      setFeedbacks(data.feedbacks);
    } catch (error) {
      console.error('Error fetching feedback:', error);
      setError('피드백 조회에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="feedback-page-container">
      <h2>피드백 조회하기</h2>
      <select
        className="input"
        value={chaincodeName}
        onChange={(e) => setChaincodeName(e.target.value)}
      >
        <option value="">-- 피드백 조회할 데이터 선택 --</option>
        <option value="airQuality">대기질 데이터</option>
        <option value="waterQuality">수질 데이터</option>
        <option value="weatherData">날씨 데이터</option>
      </select>
      <button onClick={handleFetchFeedback} disabled={loading} className="fetch-button">
        {loading ? 'Fetching Feedback...' : '선택 피드백 조회'}
      </button>
      {error && <p className="error-message">{error}</p>}
      {feedbacks.length > 0 ? (
        <ul>
          {feedbacks.map((feedback, index) => (
            <li key={index}>
              <div>
                <strong>Feedback:</strong> {feedback.feedback}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        !loading && <p>제출된 피드백이 없습니다.</p>
      )}
    </div>
  );
}

export default ViewFeedbackPage;