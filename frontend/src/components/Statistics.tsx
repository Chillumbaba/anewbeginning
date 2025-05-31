import React, { useEffect, useState } from 'react';
import { 
  Paper, 
  Typography, 
  Grid, 
  CircularProgress, 
  Box,
  Tooltip
} from '@mui/material';
import api from '../services/api';

interface Rule {
  _id: string;
  number: number;
  name: string;
  description?: string;
  active: boolean;
}

interface GridCell {
  date: string;
  rule: number;
  status: 'blank' | 'tick' | 'cross';
}

const Statistics: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [gridData, setGridData] = useState<GridCell[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rulesResponse, gridDataResponse] = await Promise.all([
        api.get('/api/rules'),
        api.get('/api/grid-data')
      ]);
      
      const activeRules = rulesResponse.data.filter((rule: Rule) => rule.active);
      setRules(activeRules);
      setGridData(gridDataResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    }
  };

  const calculateRulePerformance = (ruleNumber: number): number => {
    const ruleData = gridData.filter(cell => cell.rule === ruleNumber);
    if (ruleData.length === 0) return 0;

    const ticks = ruleData.filter(cell => cell.status === 'tick').length;
    return Math.round((ticks / ruleData.length) * 100);
  };

  const calculateOverallPerformance = (): number => {
    if (gridData.length === 0) return 0;
    
    const ticks = gridData.filter(cell => cell.status === 'tick').length;
    return Math.round((ticks / gridData.length) * 100);
  };

  const PerformanceDial: React.FC<{ value: number; title: string; description?: string }> = ({ 
    value, 
    title,
    description 
  }) => {
    const color = value >= 80 ? 'success' : value >= 50 ? 'warning' : 'error';
    
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 2 
      }}>
        <Tooltip title={description || ''} arrow>
          <Typography variant="subtitle1" gutterBottom align="center" sx={{ minHeight: '48px' }}>
            {title}
          </Typography>
        </Tooltip>
        <Box sx={{ position: 'relative', display: 'inline-flex' }}>
          <CircularProgress
            variant="determinate"
            value={value}
            size={80}
            color={color}
          />
          <Box sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Typography variant="caption" component="div" color="text.secondary">
              {`${value}%`}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  if (error) {
    return (
      <Typography color="error" align="center">
        {error}
      </Typography>
    );
  }

  const overallPerformance = calculateOverallPerformance();

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom align="center" sx={{ mb: 4 }}>
        Performance Statistics
      </Typography>

      {/* Overall Performance */}
      <Box sx={{ mb: 4 }}>
        <PerformanceDial
          value={overallPerformance}
          title="Overall Performance"
          description="Average performance across all active rules"
        />
      </Box>

      {/* Individual Rule Performance */}
      <Grid container spacing={3} justifyContent="center">
        {rules.map(rule => (
          <Grid item xs={12} sm={6} md={4} key={rule._id}>
            <PerformanceDial
              value={calculateRulePerformance(rule.number)}
              title={rule.name}
              description={rule.description}
            />
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default Statistics; 