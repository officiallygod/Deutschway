import React from 'react';
import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatsModal = ({ xpEarned, chartData }) => {
  return (
    <div className="stats-modal glass">
      <div className="stats-header">
        <Trophy color="var(--ger-gold)" size={40} />
        <h2>Lektion<br/>abgeschlossen!</h2>
      </div>
      
      <div className="xp-badge">
        <span className="xp-amount">+{xpEarned}</span>
        <span className="xp-label">XP Verdient</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} 
              dy={10}
            />
            <Tooltip 
              cursor={{ fill: 'rgba(0,0,0,0.05)' }} 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
            />
            <Bar 
              dataKey="xp" 
              fill="var(--primary-accent)" 
              radius={[6, 6, 6, 6]} 
              barSize={24}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsModal;
