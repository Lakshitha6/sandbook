import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from './axiosInstance'; 
import './css/Friend.css';

export default function Friend() {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchFriends = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/showAllFriends');
      setFriends(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching friends:', error);
      
      if (error.response && error.response.status === 404) {
        setFriends([]);
        setLoading(false);
      } else if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError('Failed to load friends');
        setLoading(false);
      }
    }
  }, [navigate]);

  useEffect(() => {
    fetchFriends();
  }, [fetchFriends]);

  const handleAddNewFriend = () => {
    navigate('/addFriend')
  };

  const handleIncomingRequests = () => {
    navigate('/request')
  };

  if (loading) {
    return (
      <div className="friends-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading friends...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="friends-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={fetchFriends} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="friends-container">
      <div className="friends-header">
        <h1 className="friends-title">My Friends</h1>
        <div className="friends-actions">
          <button onClick={handleAddNewFriend} className="add-friend-btn">
            Add New Friend
          </button>
          <button onClick={handleIncomingRequests} className="requests-btn">
            Incoming Requests
          </button>
        </div>
      </div>

      <div className="friends-content">
        {friends.length === 0 ? (
          <div className="no-friends">
            <div className="no-friends-icon">👥</div>
            <h3>No Friends Yet</h3>
            <p>Start building your network by adding friends!</p>
            <button onClick={handleAddNewFriend} className="add-first-friend-btn">
              Add Your First Friend
            </button>
          </div>
        ) : (
          <>
            <div className="friends-count">
              <span>{friends.length} {friends.length === 1 ? 'Friend' : 'Friends'}</span>
            </div>
            <div className="friends-grid">
              {friends.map(friend => (
                <div key={friend.id} className="friend-card">
                  <div className="friend-avatar">
                    <span className="avatar-text">
                      {friend.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="friend-info">
                    <h3 className="friend-name">{friend.name || 'Unknown'}</h3>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}