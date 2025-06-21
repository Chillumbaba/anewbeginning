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
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  CardActions
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
  const isMobile = useMediaQuery('(max-width:768px)');
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
      const response = await api.get('/rules');
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
    console.log('Current rules:', rules);
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
        const response = await api.put(`/rules/${editingRule._id}`, editingRule);
        console.log('Update response:', response.data);
      } else {
        console.log('Creating new rule...');
        const { _id, ...newRule } = editingRule;
        const response = await api.post('/rules', newRule);
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
      }
      
      setError(errorMessage);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting rule:', id);
      await api.delete(`/rules/${id}`);
      setError(null);
      await fetchRules();
    } catch (err) {
      console.error('Error deleting rule:', err);
      setError('Failed to delete rule');
    }
  };

  const renderMobileView = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {rules.map((rule) => (
        <Card 
          key={rule._id}
          sx={{ 
            backgroundColor: 'white',
            borderRadius: 2,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ pb: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                {rule.name}
              </Typography>
              <Box sx={{
                backgroundColor: rule.active ? '#C8E6C9' : '#FFCDD2',
                color: rule.active ? '#388E3C' : '#D32F2F',
                borderRadius: '12px',
                px: 2,
                py: 0.5,
                fontSize: '0.75rem',
                fontWeight: 600
              }}>
                {rule.active ? 'Active' : 'Inactive'}
              </Box>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Rule #{rule.number}
            </Typography>
            {rule.description && (
              <Typography variant="body2" color="text.secondary">
                {rule.description}
              </Typography>
            )}
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
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
          </CardActions>
        </Card>
      ))}
    </Box>
  );

  const renderDesktopView = () => (
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
          {rules.map((rule) => (
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
  );

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
        maxWidth: '1000px',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h5" sx={{ 
          fontWeight: 700, 
          letterSpacing: '-0.02em',
          fontSize: isMobile ? '1.25rem' : '1.5rem'
        }}>
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

      {isMobile ? renderMobileView() : renderDesktopView()}

      <Dialog 
        open={open} 
        onClose={handleClose}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            backgroundColor: theme.palette.custom.beige,
            margin: isMobile ? 0 : 2,
            width: isMobile ? '100%' : 'auto',
            maxHeight: isMobile ? '100%' : '90vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 700, 
          letterSpacing: '-0.02em',
          backgroundColor: theme.palette.custom.purple,
          color: '#000000',
          fontSize: isMobile ? '1.25rem' : '1.5rem'
        }}>
          {editingRule?._id ? 'Edit Rule' : 'Add New Rule'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2, p: isMobile ? 2 : 3 }}>
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
        <DialogActions sx={{ p: isMobile ? 2 : 3, backgroundColor: theme.palette.custom.beige }}>
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