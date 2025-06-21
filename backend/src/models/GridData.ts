import mongoose, { Document } from 'mongoose';

interface IGridData extends Document {
  userId: mongoose.Types.ObjectId;
  date: string;
  rule: number;
  status: 'blank' | 'tick' | 'cross';
  createdAt: Date;
  updatedAt: Date;
}

const gridDataSchema = new mongoose.Schema<IGridData>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  date: { 
    type: String, 
    required: true,
    validate: {
      validator: function(v: string) {
        // Validate date format (DD/MM)
        return /^\d{2}\/\d{2}$/.test(v);
      },
      message: props => `${props.value} is not a valid date format! Use DD/MM`
    }
  },
  rule: { 
    type: Number, 
    required: true,
    min: [1, 'Rule number must be at least 1']
  },
  status: { 
    type: String, 
    required: true,
    enum: {
      values: ['blank', 'tick', 'cross'],
      message: '{VALUE} is not a valid status'
    }
  }
}, {
  timestamps: true
});

// Create a compound index on userId, date and rule to ensure uniqueness per user
gridDataSchema.index({ userId: 1, date: 1, rule: 1 }, { unique: true });

// Pre-save middleware to ensure status is valid
gridDataSchema.pre('save', function(next) {
  if (!['blank', 'tick', 'cross'].includes(this.status)) {
    next(new Error('Invalid status value'));
  }
  next();
});

export const GridData = mongoose.model<IGridData>('GridData', gridDataSchema); 