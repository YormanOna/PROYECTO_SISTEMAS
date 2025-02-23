import { Link } from 'react-router-dom';
import { 
  MdDashboard, 
  MdDeveloperBoard, 
  MdMemory, 
  MdNetworkCheck, 
  MdStorage, 
  MdList 
} from 'react-icons/md';
import './Navbar.css';

const Navbar = () => (
  <nav className="navbar">
    <div className="navbar-brand">
      <MdDashboard size={28} className="brand-icon" />
      <span>Métricas del Servidor</span>
    </div>
    <div className="navbar-links">
      <Link to="/app/dashboard" className="nav-link">
        <MdDashboard size={20} />
        <span>Panel de control</span>
      </Link>
      <Link to="/app/cpu" className="nav-link">
        <MdDeveloperBoard size={20} />
        <span>CPU</span>
      </Link>
      <Link to="/app/memory" className="nav-link">
        <MdMemory size={20} />
        <span>Memoria</span>
      </Link>
      <Link to="/app/network" className="nav-link">
        <MdNetworkCheck size={20} />
        <span>Red</span>
      </Link>
      <Link to="/app/processes" className="nav-link">
        <MdList size={20} />
        <span>Procesos</span>
      </Link>
      <Link to="/app/disk" className="nav-link">
        <MdStorage size={20} />
        <span>Disco</span>
      </Link>
    </div>
  </nav>
);

export default Navbar;
