import React, { useState, useEffect } from 'react';
import { Button, Typography, Paper, Box, Alert, CircularProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
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

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
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