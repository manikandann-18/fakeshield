import mongoose from 'mongoose';

const threatReportSchema = new mongoose.Schema({
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  url: { type: String, required: true },
  status: { type: String, enum: ['Safe', 'Suspicious', 'Malicious'], required: true },
  confidence: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.model('ThreatReport', threatReportSchema);
