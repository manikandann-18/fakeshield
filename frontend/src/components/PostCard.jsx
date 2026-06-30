import React, { useState } from 'react';
import axios from 'axios';
import VerifyModal from './VerifyModal';
import { Verified, MessageSquare, Zap, Heart, Share2, MoreHorizontal, ShieldCheck, Trash2, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function PostCard({ post, onUpdate, onDelete }) {
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isLiked = post.likes?.includes(user?.id);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        `http://localhost:5000/api/posts/${post._id}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onUpdate({ ...post, likes: res.data.likes });
    } catch (err) {
      console.error('Error liking post', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/posts/${post._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (onDelete) onDelete(post._id);
    } catch (err) {
      console.error('Error deleting post', err);
    }
  };

  const username = post.author?.username || 'Unknown';
  // generate a fake handle based on username
  const handle = username.toLowerCase().replace(/\s+/g, '_');
  // generate avatar
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

  const renderVerificationBadge = () => {
    if (!post.verificationReport || post.verificationReport.status === 'unverified') return null;

    const { status, riskScore, fakeScore, threatScore, riskLevel, details } = post.verificationReport;
    
    let styles = 'bg-slate-50 text-slate-800 border-slate-200';
    if (status === 'verified') styles = 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (status === 'flagged') styles = 'bg-red-50 text-red-800 border-red-200';
    if (status === 'pending') styles = 'bg-amber-50 text-amber-800 border-amber-200';
    if (status === 'general') styles = 'bg-blue-50 text-blue-800 border-blue-200';

    return (
      <div className={`mt-3 p-4 rounded-xl border ${styles}`}>
        <div className="font-black mb-2 flex items-center gap-2">
          {status === 'general' ? <Info size={16} /> : null}
          <span>{status === 'general' ? 'GENERAL INFORMATION' : `Shield Analysis: ${status.toUpperCase()}`}</span>
          {status !== 'general' && (
            <span className="text-sm font-bold px-3 py-1 bg-white rounded-full shadow-sm text-slate-800">
              Risk: {riskScore}/100 ({riskLevel})
            </span>
          )}
        </div>
        <div className="text-sm space-y-1 font-medium">
          {status !== 'general' && (
            <>
              <div className="flex justify-between max-w-xs">
                <span>Fake News Probability:</span>
                <span>{fakeScore || 0}%</span>
              </div>
              <div className="flex justify-between max-w-xs">
                <span>Phishing Threat:</span>
                <span>{threatScore || 0}%</span>
              </div>
            </>
          )}
          <p className="mt-2 text-xs opacity-80 font-bold">{details}</p>
        </div>
      </div>
    );
  };

  return (
    <article className="p-4 border-b border-slate-100 hover:bg-slate-50/50 transition-colors relative group">
      <div className="flex space-x-3">
        <img onClick={() => navigate(`/user/${username}`)} src={avatar} className="w-12 h-12 rounded-full bg-slate-100 cursor-pointer shadow-sm border border-slate-200" alt="avatar"/>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <span onClick={() => navigate(`/user/${username}`)} className="font-bold hover:underline cursor-pointer truncate text-slate-900">{username}</span>
              <Verified size={14} className="text-blue-500 fill-blue-500 shrink-0" />
              <span className="text-slate-500 text-sm truncate">@{handle}</span>
              <span className="text-slate-400 text-sm mx-1">·</span>
              <span className="text-slate-400 text-sm">{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          
          <p className="mt-1 text-[15px] leading-relaxed text-slate-800 whitespace-pre-wrap">{post.content}</p>

          {renderVerificationBadge()}

          <div className="mt-3 flex items-center justify-between max-w-md text-slate-500">
            <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer transition-colors">
              <MessageSquare size={18} />
              <span className="text-xs font-bold">{post.comments?.length || 0}</span>
            </div>
            <div className="flex items-center space-x-2 hover:text-emerald-500 cursor-pointer transition-colors">
              <Zap size={18} />
              <span className="text-xs font-bold">0</span>
            </div>
            <button onClick={handleLike} className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-pink-500' : 'hover:text-pink-500'}`}>
              <Heart size={18} className={isLiked ? "fill-pink-500" : ""} />
              <span className="text-xs font-bold">{post.likes?.length || 0}</span>
            </button>
            <div className="flex items-center space-x-2 hover:text-blue-500 cursor-pointer transition-colors">
              <Share2 size={18} />
            </div>

            {(!post.verificationReport || post.verificationReport.status === 'unverified') && (
              <button 
                onClick={() => setShowVerifyModal(true)}
                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors ml-auto"
              >
                <ShieldCheck size={16} />
                Verify
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-4 right-4">
        <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
          <MoreHorizontal size={18} />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden animate-in fade-in">
             <button className="w-full text-left px-4 py-3 hover:bg-slate-50 text-sm font-medium text-slate-700">Copy link to post</button>
             {post.author?._id === user?.id && (
               <button onClick={handleDelete} className="w-full text-left px-4 py-3 hover:bg-red-50 text-sm font-medium text-red-600 flex items-center gap-2">
                 <Trash2 size={16} /> Delete Post
               </button>
             )}
          </div>
        )}
      </div>

      {showVerifyModal && (
        <VerifyModal 
          post={post} 
          onClose={() => setShowVerifyModal(false)} 
          onUpdate={onUpdate} 
        />
      )}
    </article>
  );
}
