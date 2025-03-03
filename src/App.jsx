import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Cpu from './pages/Cpu';
import Memory from './pages/Memory';
import Network from './pages/Network';
import Processes from './pages/Processes';
import Disk from './pages/Disk';
import Auth from './pages/Auth';
import ReportPage from './pages/ReportPage';
import './styles/main.css';

function Layout() {
  return (
    <>
      <Navbar />
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="cpu" element={<Cpu />} />
            <Route path="memory" element={<Memory />} />
            <Route path="network" element={<Network />} />
            <Route path="processes" element={<Processes />} />
            <Route path="disk" element={<Disk />} />
            <Route path="report" element={<ReportPage />} />
          </Routes>
        </div>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/app/*" element={<Layout />} />
      </Routes>
    </Router>
  );
}

export default App;
