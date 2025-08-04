import React, { useState, useEffect } from 'react';
import axiosInstance from './axiosInstance'; 
import './css/Request.css';

export default function Request() {
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingRequests, setProcessingRequests] = useState(new Set());

  // Fetch pending friend requests when page load
  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axiosInstance.get('/getPendingFriendRequests');
      setFriendRequests(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setFriendRequests([]);
        setError('No pending friend requests found');
      } else {
        setError('Failed to fetch friend requests');
        console.error('Error fetching friend requests:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (senderName, status) => {
    try {
      // Add to processing set to disable buttons
      setProcessingRequests(prev => new Set([...prev, senderName]));
      
      const response = await axiosInstance.post('/respondToFriendRequest', {
        sender_name: senderName,
        status: status
      });

      // Remove the processed request from the list
      setFriendRequests(prev => 
        prev.filter(request => request.sender_name !== senderName)
      );

      console.log(response.data.message);
      
    } catch (err) {
      console.error('Error responding to friend request:', err);
      setError('Failed to respond to friend request');
    } finally {
      // Remove from processing set
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(senderName);
        return newSet;
      });
    }
  };

  const handleAccept = (senderName) => {
    handleResponse(senderName, 'accepted');
  };

  const handleDecline = (senderName) => {
    handleResponse(senderName, 'rejected');
  };

  if (loading) {
    return (
      <div className="request-container">
        <div className="loading">Loading friend requests...</div>
      </div>
    );
  }

  return (
    <div className="request-container">
      <h2>Friend Requests</h2>
      
      {error && friendRequests.length === 0 && (
        <div className="no-requests">
          <p>{error}</p>
        </div>
      )}

      {error && friendRequests.length > 0 && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {friendRequests.length > 0 && (
        <div className="requests-list">
          {friendRequests.map((request) => (
            <div key={request.id} className="request-item">
              <div className="request-info">
                <span className="sender-name">{request.sender_name}</span>
                <span className="request-text">wants to be your friend</span>
              </div>
              
              <div className="request-actions">
                <button
                  className="accept-btn"
                  onClick={() => handleAccept(request.sender_name)}
                  disabled={processingRequests.has(request.sender_name)}
                >
                  {processingRequests.has(request.sender_name) ? 'Processing...' : 'Accept'}
                </button>
                
                <button
                  className="decline-btn"
                  onClick={() => handleDecline(request.sender_name)}
                  disabled={processingRequests.has(request.sender_name)}
                >
                  {processingRequests.has(request.sender_name) ? 'Processing...' : 'Decline'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {friendRequests.length === 0 && !loading && !error && (
        <div className="no-requests">
          <p>No pending friend requests</p>
        </div>
      )}
    </div>
  );
}