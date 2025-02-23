const DiskList = ({ disks }) => (
    <div className="disk-list">
      {disks.map((disk, index) => (
        <div key={index} className="disk-item">
          <div className="disk-header">
            <h4>{disk.device}</h4>
            <span>{disk.mountpoint}</span>
          </div>
          <div className="disk-progress">
            <div 
              className="progress-bar" 
              style={{ width: `${disk.percent}%` }}
            ></div>
            <span>{disk.percent.toFixed(1)}%</span>
          </div>
          <div className="disk-stats">
            <p>Total: {(disk.total / 1e9).toFixed(2)} GB</p>
            <p>Used: {(disk.used / 1e9).toFixed(2)} GB</p>
          </div>
        </div>
      ))}
    </div>
  );
  
  export default DiskList;