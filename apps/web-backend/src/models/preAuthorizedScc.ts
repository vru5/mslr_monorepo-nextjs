import mongoose, { Schema, Document, mongo } from "mongoose";

export interface PreAuthorizedScc extends Document {
    scc: string;
    isUsed: boolean;
};

const PreAuthorizedSccSchema: Schema = new Schema({
    scc: { type: String, required: true, unique: true },
    isUsed: { type: Boolean, default: false }
});

export default mongoose.model<PreAuthorizedScc>('PreAuthorizedScc', PreAuthorizedSccSchema);