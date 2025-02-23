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
  faMicrochip,
  faThermometerHalf,
  faDownload,
  faGaugeHigh,
  faClockRotateLeft,
  faChartLine,
  faMoon,
  faSun
} from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/cpu.css';

// Nuevas importaciones para sonido y notificaciones
import alertSound from '../sounds/Kyaa_effect.mp3';
import useSound from 'use-sound';
import butterup from 'butteruptoasts';
import '../styles/butterup-2.0.0/butterup.css';

const CpuPage = () => {
  // Estados de datos
  const [cpuData, setCpuData] = useState({});
  const [history, setHistory] = useState([]);
  
  // Estados de configuración de interfaz
  const [darkMode, setDarkMode] = useState(false);
  const [customGraphColor, setCustomGraphColor] = useState('#4a90e2');
  const [isBarChart, setIsBarChart] = useState(true); // true: barras, false: pastel

  // Estado para controlar notificaciones de alto uso de CPU
  const [hasNotifiedHighUsage, setHasNotifiedHighUsage] = useState(false);

  // Hook para reproducir sonido
  const [play] = useSound(alertSound, { volume: 1 });

  // Conexión vía WebSocket para CPU
  useEffect(() => {
    connectWebSocket('cpu', data => {
      setCpuData(data);
      setHistory(prev => [...prev.slice(-30), data]);
    });
  }, []);

  // UseEffect para reproducir sonido y mostrar notificación cuando el uso supera el 80%
  useEffect(() => {
    if (cpuData.usage > 80 && !hasNotifiedHighUsage) {
      butterup.toast({
        title: "⚠️ Uso alto de CPU",
        message: "El uso de CPU ha superado el 80%.",
        location: "top-right",
        dismissable: true,
        timeout: 5000,
        type: "error"
      });
      setHasNotifiedHighUsage(true);
      play();
    } else if (cpuData.usage <= 80 && hasNotifiedHighUsage) {
      setHasNotifiedHighUsage(false);
    }
  }, [cpuData.usage, hasNotifiedHighUsage, play]);

  // Datos para el gráfico de distribución del uso
  const usageData = [
    { name: 'Usuario', value: cpuData.times?.user || 0 },
    { name: 'Sistema', value: cpuData.times?.system || 0 },
    { name: 'Espera', value: cpuData.times?.iowait || 0 },
    { name: 'Inactivo', value: cpuData.times?.idle || 0 }
  ];

  // Si el uso supera el 80%, se usa el color de "peligro" para el gráfico de área
  const currentAreaChartColor =
    cpuData.usage && cpuData.usage > 80 ? '#ff6b6b' : customGraphColor;
  
  // Array de colores para asignar de forma variada a las secciones de los gráficos
  const chartColors = [
    customGraphColor,
    '#50e3c2',
    '#ff6b6b',
    '#f5a623'
  ];

  // Función para exportar a PDF
  const exportPDF = async () => {
    const input = document.getElementById('cpu-page');
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
    pdf.save('reporte-cpu.pdf');
  };

  // Toggle para cambiar entre modo oscuro y claro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div id="cpu-page" className={`cpu-page ${darkMode ? 'dark-mode' : ''}`}>
      <button onClick={exportPDF} className="floating-pdf-button">
        <FontAwesomeIcon icon={faDownload} /> Exportar PDF
      </button>

      <div className="header-section">
        <h1>
          <FontAwesomeIcon icon={faMicrochip} /> Monitoreo del Procesador
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

        </div>
      </div>

      <div className="metricas-principales">
        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faGaugeHigh} className="icono-metrica" />
            <h3>Uso Actual</h3>
          </div>
          <div className="valor-metrica">
            {cpuData.usage?.toFixed(1) || '0.0'}%
          </div>
        </div>

        <div className="tarjeta-metrica">
          <div className="icono-titulo">
            <FontAwesomeIcon icon={faClockRotateLeft} className="icono-metrica" />
            <h3>Frecuencia</h3>
          </div>
          <div className="valor-metrica">
            {cpuData.frequency?.toFixed(1) || '0.0'} GHz
          </div>
        </div>
      </div>

      <div className="graficos-container">
        <div className="grafico-principal">
          <h3>
            <FontAwesomeIcon icon={faChartLine} /> Historial de Uso
          </h3>
          <div className="graph-controls">
            <label htmlFor="graphColor">Color de Gráficas:</label>
            <input
              type="color"
              id="graphColor"
              value={customGraphColor}
              onChange={(e) => setCustomGraphColor(e.target.value)}
            />
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorUso" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={currentAreaChartColor} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={currentAreaChartColor} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="timestamp" 
                tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
                tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}
              />
              <YAxis unit="%" tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}/>
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
                dataKey="usage"
                stroke={currentAreaChartColor}
                fillOpacity={1}
                fill="url(#colorUso)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="graficos-secundarios">
          <div className="grafico-secundario">
            <div className="chart-header">
              <h3>Distribución del Uso</h3>
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
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={usageData}>
                  <XAxis dataKey="name" tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}/>
                  <YAxis unit="%" tick={{ fill: darkMode ? '#f8f9fa' : '#2c3e50' }}/>
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
              <ResponsiveContainer width="100%" height={200}>
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
            <div className="estadistica">
              <span>Núcleos Físicos:</span>
              <strong>{cpuData.cores || 'N/A'}</strong>
            </div>
            <div className="estadistica">
              <span>Núcleos Lógicos:</span>
              <strong>{cpuData.logical_cores || 'N/A'}</strong>
            </div>
            <div className="estadistica">
              <span>Tiempo Activo:</span>
              <strong>{cpuData.times?.user?.toFixed(1) || '0.0'}%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CpuPage;
