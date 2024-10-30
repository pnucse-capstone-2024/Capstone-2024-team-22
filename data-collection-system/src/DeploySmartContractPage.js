import React, { useState } from 'react';
import './DeploySmartContractPage.css'; // 스타일링 파일

function DeploySmartContract() {
  const [chaincodeName, setChaincodeName] = useState('');
  const [loading, setLoading] = useState(false); // 로딩 상태 추가

  const handleDeploy = async (chaincodePath, chaincodeLabel) => {
    setLoading(true); // 로딩 상태 시작
    try {
      const response = await fetch('/api/deploy-smart-contract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chaincodeName,
          chaincodePath,
          chaincodeLabel,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Smart contract deployed successfully: ' + result.message);
      } else {
        alert('Failed to deploy smart contract: ' + result.error);
      }
    } catch (error) {
      alert('Error deploying smart contract: ' + error.message);
    } finally {
      setLoading(false); // 로딩 상태 종료
    }
  };

  return (
    <div className="form-container">
      <h3>데이터 수집 시작하기</h3>
      <label>수집 항목 이름 설정</label>
      <input
        type="text"
        value={chaincodeName}
        onChange={(e) => setChaincodeName(e.target.value)}
        required
      />
      <button
        onClick={() => handleDeploy('./chaincodes/airQuality.go', 'airQuality')}
        disabled={loading}
      >
        {loading ? '대기질 데이터 수집' : '대기질 데이터 수집'}
      </button>
      <button
        onClick={() => handleDeploy('./chaincodes/waterQuality.go', 'waterQuality')}
        disabled={loading}
      >
        {loading ? '수질 데이터 수집' : '수질 데이터 수집'}
      </button>
      <button
        onClick={() => handleDeploy('./chaincodes/weatherData.go', 'weatherData')}
        disabled={loading}
      >
        {loading ? '날씨 데이터 수집' : '날씨 데이터 수집'}
      </button>
      {loading && <div className="loader"></div>} {/* 로딩 스피너 추가 */}
    </div>
  );
}

export default DeploySmartContract;