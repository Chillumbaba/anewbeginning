import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, CircularProgress, Tabs, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Select, MenuItem, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import api from '../services/api';

interface RuleProgress {
  ruleNumber: number;
  ruleName: string;
  completionRate: number;
  totalTicks: number;
}

interface StatisticsData {
  totalRules: number;
  totalDays: number;
  completionRate: number;
  streakCount: number;
  period: string;
  ruleProgress: RuleProgress[];
  totalTicks: number;
  totalPossibleTicks: number;
}

const periods = [
  { label: 'Last Week', value: '1week' },
  { label: '1 Month', value: '1month' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: '1 Year', value: '1year' },
  { label: 'Forever', value: 'forever' }
];

const Statistics: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery('(max-width:768px)');
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState(5); // Default to 'Forever'

  useEffect(() => {
    fetchStatistics(periods[selectedPeriod].value);
  }, [selectedPeriod]);

  const fetchStatistics = async (period: string) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/statistics?period=${period}`);
      setStats(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (event: any) => {
    const newValue = isMobile ? event.target.value : event;
    setSelectedPeriod(typeof newValue === 'number' ? newValue : parseInt(newValue));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (!stats) {
    return (
      <Box sx={{ padding: 3 }}>
        <Typography>No statistics available</Typography>
      </Box>
    );
  }

  const statCards = [
    { title: 'Total Rules', value: stats.totalRules, color: theme.palette.custom.lightBlue },
    { title: 'Days Tracked', value: stats.totalDays, color: theme.palette.custom.beige },
    { 
      title: 'Overall Completion', 
      value: `${Math.round(stats.completionRate)}%`,
      subtext: `${stats.totalTicks}/${stats.totalPossibleTicks}`,
      color: theme.palette.custom.orange 
    },
    { title: 'Current Streak', value: stats.streakCount, color: theme.palette.custom.purple }
  ];

  // Sort the rules by completion rate in descending order
  const sortedRules = [...stats.ruleProgress].sort((a, b) => b.completionRate - a.completionRate);

  return (
    <Box sx={{ p: 2, maxWidth: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        mb: 2,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 2 : 0
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          letterSpacing: '-0.02em',
          fontSize: isMobile ? '1.25rem' : '1.5rem'
        }}>
          Your Progress
        </Typography>
        {isMobile ? (
          <Select
            value={selectedPeriod}
            onChange={handlePeriodChange}
            sx={{
              width: '100%',
              backgroundColor: theme.palette.custom.beige,
              '.MuiOutlinedInput-notchedOutline': { border: 'none' },
              borderRadius: 2,
              '& .MuiSelect-select': {
                py: 1.5,
                fontWeight: 600,
              }
            }}
          >
            {periods.map((period, index) => (
              <MenuItem 
                key={period.value} 
                value={index}
                sx={{
                  fontWeight: selectedPeriod === index ? 700 : 400,
                }}
              >
                {period.label}
              </MenuItem>
            ))}
          </Select>
        ) : (
          <Tabs 
            value={selectedPeriod} 
            onChange={(_event, value) => handlePeriodChange(value)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              minHeight: 'unset',
              '& .MuiTabs-indicator': {
                height: 3,
                backgroundColor: theme.palette.custom.orange,
              },
              '& .MuiTab-root': {
                minHeight: 'unset',
                py: 1,
                px: 2,
              }
            }}
          >
            {periods.map((period, index) => (
              <Tab 
                key={period.value} 
                label={period.label}
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: selectedPeriod === index ? 700 : 400,
                }}
              />
            ))}
          </Tabs>
        )}
      </Box>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {statCards.map((card, index) => (
          <Grid item xs={6} sm={3} key={card.title}>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: card.color,
                color: '#000000',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                {card.title}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>
                {card.value}
              </Typography>
              {card.subtext && (
                <Typography variant="caption" sx={{ mt: 0.5, opacity: 0.7 }}>
                  {card.subtext}
                </Typography>
              )}
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 2, backgroundColor: theme.palette.custom.beige }}>
        <Typography variant="subtitle1" sx={{ 
          mb: 2,
          fontWeight: 700,
          letterSpacing: '-0.01em'
        }}>
          Rule Progress
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem', borderBottom: 'none' }}>Rule</TableCell>
                <TableCell sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem', borderBottom: 'none' }}>Progress</TableCell>
                <TableCell align="right" sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem', borderBottom: 'none' }}>Rate</TableCell>
                <TableCell align="right" sx={{ py: 1, fontWeight: 600, fontSize: '0.75rem', borderBottom: 'none' }}>Days</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedRules.map((rule) => (
                <TableRow key={rule.ruleNumber}>
                  <TableCell sx={{ py: 1, fontSize: '0.75rem', borderBottom: 'none' }}>{rule.ruleName}</TableCell>
                  <TableCell sx={{ py: 1, width: '40%', borderBottom: 'none' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ width: '100%', mr: 1 }}>
                        <LinearProgress 
                          variant="determinate" 
                          value={rule.completionRate} 
                          sx={{ 
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: theme.palette.custom.beige,
                            '& .MuiLinearProgress-bar': {
                              backgroundColor: theme.palette.custom.orange,
                              borderRadius: 3,
                            }
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 30 }}>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {`${Math.round(rule.completionRate)}%`}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ py: 1, fontSize: '0.75rem', borderBottom: 'none' }}>{`${Math.round(rule.completionRate)}%`}</TableCell>
                  <TableCell align="right" sx={{ py: 1, fontSize: '0.75rem', borderBottom: 'none' }}>{rule.totalTicks}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default Statistics; 