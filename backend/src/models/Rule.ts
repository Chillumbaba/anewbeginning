import mongoose, { Document, Model } from 'mongoose';

interface IRule {
  number: number;
  name: string;
  description?: string;
  active: boolean;
}

interface IRuleDocument extends IRule, Document {}

interface IRuleModel extends Model<IRuleDocument> {
  createDefaultRules(): Promise<void>;
}

const ruleSchema = new mongoose.Schema<IRuleDocument>({
  number: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Static method to create default rules if none exist
ruleSchema.statics.createDefaultRules = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultRules = [
      { number: 1, name: 'Limit', description: 'Stay within your limits', active: true },
      { number: 2, name: 'Yoga', description: 'Practice yoga daily', active: true },
      { number: 3, name: 'Medit', description: 'Daily meditation', active: true },
      { number: 4, name: 'Food', description: 'Healthy eating habits', active: true }
    ];
    await this.insertMany(defaultRules);
  }
};

export const Rule = mongoose.model<IRuleDocument, IRuleModel>('Rule', ruleSchema); 