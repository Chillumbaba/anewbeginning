import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Switch,
  FormControlLabel,
  Box,
  useTheme
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../services/api';

interface Rule {
  _id: string;
  number: number;
  name: string;
  description?: string;
  active: boolean;
}

interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
}

const Rules: React.FC = () => {
  const theme = useTheme();
  const [rules, setRules] = useState<Rule[]>([]);
  const [open, setOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      console.log('Fetching rules...');
      const response = await api.get('/api/rules');
      console.log('Rules fetched:', response.data);
      setRules(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching rules:', err);
      setError('Failed to load rules');
    }
  };

  const handleOpen = (rule?: Rule) => {
    setError(null);
    const newRule = rule || {
      _id: '',
      number: Math.max(0, ...rules.map(r => r.number)) + 1,
      name: '',
      description: '',
      active: true
    };
    console.log('Opening dialog with rule:', newRule);
    setEditingRule(newRule);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRule(null);
    setError(null);
  };

  const handleSave = async () => {
    if (!editingRule) return;

    try {
      if (!editingRule.name.trim()) {
        throw new Error('Name is required');
      }

      console.log('Saving rule:', editingRule);
      
      if (editingRule._id) {
        console.log('Updating existing rule...');
        const response = await api.put(`/api/rules/${editingRule._id}`, editingRule);
        console.log('Update response:', response.data);
      } else {
        console.log('Creating new rule...');
        // Remove the _id field for new rules
        const { _id, ...newRule } = editingRule;
        const response = await api.post('/api/rules', newRule);
        console.log('Create response:', response.data);
      }
      
      setError(null);
      await fetchRules();
      handleClose();
    } catch (err) {
      console.error('Error saving rule:', err);
      let errorMessage = 'Failed to save rule';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object') {
        const apiError = err as ApiError;
        if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        }
        console.error('API Error Status:', apiError.response?.status);
        console.error('API Error Data:', apiError.response?.data);
      }
      
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting rule:', id);
      await api.delete(`/api/rules/${id}`);
      setError(null);
      await fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('Failed to delete rule');
    }
  };

  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      width: '100%',
      p: 2,
      gap: 2
    }}>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        maxWidth: '1000px'
      }}>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em' }}>
          Rules Configuration
        </Typography>
        <Button
          variant="contained"
          onClick={() => handleOpen()}
          sx={{
            backgroundColor: theme.palette.custom.orange,
            color: '#000000',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: '#D66A2C',
            }
          }}
        >
          Add New Rule
        </Button>
      </Box>

      {error && (
        <Typography color="error" sx={{ width: '100%', maxWidth: '1000px', mb: 1 }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper} sx={{
        width: '100%',
        maxWidth: '1000px',
        backgroundColor: theme.palette.custom.beige,
        borderRadius: 2,
        overflow: 'hidden',
        boxShadow: 'none'
      }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{
                backgroundColor: theme.palette.custom.purple,
                color: '#000000',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>Number</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.custom.purple,
                color: '#000000',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>Name</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.custom.purple,
                color: '#000000',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>Description</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.custom.purple,
                color: '#000000',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>Status</TableCell>
              <TableCell sx={{
                backgroundColor: theme.palette.custom.purple,
                color: '#000000',
                fontWeight: 600,
                fontSize: '0.875rem'
              }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule, index) => (
              <TableRow 
                key={rule._id}
                sx={{
                  backgroundColor: 'white',
                  '&:hover': {
                    backgroundColor: theme.palette.custom.beige,
                  }
                }}
              >
                <TableCell sx={{ fontSize: '0.875rem' }}>{rule.number}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem', fontWeight: 500 }}>{rule.name}</TableCell>
                <TableCell sx={{ fontSize: '0.875rem' }}>{rule.description}</TableCell>
                <TableCell>
                  <Box sx={{
                    backgroundColor: rule.active ? '#C8E6C9' : '#FFCDD2',
                    color: rule.active ? '#388E3C' : '#D32F2F',
                    borderRadius: '12px',
                    px: 2,
                    py: 0.5,
                    display: 'inline-block',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}>
                    {rule.active ? 'Active' : 'Inactive'}
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleOpen(rule)} 
                    size="small"
                    sx={{ 
                      color: theme.palette.custom.orange,
                      '&:hover': { backgroundColor: 'rgba(232, 124, 62, 0.1)' }
                    }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(rule._id)} 
                    size="small"
                    sx={{ 
                      color: '#D32F2F',
                      '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' }
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={open} 
        onClose={handleClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme.palette.custom.beige
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          letterSpacing: '-0.02em',
          backgroundColor: theme.palette.custom.purple,
          color: '#000000'
        }}>
          {editingRule?._id ? 'Edit Rule' : 'Add New Rule'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="Number"
            type="number"
            fullWidth
            value={editingRule?.number || ''}
            onChange={(e) => setEditingRule(prev => prev ? {...prev, number: parseInt(e.target.value)} : null)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            required
            value={editingRule?.name || ''}
            onChange={(e) => setEditingRule(prev => prev ? {...prev, name: e.target.value} : null)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            type="text"
            fullWidth
            multiline
            rows={2}
            value={editingRule?.description || ''}
            onChange={(e) => setEditingRule(prev => prev ? {...prev, description: e.target.value} : null)}
            sx={{ mb: 2 }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={editingRule?.active || false}
                onChange={(e) => setEditingRule(prev => prev ? {...prev, active: e.target.checked} : null)}
                color="primary"
              />
            }
            label="Active"
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, backgroundColor: theme.palette.custom.beige }}>
          <Button 
            onClick={handleClose}
            sx={{ 
              color: '#000000',
              '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.1)' }
            }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            sx={{
              backgroundColor: theme.palette.custom.orange,
              color: '#000000',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#D66A2C',
              }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Rules; 