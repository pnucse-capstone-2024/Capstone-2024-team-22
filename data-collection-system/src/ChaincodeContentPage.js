import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './ChaincodeContentPage.css';

const ChaincodeContentPage = () => {
  const [content, setContent] = useState('Loading...');
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const chaincodeId = queryParams.get('id');

  useEffect(() => {
    const fetchChaincodeContent = async () => {
      if (chaincodeId) {
        try {
          const response = await fetch(`/api/chaincode/${chaincodeId}`);
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          const data = await response.json();
          if (data.content) {
            const formattedContent = data.content.replace(/\n/g, '<br>');
            setContent(formattedContent);
          } else {
            setContent('Content not found in the document');
          }
        } catch (error) {
          setContent('Failed to load chaincode content');
        }
      } else {
        setContent('No Chaincode ID provided');
      }
    };

    fetchChaincodeContent();
  }, [chaincodeId]);

  return (
    <div className="container">
      <h1>Chaincode Content</h1>
      <div id="chaincodeContent" dangerouslySetInnerHTML={{ __html: content }}></div>
    </div>
  );
};

export default ChaincodeContentPage;