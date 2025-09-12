// src/components/Dashboard/Charts/SalesChart.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const SalesChart = ({ data }) => {
  return (
    <div className="card">
      <div className="card-header">
        <h5 className="card-title mb-0">Monthly Sales</h5>
      </div>
      <div className="card-body">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`$${value}`, 'Sales']}
              labelFormatter={(value) => `Month: ${value}`}
            />
            <Legend />
            <Bar dataKey="sales" fill="#0d6efd" name="Sales ($)" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SalesChart;