import React, { useEffect, useState } from 'react';

const MonitorSmartContracts = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch('/api/monitor-smart-contracts');
        const logs = await response.json();
        setLogs(logs);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  return (
    <div style={styles.body}>
      <h1>Smart Contract Logs</h1>
      {loading ? (
        <div id="loading-message" style={styles.loadingMessage}>Loading...</div>
      ) : (
        <div id="log-container" style={styles.logContainer}>
          {logs.map((log, index) =>
            log.message.includes('Chaincode') || log.message.includes('DeploySysCC') ? (
              <div key={index} className="log-entry" style={styles.filtered}>{log.message}</div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  body: {
    fontFamily: 'Arial, sans-serif',
  },
  logContainer: {
    whiteSpace: 'pre-wrap',
  },
  filtered: {
    marginBottom: '10px',
    color: 'red',
  },
  loadingMessage: {
    fontWeight: 'bold',
  },
};

export default MonitorSmartContracts;