import express from 'express';
import { GridData } from '../models/GridData';
import { Rule } from '../models/Rule';
import { Parser } from 'json2csv';
import { parse } from 'csv-parse';

const router = express.Router();

// Export grid data as CSV
router.get('/export-csv', async (req, res) => {
  try {
    // Get all grid data and ALL rules (not just active ones)
    const [gridData, rules] = await Promise.all([
      GridData.find().sort({ date: -1, rule: 1 }),
      Rule.find().sort({ number: 1 }) // Remove the active filter
    ]);

    // Create CSV header
    const csvHeader = ['Date', 'Rule Number', 'Status'];
    
    // Create CSV rows
    const csvRows = gridData.map(entry => {
      return [
        entry.date,
        entry.rule,
        entry.status
      ].join(',');
    });

    // Combine header and rows
    const csvContent = [csvHeader.join(','), ...csvRows].join('\n');

    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=grid-data.csv');

    // Send the CSV file
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting grid data:', error);
    res.status(500).json({ 
      message: 'Error exporting grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get all grid data
router.get('/', async (req, res) => {
  try {
    const gridData = await GridData.find().sort({ date: -1, rule: 1 });
    res.json(gridData);
  } catch (error) {
    console.error('Error fetching grid data:', error);
    res.status(500).json({ 
      message: 'Error fetching grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update or create grid data
router.post('/', async (req, res) => {
  try {
    const { date, rule, status } = req.body;

    // Validate required fields
    if (!date || !rule || !status) {
      return res.status(400).json({ message: 'Date, rule, and status are required' });
    }

    // Validate status value
    if (!['blank', 'tick', 'cross'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    // Try to find existing data
    const existingData = await GridData.findOne({ date, rule });
    
    if (existingData) {
      // Update existing data
      existingData.status = status;
      const updatedData = await existingData.save();
      console.log('Updated grid data:', updatedData);
      res.json(updatedData);
    } else {
      // Create new data
      const newGridData = new GridData({ date, rule, status });
      const savedData = await newGridData.save();
      console.log('Created new grid data:', savedData);
      res.status(201).json(savedData);
    }
  } catch (error) {
    console.error('Error updating grid data:', error);
    res.status(500).json({ 
      message: 'Error updating grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete grid data for a specific date and rule
router.delete('/:date/:rule', async (req, res) => {
  try {
    const { date, rule } = req.params;
    const result = await GridData.findOneAndDelete({ date, rule: parseInt(rule, 10) });
    
    if (!result) {
      return res.status(404).json({ message: 'Grid data not found' });
    }
    
    res.json({ message: 'Grid data deleted successfully' });
  } catch (error) {
    console.error('Error deleting grid data:', error);
    res.status(500).json({ 
      message: 'Error deleting grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear all grid data
router.delete('/clear-all', async (req, res) => {
  try {
    await GridData.deleteMany({});
    res.json({ message: 'All grid data cleared successfully' });
  } catch (error) {
    console.error('Error clearing grid data:', error);
    res.status(500).json({ 
      message: 'Error clearing grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Upload CSV endpoint
router.post('/upload-csv', async (req, res) => {
  try {
    const csvData = req.body;
    const records: Array<{ date: string; rule: number; status: string }> = [];
    
    // Create a promise to handle CSV parsing
    const parseCSV = new Promise((resolve, reject) => {
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      });

      parser.on('readable', function() {
        let record;
        while ((record = parser.read()) !== null) {
          // Handle both possible header formats
          const date = record.Date || record['Date'];
          const ruleNumber = record['Rule Number'] || record.RuleNumber;
          const status = (record.Status || '').toLowerCase();

          // Validate the record
          if (!date || !ruleNumber || !status) {
            reject(new Error('Invalid CSV format: Missing required fields'));
            return;
          }

          // Validate date format (DD/MM)
          if (!/^\d{2}\/\d{2}$/.test(date)) {
            reject(new Error(`Invalid date format for date: ${date}. Expected format: DD/MM`));
            return;
          }

          // Validate rule number
          const ruleNum = parseInt(ruleNumber);
          if (isNaN(ruleNum) || ruleNum < 1) {
            reject(new Error(`Invalid rule number: ${ruleNumber}`));
            return;
          }

          // Validate status
          if (!['blank', 'tick', 'cross'].includes(status)) {
            reject(new Error(`Invalid status: ${status}. Must be blank, tick, or cross`));
            return;
          }

          records.push({
            date,
            rule: ruleNum,
            status
          });
        }
      });

      parser.on('error', function(err: Error) {
        reject(err);
      });

      parser.on('end', function() {
        if (records.length === 0) {
          reject(new Error('No valid records found in CSV'));
        } else {
          resolve(records);
        }
      });

      // Write data to the parser
      parser.write(csvData);
      parser.end();
    });

    // Wait for parsing to complete
    await parseCSV;

    // Clear existing data
    await GridData.deleteMany({});
    
    // Insert new records
    await GridData.insertMany(records);
    
    res.json({ 
      message: 'CSV data imported successfully', 
      count: records.length 
    });
  } catch (error) {
    console.error('Error processing CSV upload:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to process CSV upload'
    });
  }
});

export default router; 