import mongoose from 'mongoose';

const verificationResultSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fakeScore: { type: Number, required: true },
  confidence: { type: Number, required: true },
  riskLevel: { type: String, enum: ['Low', 'Medium', 'High', 'Neutral'], required: true },
}, { timestamps: true });

export default mongoose.model('VerificationResult', verificationResultSchema);
