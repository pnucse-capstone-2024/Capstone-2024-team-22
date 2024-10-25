import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TemplateViewPage.css';

const TemplateViewPage = () => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const templateId = queryParams.get('id');

  useEffect(() => {
    const loadTemplateContent = async () => {
      try {
        const response = await fetch(`/api/templates/${templateId}`);
        const data = await response.json();
        setContent(data.content);
      } catch (error) {
        setError('Failed to load template content');
      }
    };

    loadTemplateContent();
  }, [templateId]);

  const handleEdit = () => {
    navigate(`/template-editor?id=${templateId}`);
  };

  return (
    <div className="page"> {/* page 클래스를 적용 */}
      <h1 className="titleWrap">Template View</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <textarea id="templateContent" value={content} readOnly className="contentWrap"></textarea>
          <button id="editButton" onClick={handleEdit} className="bottomButton">수정</button>
        </>
      )}
    </div>
  );
};

export default TemplateViewPage;