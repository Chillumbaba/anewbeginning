import express from 'express';
import { GridData } from '../models/GridData';
import { Rule } from '../models/Rule';
import { User } from '../models/User';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { Parser } from 'json2csv';
import { parse } from 'csv-parse';

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}, { googleId: 0 }).sort({ createdAt: -1 });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
});

// Clear all grid data for all users
router.delete('/clear-all-grid-data', async (req, res) => {
  try {
    await GridData.deleteMany({});
    res.json({ message: 'All grid data for all users has been cleared.' });
  } catch (error: any) {
    res.status(500).json({ message: 'Error clearing all grid data', error: error.message });
  }
});

// Clear grid data for specific user
router.delete('/clear-user-grid-data/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await GridData.deleteMany({ userId });
    res.json({ 
      message: 'User grid data cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing user grid data:', error);
    res.status(500).json({ 
      message: 'Error clearing user grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Clear admin's own grid data
router.delete('/clear-own-grid-data', async (req, res) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const result = await GridData.deleteMany({ userId: req.user!._id });
    res.json({ 
      message: 'Your grid data cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing own grid data:', error);
    res.status(500).json({ 
      message: 'Error clearing own grid data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get statistics for all users
router.get('/statistics', async (req, res) => {
  try {
    const users = await User.find({}, { email: 1, name: 1 });
    const statistics = [];

    for (const user of users) {
      const gridData = await GridData.find({ userId: user._id });
      const rules = await Rule.find({ userId: user._id, active: true });
      
      const totalCells = gridData.length;
      const tickCount = gridData.filter(cell => cell.status === 'tick').length;
      const crossCount = gridData.filter(cell => cell.status === 'cross').length;
      const blankCount = gridData.filter(cell => cell.status === 'blank').length;
      
      statistics.push({
        userId: user._id,
        email: user.email,
        name: user.name,
        totalCells,
        tickCount,
        crossCount,
        blankCount,
        activeRules: rules.length
      });
    }

    res.json(statistics);
  } catch (error) {
    console.error('Error fetching admin statistics:', error);
    res.status(500).json({ 
      message: 'Error fetching admin statistics',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get database dump
router.get('/db-dump', async (req, res) => {
  if (!req.user || !(req.user as any).isAdmin) return res.status(403).send('Forbidden');
  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    console.error('Error fetching database dump:', error);
    res.status(500).json({ 
      message: 'Error fetching database dump',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Export all rules for all users
router.get('/export-all-rules', async (req, res) => {
  try {
    const rules = await Rule.find({}).populate('userId', 'email');
    const fields = ['userId.email', 'number', 'name', 'description', 'active'];
    const parser = new Parser({ fields });
    const csv = parser.parse(rules);
    res.header('Content-Type', 'text/csv');
    res.attachment('all-rules.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting all rules', error: error.message });
  }
});

// Export all progress for all users
router.get('/export-all-progress', async (req, res) => {
  try {
    const progress = await GridData.find({}).populate('userId', 'email');
    const fields = ['userId.email', 'date', 'rule', 'status'];
    const parser = new Parser({ fields });
    const csv = parser.parse(progress);
    res.header('Content-Type', 'text/csv');
    res.attachment('all-progress.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ message: 'Error exporting all progress', error: error.message });
  }
});

// Note: Uploading for all users via CSV is complex and requires careful
// implementation to map CSV rows to specific users, often using email as a key.
router.post('/upload-all-progress', async (req, res) => {
    try {
        const csvData = req.body;
        const records: any[] = [];
        const userCache = new Map();

        const parser = parse({
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        parser.on('readable', async function() {
            let record;
            while ((record = parser.read()) !== null) {
                records.push(record);
            }
        });

        parser.on('error', function(err) {
            return res.status(400).json({ error: `CSV Parsing Error: ${err.message}` });
        });

        parser.on('end', async function() {
            if (records.length === 0) {
                return res.status(400).json({ error: 'No valid records found in CSV' });
            }
            try {
                const gridDataToInsert = [];
                for (const record of records) {
                    const email = record['userId.email'];
                    if (!email) {
                        console.warn('Skipping record without email:', record);
                        continue;
                    }

                    let user = userCache.get(email);
                    if (!user) {
                        user = await User.findOne({ email });
                        if (user) {
                            userCache.set(email, user);
                        }
                    }

                    if (user) {
                        gridDataToInsert.push({
                            userId: user._id,
                            date: record.date,
                            rule: parseInt(record.rule, 10),
                            status: record.status.toLowerCase()
                        });
                    } else {
                        console.warn(`User not found for email: ${email}. Skipping record.`);
                    }
                }
                
                // Clear all existing grid data
                await GridData.deleteMany({});
                
                // Insert new grid data
                if (gridDataToInsert.length > 0) {
                    await GridData.insertMany(gridDataToInsert);
                }

                res.json({ 
                    message: 'Progress for all users imported successfully', 
                    count: gridDataToInsert.length 
                });

            } catch (dbError: any) {
                res.status(500).json({ error: `Database Error: ${dbError.message}` });
            }
        });

        parser.write(csvData);
        parser.end();

    } catch (error: any) {
        res.status(500).json({ error: `Server Error: ${error.message}` });
    }
});

router.post('/upload-all-rules', (req, res) => {
    res.status(501).json({ message: 'Not Implemented: Uploading rules for all users requires a robust implementation.' });
});

export default router; 