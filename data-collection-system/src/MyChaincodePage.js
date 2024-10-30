import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyChaincodePage.css';

function MyChaincodePage() {
  const [chaincodes, setChaincodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChaincode, setSelectedChaincode] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChaincodes = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/mychaincode');
        if (!response.ok) {
          throw new Error(`Error fetching chaincodes: ${response.statusText}`);
        }
        const data = await response.json();
        setChaincodes(data.chaincodeName);
      } catch (error) {
        console.error('Error fetching chaincodes:', error);
        setError('Failed to load chaincodes. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChaincodes();
  }, []);

  const handleRawDataDownload = async (chaincodeName) => {
    try {
      const response = await fetch(`/api/download-raw-data`, {
        method: 'GET',
      });
      if (!response.ok) {
        throw new Error(`Error downloading RAW data: ${response.statusText}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'raw_data.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      console.error('Error downloading RAW data:', error);
      setError('Failed to download RAW data. Please try again.');
    }
  };

  return (
    <div className="my-chaincodes-page-container">
      <h2>나의 데이터 수집</h2>
      {loading ? (
        <p>Loading my deployed chaincodes...</p>
      ) : error ? (
        <p className="error-message">{error}</p>
      ) : chaincodes.length > 0 ? (
        <ul>
          {chaincodes.map((chaincode, index) => (
            <li key={index} onClick={() => setSelectedChaincode(chaincode.chaincodename)}>
              <div>
                <strong>Chaincode Name:</strong> {chaincode.chaincodename}
              </div>
              {selectedChaincode === chaincode.chaincodename && (
                <div className="buttons-container">
                  <button className="raw-data-button" onClick={() => handleRawDataDownload(chaincode.chaincodename)}>RAW 데이터 다운로드</button>
                  <button className="visualize-data-button" onClick={() => navigate('/visualization')}>수집 데이터 시각화</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No deployed chaincodes found.</p>
      )}
    </div>
  );
}

export default MyChaincodePage;
