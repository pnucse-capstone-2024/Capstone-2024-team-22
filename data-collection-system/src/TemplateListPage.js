import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './TemplateListPage.css';

const TemplateListPage = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTemplateList = async () => {
      try {
        const response = await fetch('/api/templates');
        const data = await response.json();
        setTemplates(data);
        setLoading(false);
      } catch (error) {
        setError('Failed to load template list');
        setLoading(false);
      }
    };

    loadTemplateList();
  }, []);

  return (
    <div className="container">
      <h1>Template List</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <ul>
          {templates.map((template) => (
            <li key={template}>
              <Link to={`/template-view?id=${template}`}>{template}</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TemplateListPage;