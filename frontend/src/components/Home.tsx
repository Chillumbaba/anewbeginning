import React, { useState, useEffect } from 'react';
import { Button, Typography, Paper, Box, Alert, CircularProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Input } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import api from '../services/api';

interface Text {
  _id: string;
  content: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const theme = useTheme();
  const [inputText, setInputText] = useState('');
  const [texts, setTexts] = useState<Text[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [actionType, setActionType] = useState<'reset' | 'clear'>('reset');

  useEffect(() => {
    fetchTexts();
  }, []);

  const fetchTexts = async () => {
    try {
      const response = await api.get('/api/texts');
      setTexts(response.data);
    } catch (err) {
      setError('Failed to load texts');
      console.error('Error fetching texts:', err);
    }
  };

  const handleOpenDialog = (type: 'reset' | 'clear') => {
    setActionType(type);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleReset = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/api/test-db/reset');
      setSuccess('Database reset successful');
    } catch (err) {
      setError('Failed to reset database');
      console.error('Error resetting database:', err);
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const handleClearGrid = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.delete('/api/grid-data/clear-all');
      setSuccess('Grid data cleared successfully');
    } catch (err) {
      setError('Failed to clear grid data');
      console.error('Error clearing grid data:', err);
    } finally {
      setLoading(false);
      handleCloseDialog();
    }
  };

  const handleConfirm = () => {
    if (actionType === 'reset') {
      handleReset();
    } else {
      handleClearGrid();
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    try {
      await api.post('/api/texts', { content: inputText });
      setInputText('');
      fetchTexts();
    } catch (err) {
      setError('Failed to save text');
      console.error('Error saving text:', err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const csvData = e.target?.result;
        if (typeof csvData === 'string') {
          try {
            // Send the raw CSV data as text
            const response = await api.post('/api/grid-data/upload-csv', csvData, {
              headers: {
                'Content-Type': 'text/csv'
              },
              transformRequest: [(data) => data], // Prevent axios from trying to transform the data
            });
            setSuccess(`CSV data imported successfully: ${response.data.count} records imported`);
            
            // Clear the file input
            if (event.target) {
              event.target.value = '';
            }
          } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Failed to import CSV data';
            setError(errorMessage);
            console.error('Error importing CSV:', err);
          } finally {
            setLoading(false);
          }
        }
      };

      reader.onerror = () => {
        setError('Failed to read CSV file');
        setLoading(false);
      };

      reader.readAsText(file);
    } catch (err) {
      setError('Failed to read CSV file');
      console.error('Error reading file:', err);
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, backgroundColor: theme.palette.custom.lightBlue }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#000000', fontWeight: 600 }}>
          Database Administration
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3, color: '#000000' }}>
          Use these controls to manage the database. Please be careful as these actions cannot be undone.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog('reset')}
              disabled={loading}
              sx={{
                backgroundColor: theme.palette.custom.orange,
                color: '#000000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: theme.palette.custom.orange,
                  opacity: 0.9,
                },
              }}
            >
              {loading && actionType === 'reset' ? <CircularProgress size={24} /> : 'Reset All Data'}
            </Button>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Resets all data in the database (grid data, rules, and texts)
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              onClick={() => handleOpenDialog('clear')}
              disabled={loading}
              sx={{
                backgroundColor: theme.palette.custom.purple,
                color: '#000000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: theme.palette.custom.purple,
                  opacity: 0.9,
                },
              }}
            >
              {loading && actionType === 'clear' ? <CircularProgress size={24} /> : 'Clear Grid Data'}
            </Button>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Removes all ticks and crosses from the grid
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<CloudUploadIcon />}
              disabled={loading}
              sx={{
                backgroundColor: theme.palette.custom.beige,
                color: '#000000',
                fontWeight: 600,
                '&:hover': {
                  backgroundColor: theme.palette.custom.beige,
                  opacity: 0.9,
                },
              }}
            >
              Upload Grid Data CSV
              <input
                type="file"
                accept=".csv"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Import grid data from a CSV file (will replace existing data)
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            backgroundColor: theme.palette.custom.beige,
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.custom.orange,
          color: '#000000',
          fontWeight: 600 
        }}>
          Confirm Action
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <DialogContentText>
            {actionType === 'reset' 
              ? 'Are you sure you want to reset all data? This will delete all grid data, rules, and texts.'
              : 'Are you sure you want to clear all grid data? This will remove all ticks and crosses from the grid.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button 
            onClick={handleCloseDialog}
            sx={{ color: '#666' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            sx={{
              backgroundColor: actionType === 'reset' ? theme.palette.custom.orange : theme.palette.custom.purple,
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: actionType === 'reset' ? theme.palette.custom.orange : theme.palette.custom.purple,
                opacity: 0.9,
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter your text..."
          style={{
            padding: '10px',
            fontSize: '16px',
            width: '70%',
            marginRight: '10px'
          }}
        />
        <button
          onClick={handleSubmit}
          style={{
            padding: '10px 20px',
            fontSize: '16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Submit
        </button>
      </div>

      <div>
        <h2>Previous Entries</h2>
        {texts.length === 0 ? (
          <p>No entries yet. Add your first text!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {texts.map((text) => (
              <li
                key={text._id}
                style={{
                  padding: '10px',
                  margin: '5px 0',
                  backgroundColor: '#f5f5f5',
                  borderRadius: '4px'
                }}
              >
                <div>{text.content}</div>
                <small style={{ color: '#666' }}>
                  {new Date(text.createdAt).toLocaleString()}
                </small>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Box>
  );
};

export default Home; 