import { useEffect, useState } from 'react';
import { connectWebSocket } from '../api/websocket';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHardDrive, 
  faDownload, 
  faDatabase, 
  faChartSimple, 
  faMoon, 
  faSun 
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/disk.css';

const DiskPage = () => {
  const [diskData, setDiskData] = useState({ disks: [] });
  const [ioHistory, setIoHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [customGraphColor, setCustomGraphColor] = useState('#4a90e2');

  useEffect(() => {
    connectWebSocket('disk', data => {
      setDiskData(data);
      setIoHistory(prev => [...prev.slice(-20), data]);
    });
  }, []);

  const exportPDF = async () => {
    const input = document.getElementById('disco-page');
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
    pdf.save('reporte-disco.pdf');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Array de colores para asignar de forma variada a las barras. El primero es el color personalizado.
  const chartColors = [
    customGraphColor,
    '#50e3c2',
    '#f5a623',
    '#e2e2e2'
  ];

  return (
    <div id="disco-page" className={`disco-page ${darkMode ? 'dark-mode' : ''}`}>
      <button onClick={exportPDF} className="floating-pdf-button">
        <FontAwesomeIcon icon={faDownload} /> Exportar PDF
      </button>

      <div className="header-section">
        <h1>
          <FontAwesomeIcon icon={faHardDrive} /> Monitoreo de Disco
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
            <FontAwesomeIcon icon={faDatabase} className="icono-metrica" />
            <h3>Operaciones de Lectura</h3>
          </div>
          <div className="valor-metrica">
            {diskData.read_count || 0}
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faDatabase} className="icono-metrica" />
            <h3>Operaciones de Escritura</h3>
          </div>
          <div className="valor-metrica">
            {diskData.write_count || 0}
          </div>
        </div>
      </div>

      <div className="graficos-container">
        <div className="grafico-principal">
          <h3>
            <FontAwesomeIcon icon={faChartSimple} /> Uso de Espacio
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={diskData.disks}>
              <XAxis 
                dataKey="mountpoint" 
                tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }} 
              />
              <YAxis 
                unit="GB" 
                tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }} 
              />
              <Tooltip 
                contentStyle={{
                  background: darkMode ? '#2c3e50' : 'white',
                  color: darkMode ? '#f8f9fa' : '#2c3e50',
                  border: 'none',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                }}
              />
              <Bar dataKey="used" name="Usado">
                {diskData.disks.map((entry, index) => (
                  <Cell key={index} fill={chartColors[index % chartColors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="estadisticas-avanzadas">
          <h3>Detalles de Particiones</h3>
          {diskData.disks.map((disk, index) => (
            <div key={index} className="particion">
              <div className="particion-header">
                <span>{disk.mountpoint}</span>
                <strong>{disk.percent.toFixed(1)}%</strong>
              </div>
              <div className="particion-bar">
                <div 
                  className="particion-fill" 
                  style={{ 
                    width: `${disk.percent}%`,
                    backgroundColor: chartColors[index % chartColors.length]
                  }}
                ></div>
              </div>
              <div className="particion-details">
                <span>
                  {(disk.used / 1e9).toFixed(2)} GB / {(disk.total / 1e9).toFixed(2)} GB
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiskPage;
