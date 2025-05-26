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
  Typography
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
      const response = await api.get('/api/rules');
      setRules(response.data);
    } catch (err) {
      setError('Failed to load rules');
      console.error('Error fetching rules:', err);
    }
  };

  const handleOpen = (rule?: Rule) => {
    setEditingRule(rule || {
      _id: '',
      number: rules.length + 1,
      name: '',
      description: '',
      active: true
    });
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRule(null);
  };

  const handleSave = async () => {
    if (!editingRule) return;

    try {
      if (editingRule._id) {
        await api.put(`/api/rules/${editingRule._id}`, editingRule);
      } else {
        await api.post('/api/rules', editingRule);
      }
      fetchRules();
      handleClose();
    } catch (err) {
      setError('Failed to save rule');
      console.error('Error saving rule:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/rules/${id}`);
      fetchRules();
    } catch (err) {
      setError('Failed to delete rule');
      console.error('Error deleting rule:', err);
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