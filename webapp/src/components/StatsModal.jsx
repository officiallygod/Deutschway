import React from 'react';
import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatsModal = ({ xpEarned, chartData }) => {
  return (
    <div className="stats-modal glass">
      <h2>
        <Trophy color="var(--ger-gold)" size={48} style={{verticalAlign: 'middle', marginRight: '10px'}}/>
        Session Complete!
      </h2>
      
      <div className="xp-circle">
        <span className="xp-amount">+{xpEarned}</span>
        <span className="xp-label">XP Earned</span>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{fill: 'transparent'}} 
              contentStyle={{background: 'var(--card-bg)', borderRadius: '10px', border: 'none', color: 'var(--text-color)'}}
            />
            <Bar dataKey="xp" fill="var(--primary-accent)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StatsModal;
