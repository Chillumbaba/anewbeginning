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
  FormControlLabel
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
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <Typography variant="h5">Rules Configuration</Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add New Rule
        </Button>
      </div>

      {error && (
        <Typography color="error" style={{ marginBottom: '10px' }}>
          {error}
        </Typography>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Number</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule._id}>
                <TableCell>{rule.number}</TableCell>
                <TableCell>{rule.name}</TableCell>
                <TableCell>{rule.description}</TableCell>
                <TableCell>{rule.active ? 'Active' : 'Inactive'}</TableCell>
                <TableCell>
                  <IconButton onClick={() => handleOpen(rule)} size="small">
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(rule._id)} size="small">
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingRule?._id ? 'Edit Rule' : 'Add New Rule'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Number"
            type="number"
            fullWidth
            value={editingRule?.number || ''}
            onChange={(e) => setEditingRule(prev => prev ? {...prev, number: parseInt(e.target.value)} : null)}
          />
          <TextField
            margin="dense"
            label="Name"
            type="text"
            fullWidth
            required
            value={editingRule?.name || ''}
            onChange={(e) => setEditingRule(prev => prev ? {...prev, name: e.target.value} : null)}
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
            style={{ marginTop: '10px' }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Rules; 