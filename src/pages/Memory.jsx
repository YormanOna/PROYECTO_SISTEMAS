import { useEffect, useState } from 'react';
import { connectWebSocket } from '../api/websocket';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMemory,
  faDatabase,
  faDownload,
  faChartSimple,
  faArrowTrendUp,
  faChartLine,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/memory.css';

const MemoriaPage = () => {
  // Estados para los datos
  const [memoriaData, setMemoriaData] = useState({});
  const [history, setHistory] = useState([]);

  // Estados para las funcionalidades extra
  const [darkMode, setDarkMode] = useState(false);
  const [customGraphColor, setCustomGraphColor] = useState('#4a90e2');
  const [isBarChart, setIsBarChart] = useState(true); // true: barras, false: pastel

  // Colores variados para gráficos (se actualizan en función del color seleccionado)
  const chartColors = [
    customGraphColor,
    '#50e3c2',
    '#ff6b6b',
    '#f5a623'
  ];

  // Conexión vía WebSocket para Memoria
  useEffect(() => {
    connectWebSocket('memory', data => {
      setMemoriaData(data);
      setHistory(prev => [...prev.slice(-30), data]);
    });
  }, []);

  // Datos para la distribución de la memoria
  const usageData = [
    { name: 'Usada', value: memoriaData.used || 0 },
    { name: 'Libre', value: memoriaData.free || 0 },
    { name: 'Caché', value: memoriaData.cached || 0 },
    { name: 'Buffer', value: memoriaData.buffers || 0 }
  ];

  // Función para exportar la página a PDF
  const exportPDF = async () => {
    const input = document.getElementById('memoria-page');
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
    pdf.save('reporte-memoria.pdf');
  };

  // Toggle para modo oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div id="memoria-page" className={`memoria-page ${darkMode ? 'dark-mode' : ''}`}>
      {/* Botón flotante para exportar PDF */}
      <button onClick={exportPDF} className="floating-pdf-button">
        <FontAwesomeIcon icon={faDownload} /> Exportar PDF
      </button>

      <div className="header-section">
        <h1>
          <FontAwesomeIcon icon={faMemory} /> Monitoreo de Memoria
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
            <h3>Memoria Usada</h3>
          </div>
          <div className="valor-metrica">
            {(memoriaData.used / 1e9).toFixed(2)} GB
          </div>
          <div className="sub-metrica">
            {memoriaData.percent?.toFixed(1)}% del total
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faChartSimple} className="icono-metrica" />
            <h3>Memoria Libre</h3>
          </div>
          <div className="valor-metrica">
            {(memoriaData.free / 1e9).toFixed(2)} GB
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faArrowTrendUp} className="icono-metrica" />
            <h3>Swap Usado</h3>
          </div>
          <div className="valor-metrica">
            {(memoriaData.swap_used / 1e9).toFixed(2)} GB
          </div>
          <div className="sub-metrica">
            {memoriaData.swap_percent?.toFixed(1)}% del total
          </div>
        </div>
      </div>

      <div className="graficos-container">
        <div className="grafico-principal">
          <h3>
            <FontAwesomeIcon icon={faChartLine} /> Historial de Uso de Memoria
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorMemoria" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={customGraphColor} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={customGraphColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}
              />
              <YAxis unit="GB" tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }} />
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
                dataKey="used"
                stroke={customGraphColor}
                fillOpacity={1}
                fill="url(#colorMemoria)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="graficos-secundarios">
          <div className="grafico-secundario">
            <div className="chart-header">
              <h3>Distribución de Memoria</h3>
              <div className="chart-type-toggle">
                <button 
                  onClick={() => setIsBarChart(true)}
                  className={isBarChart ? 'active' : ''}
                >
                  Barras
                </button>
                <button 
                  onClick={() => setIsBarChart(false)}
                  className={!isBarChart ? 'active' : ''}
                >
                  Pastel
                </button>
              </div>
            </div>
            {isBarChart ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={usageData}>
                  <XAxis dataKey="name" tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}/>
                  <YAxis unit="GB" tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}/>
                  <Tooltip 
                    contentStyle={{
                      background: darkMode ? '#2c3e50' : 'white',
                      color: darkMode ? '#f8f9fa' : '#2c3e50',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  />
                  <Bar dataKey="value">
                    {usageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie 
                    data={usageData} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label
                  >
                    {usageData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={chartColors[index % chartColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      background: darkMode ? '#2c3e50' : 'white',
                      color: darkMode ? '#f8f9fa' : '#2c3e50',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="estadisticas-avanzadas">
            <h3>Estadísticas Detalladas</h3>
            <div className="estadistica">
              <span>Memoria Total:</span>
              <strong>{(memoriaData.total / 1e9).toFixed(2)} GB</strong>
            </div>
            <div className="estadistica">
              <span>Memoria Disponible:</span>
              <strong>{(memoriaData.available / 1e9).toFixed(2)} GB</strong>
            </div>
            <div className="estadistica">
              <span>Swap Total:</span>
              <strong>{(memoriaData.swap_total / 1e9).toFixed(2)} GB</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoriaPage;
