import React, { useState } from 'react';
import './CreateTemplatePage.css';

function CreateTemplatePage() {
  const [newTemplateTitle, setNewTemplateTitle] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreateTemplate = async () => {
    if (newTemplateTitle.trim() && newTemplateContent.trim()) {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/create-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ _id: newTemplateTitle.trim(), content: newTemplateContent.trim() }),
        });
        if (!response.ok) {
          throw new Error(`Error creating template: ${response.statusText}`);
        }
        alert('Template created successfully');
        setNewTemplateTitle('');
        setNewTemplateContent('');
      } catch (error) {
        console.error('Error creating template:', error);
        setError('템플릿 저장에 실패했습니다. 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="create-template-page-container">
      <h2>새 스마트 컨트랙트 템플릿 생성하기</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <textarea
        type="text"
        value={newTemplateTitle}
        onChange={(e) => setNewTemplateTitle(e.target.value)}
        placeholder="템플릿 제목 입력"
        className="new-template-title-input"
      />
      <textarea
        value={newTemplateContent}
        onChange={(e) => setNewTemplateContent(e.target.value)}
        placeholder="템플릿 내용 입력"
        className="new-template-textarea"
      />
      <button onClick={handleCreateTemplate} className="create-button">저장</button>
    </div>
  );
}

export default CreateTemplatePage;
