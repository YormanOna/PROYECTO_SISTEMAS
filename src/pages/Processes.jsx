import { useEffect, useState } from 'react';
import { connectWebSocket } from '../api/websocket';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMicrochip } from '@fortawesome/free-solid-svg-icons';
import '../styles/processes.css';

const ProcessesPage = () => {
  const [processData, setProcessData] = useState({ count: 0, processes: [] });

  useEffect(() => {
    let wsCleanup;
    const initWebSocket = async () => {
      try {
        wsCleanup = connectWebSocket('processes', data => {
          setProcessData({
            count: data.count,
            processes: data.processes
          });
        });
      } catch (error) {
        console.error('Error inicializando WebSocket:', error);
      }
    };

    initWebSocket();

    return () => {
      if (wsCleanup) {
        wsCleanup();
      }
    };
  }, []);

  return (
    <div className="procesos-page">
      <div className="header-section">
        <h1><FontAwesomeIcon icon={faMicrochip} /> Procesos del Sistema ({processData.count})</h1>
      </div>
      <ProcessTable processes={processData.processes} />
    </div>
  );
};

const ProcessTable = ({ processes }) => (
  <div className="tabla-container">
    <table className="tabla-procesos">
      <thead>
        <tr>
          <th>USER</th>
          <th>PID</th>
          <th>%CPU</th>
          <th>%MEM</th>
          <th>START</th>
          <th>TIME</th>
          <th>COMMAND</th>
        </tr>
      </thead>
      <tbody>
        {processes.map(proc => (
          <tr key={proc.PID}>
            <td>{proc.USER}</td>
            <td>{proc.PID}</td>
            <td>{proc['%CPU'].toFixed(1)}</td>
            <td>{proc['%MEM'].toFixed(1)}</td>
            <td>{proc.START}</td>
            <td>{proc.TIME}</td>
            <td>{proc.COMMAND}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProcessesPage;