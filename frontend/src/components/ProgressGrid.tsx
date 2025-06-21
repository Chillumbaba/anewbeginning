import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Tooltip, IconButton, useMediaQuery, Button } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import DownloadIcon from '@mui/icons-material/Download';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';
import BenjaminFranklinImage from '../assets/benjamin-franklin.png';

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
  const isMobile = useMediaQuery('(max-width:768px)');
  const [gridData, setGridData] = useState<GridCell[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const getDates = () => {
    const dates = [];
    for (let i = 0; i < (isMobile ? 7 : 10); i++) {
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
      const response = await api.get('/grid-data');
      console.log('Grid data received:', response.data);
      setGridData(response.data);
    } catch (error) {
      console.error('Error fetching grid data:', error);
      setError('Failed to load grid data');
    }
  };

  const fetchRules = async () => {
    try {
      const response = await api.get('/rules');
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

  // Function to check if a date is a weekend
  const isWeekend = (dateStr: string): boolean => {
    // Parse the date string (format: DD/MM)
    const [day, month] = dateStr.split('/');
    const year = new Date().getFullYear();
    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    
    // Check if it's Saturday (6) or Sunday (0)
    return date.getDay() === 0 || date.getDay() === 6;
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
      
      const response = await api.post('/grid-data', {
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

  const handleDownloadCSV = async () => {
    try {
      const response = await api.get('/grid-data/export-csv', {
        responseType: 'blob', // Important for file downloads with axios
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'grid-data.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      setError('Failed to download CSV');
    }
  };

  const renderCell = (date: string, rule: number) => {
    const status = getCellStatus(date, rule);
    return (
      <IconButton
        size="small"
        onClick={() => handleCellClick(date, rule)}
        sx={{
          width: isMobile ? '28px' : '32px',
          height: isMobile ? '28px' : '32px',
          padding: 0,
          backgroundColor: status === 'tick' 
            ? '#C8E6C9'
            : status === 'cross'
            ? '#FFCDD2'
            : theme.palette.custom.lightBlue,
          border: 'none',
          borderRadius: 0,
          '&:hover': { 
            backgroundColor: status === 'tick'
              ? '#A5D6A7'
              : status === 'cross'
              ? '#EF9A9A'
              : theme.palette.custom.beige,
          },
          '& .MuiSvgIcon-root': {
            fontSize: isMobile ? '0.75rem' : '0.875rem',
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
      height: isMobile ? '90px' : '100px',
      fontSize: isMobile ? '0.675rem' : '0.75rem',
      fontWeight: 600,
      textAlign: 'center',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      cursor: rule.description ? 'help' : 'default',
      padding: isMobile ? '2px 1px' : '4px 2px',
      color: '#FFFFFF',
    };

    const boxStyles = {
      backgroundColor: '#000000',
      border: 'none',
      borderRadius: 0,
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: isMobile ? '36px' : '40px',
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
      gap: 2
    }}>
      <Paper elevation={0} sx={{ 
        backgroundColor: theme.palette.custom.beige,
        borderRadius: 2,
        minWidth: isMobile ? 'auto' : 'fit-content',
        p: 1
      }}>
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: `${isMobile ? '70px' : '80px'} repeat(${rules.length}, ${isMobile ? '36px' : '40px'})`,
          gap: isMobile ? '2px' : '4px',
          minWidth: 'fit-content'
        }}>
          {/* Header row with rule names */}
          <Box sx={{ 
            gridColumn: '1', 
            height: isMobile ? '100px' : '120px',
            backgroundColor: theme.palette.custom.orange,
            borderRadius: '4px',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box
              component="img"
              src={BenjaminFranklinImage}
              alt="Benjamin Franklin Portrait"
              sx={{
                width: '85%',
                height: '85%',
                objectFit: 'contain',
                filter: 'grayscale(100%) contrast(1000%) brightness(1000%)',
                mixBlendMode: 'darken'
              }}
            />
          </Box>
          {rules.map(rule => (
            <Box key={rule.number} sx={{ height: isMobile ? '100px' : '120px' }}>
              {renderRuleHeader(rule)}
            </Box>
          ))}

          {/* Date rows with cells */}
          {dates.map((date, index) => (
            <React.Fragment key={date}>
              <Box sx={{ 
                gridColumn: '1',
                fontSize: isMobile ? '0.625rem' : '0.675rem',
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '1px 2px' : '2px 4px',
                backgroundColor: isWeekend(date) ? '#2196F3' : '#000000',
                border: 'none',
                borderRadius: 0,
                fontWeight: index === 0 ? 700 : 400,
                color: '#FFFFFF',
                height: isMobile ? '28px' : '32px'
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