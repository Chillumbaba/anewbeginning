import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Tooltip, IconButton } from '@mui/material';
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

const ProgressGrid = () => {
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
      <IconButton
        size="small"
        onClick={() => handleCellClick(date, rule)}
        sx={{
          width: '40px',
          height: '40px',
          padding: 0,
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          '&:hover': { 
            backgroundColor: '#e9ecef',
            borderColor: '#ced4da'
          }
        }}
      >
        {status === 'tick' && <CheckIcon fontSize="small" color="success" />}
        {status === 'cross' && <CloseIcon fontSize="small" color="error" />}
      </IconButton>
    );
  };

  const renderRuleHeader = (rule: Rule) => {
    const typographyStyles = {
      writingMode: 'vertical-rl',
      transform: 'rotate(180deg)',
      height: '60px',
      fontSize: '0.75rem',
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: rule.description ? 'help' : 'default',
      padding: '4px'
    };

    if (rule.description) {
      return (
        <Tooltip arrow title={rule.description} placement="top">
          <Box component="div" sx={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            height: '100%'
          }}>
            <Typography sx={typographyStyles}>
              {rule.name}
            </Typography>
          </Box>
        </Tooltip>
      );
    }

    return (
      <Box sx={{
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '4px',
        height: '100%'
      }}>
        <Typography sx={typographyStyles}>
          {rule.name}
        </Typography>
      </Box>
    );
  };

  return (
    <Paper elevation={2} sx={{ padding: '20px', maxWidth: 'fit-content', margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom sx={{ textAlign: 'center', color: '#2c3e50', marginBottom: '20px' }}>
        Progress Grid
      </Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: `100px repeat(${rules.length}, 40px)`, 
        gap: '8px',
        backgroundColor: '#ffffff',
        padding: '16px',
        borderRadius: '8px'
      }}>
        {/* Header row with rule names */}
        <Box sx={{ gridColumn: '1', height: '60px' }} />
        {rules.map(rule => (
          <Box key={rule.number} sx={{ height: '60px' }}>
            {renderRuleHeader(rule)}
          </Box>
        ))}

        {/* Date rows with cells */}
        {dates.map((date, index) => (
          <React.Fragment key={date}>
            <Box sx={{ 
              gridColumn: '1',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              padding: '8px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontWeight: index === 0 ? 'bold' : 'normal',
              color: '#2c3e50'
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
    </Paper>
  );
};

export default ProgressGrid; 