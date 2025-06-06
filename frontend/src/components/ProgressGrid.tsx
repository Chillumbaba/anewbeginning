import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Tooltip, IconButton } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
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
  const theme = useTheme();
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
          width: '36px',
          height: '36px',
          padding: 0,
          backgroundColor: status === 'tick' 
            ? '#C8E6C9' // More subtle green for ticks
            : status === 'cross'
            ? '#FFCDD2' // More subtle red for crosses
            : theme.palette.custom.lightBlue, // Default color
          border: 'none',
          borderRadius: '4px',
          '&:hover': { 
            backgroundColor: status === 'tick'
              ? '#A5D6A7' // Darker but still subtle green on hover
              : status === 'cross'
              ? '#EF9A9A' // Darker but still subtle red on hover
              : theme.palette.custom.beige, // Default hover
          },
          '& .MuiSvgIcon-root': {
            fontSize: '1rem',
          }
        }}
      >
        {status === 'tick' && <CheckIcon fontSize="small" sx={{ color: '#388E3C' }} />}
        {status === 'cross' && <CloseIcon fontSize="small" sx={{ color: '#D32F2F' }} />}
      </IconButton>
    );
  };

  const renderRuleHeader = (rule: Rule) => {
    const typographyStyles = {
      writingMode: 'vertical-rl',
      transform: 'rotate(180deg)',
      height: '120px',
      fontSize: '0.875rem',
      fontWeight: 600,
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: rule.description ? 'help' : 'default',
      padding: '8px 4px',
      color: '#FFFFFF',
    };

    const boxStyles = {
      backgroundColor: '#000000',
      border: 'none',
      borderRadius: '4px',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '48px',
    };

    if (rule.description) {
      return (
        <Tooltip arrow title={rule.description} placement="top">
          <Box component="div" sx={boxStyles}>
            <Typography sx={typographyStyles}>
              {rule.name}
            </Typography>
          </Box>
        </Tooltip>
      );
    }

    return (
      <Box sx={boxStyles}>
        <Typography sx={typographyStyles}>
          {rule.name}
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      mt: 0,
      p: 0
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        width: '100%',
        justifyContent: 'center'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          Progress Grid
        </Typography>
      </Box>
      
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      
      <Paper elevation={0} sx={{ 
        p: 1,
        backgroundColor: theme.palette.custom.beige,
        overflowX: 'auto',
        width: 'fit-content'
      }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: `100px repeat(${rules.length}, 48px)`,
          gap: '8px',
          minWidth: 'fit-content'
        }}>
          {/* Header row with rule names */}
          <Box sx={{ 
            gridColumn: '1', 
            height: '120px',
            backgroundColor: '#000000',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Typography sx={{ 
              color: '#FFFFFF',
              fontSize: '0.875rem',
              fontWeight: 600
            }}>
              Date
            </Typography>
          </Box>
          {rules.map(rule => (
            <Box key={rule.number} sx={{ height: '120px' }}>
              {renderRuleHeader(rule)}
            </Box>
          ))}

          {/* Date rows with cells */}
          {dates.map((date, index) => (
            <React.Fragment key={date}>
              <Box sx={{ 
                gridColumn: '1',
                fontSize: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                padding: '4px 8px',
                backgroundColor: '#000000',
                border: 'none',
                borderRadius: '4px',
                fontWeight: index === 0 ? 700 : 400,
                color: '#FFFFFF',
                height: '36px'
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
    </Box>
  );
};

export default ProgressGrid; 