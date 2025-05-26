import React, { useEffect, useState } from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

interface GridCell {
  date: string;
  rule: number;
  status: 'blank' | 'tick' | 'cross';
}

const ProgressGrid: React.FC = () => {
  const [gridData, setGridData] = useState<GridCell[]>([]);
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
  const rules = [1, 2, 3, 4];

  useEffect(() => {
    fetchGridData();
  }, []);

  const fetchGridData = async () => {
    try {
      console.log('Fetching grid data...');
      const response = await axios.get('http://localhost:3001/api/grid-data');
      console.log('Grid data received:', response.data);
      setGridData(response.data);
    } catch (error) {
      console.error('Error fetching grid data:', error);
      setError('Failed to load grid data');
    }
  };

  const getCellStatus = (date: string, rule: number): 'blank' | 'tick' | 'cross' => {
    const cell = gridData.find(item => item.date === date && item.rule === rule);
    console.log(`Cell status for date ${date}, rule ${rule}:`, cell?.status || 'blank');
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
      
      const response = await axios.post('http://localhost:3001/api/grid-data', {
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
          height: 35,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': { backgroundColor: '#f5f5f5' },
          margin: '2px'
        }}
        onClick={() => handleCellClick(date, rule)}
      >
        {status === 'tick' && <CheckIcon color="success" sx={{ fontSize: 20 }} />}
        {status === 'cross' && <CloseIcon color="error" sx={{ fontSize: 20 }} />}
      </Paper>
    );
  };

  return (
    <div style={{ padding: '10px', maxWidth: '800px', margin: '0 auto' }}>
      <Typography variant="h5" gutterBottom>Progress Grid</Typography>
      {error && (
        <Typography color="error" gutterBottom>
          {error}
        </Typography>
      )}
      <Grid container spacing={1}>
        <Grid item xs={2}></Grid>
        {rules.map(rule => (
          <Grid item xs={2.5} key={rule}>
            <Typography variant="subtitle1" align="center">Rule {rule}</Typography>
          </Grid>
        ))}

        {dates.map((date, index) => (
          <React.Fragment key={date}>
            <Grid item xs={2}>
              <Typography variant="body2" style={{ fontSize: '0.9rem' }}>
                {index === 0 ? 'Today' : index === 1 ? 'Yesterday' : date}
              </Typography>
            </Grid>
            {rules.map(rule => (
              <Grid item xs={2.5} key={`${date}-${rule}`}>
                {renderCell(date, rule)}
              </Grid>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </div>
  );
};

export default ProgressGrid; 