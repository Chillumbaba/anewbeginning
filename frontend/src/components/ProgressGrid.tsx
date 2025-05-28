import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography, Box, Tooltip } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import api from '../services/api';

interface GridCell {
  date: string;
  rule: number;
  status: 'blank' | 'tick' | 'cross';
}

interface Rule {
  _id: string;
  number: number;
  name: string;
  description?: string;
  active: boolean;
}

const ProgressGrid: React.FC = () => {
  const [gridData, setGridData] = useState<GridCell[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }));
    }
    return dates;
  };

  const dates = getDates();

  useEffect(() => {
    fetchGridData();
    fetchRules();
  }, []);

  const fetchGridData = async () => {
    try {
      console.log('Fetching grid data...');
      const response = await api.get('/api/grid-data');
      console.log('Grid data received:', response.data);
      setGridData(response.data);
    } catch (error) {
      console.error('Error fetching grid data:', error);
      setError('Failed to load grid data');
    }
  };

  const fetchRules = async () => {
    try {
      const response = await api.get('/api/rules');
      const activeRules = response.data.filter((rule: Rule) => rule.active);
      setRules(activeRules);
    } catch (error) {
      console.error('Error fetching rules:', error);
      setError('Failed to load rules');
    }
  };

  const getCellStatus = (date: string, rule: number): 'blank' | 'tick' | 'cross' => {
    const cell = gridData.find(item => item.date === date && item.rule === rule);
    return cell ? cell.status : 'blank';
  };

  const handleCellClick = async (date: string, rule: number) => {
    try {
      const currentStatus = getCellStatus(date, rule);
      let newStatus: 'blank' | 'tick' | 'cross';

      if (currentStatus === 'blank') {
        newStatus = 'tick';
      } else if (currentStatus === 'tick') {
        newStatus = 'cross';
      } else {
        newStatus = 'tick';
      }

      console.log(`Updating cell (${date}, ${rule}) from ${currentStatus} to ${newStatus}`);
      
      const response = await api.post('/api/grid-data', {
        date,
        rule,
        status: newStatus
      });
      
      console.log('Update response:', response.data);
      await fetchGridData();
    } catch (error) {
      console.error('Error updating cell:', error);
      setError('Failed to update cell');
    }
  };

  const renderCell = (date: string, rule: number) => {
    const status = getCellStatus(date, rule);
    return (
      <Paper
        elevation={1}
        sx={{
          width: '30px',
          height: '30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#f5f5f5' },
          padding: 0,
          margin: 0
        }}
        onClick={() => handleCellClick(date, rule)}
      >
        {status === 'tick' && <CheckIcon sx={{ fontSize: 18 }} color="success" />}
        {status === 'cross' && <CloseIcon sx={{ fontSize: 18 }} color="error" />}
      </Paper>
    );
  };

  return (
    <Box sx={{ padding: '10px', maxWidth: 'fit-content', margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>Progress Grid</Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      
      <Box sx={{ display: 'grid', gridTemplateColumns: `80px repeat(${rules.length}, 30px)`, gap: '4px' }}>
        {/* Header row with rule names */}
        <Box sx={{ gridColumn: '1', height: '40px' }}></Box>
        {rules.map(rule => (
          <Box key={rule.number}>
            <Tooltip title={rule.description || ''} placement="top">
              <Typography
                sx={{
                  writingMode: 'vertical-rl',
                  transform: 'rotate(180deg)',
                  height: '40px',
                  fontSize: '0.75rem',
                  textAlign: 'center',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {rule.name}
              </Typography>
            </Tooltip>
          </Box>
        ))}

        {/* Date rows with cells */}
        {dates.map((date, index) => (
          <React.Fragment key={date}>
            <Box sx={{ 
              gridColumn: '1',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              {index === 0 ? 'Today' : index === 1 ? 'Yesterday' : date}
            </Box>
            {rules.map(rule => (
              <Box key={`${date}-${rule.number}`}>
                {renderCell(date, rule.number)}
              </Box>
            ))}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
};

export default ProgressGrid; 