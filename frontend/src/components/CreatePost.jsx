import React, { useState } from 'react';
import axios from 'axios';
import { Globe, Terminal } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CreatePost({ onPostCreated }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/posts', 
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onPostCreated(res.data);
      setContent('');
    } catch (err) {
      console.error('Error creating post', err);
    } finally {
      setLoading(false);
    }
  };

  const username = user?.username || 'Unknown';
  const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`;

  return (
    <div className="p-4 border-b border-slate-200 flex space-x-4 bg-slate-50/50">
      <img src={avatar} className="w-12 h-12 rounded-full border border-slate-200 bg-white shrink-0" alt="avatar" />
      <div className="flex-1">
        <textarea 
          placeholder="Share an update or news..." 
          className="w-full bg-transparent border-none text-slate-800 focus:ring-0 text-lg resize-none min-h-[80px] outline-none placeholder:text-slate-400" 
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
        />
        <div className="flex items-center justify-between pt-3 border-t border-slate-200">
          <div className="flex space-x-4 text-blue-600">
            <Globe size={18} className="cursor-pointer hover:text-blue-700" />
            <Terminal size={18} className="cursor-pointer hover:text-blue-700" />
          </div>
          <button 
            onClick={handleSubmit} 
            disabled={!content.trim() || loading} 
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-6 py-2 rounded-full shadow-sm transition-all"
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
}
