import { Schema, model, Document, Model } from 'mongoose';

export interface IRule extends Document {
  number: number;
  name: string;
  description?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface IRuleModel extends Model<IRule> {
  createDefaultRules(): Promise<void>;
}

const ruleSchema = new Schema({
  number: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create default rules if none exist
ruleSchema.statics.createDefaultRules = async function() {
  const count = await this.countDocuments();
  if (count === 0) {
    const defaultRules = [
      { number: 1, name: "Rule 1", active: true },
      { number: 2, name: "Rule 2", active: true },
      { number: 3, name: "Rule 3", active: true },
      { number: 4, name: "Rule 4", active: true },
      { number: 5, name: "Rule 5", active: true }
    ];
    await this.insertMany(defaultRules);
  }
};

// Pre-save middleware to ensure number is unique
ruleSchema.pre('save', async function(this: IRule & { constructor: IRuleModel }, next) {
  if (this.isNew || this.isModified('number')) {
    const existingRule = await this.constructor.findOne({ number: this.number });
    if (existingRule && existingRule._id.toString() !== this._id?.toString()) {
      throw new Error('A rule with this number already exists');
    }
  }
  next();
});

export const Rule = model<IRule, IRuleModel>('Rule', ruleSchema); 