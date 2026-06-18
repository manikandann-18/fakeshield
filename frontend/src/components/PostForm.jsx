import React, { useState } from 'react';
import api from '../services/api';
import { Send } from 'lucide-react';

export default function PostForm({ onPostCreated }) {
  const [content, setContent] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    try {
      const res = await api.post('/posts', { content });
      onPostCreated(res.data);
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          className="w-full p-2 border-none resize-none focus:ring-0 text-lg"
          rows="3"
        />
        <div className="flex justify-end mt-2">
          <button 
            type="submit" 
            disabled={!content.trim()}
            className="flex items-center space-x-1 bg-blue-600 text-white px-4 py-2 rounded-full hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Post</span>
          </button>
        </div>
      </form>
    </div>
  );
}
