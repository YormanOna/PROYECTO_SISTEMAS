import { useEffect, useState } from "react";
import { connectWebSocket } from "../api/websocket";
import alertSound from '../sounds/Kyaa_effect.mp3';
import useSound from 'use-sound';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Brush,
} from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMicrochip,
  faMemory,
  faNetworkWired,
  faCamera,
  faThermometerHalf,
  faMoon,
  faSun,
} from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import butterup from 'butteruptoasts';
import '../styles/butterup-2.0.0/butterup.css';
import "../styles/dashboard.css";

const Dashboard = () => {
  // Estados para los datos
  const [cpuData, setCpuData] = useState({});
  const [memoryData, setMemoryData] = useState({});
  const [networkData, setNetworkData] = useState({});
  const [history, setHistory] = useState([]);

  // Estados para funcionalidades extra
  const [darkMode, setDarkMode] = useState(false);
  const [customGraphColor, setCustomGraphColor] = useState("#4a90e2"); // color personalizado
  const [hasNotifiedHighUsage, setHasNotifiedHighUsage] = useState(false);

  // Conexiones WebSocket
  useEffect(() => {
    connectWebSocket("cpu", (data) => {
      setCpuData(data);
      setHistory((prev) => [...prev.slice(-10), data]); // historial limitado a 10 registros
    });
    connectWebSocket("memory", setMemoryData);
    connectWebSocket("network", setNetworkData);
  }, []);

  const [play] = useSound(alertSound, { volume: 1 });
  // Notificación cuando el uso de CPU supera el 80%
  useEffect(() => {
    if (cpuData.usage > 80 && !hasNotifiedHighUsage) {
      butterup.toast({
        title: "⚠️ Uso alto de CPU",
        message: "El uso de CPU ha superado el 80%.",
        location: "top-right",
        dismissable: true,
        timeout: 5000, // El mensaje desaparece después de 5 segundos
        type: "error", // Rojo para indicar advertencia
      });
      setHasNotifiedHighUsage(true);
      play(); 
    } else if (cpuData.usage <= 80 && hasNotifiedHighUsage) {
      setHasNotifiedHighUsage(false);
    }
  }, [cpuData.usage, hasNotifiedHighUsage]);
  

  // Exportar toda la página a PDF
  const exportPDF = async () => {
    const input = document.getElementById("dashboard-container");
    const canvas = await html2canvas(input, {
      scale: 2,
      scrollY: -window.scrollY,
      useCORS: true,
      windowHeight: input.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // Ancho A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("dashboard.pdf");
  };

  // Exportar solo la gráfica a PDF (se corrigió agregando id al contenedor)
  const exportGraphPDF = async () => {
    const graphElement = document.getElementById("chart-container");
    if (!graphElement) {
      console.error("No se encontró el contenedor de la gráfica.");
      return;
    }
    const canvas = await html2canvas(graphElement, {
      scale: 2,
      scrollY: -window.scrollY,
      useCORS: true,
      windowHeight: graphElement.scrollHeight,
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = 210; // Ancho A4 en mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("graph.pdf");
  };

  // Alternar modo oscuro
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Cambio de color automático en la gráfica: si el uso de CPU supera el 80%, se usa el color de "peligro"
  const currentChartColor =
    cpuData.usage && cpuData.usage > 80 ? "#ff6b6b" : customGraphColor;

  return (
    <div id="cpu-page" className="dash-page">
      <div
        id="dashboard-container"
        className={`dashboard-container ${darkMode ? "dark-mode" : ""}`}
      >
        <div className="dashboard-header">
          <h1>Panel de Monitoreo del Servidor </h1>
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

        <div className="metrics-grid">
          {/* Tarjeta de CPU */}
          <div className="metric-card cpu-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faMicrochip} className="card-icon" />
              <h3>Procesador</h3>
            </div>
            <div className="card-content">
              <div className="main-metric">
                {cpuData.usage?.toFixed(1)}%
              </div>
              <div className="sub-metrics">
                <div className="sub-metric">
                  <FontAwesomeIcon icon={faThermometerHalf} />
                  {cpuData.temperature?.toFixed(1)}°C
                </div>
                <div className="sub-metric">
                  {cpuData.frequency?.toFixed(1)} GHz
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Memoria */}
          <div className="metric-card memory-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faMemory} className="card-icon" />
              <h3>Memoria</h3>
            </div>
            <div className="card-content">
              <div className="main-metric">
                {(memoryData.used / 1e9).toFixed(1)} GB
              </div>
              <div className="sub-metrics">
                <div className="sub-metric">
                  {memoryData.percent?.toFixed(1)}% Usada
                </div>
                <div className="sub-metric">
                  {(memoryData.total / 1e9).toFixed(1)} GB Total
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Red */}
          <div className="metric-card network-card">
            <div className="card-header">
              <FontAwesomeIcon icon={faNetworkWired} className="card-icon" />
              <h3>Red</h3>
            </div>
            <div className="card-content">
              <div className="network-speeds">
                <div className="speed download">
                  <span className="speed-label">Descarga</span>
                  <span className="speed-value">
                    {(networkData.speed_recv / 1e6).toFixed(1)} Mbps
                  </span>
                </div>
                <div className="speed upload">
                  <span className="speed-label">Subida</span>
                  <span className="speed-value">
                    {(networkData.speed_sent / 1e6).toFixed(1)} Mbps
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Se agregó id="chart-container" para que exportGraphPDF funcione correctamente */}
        <div id="chart-container" className="chart-container">
          <div className="chart-header">
            <h3 className="chart-title">Historial de Uso de CPU</h3>
            <div className="graph-controls">
              <label htmlFor="graphColor">Color de Gráficas:</label>
              <input
                type="color"
                id="graphColor"
                value={customGraphColor}
                onChange={(e) => setCustomGraphColor(e.target.value)}
              />
              <button
                onClick={exportGraphPDF}
                className="graph-screenshot-btn"
                title="Capturar gráfica"
              >
                <FontAwesomeIcon icon={faCamera} />
              </button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={history}>
              <defs>
                <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor={currentChartColor}
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor={currentChartColor}
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) =>
                  new Date(ts).toLocaleTimeString()
                }
                tick={{ fill: darkMode ? "#f8f9fa" : "#6c757d" }}
              />
              <YAxis
                unit="%"
                tick={{ fill: darkMode ? "#f8f9fa" : "#6c757d" }}
              />
              <Tooltip
                contentStyle={{
                  background: darkMode ? "#2c3e50" : "white",
                  color: darkMode ? "#f8f9fa" : "#2c3e50",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              />
              <Area
                type="monotone"
                dataKey="usage"
                stroke={currentChartColor}
                fillOpacity={1}
                fill="url(#cpuGradient)"
                dot={false}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="temperature"
                stroke="#ff6b6b"
                strokeWidth={2}
                dot={false}
              />
              <Brush
                dataKey="timestamp"
                height={30}
                stroke={currentChartColor}
                tickFormatter={(ts) =>
                  new Date(ts).toLocaleTimeString()
                }
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <button onClick={exportPDF} className="pdf-btn screenshot-btn">
          <FontAwesomeIcon icon={faCamera} /> Generar PDF
        </button>
      </div>
    </div>
  );
};

export default Dashboard;