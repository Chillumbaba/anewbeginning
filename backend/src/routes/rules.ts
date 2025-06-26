import express, { Request, Response } from 'express';
import { Rule } from '../models/Rule';
import { authenticateToken } from '../middleware/auth';
import { Parser } from 'json2csv';
import { parse } from 'csv-parse';

interface AuthenticatedRequest extends Request {
  user?: any;
}

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all rules for current user
router.get('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const rules = await Rule.find({ userId: (req.user as any)._id }).sort({ createdAt: -1 });
    res.json(rules);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching rules' });
  }
});

// Create a new rule for current user
router.post('/', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  
  console.log('Received request to create rule with body:', req.body);

  try {
    const { name, description, active } = req.body;
    
    // Auto-generate the next rule number
    const existingRules = await Rule.find({ userId: (req.user as any)._id }).sort({ number: -1 }).limit(1);
    const nextNumber = existingRules.length > 0 ? existingRules[0].number + 1 : 1;
    
    const newRule = new Rule({ 
      userId: (req.user as any)._id, 
      number: nextNumber, 
      name, 
      description, 
      active 
    });
    await newRule.save();
    console.log('Rule saved successfully:', newRule);
    res.status(201).json(newRule);
  } catch (error: any) {
    console.error('Detailed error creating rule:', error);
    if (error.name === 'ValidationError') {
      // Extract validation messages
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return res.status(400).json({ message: `Validation failed: ${messages.join(', ')}` });
    }
    res.status(500).json({ message: 'Error creating rule', error: error.message });
  }
});

// New endpoint to export rules as CSV
router.get('/export-csv', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const rules = await Rule.find({ userId: (req.user as any)._id }).sort({ number: 1 });
    const fields = ['number', 'name', 'description', 'active'];
    const opts = { fields };
    const parser = new Parser(opts);
    const csv = parser.parse(rules);
    res.header('Content-Type', 'text/csv');
    res.attachment('rules.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Error exporting rules' });
  }
});

// New endpoint to upload rules from CSV
router.post('/upload-csv', async (req: AuthenticatedRequest, res: Response) => {
    if (!req.user) return res.status(401).send('Unauthorized');
    const userId = (req.user as any)._id;

    try {
        const csvData = req.body;
        const records: any[] = [];
        
        const parser = parse({
            columns: true,
            skip_empty_lines: true,
            trim: true
        });

        // Use the 'data' event to process records one by one
        parser.on('data', (record) => {
            records.push({
                userId,
                number: parseInt(record.number, 10),
                name: record.name,
                description: record.description,
                active: String(record.active).toLowerCase() === 'true'
            });
        });

        parser.on('error', function(err) {
            return res.status(400).json({ error: err.message });
        });

        parser.on('end', async function() {
            if (records.length === 0) {
                return res.status(400).json({ error: 'No valid records found in CSV' });
            }
            try {
                // Clear existing rules for the user
                await Rule.deleteMany({ userId });
                // Insert new rules
                await Rule.insertMany(records);
                res.json({ 
                    message: 'Rules imported successfully', 
                    count: records.length 
                });
            } catch (dbError: any) {
                res.status(500).json({ error: dbError.message });
            }
        });

        parser.write(csvData);
        parser.end();

    } catch (error: any) {
        res.status(500).json({ error: 'Failed to process CSV upload' });
    }
});

// Update a rule for current user
router.put('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const { id } = req.params;
    const { name, description, active, createdAt } = req.body;
    
    // Prepare update data
    const updateData: any = { name, description, active };
    
    // Only allow GODMODE user (krishnan.paddy@gmail.com) to modify createDate
    if (createdAt && req.user.email === 'krishnan.paddy@gmail.com' && req.user.isAdmin) {
      updateData.createDate = new Date(createdAt);
    }
    
    const updatedRule = await Rule.findOneAndUpdate(
      { _id: id, userId: (req.user as any)._id },
      updateData,
      { new: true }
    );
    if (!updatedRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.json(updatedRule);
  } catch (error) {
    res.status(500).json({ message: 'Error updating rule' });
  }
});

// Delete a rule for current user
router.delete('/:id', async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).send('Unauthorized');
  try {
    const { id } = req.params;
    const deletedRule = await Rule.findOneAndDelete({ _id: id, userId: (req.user as any)._id });
    if (!deletedRule) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    res.json({ message: 'Rule deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting rule' });
  }
});

export default router; 