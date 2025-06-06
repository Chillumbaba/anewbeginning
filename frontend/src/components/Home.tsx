import React, { useState, useEffect } from 'react';
import { Button, Typography, Paper, Box, Alert, CircularProgress } from '@mui/material';
import api from '../services/api';

interface Text {
  _id: string;
  content: string;
  createdAt: string;
}

const Home: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [texts, setTexts] = useState<Text[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    }
  };

  const handlePopulate = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await api.post('/api/test-db/populate');
      setSuccess(`Test data populated successfully: ${JSON.stringify(response.data.summary)}`);
    } catch (err) {
      setError('Failed to populate test data');
      console.error('Error populating test data:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Paper sx={{ p: 3, backgroundColor: theme => theme.palette.custom.lightBlue }}>
        <Typography variant="h4" gutterBottom>
          Test Database Controls
        </Typography>
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Use these controls to manage test data in the database. Be careful as these actions cannot be undone.
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

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleReset}
            disabled={loading}
            sx={{
              backgroundColor: theme => theme.palette.custom.orange,
              '&:hover': {
                backgroundColor: theme => theme.palette.custom.orange,
                opacity: 0.9,
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Reset Database'}
          </Button>

          <Button
            variant="contained"
            onClick={handlePopulate}
            disabled={loading}
            sx={{
              backgroundColor: theme => theme.palette.custom.purple,
              '&:hover': {
                backgroundColor: theme => theme.palette.custom.purple,
                opacity: 0.9,
              },
            }}
          >
            {loading ? <CircularProgress size={24} /> : 'Populate Test Data'}
          </Button>
        </Box>
      </Paper>

      <div style={{ marginBottom: '20px' }}>
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