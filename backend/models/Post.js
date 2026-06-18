import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  verificationResult: { type: mongoose.Schema.Types.ObjectId, ref: 'VerificationResult' },
  verificationReport: { type: Object }
}, { timestamps: true });

// Configure indexes for feed performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ createdAt: -1 });

export default mongoose.model('Post', postSchema);
