import React, { useEffect, useState } from 'react';
import './DeployedChaincodesPage.css';
import './ChaincodeDataEntry.css';
import ChaincodeDataEntry from './ChaincodeDataEntry';

function ChaincodeSelection() {
  const [chaincodes, setChaincodes] = useState([]);
  const [selectedChaincode, setSelectedChaincode] = useState(null);

  useEffect(() => {
    // 배포된 체인코드 목록을 가져오기 위한 API 호출
    async function fetchChaincodes() {
      try {
        const response = await fetch('/api/deployed-chaincodes');
        const result = await response.json();
        setChaincodes(result);
      } catch (error) {
        console.error('Error fetching chaincodes:', error);
      }
    }
    fetchChaincodes();
  }, []);

  const handleChaincodeSelect = (chaincode) => {
    // 마지막 콤마 제거
    const cleanedName = chaincode.name.slice(-1) === ',' ? chaincode.name.slice(0, -1) : chaincode.name;
    setSelectedChaincode({ ...chaincode, name: cleanedName });
  };

  return (
    <div className="chaincode-selection-container">
      <h3>데이터 수집에 참여할 주제 선택</h3>
      <ul>
        {chaincodes.map((chaincode, index) => (
          <li key={index} onClick={() => handleChaincodeSelect(chaincode)}>
            {chaincode.name} (Version: {chaincode.version})
          </li>
        ))}
      </ul>

      {selectedChaincode && <ChaincodeDataEntry chaincodeName={selectedChaincode.name} />}
    </div>
  );
}

export default ChaincodeSelection;