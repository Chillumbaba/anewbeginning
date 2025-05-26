import { Schema, model, Document } from 'mongoose';

export interface IText extends Document {
    content: string;
    createdAt: Date;
}

const textSchema = new Schema({
    content: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export const Text = model<IText>('Text', textSchema); 