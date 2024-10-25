import React, { useState } from 'react';
import './CollectDataPage.css';

const CollectDataPage = () => {
  const [formType, setFormType] = useState(null);
  const [numCandidates, setNumCandidates] = useState(0);
  const [numRegions, setNumRegions] = useState(0);
  const [numQuestions, setNumQuestions] = useState(0);

  const handleFormSubmit = async (e, apiUrl, formData) => {
    e.preventDefault();

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();
      if (response.ok) {
        alert('Data collected successfully');
      } else {
        alert('Failed to collect data: ' + result.error);
      }
    } catch (error) {
      console.error('Error collecting data:', error);
    }
  };

  return (
    <div>
      <div className="fixed-top">
        <h1>데이터 수집하기</h1>
        <div id="choices">
          <button onClick={() => setFormType('vote')}>투표 데이터 수집하기</button>
          <button onClick={() => setFormType('temperature')}>지역별 온도 데이터 수집하기</button>
          <button onClick={() => setFormType('survey')}>설문 데이터 수집하기</button>
        </div>
      </div>
      <div className="spacer"></div>
      <div className="container">
        {formType === 'vote' && (
          <div id="voteForm">
            <h2>투표 데이터 수집하기</h2>
            <form
              onSubmit={(e) =>
                handleFormSubmit(e, '/api/collect-vote-data', {
                  numCandidates,
                  candidates: Array.from({ length: numCandidates }).map((_, i) => ({
                    symbolNumber: e.target[`candidates[${i + 1}][symbolNumber]`].value,
                    name: e.target[`candidates[${i + 1}][name]`].value,
                  }))
                })
              }
            >
              <input
                type="number"
                value={numCandidates}
                onChange={(e) => setNumCandidates(parseInt(e.target.value))}
                placeholder="후보자 수 입력"
                required
              />
              {Array.from({ length: numCandidates }).map((_, i) => (
                <div key={i} className="input-group">
                  <label>후보자 {i + 1}</label>
                  <input type="number" name={`candidates[${i + 1}][symbolNumber]`} placeholder="기호번호" required />
                  <input type="text" name={`candidates[${i + 1}][name]`} placeholder="후보자명" required />
                </div>
              ))}
              <button type="submit">Submit</button>
            </form>
          </div>
        )}
        {formType === 'temperature' && (
          <div id="temperatureForm">
            <h2>지역별 온도 데이터 수집하기</h2>
            <form
              onSubmit={(e) =>
                handleFormSubmit(e, '/api/collect-temperature-data', {
                  numRegions,
                  regions: Array.from({ length: numRegions }).map((_, i) => ({
                    region: e.target[`regions[${i + 1}][region]`].value,
                  }))
                })
              }
            >
              <input
                type="number"
                value={numRegions}
                onChange={(e) => setNumRegions(parseInt(e.target.value))}
                placeholder="지역 수 입력"
                required
              />
              {Array.from({ length: numRegions }).map((_, i) => (
                <div key={i} className="input-group">
                  <label>지역 {i + 1}</label>
                  <input type="text" name={`regions[${i + 1}][region]`} placeholder="지역명" required />
                </div>
              ))}
              <button type="submit">Submit</button>
            </form>
          </div>
        )}
        {formType === 'survey' && (
          <div id="surveyForm">
            <h2>설문 데이터 수집하기</h2>
            <form
              onSubmit={(e) =>
                handleFormSubmit(e, '/api/collect-survey-data', {
                  numQuestions,
                  questions: Array.from({ length: numQuestions }).map((_, i) => ({
                    questionNumber: e.target[`questions[${i + 1}][questionNumber]`].value,
                    content: e.target[`questions[${i + 1}][content]`].value,
                  }))
                })
              }
            >
              <input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                placeholder="질문 수 입력"
                required
              />
              {Array.from({ length: numQuestions }).map((_, i) => (
                <div key={i} className="input-group">
                  <label>질문 {i + 1}</label>
                  <input type="number" name={`questions[${i + 1}][questionNumber]`} placeholder="질문번호" required />
                  <input type="text" name={`questions[${i + 1}][content]`} placeholder="질문내용" required />
                </div>
              ))}
              <button type="submit">Submit</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectDataPage;