import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

const CpuChart = ({ data }) => (
  <div className="cpu-chart">
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={['#4a90e2', '#50e3c2', '#f5a623', '#e2e2e2'][index % 4]} />
          ))}
        </Pie>
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>
);

export default CpuChart;