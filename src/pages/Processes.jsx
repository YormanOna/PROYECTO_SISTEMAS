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
          <th>PID</th>
          <th>Nombre</th>
          <th>Estado</th>
          <th>CPU %</th>
          <th>Memoria %</th>
        </tr>
      </thead>
      <tbody>
        {processes.map(proc => (
          <tr key={proc.pid}>
            <td>{proc.pid}</td>
            <td>{proc.name}</td>
            <td>{proc.status}</td>
            <td>{proc.cpu.toFixed(1)}</td>
            <td>{proc.memory.toFixed(1)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default ProcessesPage;