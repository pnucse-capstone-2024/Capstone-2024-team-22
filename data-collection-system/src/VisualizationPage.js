import React from 'react';
import './VisualizationPage.css';

function VisualizationPage() {
  return (
    <div className="visualization-container">
      <h2>데이터 시각화 대시보드</h2>
      <iframe
        src="http://localhost:5601/app/dashboards#/view/f8ecd62d-b014-48a0-95c5-c0e21f7d843a?_g=(refreshInterval%3A(pause%3A!t%2Cvalue%3A60000)%2Ctime%3A(from%3Anow-15m%2Cto%3Anow))&embed=true"
        height="800"
        width="1450"
        title="Data Visualization Dashboard"
        className="visualization-iframe"
      ></iframe>
    </div>
  );
}

export default VisualizationPage;
