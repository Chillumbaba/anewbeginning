import React, { useState } from 'react';
import { Button, Typography, Paper, Box, Alert, CircularProgress, useTheme, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';
import api from '../services/api';
import { useAuth } from './AuthProvider';

const DbAdmin: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(''); // To track which button is loading

  // Dialog state
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', text: '', onConfirm: () => {} });

  const handleAction = async (action: () => Promise<any>, successMessage: string, errorMessage: string, loadingKey: string) => {
    setLoading(loadingKey);
    setError(null);
    setSuccess(null);
    try {
      await action();
      setSuccess(successMessage);
    } catch (err: any) {
      setError(err.response?.data?.message || errorMessage);
      console.error(`${errorMessage}:`, err);
    } finally {
      setLoading('');
    }
  };

  const handleConfirmAction = (title: string, text: string, action: () => Promise<any>, successMessage: string, errorMessage: string, loadingKey: string) => {
    setDialogContent({
      title,
      text,
      onConfirm: () => {
        setOpenDialog(false);
        handleAction(action, successMessage, errorMessage, loadingKey);
      }
    });
    setOpenDialog(true);
  };
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, endpoint: string, loadingKey: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvData = e.target?.result;
      if (typeof csvData === 'string') {
        setLoading(loadingKey);
        setError(null);
        setSuccess(null);
        try {
          const response = await api.post(endpoint, csvData, {
            headers: { 'Content-Type': 'text/csv' },
            transformRequest: [(data) => data],
          });
          setSuccess(`CSV imported: ${response.data.count || 0} records processed.`);
        } catch (err: any) {
          setError(err.response?.data?.error || 'Failed to import CSV');
        } finally {
          setLoading('');
        }
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Clear file input
  };
  
  const handleDownload = async (endpoint: string, filename: string) => {
      try {
        const response = await api.get(endpoint, { responseType: 'blob' });
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        setError('Failed to download file.');
      }
  };

  const userActions = [
    { label: 'Download My Progress', action: () => handleDownload('/grid-data/export-csv', 'my-progress.csv'), loadingKey: 'download-my-progress' },
    { label: 'Upload My Progress', isUpload: true, endpoint: '/grid-data/upload-csv', loadingKey: 'upload-my-progress' },
    { label: 'Download My Rules', action: () => handleDownload('/rules/export-csv', 'my-rules.csv'), loadingKey: 'download-my-rules' },
    { label: 'Upload My Rules', isUpload: true, endpoint: '/rules/upload-csv', loadingKey: 'upload-my-rules' },
    { label: 'Clear My Progress', isConfirm: true, title: 'Clear My Progress?', text: 'This will delete all your grid data. This action cannot be undone.', action: () => api.delete('/grid-data/clear-all'), successMessage: 'Your progress has been cleared.', errorMessage: 'Failed to clear progress.', loadingKey: 'clear-my-progress' },
  ];

  const godModeActions = [
      { label: "Download All Progress", action: () => handleDownload('/admin/export-all-progress', 'all-progress.csv'), loadingKey: 'download-all-progress' },
      { label: "Upload All Progress", isUpload: true, endpoint: '/admin/upload-all-progress', loadingKey: 'upload-all-progress' },
      { label: "Download All Rules", action: () => handleDownload('/admin/export-all-rules', 'all-rules.csv'), loadingKey: 'download-all-rules' },
      { label: "Upload All Rules", isUpload: true, endpoint: '/admin/upload-all-rules', loadingKey: 'upload-all-rules' },
      { label: 'Clear All Progress Data', isConfirm: true, title: 'Clear ALL Progress Data?', text: 'This will delete all grid data for EVERY user. This cannot be undone.', action: () => api.delete('/admin/clear-all-grid-data'), successMessage: 'All progress data has been cleared.', errorMessage: 'Failed to clear all progress.', loadingKey: 'clear-all-progress' },
  ];

  const renderButtons = (actions: any[]) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {actions.map(({ label, action, isUpload, isConfirm, endpoint, loadingKey, title, text, successMessage, errorMessage }) => {
            const isGodModeUploadRules = loadingKey.includes('upload-all-rules');
            return (
                <Box key={loadingKey} sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    {isUpload ? (
                        <Button component="label" variant="contained" disabled={!!loading || isGodModeUploadRules} title={isGodModeUploadRules ? 'This feature is not yet implemented' : ''}>
                            {loading === loadingKey ? <CircularProgress size={24} /> : label}
                            <input type="file" accept=".csv" hidden onChange={(e) => handleFileUpload(e, endpoint!, loadingKey)} disabled={isGodModeUploadRules} />
                        </Button>
                    ) : (
                        <Button variant="contained" onClick={() => isConfirm ? handleConfirmAction(title!, text!, action, successMessage!, errorMessage!, loadingKey) : action()} disabled={!!loading}>
                            {loading === loadingKey ? <CircularProgress size={24} /> : label}
                        </Button>
                    )}
                </Box>
            )
        })}
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Administer My Data</Typography>
        {renderButtons(userActions)}
      </Paper>

      {user?.isAdmin && (
          <Paper sx={{ p: 3, border: `2px solid ${theme.palette.error.main}` }}>
            <Typography variant="h5" gutterBottom color="error">God Mode</Typography>
            {renderButtons(godModeActions)}
          </Paper>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{dialogContent.title}</DialogTitle>
        <DialogContent><DialogContentText>{dialogContent.text}</DialogContentText></DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={dialogContent.onConfirm} color="primary" autoFocus>Confirm</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default DbAdmin; 