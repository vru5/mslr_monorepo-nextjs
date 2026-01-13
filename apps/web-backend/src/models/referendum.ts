import mongoose, { Schema, Document } from "mongoose";

export interface Option {
    text: string;
    votes: number;
};

export interface Referendum extends Document {
    referendum_title: string;
    referendum_desc: string;
    referendum_options: Option[];
    status: 'created' | 'open' | 'closed';
    createdAt: Date;
};

const ReferendumSchema: Schema = new Schema({
    referendum_title: { type: String, required: true },
    referendum_desc: { type: String, required: true },
    referendum_options: [
        {
            text: { type: String, required: true },
            votes: { type: Number, default: 0}
        }
    ],
    status: {
        type: String,
        enum: ['created', 'open', 'closed'],
        default: 'created'
    },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model<Referendum>('Referendum', ReferendumSchema);