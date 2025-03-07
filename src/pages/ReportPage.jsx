import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faDownload } from '@fortawesome/free-solid-svg-icons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import '../styles/report.css';

const ReportPage = () => {
  const [reportData, setReportData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reportGenerated, setReportGenerated] = useState(false);

  const fetchReport = async () => {
    try {
        setLoading(true);
        setError(null);
        setReportGenerated(false);

        const response = await fetch('https://dfec-177-53-215-61.ngrok-free.app/report', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        // Verificar si la respuesta es JSON antes de parsear
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            console.log('Reporte recibido:', data);
            setReportData(data);
            setReportGenerated(true);
        } else {
            const text = await response.text();
            throw new Error(`Respuesta no válida: ${text.substring(0, 200)}`);
        }
    } catch (err) {
        setError(err.message);
        console.error('Error en fetchReport:', err);
    } finally {
        setLoading(false);
    }
};

  const exportPDF = async () => {
    const input = document.getElementById('report-container');
    const canvas = await html2canvas(input, {
      scale: 2,
      scrollY: -window.scrollY,
      useCORS: true,
      windowHeight: input.scrollHeight,
    });
    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save('reporte-general.pdf');
  };

  return (
    <div className="report-page">
      <div className="header-sectionNueva">
        <h1>
          <FontAwesomeIcon icon={faChartBar} /> Reporte General del Sistema
        </h1>
        <div className="header-actions">
          <button onClick={fetchReport} className="generate-btn" disabled={loading}>
            {loading ? 'Generando...' : 'Generar Reporte'}
          </button>
          {reportGenerated && (
            <button onClick={exportPDF} className="export-btn">
              <FontAwesomeIcon icon={faDownload} /> Exportar PDF
            </button>
          )}
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {reportGenerated && !loading && (
        <div id="report-container" className="report-container">
          {reportData.cpu && (
            <div className="report-section">
              <h2>CPU</h2>
              <div className="metric-grid">
                <div className="metric-cardNueva">
                  <span>Uso Promedio:</span>
                  <strong>{reportData.cpu.average_usage.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Uso Máximo:</span>
                  <strong>{reportData.cpu.max_usage.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Uso Mínimo:</span>
                  <strong>{reportData.cpu.min_usage.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Muestras:</span>
                  <strong>{reportData.cpu.sample_count}</strong>
                </div>
              </div>
            </div>
          )}
          {reportData.memory && (
            <div className="report-section">
              <h2>Memoria</h2>
              <div className="metric-grid">
                <div className="metric-card">
                  <span>Uso Promedio:</span>
                  <strong>{reportData.memory.average_usage_percent.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Uso Máximo:</span>
                  <strong>{reportData.memory.max_usage_percent.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Uso Mínimo:</span>
                  <strong>{reportData.memory.min_usage_percent.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Muestras:</span>
                  <strong>{reportData.memory.sample_count}</strong>
                </div>
              </div>
            </div>
          )}
          {reportData.network && (
            <div className="report-section">
              <h2>Red</h2>
              <div className="metric-grid">
                <div className="metric-card">
                  <span>Vel. Envío Prom.:</span>
                  <strong>{(reportData.network.average_speed_sent / 1e6).toFixed(2)} Mbps</strong>
                </div>
                <div className="metric-card">
                  <span>Vel. Recibo Prom.:</span>
                  <strong>{(reportData.network.average_speed_recv / 1e6).toFixed(2)} Mbps</strong>
                </div>
                <div className="metric-card">
                  <span>Vel. Envío Máx.:</span>
                  <strong>{(reportData.network.max_speed_sent / 1e6).toFixed(2)} Mbps</strong>
                </div>
                <div className="metric-card">
                  <span>Muestras:</span>
                  <strong>{reportData.network.sample_count}</strong>
                </div>
              </div>
            </div>
          )}
          {reportData.processes && (
            <div className="report-section">
              <h2>Procesos</h2>
              <div className="metric-grid">
                <div className="metric-card">
                  <span>Prom. Cantidad:</span>
                  <strong>{reportData.processes.average_process_count.toFixed(0)}</strong>
                </div>
                <div className="metric-card">
                  <span>Máx. Cantidad:</span>
                  <strong>{reportData.processes.max_process_count}</strong>
                </div>
                <div className="metric-card">
                  <span>Uso Total CPU Prom.:</span>
                  <strong>{reportData.processes.average_total_cpu.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Muestras:</span>
                  <strong>{reportData.processes.sample_count}</strong>
                </div>
              </div>
            </div>
          )}
          {reportData.disk && (
            <div className="report-section">
              <h2>Disco</h2>
              <div className="metric-grid">
                <div className="metric-card">
                  <span>Uso Promedio:</span>
                  <strong>{reportData.disk.average_usage_percent.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Uso Máximo:</span>
                  <strong>{reportData.disk.max_usage_percent.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Uso Mínimo:</span>
                  <strong>{reportData.disk.min_usage_percent.toFixed(1)}%</strong>
                </div>
                <div className="metric-card">
                  <span>Muestras:</span>
                  <strong>{reportData.disk.sample_count}</strong>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportPage;