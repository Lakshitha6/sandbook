import './css/AddFriend.css'
import axiosInstance from './axiosInstance'
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddFriend() {
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sendingRequest, setSendingRequest] = useState({});
  const navigate = useNavigate();

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/getAllUsers');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      throw error;
    }
  }, []);

  const fetchFriends = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/showAllFriends');
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return [];
      }
      throw error;
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both all users and friends simultaneously
      const [usersData, friendsData] = await Promise.all([
        fetchAllUsers(),
        fetchFriends()
      ]);

      setAllUsers(usersData);
      setFriends(friendsData);

      // Remove existing friends from all users
      const friendNames = friendsData.map(friend => friend.name);
      const available = usersData.filter(user => !friendNames.includes(user.name));
      
      setAvailableUsers(available);
      setLoading(false);
    } catch (error) {
      console.error('Error loading data:', error);
      
      if (error.response && error.response.status === 401) {
        localStorage.removeItem('token');
        navigate('/');
      } else {
        setError('Failed to load users');
        setLoading(false);
      }
    }
  }, [fetchAllUsers, fetchFriends, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSendFriendRequest = async (user) => {
    try {
      setSendingRequest(prev => ({ ...prev, [user.id]: true }));
      
      const response = await axiosInstance.post('/addFriends', {
        receiver_name: user.name
      });

      console.log('Request successful, removing user from list');
      console.log('Before removal:', availableUsers.map(u => u.name));
      
      // Remove user from available users list after successful request
      setAvailableUsers(prev => {
        const filtered = prev.filter(u => u.name !== user.name);
        console.log('After removal:', filtered.map(u => u.name));
        return filtered;
      });
      
      // Show success message
      alert(response.data.message || 'Friend request sent successfully!');
      
    } catch (error) {
      console.error('Error sending friend request:', error);
      
      let errorMessage = 'Failed to send friend request';
      
      if (error.response && error.response.data && error.response.data.detail) {
        errorMessage = error.response.data.detail;
      }
      
      alert(errorMessage);
    } finally {
      setSendingRequest(prev => ({ ...prev, [user.id]: false }));
    }
  };

  if (loading) {
    return (
      <div className="add-friend-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="add-friend-container">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={loadData} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-friend-container">
      <div className="add-friend-header">
        <h1 className="add-friend-title">Add New Friends</h1>
        <div className="users-stats">
          <span className="stat-item">
            Total Users: {allUsers.length}
          </span>
          <span className="stat-item">
            Current Friends: {friends.length}
          </span>
          <span className="stat-item">
            Available: {availableUsers.length}
          </span>
        </div>
      </div>

      <div className="add-friend-content">
        {availableUsers.length === 0 ? (
          <div className="no-users">
            <div className="no-users-icon">🔍</div>
            <h3>No New Users to Add</h3>
            <p>You're already friends with everyone or there are no other users yet!</p>
            <button onClick={loadData} className="refresh-btn">
              Refresh List
            </button>
          </div>
        ) : (
          <>
            <div className="available-count">
              <span>{availableUsers.length} user{availableUsers.length !== 1 ? 's' : ''} available to add</span>
            </div>
            <div className="users-grid">
              {availableUsers.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-avatar">
                    <span className="avatar-text">
                      {user.name?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="user-info">
                    <h3 className="user-name">{user.name || 'Unknown'}</h3>
                  </div>
                  <div className="user-actions">
                    <button 
                      onClick={() => handleSendFriendRequest(user)}
                      disabled={sendingRequest[user.id]}
                      className="send-request-btn"
                    >
                      {sendingRequest[user.id] ? (
                        <>
                          <div className="button-spinner"></div>
                          Sending...
                        </>
                      ) : (
                        'Send Friend Request'
                      )}
                    </button>
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