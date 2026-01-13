import mongoose, { Schema, Document } from "mongoose";

//Defining the structure of Voter Document
export interface Voter extends Document {
    fullName: string;
    email: string;
    hashedPassword: string;
    scc: string;
    dob: Date;
    role: 'voter' | 'admin';
    hasVoted: boolean;
    createdAt: Date;
    votedReferendums: mongoose.Types.ObjectId[];
};

const VoterSchema: Schema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    hashedPassword: { type: String, required: true },
    scc: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    role: { type: String, default: 'voter', enum: ['voter', 'admin'] },
    hasVoted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    votedReferendums: [{ type: Schema.Types.ObjectId, ref: 'Referendum' }]
});

export default mongoose.model<Voter>('Voter', VoterSchema);