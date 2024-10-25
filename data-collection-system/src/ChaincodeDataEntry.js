import React, { useEffect, useState } from 'react';
import './ChaincodeDataEntry.css';

function ChaincodeDataEntry({ chaincodeName }) {
  const [metadata, setMetadata] = useState({}); // 메타데이터 상태
  const [formData, setFormData] = useState({}); // 폼 데이터 상태
  const [loading, setLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(''); // 에러 상태
  const [status, setStatus] = useState(''); // 제출 상태

  // chaincodeName이 변경될 때마다 메타데이터를 fetch하는 useEffect 훅
  useEffect(() => {
    async function fetchMetadata() {
      try {
        const response = await fetch(`/api/chaincode-metadata/${chaincodeName}`);
        if (!response.ok) {
          throw new Error(`Error fetching metadata: ${response.statusText}`);
        }
        const data = await response.json();
        setMetadata(data); // 메타데이터 상태 설정
        setFormData(
          // 메타데이터에서 폼 데이터를 빈 값으로 초기화
          Object.entries(data).reduce((acc, [key]) => {
            acc[key] = ''; // 초기값을 빈 문자열로 설정
            return acc;
          }, {})
        );
      } catch (error) {
        console.error('Error fetching chaincode metadata:', error);
        setError('Failed to load chaincode metadata. Please try again.'); // 에러 메시지 설정
      } finally {
        setLoading(false); // 로딩 상태를 false로 설정
      }
    }
    fetchMetadata();
  }, [chaincodeName]); // chaincodeName이 변경될 때마다 실행

  // 폼 입력 값이 변경될 때 호출되는 함수
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value }); // 입력된 값을 formData에 설정
  };

  // 제출 버튼을 눌렀을 때 실행되는 함수
  const handleSubmit = async () => {
    try {
      setStatus('Submitting data...'); // 제출 상태 메시지 설정
      const response = await fetch('/api/create-asset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chaincodeName, assetData: formData }), // 폼 데이터 전송
      });

      const result = await response.json();
      if (response.ok) {
        setStatus('Data submitted successfully'); // 성공 메시지
      } else {
        setStatus('Failed to submit data: ' + result.error); // 실패 메시지
      }
    } catch (error) {
      setStatus('Error submitting data: ' + error.message); // 에러 발생 시 메시지 설정
    }
  };

  // 로딩 중일 때 표시
  if (loading) {
    return <p>Loading metadata...</p>;
  }

  // 에러 발생 시 표시
  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="chaincode-data-entry-container">
      <h3>{chaincodeName}</h3>
      {Object.entries(metadata).length > 0 ? (
        // 메타데이터를 순회하며 입력 폼 생성
        Object.entries(metadata).map(([key, value], index) => (
          <div key={index}>
            <label>{key} ({value}): </label>
            <input
              type="text"
              name={key}
              value={formData[key]} // 폼 데이터 값을 설정
              onChange={handleChange} // 입력 값 변경 핸들러
            />
          </div>
        ))
      ) : (
        <p>No metadata available for this chaincode.</p> // 메타데이터가 없을 때 표시
      )}
      <button onClick={handleSubmit}>제출</button>
      {status && <p>{status}</p>}
    </div>
  );
}

export default ChaincodeDataEntry;
