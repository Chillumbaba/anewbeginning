import mongoose from 'mongoose';

const textSchema = new mongoose.Schema({
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

export const Text = mongoose.model('Text', textSchema); 