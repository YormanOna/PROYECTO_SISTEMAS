import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const NetworkSpeedChart = ({ data }) => (
  <div className="network-chart">
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <Line 
          type="monotone" 
          dataKey="speed_recv" 
          name="Download Speed" 
          stroke="#4a90e2" 
          dot={false}
        />
        <Line 
          type="monotone" 
          dataKey="speed_sent" 
          name="Upload Speed" 
          stroke="#50e3c2" 
          dot={false}
        />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(ts) => new Date(ts).toLocaleTimeString()}
        />
        <YAxis />
        <Tooltip />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export default NetworkSpeedChart;