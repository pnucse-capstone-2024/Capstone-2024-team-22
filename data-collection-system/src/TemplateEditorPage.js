import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TemplateEditorPage.css';

const TemplateEditorPage = () => {
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

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/templates/${templateId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });
      const result = await response.json();
      if (response.ok) {
        alert(result.message);
        navigate('/template-list'); // 저장 성공 시 템플릿 리스트로 이동
      } else {
        alert('Failed to save template: ' + result.error);
      }
    } catch (error) {
      console.error('Failed to save template', error);
    }
  };

  return (
    <div className="container">
      <h1>Template Editor</h1>
      {error ? (
        <p>{error}</p>
      ) : (
        <>
          <textarea
            id="templateContent"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>
          <button onClick={handleSave}>Save</button>
        </>
      )}
    </div>
  );
};

export default TemplateEditorPage;