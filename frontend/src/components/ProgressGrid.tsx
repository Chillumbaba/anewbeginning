import React, { useEffect, useState } from 'react';
import { Paper, Typography, Box, Tooltip, IconButton, useMediaQuery, Button, Pagination, TextField } from '@mui/material';
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
  const daysPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  
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

  // Helper to format date for display (DD-MMM)
  const formatDisplayDate = (dateStr: string) => {
    const [day, month] = dateStr.split('/');
    const year = new Date().getFullYear();
    const date = new Date(year, parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  };

  // Helper to format date as DD/MM
  const formatValueDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
  };

  // Get all unique dates from gridData
  const allUniqueDates = Array.from(new Set(gridData.map(item => item.date)));

  // Find the oldest date in the data
  let dateRange: { value: string; display: string }[] = [];
  const today = new Date();
  // Find the oldest date in the data
  let oldest = new Date(today);
  if (allUniqueDates.length > 0) {
    allUniqueDates.forEach(dateStr => {
      const [d, m] = dateStr.split('/').map(Number);
      const dt = new Date(today.getFullYear(), m - 1, d);
      if (dt < oldest) oldest = dt;
    });
  }
  // Generate all days from today to oldest (inclusive)
  dateRange = [];
  let current = new Date(today);
  while (current >= oldest) {
    dateRange.push({
      value: formatValueDate(current),
      display: formatDisplayDate(formatValueDate(current))
    });
    current.setDate(current.getDate() - 1);
  }

  // Pagination logic
  const pageCount = Math.ceil(dateRange.length / daysPerPage);
  const paginatedDates = dateRange.slice((currentPage - 1) * daysPerPage, currentPage * daysPerPage);

  // Find the page containing a given date string (DD/MM)
  const findPageForDate = (dateStr: string) => {
    const idx = dateRange.findIndex(d => d.value === dateStr);
    if (idx === -1) return 1;
    return Math.floor(idx / daysPerPage) + 1;
  };

  // Handler for date input selection
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    setSelectedDate(dateValue);
    
    if (dateValue) {
      // Convert YYYY-MM-DD to DD/MM format
      const date = new Date(dateValue);
      const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
      
      console.log('Selected date:', dateValue);
      console.log('Converted to DD/MM:', dateStr);
      console.log('Available dates in range:', dateRange.map(d => d.value));
      
      const page = findPageForDate(dateStr);
      console.log('Found page:', page);
      
      setCurrentPage(page);
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
      <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'end' }}>
        <Button variant="contained" onClick={() => setCurrentPage(1)}>Today</Button>
        <TextField
          type="date"
          value={selectedDate}
          onChange={handleDateChange}
          variant="outlined"
          size="small"
          inputProps={{
            max: today.toISOString().split('T')[0]
          }}
          sx={{ minWidth: 150 }}
        />
      </Box>
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
          {paginatedDates.map((dateObj, index) => (
            <React.Fragment key={dateObj.value}>
              <Box sx={{ 
                gridColumn: '1',
                fontSize: isMobile ? '0.625rem' : '0.675rem',
                display: 'flex',
                alignItems: 'center',
                padding: isMobile ? '1px 2px' : '2px 4px',
                backgroundColor: isWeekend(dateObj.value) ? '#2196F3' : '#000000',
                border: 'none',
                borderRadius: 0,
                fontWeight: index === 0 ? 700 : 400,
                color: '#FFFFFF',
                height: isMobile ? '28px' : '32px'
              }}>
                {currentPage === 1 && index === 0 ? 'Today' : currentPage === 1 && index === 1 ? 'Yesterday' : dateObj.display}
              </Box>
              {rules.map(rule => (
                <Box key={`${dateObj.value}-${rule.number}`}>
                  {renderCell(dateObj.value, rule.number)}
                </Box>
              ))}
            </React.Fragment>
          ))}
        </Box>
      </Paper>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination
          count={pageCount}
          page={currentPage}
          onChange={(_, value) => setCurrentPage(value)}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default ProgressGrid; 