import mongoose, { Document, Model } from 'mongoose';

interface IRule {
  userId: mongoose.Types.ObjectId;
  number: number;
  name: string;
  description?: string;
  active: boolean;
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
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Create a compound index on userId and number to ensure uniqueness per user
ruleSchema.index({ userId: 1, number: 1 }, { unique: true });

// Static method to create default rules if none exist for a user
ruleSchema.statics.createDefaultRules = async function(userId: mongoose.Types.ObjectId) {
  const count = await this.countDocuments({ userId });
  if (count === 0) {
    const defaultRules = [
      { userId, number: 1, name: 'Limit', description: 'Stay within your limits', active: true },
      { userId, number: 2, name: 'Yoga', description: 'Practice yoga daily', active: true },
      { userId, number: 3, name: 'Medit', description: 'Daily meditation', active: true },
      { userId, number: 4, name: 'Food', description: 'Healthy eating habits', active: true }
    ];
    await this.insertMany(defaultRules);
  }
};

export const Rule = mongoose.model<IRuleDocument, IRuleModel>('Rule', ruleSchema); 