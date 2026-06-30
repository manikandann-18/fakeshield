import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

export const createPost = async (req, res) => {
  try {
    const newPost = new Post({ content: req.body.content, author: req.user.id });
    const savedPost = await newPost.save();
    await savedPost.populate('author', 'username');
    res.status(201).json(savedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'username')
      .sort({ createdAt: -1 })
      .lean();
    
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const comments = await Comment.find({ post: post._id }).populate('user', 'username');
      return { ...post, comments };
    }));
    
    res.json(postsWithComments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    if (!post.likes.includes(req.user.id)) {
      post.likes.push(req.user.id);
    } else {
      post.likes = post.likes.filter(id => id.toString() !== req.user.id);
    }
    await post.save();
    res.json({ likes: post.likes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const commentPost = async (req, res) => {
  try {
    const comment = new Comment({
      post: req.params.id,
      user: req.user.id,
      text: req.body.text
    });
    const savedComment = await comment.save();
    await savedComment.populate('user', 'username');
    
    const post = await Post.findById(req.params.id).lean();
    const comments = await Comment.find({ post: post._id }).populate('user', 'username');
    
    res.status(201).json({ ...post, comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const verifyPostContent = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get post content from MongoDB
    const originalPost = await Post.findById(id);
    if (!originalPost) return res.status(404).json({ message: 'Post not found' });
    const content = originalPost.content;
    
    // 2. Send post content to Python fake news service
    const pythonPredictUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000/predict';
    const pythonScanUrl = pythonPredictUrl.replace('/predict', '/scan-url');
    
    const axios = (await import('axios')).default;
    let pythonResponse;
    try {
      pythonResponse = await axios.post(pythonPredictUrl, { text: content });
    } catch (apiError) {
      return res.status(503).json({ message: 'Fake news detection service is unavailable.' });
    }

    // 3. Receive prediction and confidence
    const { confidence, prediction } = pythonResponse.data;
    
    // 4. Automatically detect and scan URLs inside the post content
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = content.match(urlRegex) || [];
    const threatReports = [];
    
    let phishingScore = 0;
    let highestThreatStatus = 'Safe';
    
    const ThreatReport = (await import('../models/ThreatReport.js')).default;
    
    for (const url of urls) {
      try {
        const cleanUrl = url.replace(/[.,;:!?]+$/, ''); // clean trailing punctuation
        const scanRes = await axios.post(pythonScanUrl, { url: cleanUrl });
        const { status: threatStatus, confidence: threatConfidence } = scanRes.data;
        
        // Save to MongoDB ThreatReport
        const report = new ThreatReport({
          post: id,
          url: cleanUrl,
          status: threatStatus,
          confidence: threatConfidence
        });
        await report.save();
        threatReports.push(report);
        
        if (threatStatus !== 'Safe') {
          if (threatConfidence > phishingScore) {
            phishingScore = threatConfidence;
            highestThreatStatus = threatStatus;
          }
        }
      } catch (scanError) {
        console.error(`[URL SCAN ERROR] Failed to scan URL ${url}:`, scanError.message);
      }
    }
    
    let fakeScoreVal = 0;
    let status = 'verified';

    if (prediction === 'Fake') {
      fakeScoreVal = confidence / 100;
      if (fakeScoreVal >= 0.7) {
        status = 'flagged';
      } else {
        status = 'pending';
      }
    } else if (prediction === 'General') {
      fakeScoreVal = 0.5;
      status = 'general';
    } else {
      fakeScoreVal = 1 - (confidence / 100);
      status = 'verified';
    }
    
    const finalFakeScore = Math.round(fakeScoreVal * 100);
    const finalThreatScore = Math.round(phishingScore);
    
    // Unified risk score formula
    let finalRiskScore;
    if (urls.length > 0) {
      finalRiskScore = Math.round((finalFakeScore + finalThreatScore) / 2);
    } else {
      finalRiskScore = finalFakeScore;
    }
    
    // Map risk levels
    let finalRiskLevel = 'Low';
    if (finalRiskScore >= 85) {
      finalRiskLevel = 'Critical';
      status = 'flagged';
    } else if (finalRiskScore >= 70) {
      finalRiskLevel = 'High';
      status = 'flagged';
    } else if (finalRiskScore >= 35) {
      finalRiskLevel = 'Medium';
      status = 'pending';
    } else {
      finalRiskLevel = 'Low';
      status = 'verified';
    }

    // Format for frontend
    const verificationReport = {
      fakeScore: finalFakeScore,
      threatScore: finalThreatScore,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel,
      status,
      urlsScanned: threatReports.map(r => ({ url: r.url, status: r.status, confidence: r.confidence })),
      details: `Fake News Score: ${finalFakeScore}%, Threat Score: ${finalThreatScore}%, Risk Score: ${finalRiskScore}% (${finalRiskLevel}).`
    };

    // 5. Store verification result in MongoDB
    const VerificationResult = (await import('../models/VerificationResult.js')).default;
    const verification = new VerificationResult({
      post: id,
      verifiedBy: req.user.id,
      fakeScore: finalFakeScore,
      threatScore: finalThreatScore,
      riskScore: finalRiskScore,
      riskLevel: finalRiskLevel
    });
    await verification.save();

    // Attach report to post and return fully populated post for the frontend
    const updatedPost = await Post.findByIdAndUpdate(
      id, 
      { verificationResult: verification._id, verificationReport }, 
      { new: true }
    )
    .populate('author', 'username')
    .lean();

    const Comment = (await import('../models/Comment.js')).default;
    const comments = await Comment.find({ post: updatedPost._id }).populate('user', 'username');
    
    res.status(200).json({ ...updatedPost, comments });
  } catch (err) {
    console.error('[VERIFICATION ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const verifyTextDirectly = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: 'Text content is required' });

    const pythonApiUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000/predict';
    const axios = (await import('axios')).default;
    
    let pythonResponse;
    try {
      pythonResponse = await axios.post(pythonApiUrl, { text });
    } catch (apiError) {
      return res.status(503).json({ message: 'Fake news detection service is unavailable.' });
    }

    const { confidence, prediction } = pythonResponse.data;

    let fakeScore = 0;
    let riskLevel = 'Low';

    if (prediction === 'Fake') {
      fakeScore = confidence / 100;
      if (fakeScore >= 0.7) riskLevel = 'High';
      else riskLevel = 'Medium';
    } else if (prediction === 'General') {
      fakeScore = 0.5;
      riskLevel = 'Neutral';
    } else {
      fakeScore = 1 - (confidence / 100);
      riskLevel = 'Low';
    }

    res.status(200).json({ 
      riskLevel, 
      confidence, 
      fakeScore 
    });
  } catch (err) {
    console.error('[DIRECT TEXT VERIFICATION ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
};

export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'User not authorized to delete this post' });
    }

    await Post.findByIdAndDelete(req.params.id);
    
    // Also delete associated comments
    const Comment = (await import('../models/Comment.js')).default;
    await Comment.deleteMany({ post: req.params.id });

    // Also delete verification results
    const VerificationResult = (await import('../models/VerificationResult.js')).default;
    await VerificationResult.deleteMany({ post: req.params.id });

    res.status(200).json({ message: 'Post removed successfully' });
  } catch (err) {
    console.error('[DELETE POST ERROR]', err.message);
    res.status(500).json({ error: err.message });
  }
};
