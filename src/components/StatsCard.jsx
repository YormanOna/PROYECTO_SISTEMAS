import '../styles/stats-card.css';

const StatsCard = ({ title, value, subtext }) => (
  <div className="stats-card">
    <div className="card-header">
      <h3>{title}</h3>
    </div>
    <div className="card-content">
      <div className="main-value">{value}</div>
      <div className="subtext">{subtext}</div>
    </div>
  </div>
);

export default StatsCard;