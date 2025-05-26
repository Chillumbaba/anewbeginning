import { Router, Request, Response } from 'express';
import { GridCell } from '../models/GridCell';

const router = Router();

// Get all grid cells
router.get('/grid-data', async (_req: Request, res: Response) => {
  try {
    const gridCells = await GridCell.find();
    res.json(gridCells);
  } catch (error) {
    res.status(500).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

// Update or create a grid cell
router.post('/grid-data', async (req: Request, res: Response) => {
  try {
    const { date, rule, status } = req.body;
    
    const gridCell = await GridCell.findOneAndUpdate(
      { date, rule },
      { status },
      { new: true, upsert: true }
    );
    
    res.status(200).json(gridCell);
  } catch (error) {
    res.status(400).json({ message: error instanceof Error ? error.message : 'An error occurred' });
  }
});

export default router; 