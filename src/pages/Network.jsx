import { useEffect, useState } from 'react';
import { connectWebSocket } from '../api/websocket';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faNetworkWired,
  faDownload,
  faUpload,
  faSignal,
  faExclamationTriangle,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/network.css';

const NetworkPage = () => {
  // Estados de datos y configuración
  const [networkData, setNetworkData] = useState({});
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [customGraphColor, setCustomGraphColor] = useState('#4a90e2');

  useEffect(() => {
    connectWebSocket('network', data => {
      setNetworkData(data);
      setHistory(prev => [...prev.slice(-30), data]);
    });
  }, []);

  const exportPDF = async () => {
    const input = document.getElementById('red-page');
    const canvas = await html2canvas(input, {
      scale: 2,
      scrollY: -window.scrollY,
      useCORS: true,
      windowHeight: input.scrollHeight
    });
    
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('reporte-red.pdf');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div id="red-page" className={`red-page ${darkMode ? 'dark-mode' : ''}`}>
      <button onClick={exportPDF} className="floating-pdf-button">
        <FontAwesomeIcon icon={faDownload} /> Exportar PDF
      </button>

      <div className="header-section">
        <h1>
          <FontAwesomeIcon icon={faNetworkWired} /> Monitoreo de Red
        </h1>
        <div className="header-controls">
          <button onClick={toggleDarkMode} className="mode-toggle-btn">
            {darkMode ? (
              <>
                <FontAwesomeIcon icon={faSun} /> Modo Claro
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faMoon} /> Modo Oscuro
              </>
            )}
          </button>
          <div className="graph-controls">
            <label htmlFor="graphColor">Color de Gráficas:</label>
            <input
              type="color"
              id="graphColor"
              value={customGraphColor}
              onChange={(e) => setCustomGraphColor(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="metricas-principales">
        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faDownload} className="icono-metrica" />
            <h3>Descarga</h3>
          </div>
          <div className="valor-metrica">
            {(networkData.speed_recv / 1e6).toFixed(2)} Mbps
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faUpload} className="icono-metrica" />
            <h3>Subida</h3>
          </div>
          <div className="valor-metrica">
            {(networkData.speed_sent / 1e6).toFixed(2)} Mbps
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faExclamationTriangle} className="icono-metrica" />
            <h3>Errores</h3>
          </div>
          <div className="valor-metrica">
            {networkData.errin || 0}
            <span className="sub-metrica">/ {networkData.errout || 0}</span>
          </div>
        </div>
      </div>

      <div className="graficos-container">
        <div className="grafico-principal">
          <h3>
            <FontAwesomeIcon icon={faSignal} /> Historial de Tráfico
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorDescarga" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={customGraphColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={customGraphColor} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSubida" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#50e3c2" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#50e3c2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}
              />
              <YAxis unit="Mbps" tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}/>
              <Tooltip 
                contentStyle={{
                  background: darkMode ? '#2c3e50' : 'white',
                  color: darkMode ? '#f8f9fa' : '#2c3e50',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              />
              <Area
                type="monotone"
                dataKey="speed_recv"
                stroke={customGraphColor}
                fillOpacity={1}
                fill="url(#colorDescarga)"
                name="Descarga"
              />
              <Area
                type="monotone"
                dataKey="speed_sent"
                stroke="#50e3c2"
                fillOpacity={1}
                fill="url(#colorSubida)"
                name="Subida"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="estadisticas-avanzadas">
          <h3>Estadísticas Detalladas</h3>
          <div className="estadistica">
            <span>Total Recibido:</span>
            <strong>{(networkData.bytes_recv / 1e9).toFixed(2)} GB</strong>
          </div>
          <div className="estadistica">
            <span>Total Enviado:</span>
            <strong>{(networkData.bytes_sent / 1e9).toFixed(2)} GB</strong>
          </div>
          <div className="estadistica">
            <span>Paquetes Perdidos:</span>
            <strong>{networkData.dropin || 0}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NetworkPage;
