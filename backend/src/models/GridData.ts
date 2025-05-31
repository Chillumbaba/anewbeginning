import mongoose from 'mongoose';

interface IGridData {
  date: string;
  rule: number;
  status: 'blank' | 'tick' | 'cross';
}

const gridDataSchema = new mongoose.Schema<IGridData>({
  date: { type: String, required: true },
  rule: { type: Number, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['blank', 'tick', 'cross']
  }
}, {
  timestamps: true
});

// Create a compound index on date and rule to ensure uniqueness
gridDataSchema.index({ date: 1, rule: 1 }, { unique: true });

export const GridData = mongoose.model<IGridData>('GridData', gridDataSchema); 