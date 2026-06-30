import mongoose from 'mongoose';

const verificationResultSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fakeScore: { type: Number, required: true },
  threatScore: { type: Number, required: true },
  riskScore: { type: Number, required: true },
  riskLevel: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('VerificationResult', verificationResultSchema);
