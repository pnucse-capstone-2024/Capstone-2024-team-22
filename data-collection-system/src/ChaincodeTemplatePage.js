import React, { useEffect, useState } from 'react';
import './ChaincodeTemplatePage.css';

function ChaincodeTemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetch('/api/templates');
        if (!response.ok) {
          throw new Error(`Error fetching templates: ${response.statusText}`);
        }
        const data = await response.json();
        setTemplates(data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        setError('Failed to load templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  const handleTemplateClick = async (id) => {
    setLoading(true);
    setError('');
    setSelectedTemplate(null);
    try {
      const response = await fetch(`/api/templates/${id}`);
      if (!response.ok) {
        throw new Error(`Error fetching template: ${response.statusText}`);
      }
      const data = await response.json();
      setSelectedTemplate(data);
    } catch (error) {
      console.error('Error fetching template:', error);
      setError('Failed to load template. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (selectedTemplate) {
      setLoading(true);
      setError('');
      try {
        const response = await fetch(`/api/templates/${selectedTemplate._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content: selectedTemplate.content }),
        });
        if (!response.ok) {
          throw new Error(`Error saving template: ${response.statusText}`);
        }
        alert('Template saved successfully');
      } catch (error) {
        console.error('Error saving template:', error);
        setError('Failed to save template. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleContentChange = (index, newValue) => {
    if (selectedTemplate) {
      const functionBlocks = selectedTemplate.content.split(/(?=\/\/[^\n]*\nfunc\s+)/m);
      functionBlocks[index] = newValue;
      setSelectedTemplate({ ...selectedTemplate, content: functionBlocks.join('\n\n') });
    }
  };

  const renderTemplateContent = (content) => {
    const functionBlocks = content.split(/(?=\/\/[^\n]*\nfunc\s+)/m);
    return functionBlocks.map((block, index) => (
      <div key={index} className="function-block">
        <textarea
          id={`function-${index}`}
          value={block.trim()}
          onChange={(e) => handleContentChange(index, e.target.value)}
          className="function-textarea"
        />
      </div>
    ));
  };

  return (
    <div className="chaincode-templates-page-container">
      <h2>스마트 컨트랙트 템플릿 목록</h2>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      <ul className="templates-list">
        {templates.map((template) => (
          <li key={template} onClick={() => handleTemplateClick(template)} className="template-item">
            {template}
          </li>
        ))}
      </ul>
      {selectedTemplate && (
        <div className="template-details">
          <h3>Selected Template: {selectedTemplate._id}</h3>
          <div className="template-content-container">
            {renderTemplateContent(selectedTemplate.content)}
          </div>
          <button onClick={handleSaveTemplate} className="save-button">Save Changes</button>
        </div>
      )}
    </div>
  );
}

export default ChaincodeTemplatesPage;
