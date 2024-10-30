import React, { useEffect, useState } from 'react';

const ChaincodeViewer = () => {
  const [chaincodeIds, setChaincodeIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChaincodeIds = async () => {
      try {
        const response = await fetch('/api/chaincodes');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const ids = await response.json();
        setChaincodeIds(ids);
        setLoading(false);
      } catch (error) {
        setError('Failed to load chaincode IDs');
        setLoading(false);
      }
    };

    fetchChaincodeIds();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Chaincode IDs</h1>
      <ul>
        {chaincodeIds.map((id) => (
          <li key={id}>
            <a href={`/chaincode.html?id=${id}`}>{id}</a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ChaincodeViewer;