import mongoose, { Document, Model } from 'mongoose';

export interface IUser {
  email: string;
  name: string;
  picture?: string;
  googleId: string;
  isAdmin: boolean;
}

export interface IUserDocument extends IUser, Document {}

interface IUserModel extends Model<IUserDocument> {
  createDefaultAdmin(): Promise<void>;
}

const userSchema = new mongoose.Schema<IUserDocument>({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  name: { 
    type: String, 
    required: true 
  },
  picture: { 
    type: String 
  },
  googleId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  isAdmin: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Create default admin user if none exists
userSchema.statics.createDefaultAdmin = async function() {
  const adminExists = await this.findOne({ email: 'krishnan.paddy@gmail.com' });
  if (!adminExists) {
    await this.create({
      email: 'krishnan.paddy@gmail.com',
      name: 'Krishnan Paddy',
      googleId: 'admin-default',
      isAdmin: true
    });
    console.log('Default admin user created');
  }
};

export const User = mongoose.model<IUserDocument, IUserModel>('User', userSchema); 