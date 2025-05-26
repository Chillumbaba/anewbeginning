import { Schema, model, Document } from 'mongoose';

export interface IGridCell extends Document {
  date: string;
  rule: number;
  status: 'blank' | 'tick' | 'cross';
  createdAt: Date;
  updatedAt: Date;
}

const gridCellSchema = new Schema({
  date: {
    type: String,
    required: true
  },
  rule: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['blank', 'tick', 'cross'],
    default: 'blank'
  }
}, {
  timestamps: true
});

// Create a compound index for unique combinations of date and rule
gridCellSchema.index({ date: 1, rule: 1 }, { unique: true });

export const GridCell = model<IGridCell>('GridCell', gridCellSchema); 