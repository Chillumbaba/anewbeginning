import mongoose, { Document, Model } from 'mongoose';

interface IRule {
  userId: mongoose.Types.ObjectId;
  number: number;
  name: string;
  description?: string;
  active: boolean;
  createDate: Date;
}

interface IRuleDocument extends IRule, Document {}

interface IRuleModel extends Model<IRuleDocument> {
  createDefaultRules(userId: mongoose.Types.ObjectId): Promise<void>;
}

const ruleSchema = new mongoose.Schema<IRuleDocument>({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  number: { type: Number, required: true },
  name: { type: String, required: true },
  description: { type: String },
  active: { type: Boolean, default: true },
  createDate: { 
    type: Date, 
    default: Date.now,
    required: true 
  }
}, {
  timestamps: true
});

// Create a compound index on userId and number to ensure uniqueness per user
ruleSchema.index({ userId: 1, number: 1 }, { unique: true });

// Pre-save hook to set createDate if not provided (for backward compatibility)
ruleSchema.pre('save', function(this: IRuleDocument, next) {
  if (this.isNew && !this.createDate) {
    this.createDate = new Date();
  }
  next();
});

// Static method to create default rules if none exist for a user
ruleSchema.statics.createDefaultRules = async function(userId: mongoose.Types.ObjectId) {
  const count = await this.countDocuments({ userId });
  if (count === 0) {
    const now = new Date();
    const defaultRules = [
      { userId, number: 1, name: 'Limit', description: 'Stay within your limits', active: true, createDate: now },
      { userId, number: 2, name: 'Yoga', description: 'Practice yoga daily', active: true, createDate: now },
      { userId, number: 3, name: 'Medit', description: 'Daily meditation', active: true, createDate: now },
      { userId, number: 4, name: 'Food', description: 'Healthy eating habits', active: true, createDate: now }
    ];
    await this.insertMany(defaultRules);
  }
};

export const Rule = mongoose.model<IRuleDocument, IRuleModel>('Rule', ruleSchema); 