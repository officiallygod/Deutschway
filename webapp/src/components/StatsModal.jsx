import React from 'react';
import { Trophy } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Card, CardHeader, Alert } from '@heroui/react';
import { motion } from 'framer-motion';

const StatsModal = ({ xpEarned, chartData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto flex flex-col justify-center h-full p-4"
    >
      <Card className="w-full shadow-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <CardHeader className="flex flex-col items-center gap-4 pt-6 pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            className="p-3 rounded-full bg-primary/10"
          >
            <Trophy color="var(--ger-gold)" size={32} />
          </motion.div>
          <Alert 
            color="success" 
            title="Lektion abgeschlossen!" 
            description={`Hervorragend! Du hast heute ${xpEarned} XP verdient.`}
            variant="flat"
            className="w-full mt-2"
          />
        </CardHeader>
        
        <div className="flex flex-col pb-6 px-4">
          <h3 className="text-sm font-bold text-foreground/60 uppercase tracking-widest text-center mb-2">
            7-Tage-Statistik
          </h3>
          <div className="w-full h-48 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-accent)" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="var(--primary-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" opacity={0.6} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'var(--text-secondary)', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: 'var(--primary-accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid var(--card-border)', 
                    background: 'var(--card-bg)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    color: 'var(--text-color)',
                    fontWeight: 600,
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: 'var(--primary-accent)' }}
                />
                <Area 
                  type="monotone"
                  dataKey="xp" 
                  stroke="var(--primary-accent)" 
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorXp)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatsModal;
