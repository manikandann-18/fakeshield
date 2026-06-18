import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

export default function Notifications() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      // Re-using the getPosts endpoint to extract verified posts for the audit log
      const res = await axios.get('http://localhost:5000/api/posts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const verifiedPosts = posts.filter(p => p.verificationReport && p.verificationReport.status !== 'unverified');

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4">
        <span className="text-xl font-black tracking-tighter text-slate-800">System Audit Logs</span>
      </div>

      <div className="divide-y divide-slate-100 bg-white">
        {verifiedPosts.length > 0 ? (
          verifiedPosts.map((post, i) => {
            const isFlagged = post.verificationReport.status === 'flagged';
            const Icon = isFlagged ? ShieldAlert : ShieldCheck;
            const colorClass = isFlagged ? 'text-red-500' : 'text-emerald-500';
            const bgClass = isFlagged ? 'bg-red-50 border-red-100' : 'bg-emerald-50 border-emerald-100';

            return (
              <div key={post._id || i} className="p-4 flex space-x-4 items-start hover:bg-slate-50 transition-colors">
                <div className={`p-2 rounded-full border ${bgClass}`}>
                  <Icon size={22} className={colorClass} />
                </div>
                <div>
                  <div className="font-bold uppercase tracking-tight text-slate-800 font-mono text-sm">
                    {isFlagged ? 'ANOMALY_DETECTED' : 'VERIFICATION_SUCCESS'}
                  </div>
                  <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                    Post by <strong>@{post.author?.username}</strong> was scanned by FakeShield AI. 
                    Result: {post.verificationReport.status.toUpperCase()} (Confidence: {post.verificationReport.riskScore}%).
                  </p>
                  <div className="text-xs text-slate-400 mt-2 font-mono">
                    {new Date(post.createdAt).toLocaleString()} • ID: {post._id.substring(0, 8)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-500">
            <AlertTriangle size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="font-medium">No system audits found.</p>
            <p className="text-sm mt-1">Verify posts to populate the kernel logs.</p>
          </div>
        )}
      </div>
    </div>
  );
}
