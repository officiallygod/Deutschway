import React from 'react';
import { Trophy } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardBody, Alert } from '@heroui/react';
import { motion } from 'framer-motion';

const StatsModal = ({ xpEarned, chartData }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-lg mx-auto flex items-center justify-center h-full p-4"
    >
      <Card className="w-full shadow-2xl" style={{ background: 'var(--card-bg)', border: '1px solid var(--card-border)' }}>
        <CardHeader className="flex flex-col items-center gap-4 pt-8 pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          >
            <Trophy color="var(--ger-gold)" size={64} />
          </motion.div>
          <Alert 
            color="success" 
            title="Lektion abgeschlossen!" 
            description={`Hervorragend! Du hast heute ${xpEarned} XP verdient.`}
            variant="flat"
            className="w-full mt-2"
          />
        </CardHeader>
        
        <CardBody className="pb-8">
          <div className="w-full h-64 mt-4">
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
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid var(--card-border)', 
                    background: 'var(--card-bg)',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                    color: 'var(--text-color)',
                    fontWeight: 600
                  }}
                  itemStyle={{ color: 'var(--primary-accent)' }}
                />
                <Bar 
                  dataKey="xp" 
                  fill="var(--primary-accent)" 
                  radius={[8, 8, 8, 8]} 
                  barSize={32}
                  animationDuration={1500}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

export default StatsModal;
