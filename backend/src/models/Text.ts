import mongoose, { Document } from 'mongoose';

interface IText extends Document {
    content: string;
    createdAt: Date;
}

const textSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

export const Text = mongoose.model<IText>('Text', textSchema); 