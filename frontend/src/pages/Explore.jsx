import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, UserCheck, Verified } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Explore() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleFollow = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/users/${userId}/follow`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (err) {
      console.error('Error following user', err);
    }
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(search.toLowerCase()) && 
    u._id !== currentUser?.id
  );

  return (
    <div className="w-full min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200 p-4">
        <div className="bg-slate-100 p-3 rounded-full flex items-center space-x-3 border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500 transition-all">
          <Search className="text-slate-500" size={20} />
          <input 
            type="text" 
            placeholder="Search FakeShield network..." 
            className="bg-transparent border-none outline-none flex-1 text-slate-800 text-sm font-medium"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4">
        <h2 className="text-xl font-black text-slate-800 mb-4 px-2">Discover Nodes</h2>
        
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {filteredUsers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map(user => {
                const isFollowing = user.followers?.includes(currentUser?.id);
                const avatar = user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`;
                
                return (
                  <div key={user._id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer" onClick={(e) => {
                    if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                      navigate(`/user/${user.username}`);
                    }
                  }}>
                    <div className="flex items-center space-x-3">
                      <img src={avatar} className="w-12 h-12 rounded-full border border-slate-200 bg-slate-100" alt="avatar" />
                      <div>
                        <div className="font-bold text-slate-900 flex items-center">
                          {user.username} <Verified size={14} className="ml-1 text-blue-500 fill-blue-500" />
                        </div>
                        <div className="text-sm text-slate-500">@{user.username.toLowerCase().replace(/\s+/g, '_')}</div>
                        <div className="text-xs text-slate-400 mt-1 line-clamp-1">{user.bio || 'Network entity monitored by FakeShield.'}</div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => handleFollow(user._id)} 
                      className={`flex items-center space-x-2 px-4 py-1.5 rounded-full text-sm font-bold transition-colors shadow-sm ${isFollowing ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-800 text-white hover:bg-slate-700'}`}
                    >
                      {isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-500">No network entities found matching your query.</div>
          )}
        </div>
      </div>
    </div>
  );
}
