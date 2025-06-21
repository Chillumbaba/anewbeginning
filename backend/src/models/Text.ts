import mongoose, { Document } from 'mongoose';

interface IText extends Document {
    userId: mongoose.Types.ObjectId;
    content: string;
    createdAt: Date;
}

const textSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

export const Text = mongoose.model<IText>('Text', textSchema); 