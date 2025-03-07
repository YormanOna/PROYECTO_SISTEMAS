import { Link } from "react-router-dom";
import {
  MdDashboard,
  MdDeveloperBoard,
  MdMemory,
  MdNetworkCheck,
  MdStorage,
  MdList,
} from "react-icons/md";
import "./Sidebar.css";

const Sidebar = () => {
  const username = localStorage.getItem("username") || "Usuario"; // Obtenemos el nombre o usamos "Usuario" por defecto

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h3>Métricas del Servidor</h3>
      </div>
      <nav className="sidebar-nav">
        <Link to="/app/dashboard" className="sidebar-link">
          <MdDashboard size={20} />
          <span>Panel de control</span>
        </Link>
        <Link to="/app/cpu" className="sidebar-link">
          <MdDeveloperBoard size={20} />
          <span>CPU</span>
        </Link>
        <Link to="/app/memory" className="sidebar-link">
          <MdMemory size={20} />
          <span>Memoria</span>
        </Link>
        <Link to="/app/network" className="sidebar-link">
          <MdNetworkCheck size={20} />
          <span>Red</span>
        </Link>
        <Link to="/app/disk" className="sidebar-link">
          <MdStorage size={20} />
          <span>Disco</span>
        </Link>
        <Link to="/app/processes" className="sidebar-link">
          <MdList size={20} />
          <span>Procesos</span>
        </Link>
        <Link to="/app/report" className="sidebar-link">
          <MdList size={20} />
          <span>Reporte</span>
        </Link>
        <Link to="/" className="sidebar-link">
          <span>Cerrar Sesión</span>
        </Link>
      </nav>
      <div className="sidebar-footer">
        <p>
          <strong>Bienvenido:</strong> {username}
        </p>
      </div>
    </aside>
  );
};

export default Sidebar;
